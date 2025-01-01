"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddExamModal from "@/components/AddExamModal";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Footer from "@/components/Footer";
import Link from "next/link";

interface Exam {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  departement: string;
  enseignant: string;
  option: string;
  module: string;
  locaux: string[];
}

const ExamSlot = () => {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  const [exams, setExams] = useState<Exam[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [showExamModal, setShowExamModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date && startTime && endTime) {
      fetchExams();
    }
  }, [date, startTime, endTime]);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      console.error("No sessionId found in localStorage.");
    }
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const formattedStart =
        startTime?.length === 5 ? `${startTime}:00` : startTime;
      const formattedEnd = endTime?.length === 5 ? `${endTime}:00` : endTime;

      const response = await axios.get(
        "http://localhost:8088/api/exams/search",
        {
          params: {
            date: date,
            startTime: formattedStart,
            endTime: formattedEnd,
          },
        }
      );

      const transformedExams: Exam[] = response.data.map((exam: any) => ({
        id: exam.id,
        module: exam.module ? exam.module.nomModule : "Unknown",
        enseignant: exam.enseignant ? exam.enseignant.name : "Unknown",
        locaux: exam.locaux ? exam.locaux.map((l: any) => l.nom) : [],
      }));
      console.log("Transformed exams:", transformedExams);

      setExams(transformedExams);
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      setError("Failed to load exams. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (examId: number) => {
    const examToUpdate = exams.find((exam) => exam.id === examId);
    if (examToUpdate) {
      setSelectedExam(examToUpdate);
      setShowEditModal(true);
    }
  };

  const handleDelete = async (examId: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this exam?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8088/api/exams/${examId}`);
      alert("Exam deleted successfully");
      fetchExams(); 
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam. Please try again.");
    }
  };

  const handleExamAdded = () => {
    setShowExamModal(false);
    fetchExams();
  };

  if (!date || !startTime || !endTime) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-500">Missing required parameters</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Navbar />
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4 mt-1">
            Examens pour {date} ({startTime} - {endTime})
          </h1>
          <Link
            href="/session"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Retour vers Sessions
          </Link>
          </div>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowExamModal(true)}
          >
            + Ajouter Examen
          </Button>
        </div>

        {exams.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full table-auto text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Module</th>
                  <th className="px-4 py-2">Enseignant</th>
                  <th className="px-4 py-2">Locaux</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-100 border-b">
                    <td className="px-4 py-2">{exam.module}</td>
                    <td className="px-4 py-2">{exam.enseignant}</td>
                    <td className="px-4 py-2">{exam.locaux.join(", ")}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(exam.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No exams found for this time slot.</p>
        )}

        {showExamModal && (
          <AddExamModal
            showExamModal={showExamModal}
            setShowExamModal={setShowExamModal}
            selectedSlot={{
              day: date,
              timeSlot: { startTime, endTime },
            }}
            // Pass the callback to refresh the list after adding an exam
            onExamAdded={handleExamAdded}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ExamSlot;
