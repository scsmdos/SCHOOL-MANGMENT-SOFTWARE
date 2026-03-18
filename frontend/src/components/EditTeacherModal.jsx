import React, { useEffect } from 'react';
import { X, Save, Edit } from 'lucide-react';

const EditTeacherModal = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const staff = data || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-[700px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#334155] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] transition-colors">
          <div className="flex items-center space-x-3 text-[#eab308]">
            <div className="bg-[#eab308]/10 dark:bg-[#eab308]/20 p-1.5 rounded">
              <Edit size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-widest text-[var(--text-primary)] transition-colors">Update Personnel Record</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#10162A] text-[#64748b] hover:text-[var(--text-primary)] border border-transparent dark:border-[#334155] transition-colors"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Body Section */}
        <div className="p-6 bg-white dark:bg-[#1a2234] transition-colors">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* FULL NAME */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Full Name</label>
              <input 
                type="text" 
                defaultValue={staff.name}
                placeholder="Enter Full Name" 
                className="w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none"
              />
            </div>

            {/* GENDER */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Gender</label>
              <div className="relative">
                <select 
                  defaultValue={staff.gender || ""} 
                  className="w-full h-10 px-3 pr-8 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none"
                >
                  <option value="" disabled hidden>Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748b]">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* DEPARTMENT */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Department</label>
              <div className="relative">
                <select 
                  defaultValue={staff.department || ""}
                  className="w-full h-10 px-3 pr-8 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none"
                >
                  <option value="" disabled hidden>Select Department</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT">Support</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748b]">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* ROLE / DESIGNATION */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Role / Designation</label>
              <div className="relative">
                <select 
                  defaultValue={staff.designation || ""}
                  className="w-full h-10 px-3 pr-8 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none"
                >
                  <option value="" disabled hidden>Select Role/Designation</option>
                  <option value="Math">Math</option>
                  <option value="TGT">Trained Graduate Teacher (TGT)</option>
                  <option value="PGT">Post Graduate Teacher (PGT)</option>
                  <option value="PRT">Primary Teacher (PRT)</option>
                  <option value="CLERK">Clerk</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748b]">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Phone Number</label>
              <input 
                type="text" 
                defaultValue={staff.phone}
                placeholder="+91 XXXXX XXXXX" 
                className="w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none"
              />
            </div>

            {/* EMAIL ADDRESS */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Email Address</label>
              <input 
                type="email" 
                defaultValue={staff.email}
                placeholder="email@school.edu" 
                className="w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          <div className="pt-8 flex justify-end items-center space-x-3 mt-4 border-t border-gray-200 dark:border-[#334155] transition-colors">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[11px] font-extrabold tracking-widest uppercase hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-colors shadow-sm dark:shadow-none"
            >
              Cancel
            </button>
            <button 
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#84cc16] hover:bg-[#65a30d] text-white rounded text-[11px] font-extrabold tracking-widest uppercase shadow-sm transition-colors"
            >
              <Save size={14} strokeWidth={3} />
              <span>Update Data</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditTeacherModal;
