import React, { useRef } from 'react';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import logoImg from '../assets/logo.jpeg';

const getPhotoSrc = (url, fallbackText) => {
  if (!url) return `https://placehold.co/150x150/1e293b/a2a9b5?text=${fallbackText}`;
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.split('/api')[0] || 'http://localhost:8000';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
};

const IDCardModal = ({ isOpen, onClose, data }) => {
  const cardRef = useRef(null);

  if (!isOpen || !data) return null;

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        scale: 4,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `ID_Card_${data.studentName?.replace(/\s+/g, '_') || 'Student'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const studentPhoto = getPhotoSrc(data.student_photo, 'STUDENT');

  return (
    <div className="fixed inset-0 z-[150] flex justify-center items-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center">
        
        {/* Controls Overlay */}
        <div className="absolute -right-14 top-0 flex flex-col gap-4">
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-[#f43f5e] text-white flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)] hover:bg-[#e11d48] transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
          >
            <X size={20} strokeWidth={3} />
          </button>
          <button 
            onClick={handleDownload} 
            title="Download ID Card" 
            className="w-10 h-10 rounded-full bg-[#84cc16] text-white flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.5)] hover:bg-[#65a30d] transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
          >
            <Download size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Outer Frame - to match user's screenshot exactly */}
        <div className="bg-[#2a2c38] p-2.5 rounded-[24px] shadow-2xl">
          <div 
            ref={cardRef}
            className="w-[330px] h-[550px] bg-white rounded-[16px] overflow-hidden flex flex-col relative"
            style={{ 
              fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              boxSizing: 'border-box'
            }}
          >
            
            {/* Header Section */}
            <div className="h-[210px] bg-[#236b2b] relative overflow-hidden flex flex-col items-center pt-6">
               <div className="w-[68px] h-[68px] bg-white rounded-full p-1 flex items-center justify-center mb-3 shadow-md z-20 border-[1.5px] border-[#eab308]">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
                    <img src={logoImg} alt="Logo" className="w-[85%] h-[85%] object-contain" />
                  </div>
               </div>
               
               <div className="w-[160px] h-[1px] bg-white/40 mb-2.5 z-20"></div>

               <h2 className="text-white text-[10.5px] font-[900] tracking-[0.08em] text-center z-20 uppercase leading-none">(AN ENGLISH MEDIUM SCHOOL)</h2>
               <p className="text-white text-[7.5px] font-[800] tracking-wide text-center mt-1 z-20 uppercase opacity-95">Affiliated to State Board Of Govt.</p>
               
               {/* Exact Dynamic Tapering Wave Design - Thick center, thin edges */}
               <div className="absolute bottom-0 left-0 right-0 h-[75px] z-10 overflow-hidden pointer-events-none">
                 <svg viewBox="0 0 1000 140" preserveAspectRatio="none" className="w-full h-full">
                   {/* White upper band */}
                   <path d="M0,20 Q500,110 1000,40 L1000,140 L0,140 Z" fill="#ffffff" />
                   {/* Yellow middle band */}
                   <path d="M0,30 Q500,145 1000,50 L1000,140 L0,140 Z" fill="#eab308" />
                   {/* Green lower band */}
                   <path d="M0,40 Q500,180 1000,60 L1000,140 L0,140 Z" fill="#236b2b" />
                   {/* White body below */}
                   <path d="M0,50 Q500,215 1000,70 L1000,140 L0,140 Z" fill="#ffffff" />
                 </svg>
               </div>
            </div>

            {/* Profile Photo - Precise White Outer, Yellow Inner Border */}
            <div className="absolute top-[148px] left-1/2 -translate-x-1/2 z-30">
               <div className="w-[110px] h-[110px] rounded-full bg-white shadow-xl flex items-center justify-center">
                  <div className="w-[100px] h-[100px] rounded-full border-[3px] border-[#eab308] overflow-hidden bg-white">
                    <img 
                      src={studentPhoto} 
                      alt="Student" 
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://placehold.co/150x150/1e293b/a2a9b5?text=STUDENT'; }}
                    />
                  </div>
               </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 flex flex-col items-center pt-[62px] px-8 bg-white z-0">
               <h1 className="text-[#1a5d1a] text-[22px] font-black tracking-tight uppercase text-center leading-none mb-1">{data.studentName || data.name}</h1>
               <p className="text-[#334155] text-[10px] font-black tracking-[1.5px] uppercase mb-3">SESSION: 2026 / 2027</p>
               <div className="flex flex-col items-center w-full space-y-[4px]">
                  <div className="flex items-center text-[10px] font-[900] w-[85%]">
                    <div className="w-[45%] text-right text-[#64748b] uppercase tracking-wide">STUDENT ID :</div>
                    <div className="w-[55%] pl-2 text-[#1e293b]">{data.id}</div>
                  </div>
                  
                  <div className="flex items-center text-[10px] font-[900] w-[85%]">
                    <div className="w-[45%] text-right text-[#64748b] uppercase tracking-wide">FATHER NAME :</div>
                    <div className="w-[55%] pl-2 text-[#1e293b] truncate">{data.fatherName || data.father_name}</div>
                  </div>

                  <div className="flex items-center text-[10px] font-[900] w-[85%]">
                    <div className="w-[45%] text-right text-[#64748b] uppercase tracking-wide">CLASS / SEC:</div>
                    <div className="w-[55%] pl-2 text-[#1e293b]">{data.className || data.class} {data.section ? `/ ${data.section}` : ''}</div>
                  </div>

                  <div className="flex items-center text-[10px] font-[900] w-[85%]">
                    <div className="w-[45%] text-right text-[#64748b] uppercase tracking-wide">ROLL NO :</div>
                    <div className="w-[55%] pl-2 text-[#1e293b]">{data.roll || data.roll_no || '-'}</div>
                  </div>

                  <div className="flex items-center text-[10px] font-[900] w-[85%]">
                    <div className="w-[45%] text-right text-[#64748b] uppercase tracking-wide">BLOOD GROUP :</div>
                    <div className="w-[55%] pl-2 text-[#1e293b]">{data.blood_group || 'N/A'}</div>
                  </div>

                  <div className="flex items-center text-[10px] font-[900] w-[85%]">
                    <div className="w-[45%] text-right text-[#64748b] uppercase tracking-wide">D.O.B :</div>
                    <div className="w-[55%] pl-2 text-[#1e293b]">{data.date_of_birth || '-'}</div>
                  </div>

                  <div className="flex items-center text-[10px] font-[900] w-[85%]">
                    <div className="w-[45%] text-right text-[#64748b] uppercase tracking-wide">PHONE :</div>
                    <div className="w-[55%] pl-2 text-[#1e293b]">{data.contactNo || data.phone}</div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="h-[65px] bg-[#236b2b] flex flex-col items-center justify-center">
               <p className="text-white text-[10px] font-[900] tracking-wide uppercase text-center leading-tight mb-1">
                 NEAR PVS BANKA,<br/>BANKA - BIHAR 813102
               </p>
               <p className="text-[#eab308] text-[10px] font-[900] tracking-widest uppercase">
                 CONTACT NO. 8102522355
               </p>
            </div>

          </div>
        </div>
      </div>
      
      {/* Import Inter to ensure identical rendering */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}} />
    </div>
  );
};

export default IDCardModal;
