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
import { Briefcase, ClipboardList, Users } from "lucide-react";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface Exam {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  departement: string;
  enseignant: string;
  option: string;
  module: string;
}

interface Stats {
  exams: number;
  enseignants: number;
  departments: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    exams: 0,
    enseignants: 0,
    departments: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [recentExams, setRecentExams] = useState<Exam[]>([]);
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    fetchStats();
    fetchChartData();
    fetchRecentExams();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8088/api/dashboard/stats"
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8088/api/dashboard/department-distribution"
      );

      const maxValue = Math.max(...response.data.values);

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

      setChartOptions({
        scales: {
          y: {
            beginAtZero: true,
            max: maxValue + 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchRecentExams = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8088/api/dashboard/recent-exams"
      );
      setRecentExams(response.data);
    } catch (error) {
      console.error("Error fetching recent exams:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-14">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <Link
            href="/session"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Retour vers Sessions
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg p-4 rounded-xl flex items-center gap-4">
            <ClipboardList className="text-indigo-600 w-10 h-10" />
            <div>
              <h2 className="text-gray-800 text-md mb-2">Exams</h2>
              <p className="text-4xl font-semibold text-indigo-600">
                {stats.exams}
              </p>
            </div>
          </Card>
          <Card className="bg-white shadow-lg p-4 rounded-xl flex items-center gap-4">
            <Users className="text-indigo-600 w-10 h-10" />
            <div>
              <h2 className="text-gray-800 text-md mb-2">Enseignants</h2>
              <p className="text-4xl font-semibold text-indigo-600">
                {stats.enseignants}
              </p>
            </div>
          </Card>
          <Card className="bg-white shadow-lg p-4 rounded-xl flex items-center gap-4">
            <Briefcase className="text-indigo-600 w-10 h-10" />
            <div>
              <h2 className="text-gray-800 text-md mb-2">Departments</h2>
              <p className="text-4xl font-semibold text-indigo-600">
                {stats.departments}
              </p>
            </div>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <Card className="bg-white shadow-lg p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Enseignants per Department
            </h3>
            {chartData.datasets.length > 0 &&
            chartData.datasets[0].data.length > 0 ? (
              <Bar
                data={chartData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: Math.max(...chartData.datasets[0].data) + 1, // Dynamic max value
                    },
                  },
                }}
                height={220}
              />
            ) : (
              <p className="text-gray-500 text-center">
                No data available for the chart.
              </p>
            )}
          </Card>
          {/* Recent Exams */}
          <Card className="bg-white shadow-lg p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Recent Exams
            </h3>
            {recentExams.length > 0 ? (
              <div className="overflow-x-auto rounded-lg">
                <table className="table-auto w-full text-left border-collapse border border-gray-300 rounded-lg">
                  <thead className="bg-gray-200">
                    <tr style={{ backgroundColor: "rgba(54, 162, 235, 0.5)" }}>
                      <th className="px-4 py-2 text-white">Module</th>
                      <th className="px-4 py-2 text-white">Option</th>
                      <th className="px-4 py-2 text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExams.map((exam, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-2 border-t border-gray-300">
                          {exam.module}
                        </td>
                        <td className="px-4 py-2 border-t border-gray-300">
                          {exam.option}
                        </td>
                        <td className="px-4 py-2 border-t border-gray-300">
                          {exam.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No recent exams available.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
