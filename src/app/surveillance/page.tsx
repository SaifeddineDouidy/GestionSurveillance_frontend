"use client";

import React, { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { Loader2 } from "lucide-react";

// 1. Import shadcn/ui's Select components:
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; 

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
          // Filter out teachers who have dispense = true
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
    const fetchSurveillance = async () => {
      if (selectedDepartment !== null && session) {
        try {
          const response = await fetch(
            `http://localhost:8088/api/surveillance/generate?sessionId=${session.id}`
          );
          if (!response.ok) {
            throw new Error(`Error fetching surveillance data: ${response.statusText}`);
          }
          const data: SurveillanceData = await response.json();

          // Filter surveillance data to only include teachers in the selected department
          const filtered = Object.keys(data)
            .filter((teacherName) =>
              teachers.some((teacher) => teacher.name === teacherName)
            )
            .reduce((acc, teacherName) => {
              acc[teacherName] = data[teacherName];
              return acc;
            }, {} as SurveillanceData);

          setSurveillanceData(data);
          setFilteredData(filtered);
        } catch (error) {
          console.error("Error fetching surveillance data:", error);
        }
      }
    };
    fetchSurveillance();
  }, [selectedDepartment, session, teachers]);

  // If still loading or missing essential data
  if (loading || !session || !departments.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-gradient-to-r from-white to-blue-50">
        <div className="p-4 bg-white rounded-full shadow-lg">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
        <p className="text-gray-700 text-lg font-semibold">Loading data...</p>
      </div>
    );
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

  // Scroll horizontally
  const scrollTable = (direction: "left" | "right") => {
    const scrollAmount = 300;
    if (tableRef.current) {
      tableRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Surveillances par départements</h1>
          <Link
            href="/session"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Retour vers Session
          </Link>
        </div>

        {/* Department selector + Arrows */}
        <div className="flex items-center justify-between mb-4">
          <Select
            onValueChange={(value) => setSelectedDepartment(Number(value))}
            value={selectedDepartment ? selectedDepartment.toString() : ""}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem
                  key={department.id}
                  value={department.id.toString()}
                >
                  {department.departmentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <button
              onClick={() => scrollTable("left")}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              <FiArrowLeft />
            </button>
            <button
              onClick={() => scrollTable("right")}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Scrollable table */}
        <div ref={tableRef} className="overflow-x-auto border border-gray-300 rounded">
          <table className="table-auto border-collapse w-full min-w-max">
            {/* Dates row */}
            <thead>
              <tr className="bg-gray-100">
                {/* 
                  Make this header cell sticky 
                  so the "Enseignants" label doesn’t scroll horizontally
                */}
                <th
                  className="
                    sticky left-0 z-10 bg-white 
                    border p-2 text-center w-32
                  "
                >
                  Enseignants
                </th>
                {dates.map((date) => (
                  <th key={date} colSpan={4} className="border p-2 text-center">
                    {date}
                  </th>
                ))}
              </tr>
              <tr>
                {/* 
                  Empty <th> for alignment of the teacher column 
                  also must be sticky
                */}
                <th
                  className="
                    sticky left-0 z-10 bg-white
                    border p-2 w-32
                  "
                />
                {dates.map(() =>
                  timeSlots.map((slot) => (
                    <th key={slot} className="border p-2 text-center bg-gray-50 w-32">
                      {slot}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            {/* Teachers & data */}
            <tbody>
            {teachers.map((teacher) => {
  const normalizedTeacherName = teacher.name.trim();
  return (
    <tr key={teacher.id} className="hover:bg-gray-50">
      {/* Teacher name cell */}
      <td
        className="
          sticky left-0 z-10 bg-white
          border p-2 text-center w-32
        "
      >
        <Link href={`/enseignantEmploi?teacherId=${teacher.id}`}>
          {teacher.name}
        </Link>
      </td>

      {/* Day/time data */}
      {dates.map((date) =>
        timeSlots.map((slot) => {
          const normalizedSlot = slot.replace(/\s/g, "");
          const normalizedKey = `${date} ${normalizedSlot}`;

          let value = filteredData[normalizedTeacherName]?.[normalizedKey] || "";

          // Dynamically parse JSON for Morning or Afternoon RR based on session
          const morningKey = `${date} Morning (${session.morningStart1}-${session.morningEnd2})`;
          const afternoonKey = `${date} Afternoon (${session.afternoonStart1}-${session.afternoonEnd2})`;

          // If "RR" is found for the morning or afternoon in the JSON
          const isMorningRR =
            filteredData[normalizedTeacherName]?.[morningKey] === "RR";
          const isAfternoonRR =
            filteredData[normalizedTeacherName]?.[afternoonKey] === "RR";

          // Assign "RR" to all morning slots if morning RR is found
          if (isMorningRR && (slot.startsWith(session.morningStart1) || slot.startsWith(session.morningStart2))) {
            value = "RR";
          }

          // Assign "RR" to all afternoon slots if afternoon RR is found
          if (isAfternoonRR && (slot.startsWith(session.afternoonStart1) || slot.startsWith(session.afternoonStart2))) {
            value = "RR";
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

      <Footer />
    </div>
  );
};

export default SurveillanceTable;
