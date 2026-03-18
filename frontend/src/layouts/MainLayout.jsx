import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex bg-[#020617] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
