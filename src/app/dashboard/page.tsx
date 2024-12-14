"use client"
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement, // Ensure PointElement is imported
} from "chart.js";
import Link from "next/link";
import Navbar from "@/components/Navbar"; // Assuming a Navbar component is available

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement // Register PointElement to avoid the error
);

const chartData = {
  labels: ["Nov 6", "Nov 7", "Nov 8"],
  datasets: [
    {
      label: "Exams Performance",
      data: [30, 40, 45],
      borderColor: "rgba(75, 192, 192, 1)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      fill: true,
    },
  ],
};

export default function DashboardPage() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">


      <div className=""> {/* Add padding to prevent content from hiding behind navbar */}
          <div className="mt-8 mb-6">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                <Link href="/session" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  ← Back to Sessions
                </Link>
              </div>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-sm mb-2">Exams</span>
                  <span className="text-4xl font-semibold text-indigo-600">7</span>
                  <span className="text-gray-500 text-sm mt-2">Nombre total d'exams</span>
                </div>
              </Card>

              <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-sm mb-2">Enseignants</span>
                  <span className="text-4xl font-semibold text-indigo-600">15</span>
                  <span className="text-gray-500 text-sm mt-2">Nombre total d'enseignants</span>
                </div>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Exams Overview Chart */}
              <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Exams Overview</h3>
                <Line data={chartData} height={320} />
              </Card>

              {/* Recent Exams Section */}
              <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Exams</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex justify-between text-gray-800">
                    <span>Math</span>
                    <span className="text-green-600">90%</span>
                  </li>
                  <li className="flex justify-between text-gray-800">
                    <span>Physics</span>
                    <span className="text-yellow-600">85%</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
