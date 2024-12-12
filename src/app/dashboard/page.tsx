"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFileAlt,
  faEye,
  faBriefcase,
  faCog,
  faBuilding,
  faDoorOpen,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";


const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const chartOptions = {
    chart: {
      id: "basic-bar",
    },
    xaxis: {
      categories: ["November 6th, 2024", "November 7th, 2024", "November 8th, 2024"],
    },
  };

  const chartSeries = [
    {
      name: "Exams",
      data: [30, 40, 45],
    },
  ];

  return (
    <div className="bg-gray-100 p-8">
      <Navbar/>

      {/* Main Content */}
      <div className="mt-24">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <Link href="/sessions" className="text-sm hover:text-indigo-800 font-medium">
              ← Back to Sessions
            </Link>
          </div>
        </div>

        <div className="container mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm mb-2">Exams</span>
                <span className="text-3xl font-bold">7</span>
                <span className="text-gray-500 text-sm mt-2">Nombre total d'exams du dernier session</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm mb-2">Enseignants</span>
                <span className="text-3xl font-bold">15</span>
                <span className="text-gray-500 text-sm mt-2">Nombre total d'enseignants</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <ApexChart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={320}
              />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Exams</h3>
              <ul className="space-y-4">
                <li className="flex justify-between">
                  <span>Math</span>
                  <span>90%</span>
                </li>
                <li className="flex justify-between">
                  <span>Physics</span>
                  <span>85%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
