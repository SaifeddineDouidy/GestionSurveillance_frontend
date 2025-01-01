"use client";
import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; 
interface TimeSlot {
  time: string;
}

interface SessionData {
  startDate: string;
  endDate: string;
  timeSlots: TimeSlot[];
}

interface Department {
  id: number;
  departmentName: string;
}

interface Option {
  id: number;
  nomDeFiliere: string;
}

interface Exam {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  option: Option;
  module: {
    nomModule: string;
  };
}

const ExamScheduleTable = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const storedSessionId = localStorage.getItem("sessionId");
        if (!storedSessionId) {
          console.error("No session ID found");
          return;
        }

        const [sessionResponse, examsResponse] = await Promise.all([
          fetch(`http://localhost:8088/api/session/${storedSessionId}/schedule`),
          fetch(`http://localhost:8088/api/exams/session/${storedSessionId}`),
        ]);

        const [sessionData, examsData] = await Promise.all([
          sessionResponse.json(),
          examsResponse.json(),
        ]);

        setSessionData(sessionData);
        setExams(examsData);
        console.log(examsData)
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchSessionData();
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:8088/api/departements");
        const data = await response.json();
        setDepartments(data);
        console.log(data)
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch options based on selected department
  useEffect(() => {
    const fetchOptions = async () => {
      if (!selectedDepartment) return;

      try {
        const response = await fetch(
          `http://localhost:8088/api/departements/${selectedDepartment}/options`
        );
        const data = await response.json();
        setOptions(data);
        console.log(data)
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };

    fetchOptions();
  }, [selectedDepartment]);

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

  const formatTimeSlot = (startTime: string, endTime: string) => {
    // Format time slot to remove seconds
    return `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
  };

  const getExamForSlot = (date: Date, timeSlot: string) => {
    if (!selectedOption) return null;

    return exams.find((exam) => {
      const examDate = new Date(exam.date).toDateString();
      const examTimeSlot = formatTimeSlot(exam.startTime, exam.endTime);

      return (
        examDate === date.toDateString() &&
        examTimeSlot === timeSlot &&
        exam.option.id.toString() === selectedOption
      );
    });
  };

  if (!sessionData) return <div>Loading...</div>;

  const daysInRange = generateDateRange(sessionData.startDate, sessionData.endDate);

  return (
    <div className="p-4">
      <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gray-50 p-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Emplois</h1>
              <Link
                href="/session"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Retour vers Session
              </Link>
            </div>
          </div>

       {/* Department Dropdown */}
       <div className="mb-4">
        <label htmlFor="department" className="block text-gray-700">
          Department:
        </label>
        <Select onValueChange={(value) => setSelectedDepartment(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.departmentName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Option Dropdown */}
      <div className="mb-4">
        <label htmlFor="option" className="block text-gray-700">
          Option:
        </label>
        <Select
          onValueChange={(value) => setSelectedOption(value)}
          disabled={!selectedDepartment}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {option.nomDeFiliere}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">

      

      {/* Exam Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-50">Days</th>
              {sessionData.timeSlots.map((slot, index) => (
                <th key={index} className="border p-2 bg-gray-50">
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
                <td className="border p-2 font-medium bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {day.toLocaleDateString()}
                  </div>
                </td>
                {sessionData.timeSlots.map((timeSlot, index) => {
                  const exam = getExamForSlot(day, timeSlot.time);
                  return (
                    <td key={index} className="border p-2">
                      {exam ? (
                        <div className="p-2 bg-blue-100 rounded">
                          {exam.module.nomModule}
                        </div>
                      ) : (
                        <div className="text-center">-</div>
                      )}
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
      </div></div>
     
    </div>
  );
};

export default ExamScheduleTable;
