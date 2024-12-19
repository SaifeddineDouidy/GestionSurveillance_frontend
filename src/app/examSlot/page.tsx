"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddExamModal from "@/components/AddExamModal";
import axios from "axios";
import Navbar from "@/components/Navbar";

interface Exam {
  id: number;
  module: string;
  enseignant: string;
  locaux: string[];
}

const ExamSlot = () => {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  const [exams, setExams] = useState<Exam[]>([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date && startTime && endTime) {
      fetchExams();
    }
  }, [date, startTime, endTime]);

  const fetchExams = async () => {
    
  };



  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Navbar />
      <div className="bg-white rounded-lg shadow p-6">
      
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">
          Exams for {date} ({startTime} - {endTime})
        </h1>

        <Button
          variant="default"
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowExamModal(true)}
        >
          + Add Exam
        </Button></div>

        {exams.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full table-auto text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Module</th>
                  <th className="px-4 py-2">Enseignant</th>
                  <th className="px-4 py-2">Locaux</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-100 border-b">
                    <td className="px-4 py-2">{exam.module}</td>
                    <td className="px-4 py-2">{exam.enseignant}</td>
                    <td className="px-4 py-2">{exam.locaux.join(", ")}</td>
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
          />
        )}
      </div>
    </div>
  );
};

export default ExamSlot;
