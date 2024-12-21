"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface TimeSlot {
  time: string;
}

interface SessionData {
  startDate: string;
  endDate: string;
  timeSlots: TimeSlot[];
}

const ExamSchedule = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [examCounts, setExamCounts] = useState<Record<string, number>>({});

  const fetchExamCounts = async (date: string, time: string) => {
    try {
      const [startTime, endTime] = time.split(" - ");
      const formattedStart = `${startTime}:00`;
      const formattedEnd = `${endTime}:00`;

      const response = await fetch(
        `http://localhost:8088/api/exams/search?date=${date}&startTime=${formattedStart}&endTime=${formattedEnd}`
      );
      const data = await response.json();
      return data.length; // Assuming `data` is an array of exams
    } catch (error) {
      console.error("Error fetching exam counts:", error);
      return 0;
    }
  };

  const handleCellClick = (day: Date, timeSlot: TimeSlot) => {
    const [startTime, endTime] = timeSlot.time.split(" - ");
    const formattedDate = day.toISOString().split("T")[0];
    window.location.href = `/examSlot?date=${formattedDate}&startTime=${startTime}&endTime=${endTime}`;
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const storedSessionId = localStorage.getItem("sessionId");
        if (!storedSessionId) {
          console.error("No session ID found");
          return;
        }

        const response = await fetch(
          `http://localhost:8088/api/session/${storedSessionId}/schedule`
        );
        const data = await response.json();
        setSessionData(data);

        const counts: Record<string, number> = {};
        const daysInRange = generateDateRange(data.startDate, data.endDate);

        for (const day of daysInRange) {
          for (const slot of data.timeSlots) {
            const formattedDate = day.toISOString().split("T")[0];
            const key = `${formattedDate}_${slot.time}`;
            counts[key] = await fetchExamCounts(formattedDate, slot.time);
          }
        }

        setExamCounts(counts);
      } catch (error) {
        console.error("Failed to fetch session data:", error);
      }
    };

    fetchSessionData();
  }, []);

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

  if (!sessionData) return <div>Loading...</div>;

  const daysInRange = generateDateRange(sessionData.startDate, sessionData.endDate);

  return (
    <div>
      <Navbar />
      <div className="p-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-4">Crenaux des Exams</h1>
          <Link href="/session" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Sessions
          </Link>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50">Days</th>
              {sessionData.timeSlots.map((slot: TimeSlot, index: number) => (
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
                {sessionData.timeSlots.map((timeSlot: TimeSlot, index: number) => {
                  const formattedDate = day.toISOString().split("T")[0];
                  const key = `${formattedDate}_${timeSlot.time}`;
                  const count = examCounts[key] || "Add exam";

                  return (
                    <td
                      key={index}
                      className="border p-3 cursor-pointer hover:bg-blue-50"
                      onClick={() => handleCellClick(day, timeSlot)}
                    >
                      <div className="text-center text-blue-600 font-bold">{count}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default ExamSchedule;
