"use client";
import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import AddExamModal from "../component/AddExamModal";

const ExamSchedule = () => {
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  const storedSessionId = localStorage.getItem("sessionId");

  const handleCellClick = (day: Date, timeSlot: { time: string; }) => {
    setSelectedSlot({
      day,
      timeSlot: {
        ...timeSlot,
        startTime: timeSlot.time.split(' - ')[0],
        endTime: timeSlot.time.split(' - ')[1]
      }
    });
    setShowExamModal(true);
  };


  useEffect(() => {
    const fetchSessionData = async () => {
      const response = await fetch(
        `http://localhost:8088/api/session/${storedSessionId}/schedule`
      );
      const data = await response.json();
      setSessionData(data);
    };

    fetchSessionData();
  }, []);

  const generateDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray = [];
    let currentDate = start;
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  };


  if (!sessionData) return <div>Loading...</div>;

  const daysInRange = generateDateRange(sessionData.startDate, sessionData.endDate);

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Exam Schedule</h2>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50">Jours</th>
              {sessionData.timeSlots.map((slot: any, index: number) => (
                <th key={index} className="border p-3 bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} />
                    {slot.time}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysInRange.map((day, dayIndex) => (
              <tr key={dayIndex}>
                <td className="border p-3 font-medium bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <div>{day.toLocaleDateString()}</div>
                  </div>
                </td>
                {sessionData.timeSlots.map((timeSlot: any, index: number) => (
                  <td
                    key={index}
                    className="border p-3 cursor-pointer transition-colors hover:bg-blue-50"
                    onClick={() => handleCellClick(day, timeSlot)}
                  >
                    <div className="text-gray-400">Ajouter un examen</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal for adding exam */}
        {showExamModal && (
          <AddExamModal
            showExamModal={showExamModal}
            setShowExamModal={setShowExamModal}
            selectedSlot={selectedSlot}
          />
        )}
      </div>
    </div>
  );
};

export default ExamSchedule;