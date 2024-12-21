import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">

      <div>
        <div className="container mx-auto">
          {children} 
        </div>
      </div>
    </div>
  );
};

export default Layout;

