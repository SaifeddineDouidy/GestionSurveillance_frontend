import React from 'react';
import Navbar from '@/components/Navbar'; // Import your Navbar component

// The layout component will wrap the content of your dashboard page
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}

      {/* Main content area */}
      <div> {/* Padding to avoid content under the fixed Navbar */}
        <div className="container mx-auto">
          {children} {/* This will render the content passed as children */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
