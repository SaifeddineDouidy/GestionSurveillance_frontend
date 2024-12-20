"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

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
  const pathname = usePathname();
  const router = useRouter();

  // Navigates to a given time slot page
  const navigateToTimeSlot = (formattedDate: string, startTime: string, endTime: string) => {
    const url = `/examSlot?date=${formattedDate}&startTime=${startTime}&endTime=${endTime}`;
    // Using window.location for navigation
    window.location.href = url;
  };

  const handleCellClick = (day: Date, timeSlot: TimeSlot) => {
    const [startTime, endTime] = timeSlot.time.split(" - ");
    const formattedDate = day.toISOString().split("T")[0];

    try {
      navigateToTimeSlot(formattedDate, startTime, endTime);
    } catch (err) {
      console.error("Navigation error:", err);
      // Fallback
      window.location.href = `/examSlot?date=${formattedDate}&startTime=${startTime}&endTime=${endTime}`;
    }
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
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Exam Schedule</h2>
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
                {sessionData.timeSlots.map((timeSlot: TimeSlot, index: number) => (
                  <td
                    key={index}
                    className="border p-3 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleCellClick(day, timeSlot)}
                  >
                    <div className="text-gray-400">Add exam</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamSchedule;
