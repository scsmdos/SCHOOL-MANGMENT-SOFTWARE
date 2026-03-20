import React, { useEffect, useState } from 'react';
import { X, GraduationCap, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const EditStudentModal = ({ isOpen, onClose, data, onSaved }) => {
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

  const student = data || {};

  const [section, setSection] = useState(student.section || 'A');
  const [roll, setRoll] = useState(student.roll_no || student.roll_number || '');
  const [routeId, setRouteId] = useState(student.transport_route_id || '');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [sectionSaving, setSectionSaving] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.get('/transport-routes');
        setRoutes(res.data?.data ?? res.data ?? []);
      } catch (err) { console.error('Routes fetch error:', err); }
    };
    const fetchSections = async () => {
      try {
        const res = await api.get('/sections-list');
        setSections(res.data || []);
      } catch (err) { console.error('Sections fetch error:', err); }
    };
    if (isOpen) {
      fetchRoutes();
      fetchSections();
    }
  }, [isOpen]);

  // Sync state if student data changes
  useEffect(() => {
    setSection(student.section || 'A');
    setRoll(student.roll_no || student.roll_number || '');
    setRouteId(student.transport_route_id || '');
  }, [student.section, student.roll_no, student.roll_number, student.transport_route_id]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/admissions/${student.rawId}`, { 
        section, 
        roll_no: roll,
        transport_route_id: routeId 
      });
      toast.success("Profile updated successfully!");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error("Error saving: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) return;
    setSectionSaving(true);
    try {
      await api.post('/sections', { name: newSectionName.trim().toUpperCase() });
      const res = await api.get('/sections-list');
      setSections(res.data || []);
      setSection(newSectionName.trim().toUpperCase());
      setIsAddingSection(false);
      setNewSectionName('');
      toast.success("Section created successfully!");
    } catch (err) {
      toast.error("Error creating section: " + (err.response?.data?.message || err.message));
    } finally {
      setSectionSaving(false);
    }
  };
  
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
          <div className="flex items-center space-x-2 text-[#eab308]">
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
              {/* Fake Student Image */}
               <div className="w-[85px] h-[100px] bg-gray-100 dark:bg-[#334155] border-2 border-gray-300 dark:border-[#475569] rounded overflow-hidden shadow-sm shrink-0 transition-colors">
                  <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name||student.studentName||'S')}&size=100&background=1e293b&color=a2a9b5&bold=true`} alt="Student" className="w-full h-full object-cover" onError={e=>{e.target.src='https://placehold.co/200x240/1e293b/a2a9b5?text=S'}} />
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
                Active Student Record
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
                   <span className="font-bold text-[#64748b] tracking-widest">DATE OF BIRTH</span>
                   <span className="font-bold text-[var(--text-primary)] transition-colors">{student.date_of_birth || student.dob || '-'}</span>
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
          <div className="bg-orange-50 dark:bg-[#78350f]/10 border border-orange-200 dark:border-[#9a3412]/50 p-3 rounded mb-4 transition-colors">
             <p className="text-[9px] font-bold text-[#ea580c] dark:text-[#ea580c] tracking-widest uppercase mb-0.5">Local Guardian Info</p>
             <p className="text-xs font-extrabold text-[#c2410c] dark:text-[#fdba74] uppercase transition-colors">
               {student.local_guardian_name ? `${student.local_guardian_name} (${student.relation_with_student || 'GUARDIAN'}) — ${student.local_guardian_contact_no || ''}` : (student.localGuardian || '-')}
             </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-[#334155] flex items-center justify-between px-4 py-2 rounded transition-colors">
              <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Transport Route:</span>
              <div className="relative">
                <select value={routeId} onChange={(e) => setRouteId(e.target.value)} className="bg-white dark:bg-[#10162A] border border-gray-300 dark:border-[#475569] text-[var(--text-primary)] text-xs font-bold px-3 py-1.5 pr-8 rounded appearance-none focus:outline-none focus:border-[#0ea5e9] transition-colors max-w-[150px]">
                  <option value="">None</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.route_name || r.name || `Route ${r.id}`}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-white">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-[#334155] flex items-center justify-between px-4 py-2 rounded transition-colors">
              <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase shrink-0">Section & Roll:</span>
              <div className="flex items-center space-x-2">
                {isAddingSection ? (
                  <div className="flex items-center space-x-1">
                    <input 
                      autoFocus
                      type="text"
                      placeholder="New..."
                      value={newSectionName}
                      onChange={e => setNewSectionName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateSection()}
                      className="bg-white dark:bg-[#10162A] border border-[#0ea5e9] text-[var(--text-primary)] text-[10px] font-bold px-2 py-1 rounded w-16 focus:outline-none"
                    />
                    <button onClick={handleCreateSection} disabled={sectionSaving} className="p-1 bg-[#0ea5e9] text-white rounded">
                      {sectionSaving ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                    </button>
                    <button onClick={() => setIsAddingSection(false)} className="p-1 bg-gray-200 dark:bg-[#334155] text-gray-500 rounded">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <select 
                    value={section} 
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') setIsAddingSection(true);
                      else setSection(e.target.value);
                    }} 
                    className="bg-white dark:bg-[#10162A] border border-gray-300 dark:border-[#475569] text-[var(--text-primary)] text-xs font-bold px-2 py-1.5 rounded focus:outline-none min-w-[50px]"
                  >
                    {[...new Set(['A', 'B', 'C', 'D', ...sections])].map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="" disabled>───</option>
                    <option value="ADD_NEW" className="text-[#0ea5e9] font-bold">+ New</option>
                  </select>
                )}
                <input 
                  type="text" 
                  placeholder="Roll" 
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  className="bg-white dark:bg-[#10162A] border border-gray-300 dark:border-[#475569] text-[var(--text-primary)] text-xs font-bold px-3 py-1.5 w-16 rounded focus:outline-none focus:border-[#0ea5e9]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-[#334155] transition-colors">
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-[#334155] bg-transparent text-[#94a3b8] rounded text-xs font-bold hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors"
            >
              CANCEL
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-white rounded text-xs font-bold shadow-sm transition-colors flex items-center"
            >
              {loading && <Loader2 size={14} className="animate-spin mr-2" />}
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
