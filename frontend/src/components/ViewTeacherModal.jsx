import React, { useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';

const ViewTeacherModal = ({ isOpen, onClose, data }) => {
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
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] transition-colors">
          <div className="flex items-center space-x-2 text-[#0ea5e9]">
            <Briefcase size={18} strokeWidth={2.5} />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[var(--text-primary)] transition-colors">Staff Profile Information</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-[#64748b] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Section */}
        <div className="p-4 bg-white dark:bg-[#1a2234] transition-colors">
          
          {/* Top Profile Area */}
          <div className="flex flex-col md:flex-row gap-5 mb-4 border-b border-gray-200 dark:border-[#334155] pb-4 transition-colors">
            <div className="flex gap-4">
              {/* Fake Staff Image */}
              <div className="w-[85px] h-[100px] bg-gray-100 dark:bg-[#334155] border-2 border-gray-300 dark:border-[#475569] rounded overflow-hidden shadow-sm shrink-0 transition-colors flex items-center justify-center">
                 {staff.avatar ? (
                    <img src={staff.avatar} alt="Staff" className="w-full h-full object-cover" />
                 ) : (
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${staff.avatarColor || 'bg-gray-200 text-gray-500'}`}>
                      {staff.initials || 'S'}
                    </div>
                 )}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] uppercase tracking-tight mb-2 transition-colors">
                {staff.name || 'STAFF NAME'}
              </h1>
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-[#3b82f6] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  {staff.id || 'EMP-XXXX'}
                </span>
                <span className="bg-[#14b8a6] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  DEPT: {staff.department || 'GENERAL'}
                </span>
                <span className="text-[var(--text-primary)] text-[11px] font-bold tracking-widest uppercase transition-colors">
                  {staff.gender || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#10b981] tracking-widest uppercase">
                Active Staff Record
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 text-[11px] mb-4">
             {/* Left Column */}
             <div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">DESIGNATION</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{staff.designation || 'TEACHER'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">MOBILE NUMBER</span>
                   <span className="font-bold text-[#3b82f6]">{staff.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">EMAIL ADDRESS</span>
                   <span className="font-bold text-[var(--text-primary)] transition-colors">{staff.email || 'N/A'}</span>
                </div>
             </div>

             {/* Right Column */}
             <div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">DATE OF JOINING</span>
                   <span className="font-bold text-[var(--text-primary)] transition-colors">{staff.doj || '2023-05-10'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">QUALIFICATION</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{staff.qualification || 'M.Sc, B.Ed'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">EXPERIENCE</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{staff.experience || '5 YEARS'}</span>
                </div>
             </div>
          </div>

          {/* Address Box */}
          <div className="bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] p-3 rounded mb-2 transition-colors">
             <p className="text-[9px] font-bold text-[#64748b] tracking-widest uppercase mb-0.5">Residential Address</p>
             <p className="text-xs font-extrabold text-[var(--text-primary)] uppercase transition-colors">{staff.address || 'NEW DELHI, INDIA - 110001'}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewTeacherModal;
