"use client";

import React, { useState, useEffect } from "react";
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
  PointElement,
} from "chart.js";
import Link from "next/link";
import Navbar from "@/components/Navbar"; // Assuming a Navbar component is available
import axios from "axios";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default function DashboardPage() {
  const [stats, setStats] = useState({ exams: 0, enseignants: 0, departments: 0 });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [recentExams, setRecentExams] = useState([]);

  // Fetch stats and data for the dashboard
  useEffect(() => {
    fetchStats();
    fetchChartData();
    fetchRecentExams();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:8088/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get("http://localhost:8088/api/dashboard/department-distribution");
      setChartData({
        labels: response.data.labels,
        datasets: [
          {
            label: "Enseignants per Department",
            data: response.data.data,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchRecentExams = async () => {
    try {
      const response = await axios.get("http://localhost:8088/api/dashboard/recent-exams");
      setRecentExams(response.data);
    } catch (error) {
      console.error("Error fetching recent exams:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
                <span className="text-4xl font-semibold text-indigo-600">{stats.exams}</span>
                <span className="text-gray-500 text-sm mt-2">Nombre total d'exams</span>
              </div>
            </Card>

            <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-sm mb-2">Enseignants</span>
                <span className="text-4xl font-semibold text-indigo-600">{stats.enseignants}</span>
                <span className="text-gray-500 text-sm mt-2">Nombre total d'enseignants</span>
              </div>
            </Card>

            <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-sm mb-2">Departments</span>
                <span className="text-4xl font-semibold text-indigo-600">{stats.departments}</span>
                <span className="text-gray-500 text-sm mt-2">Nombre total de départements</span>
              </div>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Exams Overview Chart */}
            <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Enseignants Overview</h3>
              <Line data={chartData} height={320} />
            </Card>

            {/* Recent Exams Section */}
            <Card className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition duration-300 ease-in-out">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Exams</h3>
              <ul className="space-y-4 text-gray-700">
                {recentExams.map((exam, index) => (
                  <li key={index} className="flex justify-between text-gray-800">
                    <span>{exam.subject}</span>
                    <span className="text-green-600">{exam.score}%</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
