"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import Link from "next/link";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default function DashboardPage() {
  const [stats, setStats] = useState({ exams: 0, enseignants: 0, departments: 0 });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [recentExams, setRecentExams] = useState([]);

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
            data: response.data.values,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
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
      <div className="p-6">
        <div className="mt-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <Link href="/session" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Sessions
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg p-6 rounded-xl">
            <h2 className="text-gray-500 text-sm mb-2">Exams</h2>
            <p className="text-4xl font-semibold text-indigo-600">{stats.exams}</p>
          </Card>
          <Card className="bg-white shadow-lg p-6 rounded-xl">
            <h2 className="text-gray-500 text-sm mb-2">Enseignants</h2>
            <p className="text-4xl font-semibold text-indigo-600">{stats.enseignants}</p>
          </Card>
          <Card className="bg-white shadow-lg p-6 rounded-xl">
            <h2 className="text-gray-500 text-sm mb-2">Departments</h2>
            <p className="text-4xl font-semibold text-indigo-600">{stats.departments}</p>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <Card className="bg-white shadow-lg p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Enseignants per Department</h3>
            <Bar data={chartData} height={320} />
          </Card>

          {/* Recent Exams */}
          <Card className="bg-white shadow-lg p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Exams</h3>
            <ul className="space-y-4">
              {recentExams.map((exam, index) => (
                <li key={index} className="flex justify-between">
                  <span>{exam.subject}</span>
                  <span className="text-gray-500">{exam.date}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}