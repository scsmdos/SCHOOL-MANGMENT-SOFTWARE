import React, { useEffect } from 'react';
import { X, GraduationCap } from 'lucide-react';

const ViewStudentModal = ({ isOpen, onClose, data }) => {
  // Prevent scrolling on body when modal is open
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

  const student = data || {};
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-[800px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#334155] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] transition-colors">
          <div className="flex items-center space-x-2 text-[#84cc16]">
            <GraduationCap size={18} strokeWidth={2.5} />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[var(--text-primary)] transition-colors">Student Profile Information</h3>
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
              {/* Fake Student Image based on screenshot */}
               <div className="w-[85px] h-[100px] bg-gray-100 dark:bg-[#334155] border-2 border-gray-300 dark:border-[#475569] rounded overflow-hidden shadow-sm shrink-0 transition-colors">
                  <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name||'S')}&size=100&background=1e293b&color=a2a9b5&bold=true`} alt="Student" className="w-full h-full object-cover" onError={e=>{e.target.src='https://placehold.co/200x240/1e293b/a2a9b5?text=S'}} />
               </div>
               {/* Parent Image */}
               <div className="w-[85px] h-[100px] bg-gray-100 dark:bg-[#334155] border-2 border-gray-300 dark:border-[#475569] rounded overflow-hidden shadow-sm shrink-0 transition-colors">
                  <img src={student.parentAvatar || 'https://placehold.co/200x240/1e293b/a2a9b5?text=PARENT'} alt="Parent" className="w-full h-full object-cover" onError={e=>{e.target.src='https://placehold.co/200x240/1e293b/a2a9b5?text=PARENT'}} />
               </div>
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] uppercase tracking-tight mb-2 transition-colors">
                {student.name || student.studentName || '-'}
              </h1>
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-[#3b82f6] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  {student.id || '-'}
                </span>
                <span className="bg-[#84cc16] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  {student.className || '-'}
                </span>
                <span className="text-[var(--text-primary)] text-[11px] font-bold tracking-widest uppercase transition-colors">
                  {student.gender || '-'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#10b981] tracking-widest uppercase">
                {student.status || 'Active'} Record
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 text-[11px] mb-4">
             {/* Left Column */}
              <div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">FATHER'S NAME</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.fatherName || student.father_name || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">MOTHER'S NAME</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.motherName || student.mother_name || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">MOBILE NUMBER</span>
                   <span className="font-bold text-[#3b82f6]">{student.phone || student.contactNo || student.contact_no || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">PARENT EMAIL</span>
                   <span className="font-bold text-[#ef4444]">{student.parent_email || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">FATHER'S QUAL</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.qualification_father || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">MOTHER'S QUAL</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.qualification_mother || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">DATE OF BIRTH</span>
                   <span className="font-bold text-[var(--text-primary)] transition-colors">{student.date_of_birth || student.dob || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">SECTION</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.section || '-'}</span>
                </div>
             </div>

             {/* Right Column */}
             <div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">AADHAAR NO</span>
                   <span className="font-bold text-[var(--text-primary)] transition-colors">{student.aadhaar_no || student.aadhaar || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">CATEGORY</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.category || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">RELIGION</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.religion || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">NATIONALITY</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.nationality || 'INDIAN'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-[#334155] transition-colors">
                   <span className="font-bold text-[#64748b] tracking-widest">ROLL NUMBER</span>
                   <span className="font-bold text-[var(--text-primary)] uppercase transition-colors">{student.roll_no || student.roll || '-'}</span>
                </div>
             </div>
          </div>

          {/* Address Box */}
           <div className="bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] p-3 rounded mb-2 transition-colors">
              <p className="text-[9px] font-bold text-[#64748b] tracking-widest uppercase mb-0.5">Permanent Residential Address</p>
              <p className="text-xs font-extrabold text-[var(--text-primary)] uppercase transition-colors">
                {[student.village, student.district, student.state, student.pin_code].filter(Boolean).join(', ') || student.address || '-'}
              </p>
           </div>

          {/* Local Guardian Box */}
          <div className="bg-orange-50 dark:bg-[#78350f]/10 border border-orange-200 dark:border-[#9a3412]/50 p-3 rounded transition-colors">
             <p className="text-[9px] font-bold text-[#ea580c] dark:text-[#ea580c] tracking-widest uppercase mb-0.5">Local Guardian Info</p>
             <p className="text-xs font-extrabold text-[#c2410c] dark:text-[#fdba74] uppercase transition-colors">
               {student.local_guardian_name ? `${student.local_guardian_name} (${student.relation_with_student || 'GUARDIAN'}) — ${student.local_guardian_contact_no || ''}` : (student.localGuardian || '-')}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewStudentModal;
