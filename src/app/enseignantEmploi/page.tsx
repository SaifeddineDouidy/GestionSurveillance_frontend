"use client";

import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type SurveillanceData = Record<string, Record<string, string>>;

interface Teacher {
  name: string;
}

const EnseignantEmploi = () => {
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacherId");

  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<SurveillanceData>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    const fetchTeacherTimetable = async () => {
      if (!teacherId) {
        setError("Teacher ID is missing in the query parameters.");
        setLoading(false);
        return;
      }

      try {
        const teacherResponse = await fetch(`http://localhost:8088/api/enseignants/${teacherId}`);
        if (!teacherResponse.ok) throw new Error(`Failed to fetch teacher data: ${teacherResponse.status}`);
        const teacherData = await teacherResponse.json();
        const teacherName = teacherData.name;
        setTeacherName(teacherName);

        const sessionResponse = await fetch(`http://localhost:8088/api/session/${sessionId}`);
        if (!sessionResponse.ok) throw new Error(`Failed to fetch session data: ${sessionResponse.status}`);
        const session = await sessionResponse.json();

        const startDate = new Date(session.startDate);
        const endDate = new Date(session.endDate);
        const generatedDates: string[] = [];
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
          generatedDates.push(new Date(d).toISOString().split("T")[0]);
        }
        setDates(generatedDates);

        const generatedTimeSlots = [
          `${session.morningStart1} - ${session.morningEnd1}`,
          `${session.morningStart2} - ${session.morningEnd2}`,
          `${session.afternoonStart1} - ${session.afternoonEnd1}`,
          `${session.afternoonStart2} - ${session.afternoonEnd2}`,
        ];
        setTimeSlots(generatedTimeSlots);

        const surveillanceResponse = await fetch(
          `http://localhost:8088/api/surveillance/generate?sessionId=${session.id}`
        );
        if (!surveillanceResponse.ok) {
          throw new Error(`Error fetching surveillance data: ${surveillanceResponse.statusText}`);
        }
        const surveillanceData: SurveillanceData = await surveillanceResponse.json();
        const teacherSurveillance = surveillanceData[teacherName] || {};
        setFilteredData({ [teacherName]: teacherSurveillance });
      } catch (error) {
        console.error("Error:", error);
        setError("An error occurred while fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherTimetable();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!teacherId || !teacherName || dates.length === 0 || timeSlots.length === 0) {
    return (
      <div className="p-4">
        <p>No data available.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
        <Navbar />
        <div className="p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mt-4">Timetable for {teacherName}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-10">
      <table className="table-auto w-full border-collapse ">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            {timeSlots.map((slot) => (
              <th key={slot} className="border p-2">
                {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((date) => (
            <tr key={date}>
              <td className="border p-2">{date}</td>
              {timeSlots.map((slot) => {
                const normalizedSlot = slot.replace(/\s/g, "");
                const normalizedKey = `${date} ${normalizedSlot}`;
                let value =
                  filteredData[teacherName || ""]?.[normalizedKey] || "";

                // Check for half-day "RR"
                if (!value) {
                  const morningKey = `${date} Morning (08:00-12:30)`;
                  const afternoonKey = `${date} Afternoon (13:30-17:30)`;

                  if (
                    filteredData[teacherName || ""]?.[morningKey] &&
                    slot.startsWith("08:00")
                  ) {
                    value = "RR";
                  } else if (
                    filteredData[teacherName || ""]?.[afternoonKey] &&
                    slot.startsWith("13:30")
                  ) {
                    value = "RR";
                  }
                }

                return (
                  <td key={slot} className="border p-2 items-center">
                    {value || "...."}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table></div>
      </div></div>
    </div>
  );
};

export default EnseignantEmploi;
