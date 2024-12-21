"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import Footer from "@/components/Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 fixed w-full z-50 py-1">
        <div className="container mx-auto px-2 py-2.5 flex items-center justify-between">
          {/* Left: Brand Logo + Name */}
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
            <span className="font-semibold text-xl text-gray-700">
             
            </span>
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/session"
              className="text-gray-800 text-xl hover:text-blue-600 transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="https://www.ensaj.ucd.ac.ma"
              className="text-gray-800 text-xl hover:text-blue-600 transition-colors"
            >
              À Propos
            </Link>
            <Link
              href="/contact"
              className="text-gray-800 text-xl hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right: Search + CTA + User */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar */}
            

            {/* Example CTA Button */}
            <Link
              href="/get-started"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Plus
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-xl" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <ul className="py-1 text-sm text-gray-700">
                    <li>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-3 px-6">
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>
            {/* Optional: The CTA and user menu for mobile */}
            <div className="mt-4 flex flex-col space-y-2">
              <Link
                href="/get-started"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
               Plus
              </Link>
              <button
                onClick={toggleUserMenu}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content (with top padding so it’s not behind the navbar) */}
      <div className=" flex-grow">
        {children}
      </div>

      <Footer />
    </div>
  );
}
