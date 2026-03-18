import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import logoImg from '../assets/logo.jpeg';

const SectionTitle = ({ title }) => (
  <div className="flex flex-col mb-4 mt-2">
    <h3 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest mb-1.5">{title}</h3>
    <div className="w-8 h-[2px] bg-orange-400"></div>
  </div>
);

const InfoBox = ({ label, value, className = "" }) => (
  <div className={`flex flex-col border border-[var(--border-color)] bg-[var(--bg-main)] rounded px-4 py-3 shadow-sm ${className}`}>
    <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">{label}</span>
    <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide">{value || '-'}</span>
  </div>
);

const getPhotoSrc = (url, fallbackText) => {
  if (!url) return `https://placehold.co/150x200/1e293b/a2a9b5?text=${fallbackText}`;
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}${url}`;
};

const ViewAdmissionModal = ({ isOpen, onClose, data, onStatusChange }) => {
  if (!isOpen || !data) return null;

  const isApproved = data?.status === 'Approved';
  const isRejected = data?.status === 'Rejected';
  const isActioned = isApproved || isRejected;

  const parentPhotoSrc = getPhotoSrc(data?.parent_photo, 'PARENT');
  const studentPhotoSrc = getPhotoSrc(data?.student_photo, 'STUDENT');

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 md:p-8 transition-colors">
      
      {/* Modal Container */}
      <div className="bg-[var(--bg-panel)] w-full max-w-5xl rounded-lg shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden border border-[var(--border-color)] transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-[var(--bg-panel-alt)] border-b border-[var(--border-color)] shrink-0 transition-colors">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-7 rounded overflow-hidden p-[2px] bg-white flex items-center justify-center shrink-0 border border-gray-200 dark:border-none">
               <img src={logoImg} alt="logo" className="w-full h-full object-contain" />
             </div>
             <div>
               <h2 className="text-[13px] font-bold text-[var(--text-primary)] tracking-widest uppercase mb-0.5">View Admission</h2>
               <p className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase leading-none">Little Seeds School Platform</p>
             </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Status pill */}
            {isActioned && (
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                isApproved
                  ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'
                  : 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400'
              }`}>
                {isApproved ? '✓ Approved' : '✗ Rejected'}
              </span>
            )}
            <button 
              onClick={onClose} 
              className="w-6 h-6 rounded flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white hover:bg-[#e11d48] hover:border-[#e11d48] transition-colors"
            >
              <X size={14} strokeWidth={2.5}/>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative bg-[var(--bg-panel)] transition-colors">
          
          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Photos */}
            <div className="flex space-x-3 shrink-0">
               <div className="flex flex-col items-center space-y-1">
                 <div className="w-[110px] h-[130px] border-2 border-[var(--border-color)] rounded p-1 bg-[var(--bg-panel-alt)] shadow-sm">
                   <img 
                     src={parentPhotoSrc}
                     alt="Parent"
                     className="w-full h-full object-cover rounded-sm"
                     onError={e => { e.target.src = 'https://placehold.co/150x200/1e293b/a2a9b5?text=PARENT'; }}
                   />
                 </div>
                 <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Parent</span>
               </div>
               <div className="flex flex-col items-center space-y-1">
                 <div className="w-[110px] h-[130px] border-2 border-[var(--border-color)] rounded p-1 bg-[var(--bg-panel-alt)] shadow-sm">
                   <img 
                     src={studentPhotoSrc}
                     alt="Student"
                     className="w-full h-full object-cover rounded-sm"
                     onError={e => { e.target.src = 'https://placehold.co/150x200/1e293b/a2a9b5?text=STUDENT'; }}
                   />
                 </div>
                 <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Student</span>
               </div>
            </div>

            {/* Top Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoBox label="Admission No" value={data?.id} />
              <InfoBox label="Class Admitted" value={data?.className} />
              <InfoBox label="Date of Admission" value={data?.date_of_admission || data?.date} />
              <InfoBox label="Status" value={data?.status} />
              <InfoBox label="Date of Birth" value={data?.date_of_birth} />
              <InfoBox label="Gender" value={data?.gender} />
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Student Info */}
            <div>
               <SectionTitle title="Student Info" />
               <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="Student Name" value={data?.studentName} className="bg-blue-50/50 dark:bg-[#1e293b]/50 border-blue-100 dark:border-blue-900/30" />
                  <InfoBox label="Blood Group" value={data?.blood_group} />
                  <InfoBox label="Religion" value={data?.religion} />
                  <InfoBox label="Category" value={data?.category} />
                  <InfoBox label="Nationality" value={data?.nationality} />
                  <InfoBox label="Aadhaar No" value={data?.aadhaar_no} />
               </div>
            </div>

            {/* Parent's Info */}
            <div>
               <SectionTitle title="Parent's Info" />
               <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="Father's Name" value={data?.fatherName} />
                  <InfoBox label="Father's Job" value={data?.occupation_father} />
                  <InfoBox label="Mother's Name" value={data?.mother_name} />
                  <InfoBox label="Mother's Job" value={data?.occupation_mother} />
                  <InfoBox label="Primary Contact" value={data?.contactNo} />
                  <InfoBox label="Father's Qual" value={data?.qualification_father} />
               </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="mt-8">
             <SectionTitle title="Location Details" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoBox label="Village / Address" value={data?.village} />
                <InfoBox label="Post Office" value={data?.post_office} />
                <InfoBox label="Police Station" value={data?.police_station} />
                <InfoBox label="District" value={data?.district} />
                <InfoBox label="State" value={data?.state} />
                <InfoBox label="Pin Code" value={data?.pin_code} />
             </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white dark:bg-[#171e2e] border-t border-[var(--border-color)] p-4 px-6 flex justify-between items-center shrink-0">
           <div className="flex space-x-3">
             {isActioned ? (
               <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest self-center">
                 {isApproved ? '✓ This admission has been approved.' : '✗ This admission has been rejected.'}
               </p>
             ) : (
               <>
                 <button 
                   onClick={() => onStatusChange(data?.rawId, 'Approved')} 
                   className="flex items-center space-x-2 px-5 py-2 rounded bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                 >
                   <CheckCircle size={12} strokeWidth={2.5}/>
                   <span>Approve</span>
                 </button>
                 <button 
                   onClick={() => onStatusChange(data?.rawId, 'Rejected')} 
                   className="flex items-center space-x-2 px-5 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                 >
                   <XCircle size={12} strokeWidth={2.5}/>
                   <span>Reject</span>
                 </button>
               </>
             )}
           </div>
           <button 
             onClick={onClose} 
             className="px-6 py-2 rounded border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest hover:bg-[var(--bg-main)] transition-colors shadow-sm"
           >
             Close Window
           </button>
        </div>

      </div>
    </div>
  );
};

export default ViewAdmissionModal;
