"use client";

import React, { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar without extra padding */}
      <Navbar />

      {/* Main content with the p-14 padding */}
      <div className="p-12">
        {children}
      </div>
      <Footer/>
    </div>
  );
}
