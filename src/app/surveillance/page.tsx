"use client";
import Navbar from "@/components/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi"; // Arrow Icons

const SurveillanceTable = () => {
  const [session, setSession] = useState(null);
  const [teachers, setTeachers] = useState([]); // Start with an empty array for teachers
  const [departments, setDepartments] = useState([]); // Department data
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Selected department ID
  const [loading, setLoading] = useState(true); // Spinner loading state

  const tableRef = useRef(null); // Ref for horizontal scroll

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
          const data = await response.json();
          setSession(data);
        } catch (error) {
          console.error("Error fetching session:", error);
        }
      }
    };

    fetchSession();
  }, []);

  // Fetch departments data
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:8088/api/departements'); // Replace with your actual endpoint for departments
        if (!response.ok) {
          throw new Error(`Error fetching departments: ${response.statusText}`);
        }
        const data = await response.json();
        setDepartments(data); // Set the departments state
        setLoading(false); // Stop the spinner when data is fetched
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch teachers based on the selected department
  useEffect(() => {
    if (selectedDepartment !== null) {
      const fetchTeachersByDepartment = async () => {
        setLoading(true); // Show spinner when fetching teachers
        try {
          const response = await fetch(`http://localhost:8088/api/departements/${selectedDepartment}/enseignants`); // Replace with your actual endpoint for teachers by department
          if (!response.ok) {
            throw new Error(`Error fetching teachers: ${response.statusText}`);
          }
          const data = await response.json();
          // Filter teachers to only those with dispense = false
          setTeachers(data.filter((teacher: { dispense: any; }) => !teacher.dispense)); 
          setLoading(false); // Stop the spinner when data is fetched
        } catch (error) {
          console.error("Error fetching teachers:", error);
        }
      };

      fetchTeachersByDepartment();
    }
  }, [selectedDepartment]);

  if (loading || !session || !departments.length) {
    return <div>Loading session, departments, and teachers data...</div>;
  }

  // Generate dates dynamically
  const startDate = new Date(session.startDate);
  const endDate = new Date(session.endDate);
  const dates = [];
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split("T")[0]);
  }

  // Generate time slots dynamically
  const timeSlots = [
    `${session.morningStart1} - ${session.morningEnd1}`,
    `${session.morningStart2} - ${session.morningEnd2}`,
    `${session.afternoonStart1} - ${session.afternoonEnd1}`,
    `${session.afternoonStart2} - ${session.afternoonEnd2}`,
  ];

  // Function to scroll horizontally
  const scrollTable = (direction) => {
    const scrollAmount = 300; // Amount of scroll
    if (tableRef.current) {
      tableRef.current.scrollLeft += direction === "right" ? scrollAmount : -scrollAmount;
    }
  };

  return (
    <div className="p-4 relative">
      <Navbar />
      <h1 className="text-xl font-bold text-center mb-4">Surveillances par départements</h1>

      {/* Department Dropdown Spinner */}
      <div className="mb-4 text-center">
        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectedDepartment(e.target.value)}
          value={selectedDepartment || ""}
        >
          <option value="" disabled>Select Department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.departmentName}
            </option>
          ))}
        </select>
      </div>

      {/* Spinner */}
      {loading && (
        <div className="text-center my-4">
          <span>Loading teachers...</span>
        </div>
      )}

      {/* Scroll Buttons */}
      <button
        onClick={() => scrollTable("left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300"
      >
        <FiArrowLeft size={20} />
      </button>
      <button
        onClick={() => scrollTable("right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300"
      >
        <FiArrowRight size={20} />
      </button>

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="table-auto border-collapse w-full min-w-max">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-center w-32">Enseignants</th>
              {dates.map((date) => (
                <th key={date} colSpan={4} className="border p-2 text-center w-32">
                  {`Matin ${date} Après-midi`}
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
            {teachers.map((teacher, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                <td className="border p-2 w-32 text-center">{teacher.name}</td>
                {dates.map(() =>
                  timeSlots.map((slot, colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`} className="border p-2 w-32 text-center">
                      {/* Empty for now - You can fill it with fetched data */}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SurveillanceTable;
