import React from 'react';
import Header from './components/Header';
import { Outlet } from 'react-router-dom';

const WebsiteLayout = () => {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      {/* Footer will be added here later */}
    </div>
  );
};

export default WebsiteLayout;
