import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Admissions from './pages/Admissions';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Academics from './pages/Academics';
import Homework from './pages/Homework';
import ExamsResults from './pages/ExamsResults';
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import StudentLeaves from './pages/StudentLeaves';
import StaffManagement from './pages/StaffManagement';
import FinanceFees from './pages/FinanceFees';
import SalaryManagement from './pages/SalaryManagement';
import DocumentManagement from './pages/DocumentManagement';
import LibraryManagement from './pages/LibraryManagement';
import TransportManagement from './pages/TransportManagement';
import CommunicationManagement from './pages/CommunicationManagement';
import ParentAppManagement from './pages/ParentAppManagement';
import TeacherAppAdmin from './pages/TeacherAppAdmin';

import Login from './pages/Login';

import WebsiteLayout from './website/WebsiteLayout';
import WebHome from './website/pages/WebHome';
import AboutPage from './website/pages/AboutPage';
import ProgramsPage from './website/pages/ProgramsPage';
import EventsPage from './website/pages/EventsPage';
import FAQPage from './website/pages/FAQPage';
import GalleryPage from './website/pages/GalleryPage';
import ContactPage from './website/pages/ContactPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

import { Toaster } from 'react-hot-toast';

function App() {
  const token = localStorage.getItem('token');

  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<WebsiteLayout />}>
          <Route index element={<WebHome />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Admin Section Group */}
        <Route path="/admin">
          {/* Base /admin redirect */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Auth Route */}
          <Route 
            path="login" 
            element={token ? <Navigate to="/admin/dashboard" replace /> : <Login />} 
          />

          {/* Protected Admin Routes */}
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="admissions" element={<ProtectedRoute><Admissions /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="academics" element={<ProtectedRoute><Academics /></ProtectedRoute>} />
          <Route path="homework" element={<ProtectedRoute><Homework /></ProtectedRoute>} />
          <Route path="exams" element={<ProtectedRoute><ExamsResults /></ProtectedRoute>} />
          <Route path="timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="leaves" element={<ProtectedRoute><StudentLeaves /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute><FinanceFees /></ProtectedRoute>} />
          <Route path="salary" element={<ProtectedRoute><SalaryManagement /></ProtectedRoute>} />
          <Route path="documents" element={<ProtectedRoute><DocumentManagement /></ProtectedRoute>} />
          <Route path="library" element={<ProtectedRoute><LibraryManagement /></ProtectedRoute>} />
          <Route path="transport" element={<ProtectedRoute><TransportManagement /></ProtectedRoute>} />
          <Route path="communication" element={<ProtectedRoute><CommunicationManagement /></ProtectedRoute>} />
          <Route path="parent-app" element={<ProtectedRoute><ParentAppManagement /></ProtectedRoute>} />
          <Route path="teacher-app" element={<ProtectedRoute><TeacherAppAdmin /></ProtectedRoute>} />
        </Route>
        
        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
