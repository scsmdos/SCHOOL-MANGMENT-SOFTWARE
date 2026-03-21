import React from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  Calendar, 
  CheckSquare, 
  LogOut,
  ChevronLeft,
  Wallet,
  Banknote,
  Folder,
  Book,
  Bus,
  MessageSquare,
  Smartphone,
  Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.jpeg';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-[240px] h-screen fixed left-0 top-0 z-50 bg-[var(--bg-panel)] border-r border-[var(--border-color)] flex flex-col transition-colors duration-300">
      
      {/* Brand & Logo Section — FIXED (No Scroll) */}
      <div className="h-14 px-3 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-panel)] z-10">
        <div className="flex items-center space-x-2">
          <div className="w-[38px] h-[30px] rounded flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 bg-white">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center text-[19px] font-black tracking-tight" style={{ fontFamily: '"Comic Sans MS", "Roboto", sans-serif' }}>
            <span className="text-[#0ea5e9]">l</span>
            <span className="text-[#84cc16]">i</span>
            <span className="text-[#3b82f6]">t</span>
            <span className="text-[#ec4899]">t</span>
            <span className="text-[#0ea5e9]">l</span>
            <span className="text-[#14b8a6]">e</span>
            <span className="mx-[2px]"> </span>
            <span className="text-[#84cc16]">S</span>
            <span className="text-[#f59e0b]">e</span>
            <span className="text-[#06b6d4]">e</span>
            <span className="text-[#3b82f6]">d</span>
            <span className="text-[#f43f5e]">s</span>
          </div>
        </div>
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* SCROLLABLE NAV SECTION */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-4 pt-4 pb-20"> 
        
        {/* Main Navigation */}
        <div className="space-y-0.5">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/admin/dashboard'} onClick={() => navigate('/admin/dashboard')} />
          <SidebarItem icon={Box} label="Admissions" active={location.pathname === '/admin/admissions'} onClick={() => navigate('/admin/admissions')} />
          <SidebarItem icon={Users} label="Students" active={location.pathname === '/admin/students'} onClick={() => navigate('/admin/students')} />
          <SidebarItem icon={GraduationCap} label="Teachers & Staff" active={location.pathname === '/admin/staff'} onClick={() => navigate('/admin/staff')} />
        </div>

        {/* Academic Hub */}
        <div>
          <p className="px-3 text-[10px] font-bold text-[#10B981] uppercase tracking-wider mb-2 mt-4">ACADEMIC HUB</p>
          <div className="space-y-0.5">
            <SidebarItem icon={BookOpen} label="Academics" active={location.pathname === '/admin/academics'} onClick={() => navigate('/admin/academics')} />
            <SidebarItem icon={ClipboardList} label="Homework" active={location.pathname === '/admin/homework'} onClick={() => navigate('/admin/homework')} />
            <SidebarItem icon={FileText} label="Exams & Results" active={location.pathname === '/admin/exams'} onClick={() => navigate('/admin/exams')} />
            <SidebarItem icon={Calendar} label="Timetable" active={location.pathname === '/admin/timetable'} onClick={() => navigate('/admin/timetable')} />
            <SidebarItem icon={CheckSquare} label="Attendance" active={location.pathname === '/admin/attendance'} onClick={() => navigate('/admin/attendance')} />
            <SidebarItem icon={Box} label="Student Leaves" active={location.pathname === '/admin/leaves'} onClick={() => navigate('/admin/leaves')} />
          </div>
        </div>

        {/* Management */}
        <div>
          <p className="px-3 text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider mb-2 mt-4">MANAGEMENT</p>
          <div className="space-y-0.5">
            <SidebarItem icon={Wallet} label="Finance & Fees" active={location.pathname === '/admin/finance'} onClick={() => navigate('/admin/finance')} />
            <SidebarItem icon={Banknote} label="Salary" active={location.pathname === '/admin/salary'} onClick={() => navigate('/admin/salary')} />
            <SidebarItem icon={Folder} label="Documents" active={location.pathname === '/admin/documents'} onClick={() => navigate('/admin/documents')} />
            <SidebarItem icon={Book} label="Library" active={location.pathname === '/admin/library'} onClick={() => navigate('/admin/library')} />
            <SidebarItem icon={Bus} label="Transport" active={location.pathname === '/admin/transport'} onClick={() => navigate('/admin/transport')} />
            <SidebarItem icon={MessageSquare} label="Communication" active={location.pathname === '/admin/communication'} onClick={() => navigate('/admin/communication')} />
            <SidebarItem icon={Smartphone} label="Parent App" active={location.pathname === '/admin/parent-app'} onClick={() => navigate('/admin/parent-app')} />
            <SidebarItem icon={Smartphone} label="Teacher App" active={location.pathname === '/admin/teacher-app'} onClick={() => navigate('/admin/teacher-app')} />
            <SidebarItem icon={Settings} label="Settings" />
          </div>
        </div>

      </div>

      {/* Logout — Stays at bottom of the scrollable list or fixed area */}
      <div className="absolute bottom-0 left-0 w-full px-3 py-4 bg-[var(--bg-panel)] border-t border-[var(--border-color)]">
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            // Using window.location to ensure fresh state/redirect correctly
            window.location.href = '/admin/login';
          }}
          className="w-full h-11 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded flex items-center justify-between px-3 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center space-x-2.5 text-[#F43F5E] group-hover:text-red-400">
            <div className="bg-white/5 dark:bg-black/20 p-2 rounded border border-red-500/10 shadow-sm transition-transform group-hover:scale-110">
               <LogOut size={16} strokeWidth={2.5} />
            </div>
            <div className="text-left flex flex-col justify-center">
              <span className="text-[13px] font-black leading-none uppercase tracking-tight">Logout</span>
              <span className="text-[9px] font-bold text-[#E11D48] tracking-widest uppercase mt-1">Sign Out Securely</span>
            </div>
          </div>
        </button>
      </div>

    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
      flex items-center px-3 py-2 text-xs font-bold rounded cursor-pointer transition-colors duration-200
      ${active 
        ? 'bg-[#5B4DF0] text-white shadow-[var(--card-shadow)]' 
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] dark:hover:bg-[#1B2338]'
      }
    `}>
      <Icon size={16} strokeWidth={2.5} className={`mr-3 ${active ? 'text-white' : 'text-[var(--text-secondary)] scale-90'}`} />
      {label}
    </div>
  );
};

export default Sidebar;
