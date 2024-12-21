"use client"
import Navbar from "@/components/Navbar";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";

interface Session {
  id: number;
  startDate: string;
  endDate: string;
  morningStart1: string;
  morningEnd1: string;
  morningStart2: string;
  morningEnd2: string;
  afternoonStart1: string;
  afternoonEnd1: string;
  afternoonStart2: string;
  afternoonEnd2: string;
}

interface Department {
  id: number;
  departmentName: string;
}

interface Teacher {
  id: number;
  name: string;
  dispense: boolean;
}

type SurveillanceData = Record<string, Record<string, string>>;

const SurveillanceTable: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [surveillanceData, setSurveillanceData] = useState<SurveillanceData>({});
  const [filteredData, setFilteredData] = useState<SurveillanceData>({});

  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        try {
          const response = await fetch(`http://localhost:8088/api/session/${sessionId}`);
          if (!response.ok) {
            throw new Error(`Error fetching session: ${response.statusText}`);
          }
          const data: Session = await response.json();
          setSession(data);
        } catch (error) {
          console.error("Error fetching session:", error);
        }
      }
    };

    fetchSession();
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:8088/api/departements");
        if (!response.ok) {
          throw new Error(`Error fetching departments: ${response.statusText}`);
        }
        const data: Department[] = await response.json();
        setDepartments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch teachers based on the selected department
  useEffect(() => {
    if (selectedDepartment !== null) {
      const fetchTeachers = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:8088/api/departements/${selectedDepartment}/enseignants`
          );
          if (!response.ok) {
            throw new Error(`Error fetching teachers: ${response.statusText}`);
          }
          const data: Teacher[] = await response.json();
          setTeachers(data.filter((teacher) => !teacher.dispense));
          setLoading(false);
        } catch (error) {
          console.error("Error fetching teachers:", error);
        }
      };

      fetchTeachers();
    }
  }, [selectedDepartment]);

  // Fetch and filter surveillance data
  useEffect(() => {
    if (selectedDepartment !== null && session) {
      const fetchSurveillance = async () => {
        try {
          const response = await fetch(
            `http://localhost:8088/api/surveillance/generate?sessionId=${session.id}`
          );
          if (!response.ok) {
            throw new Error(`Error fetching surveillance data: ${response.statusText}`);
          }
          const data: SurveillanceData = await response.json();
          console.log("Fetched Surveillance Data:", data);

          // Filter surveillance data to include only teachers in the selected department
          const filtered = Object.keys(data)
            .filter((teacherName) => teachers.some((teacher) => teacher.name === teacherName))
            .reduce((acc, teacherName) => {
              acc[teacherName] = data[teacherName];
              return acc;
            }, {} as SurveillanceData);

          setSurveillanceData(data);
          setFilteredData(filtered); 
          console.log(filtered)// Set filtered data for rendering
        } catch (error) {
          console.error("Error fetching surveillance data:", error);
        }
      };

      fetchSurveillance();
    }
  }, [selectedDepartment, session, teachers]);

  if (loading || !session || !departments.length) {
    return <div>Loading...</div>;
  }

  // Generate dates dynamically
  const startDate = new Date(session.startDate);
  const endDate = new Date(session.endDate);
  const dates: string[] = [];
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split("T")[0]);
  }

  // Generate time slots dynamically
  const timeSlots: string[] = [
    `${session.morningStart1} - ${session.morningEnd1}`,
    `${session.morningStart2} - ${session.morningEnd2}`,
    `${session.afternoonStart1} - ${session.afternoonEnd1}`,
    `${session.afternoonStart2} - ${session.afternoonEnd2}`,
  ];
  const logAndReturnValue = (teacherName: any, date: any, slot: any, value: any) => {
    console.log(`Teacher: ${teacherName}, Date: ${date}, Slot: ${slot}, Value: ${value}`);
    return value;
  };

  // Scroll function
  const scrollTable = (direction: "left" | "right") => {
    const scrollAmount = 300;
    if (tableRef.current) {
      tableRef.current.scrollLeft += direction === "right" ? scrollAmount : -scrollAmount;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 p-12">
      <div className="flex justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold mt-2 mb-4">Surveillances par départements </h1>
                    <Link
              href="/session"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Session
            </Link></div>
                    
                </div>


      {/* Department Dropdown */}

      <div className="mb-4 ">
        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectedDepartment(Number(e.target.value))}
          value={selectedDepartment || ""}
        >
          <option value="" disabled>
            Select Department
          </option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.departmentName}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto">
      
        <table className="table-auto border-collapse w-full min-w-max">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-center w-32">Enseignants</th>
              {dates.map((date) => (
                <th key={date} colSpan={4} className="border p-2 text-center w-32">
                  {date}
                </th>
              ))}
            </tr>
            <tr>
              <th className="border p-2"></th>
              {dates.map(() =>
                timeSlots.map((slot) => (
                  <th key={slot} className="border p-2 text-center bg-gray-50 w-32">
                    {slot}
                  </th>
                ))
              )}
            </tr>
          </thead>

          <tbody>
  {teachers.map((teacher) => {
    const normalizedTeacherName = teacher.name.trim();

    return (
      <tr key={teacher.id} className="hover:bg-gray-50">
        {/* Teacher Name */}
        <td className="border p-2 w-32 text-center">{teacher.name}</td>

        {/* Surveillance Data */}
        {dates.map((date) =>
          timeSlots.map((slot) => {
            const normalizedSlot = slot.replace(/\s/g, ""); // Remove spaces from slot
            const normalizedKey = `${date} ${normalizedSlot}`; // Combine date and slot

            // Handle reservists
            let value = filteredData[normalizedTeacherName]?.[normalizedKey] || "";

            // Check for half-day reservists (e.g., Morning or Afternoon)
            if (!value) {
              const morningKey = `${date} Morning (08:00-12:30)`;
              const afternoonKey = `${date} Afternoon (13:30-17:30)`;

              // If the reservist spans a morning or afternoon, assign "RR" to all relevant slots
              if (
                filteredData[normalizedTeacherName]?.[morningKey] &&
                slot.startsWith("08:00")
              ) {
                value = "RR";
              } else if (
                filteredData[normalizedTeacherName]?.[afternoonKey] &&
                slot.startsWith("13:30")
              ) {
                value = "RR";
              }
            }

            return (
              <td
                key={`${teacher.id}-${date}-${slot}`}
                className="border p-2 w-32 text-center"
              >
                {value}
              </td>
            );
          })
        )}
      </tr>
    );
  })}
</tbody>


        </table>
        
      </div>
      </div>
      </div>
    </div>
  );
};

export default SurveillanceTable;