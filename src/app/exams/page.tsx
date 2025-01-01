"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";

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
  const [holidays, setHolidays] = useState<string[]>([]);


  useEffect(() => {
    async function fetchHolidays() {
      try {
        const response = await fetch(
          "http://localhost:8088/api/session/holidays"
        );
        if (response.ok) {
          const data = await response.json();
          setHolidays(data.map((holiday: { date: string }) => holiday.date));
          console.log(data);
        } else {
          console.error("Failed to fetch holidays");
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    }

    fetchHolidays();
  }, []);

  const isSunday = (date: Date) => date.getDay() === 0;

  const isHoliday = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    return holidays.includes(formattedDate); // Check if formattedDate exists in holidays
  };

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
    if (isSunday(day) || isHoliday(day)) {
      alert("Exams cannot be scheduled on Sundays or holidays.");
      return; // Prevent further logic for invalid dates
    }

    // Proceed with the valid scheduling logic
    const [startTime, endTime] = timeSlot.time.split(" - ");
    const formattedDate = day.toISOString().split("T")[0];
    window.location.href = `/examSlot?date=${formattedDate}&startTime=${startTime}&endTime=${endTime}`;
  };

  const getCellClass = (date: Date) => {
    if (isSunday(date)) return "bg-gray-200 text-gray-500 cursor-not-allowed"; // Sunday style
    if (isHoliday(date)) return "bg-red-200 text-red-700 cursor-not-allowed"; // Holiday style
    return "cursor-pointer hover:bg-blue-50"; // Default style for valid dates
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

  const daysInRange = generateDateRange(
    sessionData.startDate,
    sessionData.endDate
  );

  return (
    <div>
      <Navbar />
      <div className="p-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-4">
            Crenaux des Exams
          </h1>
          <Link
            href="/session"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Retour vers Sessions
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
              {daysInRange.map((day, dayIndex) => {
                const isHolidayCell = isHoliday(day);
                const isSundayCell = isSunday(day);

                return (
                  <tr key={dayIndex}>
                    <td className="border p-3 font-medium bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <div>{day.toLocaleDateString()}</div>
                      </div>
                    </td>

                    {/* If the day is a holiday, render a single merged cell */}
                    {isHolidayCell ? (
                      <td
                        colSpan={sessionData.timeSlots.length} // Span across all time slots
                        className="border p-3 text-center bg-red-200 text-red-700 font-bold cursor-not-allowed"
                      >
                        Vacance
                      </td>
                    ) : (
                      // Regular time slots
                      sessionData.timeSlots.map(
                        (timeSlot: TimeSlot, index: number) => {
                          const formattedDate = day.toISOString().split("T")[0];
                          const key = `${formattedDate}_${timeSlot.time}`;
                          const count = isSundayCell
                            ? ""
                            : examCounts[key] || "Ajouter exam";

                          return (
                            <td
                              key={index}
                              className={`text-blue-800 border p-3 text-center font-bold ${getCellClass(
                                day
                              )}`}
                              onClick={() => {
                                if (!isSundayCell && !isHolidayCell)
                                  handleCellClick(day, timeSlot);
                              }}
                            >
                              {count}
                            </td>
                          );
                        }
                      )
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExamSchedule;
