import React, { useEffect, useState } from 'react';
import { Search, Bell, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  // Check local storage for theme, default to true (Dark)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) { console.error('Error parsing admin data'); }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="h-14 flex items-center justify-between px-6 bg-[var(--bg-panel)] border-b border-[var(--border-color)] sticky top-0 z-40 transition-colors duration-300">
      
      {/* Title & Greeting */}
      <div className="flex flex-col justify-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight leading-tight">Dashboard</h2>
        <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">
          Welcome, <span className="text-[#6D63F4] font-bold">{admin?.name || 'Super Admin'} 👋</span>
        </p>
      </div>

      {/* Utilities Container */}
      <div className="flex items-center space-x-4">
        
        {/* Exact Search Bar - Sharp borders */}
        <div className="relative flex items-center">
          <div className="absolute left-3">
             <Search size={14} className="text-gray-500" strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Search for details..." 
            className="w-[200px] h-8 pl-9 pr-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#5B4DF0] transition-colors"
          />
        </div>

        {/* LIGHT/DARK MODE SWITCH BUTTON */}
        <button 
          onClick={() => setIsDark(!isDark)}
          className="h-7 w-14 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-full flex items-center px-1 relative cursor-pointer transition-colors"
        >
           {/* Animated Pill Background */}
           <div 
             className={`absolute top-[2px] w-6 h-6 rounded-full bg-[#1E2741] dark:bg-[#1E2741] shadow flex items-center justify-center transition-all duration-300 ease-in-out ${isDark ? 'left-1' : 'left-[26px] bg-white'}`}
           >
              {isDark ? <Moon size={12} className="text-white" strokeWidth={2.5} /> : <Sun size={12} className="text-gray-800" strokeWidth={2.5} />}
           </div>
           
           {/* Background Icons (Visible when not active) */}
           <div className="w-full flex justify-between px-1.5 text-[var(--text-secondary)] z-0">
             <Moon size={12} strokeWidth={2.5} className={isDark ? "opacity-0" : "opacity-100"} />
             <Sun size={12} strokeWidth={2.5} className={!isDark ? "opacity-0" : "opacity-100"} />
           </div>
        </button>

        {/* Bell Button */}
        <button className="w-8 h-8 rounded bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative">
          <Bell size={14} strokeWidth={2.5} />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border-color)] mx-1"></div>

        {/* Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
           <div className="w-8 h-8 rounded bg-[#3525E7] flex items-center justify-center text-white font-bold text-[11px]">
             {getInitials(admin?.name)}
           </div>
           <div className="text-left flex flex-col justify-center">
              <p className="text-[12px] font-bold text-[var(--text-primary)] leading-none">{admin?.name || 'Super Admin'}</p>
              <p className="text-[9px] font-bold text-[#6D81A5] leading-tight mt-1 uppercase tracking-wide">{admin?.role?.replace('_', ' ') || 'Administrator'}</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Navbar;
