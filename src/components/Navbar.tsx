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


export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };


  return (
    <div className="bg-gray-100 p-8">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 ml-2 w-auto" // Properly resized logo
            />
          </div>
            
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
    <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Dashboard
  </Link>
  <Link href="/exams" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
    <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> Exams
  </Link>
  <Link href="/surveillance" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
    <FontAwesomeIcon icon={faEye} className="mr-2" /> Surveillance
  </Link>
  <Link href="/emploi" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
    <FontAwesomeIcon icon={faBriefcase} className="mr-2" /> Emploi
  </Link>
  <Link href="/options" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
    <FontAwesomeIcon icon={faCog} className="mr-2" /> Options
  </Link>
  <Link href="/departments" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
    <FontAwesomeIcon icon={faBuilding} className="mr-2" /> Départements
  </Link>
  <Link href="/locaux" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
    <FontAwesomeIcon icon={faDoorOpen} className="mr-2" /> Locaux
  </Link>
  <div className="relative">
    <button
      onClick={toggleUserMenu}
      className="flex items-center text-gray-600 hover:text-gray-900"
    >
      <FontAwesomeIcon icon={faUser} className="text-lg" />
    </button>
    {isUserMenuOpen && (
      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
        <ul className="py-1 text-sm text-gray-700">
          <li>
            <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
              Profile
            </Link>
          </li>
          <li>
            <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100">
              Settings
            </Link>
          </li>
          <li>
            <Link href="/login" className="block px-4 py-2 text-red-600 hover:bg-gray-100">
              Logout
            </Link>
          </li>
        </ul>
      </div>
    )}
  </div>
</div>
</div>
      </nav>
      </div>

  );
}
