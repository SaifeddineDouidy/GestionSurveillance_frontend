"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

interface TimeSlot {
  time: string;
}

interface SessionData {
  startDate: string;
  endDate: string;
  timeSlots: TimeSlot[];
}

interface Occupation {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  cause: string;
}

const EmpechementPage = () => {
  const searchParams = useSearchParams();
  const enseignantId = searchParams.get("enseignantId");
  const enseignantName = searchParams.get("enseignantName");
  const sessionId = localStorage.getItem("sessionId"); // Replace with actual session ID from localStorage or props
  const normalizeTime = (time: string) => time.split(":").slice(0, 2).join(":");

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Occupation | null>(null);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const response = await fetch(
          "http://localhost:8088/api/session/holidays"
        );
        if (response.ok) {
          const data = await response.json();
          setHolidays(data.map((holiday: { date: string }) => holiday.date));
        } else {
          console.error("Failed to fetch holidays");
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    }

    fetchHolidays();
  }, []);

  useEffect(() => {
    async function fetchSessionData() {
      try {
        const response = await fetch(
          `http://localhost:8088/api/session/${sessionId}/schedule`
        );
        const data = await response.json();
        setSessionData(data);

        const occupationsResponse = await fetch(
          `http://localhost:8088/api/occupations/${enseignantId}/${sessionId}`
        );
        const occupationsData = await occupationsResponse.json();
        setOccupations(Array.isArray(occupationsData) ? occupationsData : []);
        console.log(occupationsData); // Ensure occupations is an array
      } catch (error) {
        console.error("Failed to fetch session data:", error);
      }
    }

    fetchSessionData();
  }, [enseignantId, sessionId]);

  const isSunday = (date: Date) => date.getDay() === 0;

  const isHoliday = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return holidays.includes(formattedDate);
  };

  const handleCellClick = (date: Date, timeSlot: TimeSlot) => {
    const formattedDate = date.toISOString().split("T")[0];
    const startTime = normalizeTime(timeSlot.time.split(" - ")[0]);
    const endTime = normalizeTime(timeSlot.time.split(" - ")[1]);

    const existingOccupation = occupations.find(
      (occ) =>
        occ.date === formattedDate && normalizeTime(occ.startTime) === startTime
    );

    if (existingOccupation) {
      setSelectedSlot(existingOccupation);
    } else {
      setSelectedSlot({
        date: formattedDate,
        startTime,
        endTime,
        cause: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleSaveOccupation = async () => {
    if (!selectedSlot) return;

    try {
      if (selectedSlot.id) {
        // Update existing occupation
        await fetch(
          `http://localhost:8088/api/occupations/${selectedSlot.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedSlot),
          }
        );
        setOccupations((prev) =>
          prev.map((occ) => (occ.id === selectedSlot.id ? selectedSlot : occ))
        );
      } else {
        // Add new occupation
        const response = await fetch("http://localhost:8088/api/occupations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enseignant: { id: enseignantId },
            session: { id: sessionId },
            date: selectedSlot.date,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            cause: selectedSlot.cause,
          }),
        });
        const newOccupation = await response.json();

        if (response.ok) {
          setOccupations((prev) => {
            // Replace or add the occupation
            const existingIndex = prev.findIndex(
              (occ) => occ.id === newOccupation.id
            );
            if (existingIndex > -1) {
              prev[existingIndex] = newOccupation;
              return [...prev];
            }
            return [...prev, newOccupation];
          });
        }

        setIsModalOpen(false);
        setSelectedSlot(null);
        console.log(newOccupation);
      }

      setIsModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error saving occupation:", error);
    }
  };

  const handleDeleteOccupation = async () => {
    if (!selectedSlot?.id) return;

    try {
      await fetch(`http://localhost:8088/api/occupations/${selectedSlot.id}`, {
        method: "DELETE",
      });
      setOccupations((prev) =>
        prev.filter((occ) => occ.id !== selectedSlot.id)
      );
      setIsModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error deleting occupation:", error);
    }
  };

  if (!sessionData) return <div>Loading...</div>;
  const renderOccupations = (day: Date, timeSlot: TimeSlot) => {
    const formattedDate = day.toISOString().split("T")[0];
    const startTime = normalizeTime(timeSlot.time.split(" - ")[0]);

    const occupation = occupations.find(
      (occ) =>
        occ.date === formattedDate && normalizeTime(occ.startTime) === startTime
    );

    console.log(
      `Rendering for date: ${formattedDate}, startTime: ${startTime}`,
      occupation
    );

    return occupation ? occupation.cause : "Ajouter";
  };

  const generateDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray: Date[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  const daysInRange = generateDateRange(
    sessionData.startDate,
    sessionData.endDate
  );

  return (
    <div>
      <Navbar />
      <div className="p-12">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1 ">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Gérer les empêchements de: {enseignantName}
            </h1>
            <Link
              href="/departement"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-2"
            >
              ← Retour vers Departements
            </Link>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-3 bg-gray-50">Jours</th>
                {sessionData.timeSlots.map((slot, index) => (
                  <th key={index} className="border p-3 bg-gray-50">
                    <div className="flex items-center gap-2 justify-center">
                      <Clock size={16} />
                      <span>{slot.time}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysInRange.map((day, dayIndex) => (
                <tr key={dayIndex}>
                  <td className="border p-3 bg-gray-50 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{day.toLocaleDateString()}</span>
                    </div>
                  </td>

                  {isHoliday(day) ? (
                    <td
                      colSpan={sessionData.timeSlots.length}
                      className="border p-3 text-center bg-red-200"
                    >
                      Vacance
                    </td>
                  ) : (
                    sessionData.timeSlots.map((slot, index) => (
                      <td
                        key={index}
                        className={`border p-3 text-center ${
                          isSunday(day)
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : occupations.find(
                                (occ) =>
                                  occ.date ===
                                    day.toISOString().split("T")[0] &&
                                  normalizeTime(occ.startTime) ===
                                    normalizeTime(slot.time.split(" - ")[0])
                              )
                            ? "bg-red-100 text-red-700"
                            : "cursor-pointer hover:bg-blue-50"
                        }`}
                        onClick={() => handleCellClick(day, slot)}
                      >
                        {renderOccupations(day, slot)}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSlot?.id
                  ? "Modifier l'empêchement"
                  : "Ajouter un empêchement"}
              </DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              value={selectedSlot?.cause || ""}
              onChange={(e) =>
                setSelectedSlot({ ...selectedSlot!, cause: e.target.value })
              }
              placeholder="Cause de l'empêchement"
              className="mb-4"
            />
            <div className="flex justify-between">
              {selectedSlot?.id && (
                <Button variant="destructive" onClick={handleDeleteOccupation}>
                  Supprimer
                </Button>
              )}
              <Button variant="blue" onClick={handleSaveOccupation}>
                {selectedSlot?.id ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmpechementPage;
