import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckSquare, Users, Search, X, RefreshCw, BarChart2, Filter, Eye, CalendarDays
} from 'lucide-react';
import api from '../api/axios';

const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const Attendance = () => {
  const [subTab, setSubTab] = useState('daily'); 
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [classesList, setClassesList] = useState([]);
  const [showStudentReportModal, setShowStudentReportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pendingUpdate, setPendingUpdate] = useState(null); // {id, status}

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const clRes = await api.get('/classes-list');
      setClassesList(clRes.data || []);

      const cls = selectedClass === 'All Classes' ? (clRes.data?.[0] || 'Class 1') : selectedClass;
      const res = await api.get(`/admissions?admitted_into_class=${cls}`);
      const payload = (res.data?.data ?? res.data ?? []).map(s => ({
          id: s.id,
          name: s.student_name,
          roll: s.roll_no || s.id,
          section: s.section || 'A',
          class: s.admitted_into_class,
          photo: s.student_photo,
          admission_no: s.admission_no,
          father: s.father_name
      }));
      setStudents(payload);

      if (subTab === 'daily') {
          const attRes = await api.get(`/student-attendance?class_name=${cls}&attendance_date=${selectedDate}`);
          const attMap = {};
          (attRes.data?.data ?? attRes.data ?? []).forEach(a => { 
                // Normalize status to lowercase for consistency
                attMap[a.student_id] = (a.status || '').toLowerCase(); 
          });
          setAttendance(attMap);
      }
    } catch (err) { console.error('Fetch error:', err); }
    setLoading(false);
  }, [subTab, selectedClass, selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

    const handleMarkAttendance = (student, status) => {
        setPendingUpdate({ ...student, status });
    };

    const confirmUpdate = async () => {
        if (!pendingUpdate) return;
        setLoading(true);
        try {
            await api.post('/student-attendance/bulk', {
                records: [{
                    student_id: pendingUpdate.id,
                    status: pendingUpdate.status,
                    attendance_date: selectedDate,
                    student_name: pendingUpdate.name,
                    class_name: pendingUpdate.class
                }]
            });
            
            setAttendance(prev => ({
                ...prev,
                [pendingUpdate.id]: pendingUpdate.status
            }));
            
            setPendingUpdate(null);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Sync failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

  const filteredItems = students.filter(item => {
    const target = (item.name + item.father + item.roll);
    return target.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-6 bg-[var(--bg-main)] h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* ── Page Root Header ── */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1 uppercase tracking-[0.05em]">Attendance</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-[0.15em] uppercase opacity-70">Registry · Sync · Analytics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={fetchData} className="w-9 h-9 flex items-center justify-center rounded bg-white dark:bg-white/5 border border-[var(--border-color)] text-slate-500 hover:text-[#0ea5e9] shadow-sm transition-all active:scale-95"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
          <div className="h-9 flex items-center bg-white dark:bg-[#111827] border border-[var(--border-color)] px-1 rounded shadow-sm">
             <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent border-none text-[11px] font-black text-[var(--text-primary)] outline-none px-2 uppercase" />
          </div>
        </div>
      </div>


      {/* ── Content Area ── */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
        
        {/* Navigation & Controls Row */}
        <div className="flex items-center justify-between px-4 bg-gray-50/80 dark:bg-[#171e2e] border-b border-[var(--border-color)] shrink-0">
           <div className="flex items-center shrink-0 border-b border-[var(--border-color)] sm:border-b-0">
              <NavTabItem active={subTab === 'daily'} label="Daily Attendance" icon={CheckSquare} onClick={() => setSubTab('daily')} />
              <NavTabItem active={subTab === 'monthly'} label="Monthly View" icon={CalendarDays} onClick={() => setSubTab('monthly')} />
              <NavTabItem active={subTab === 'report'} label="Individual Report" icon={BarChart2} onClick={() => setSubTab('report')} />
           </div>

           <div className="flex items-center space-x-2 py-2">
              <div className="relative">
                 <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   value={search} 
                   onChange={e => setSearch(e.target.value)} 
                   className="w-[160px] h-8 pl-8 pr-3 bg-white dark:bg-[#111827] border border-[var(--border-color)] rounded text-[10px] font-black text-[var(--text-primary)] focus:outline-none focus:border-[#0ea5e9]" 
                 />
              </div>

              <div className="flex items-center bg-white dark:bg-[#111827] border border-[var(--border-color)] rounded h-8 px-2">
                 <Filter size={10} className="text-slate-500 mr-2" />
                 <select 
                   value={selectedClass} 
                   onChange={e => setSelectedClass(e.target.value)}
                   className="bg-transparent text-[10px] font-black text-[var(--text-primary)] outline-none appearance-none pr-4"
                 >
                    {classesList.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                 </select>
              </div>

              {/* Save button removed as per user request */}
           </div>
        </div>

        {/* Data List or Grid */}
        <div className="flex-1 overflow-auto relative custom-scrollbar bg-white dark:bg-[#0f172a]">
           {loading && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-sm">
                <RefreshCw size={20} className="animate-spin text-[#0ea5e9]" />
             </div>
           )}

           {subTab === 'daily' ? (
                <table className="w-full text-left border-collapse">
                   <thead className="sticky top-0 bg-white dark:bg-[#0f172a] z-10 border-b border-[var(--border-color)]">
                      <tr className="bg-gray-50/50">
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Student Name</th>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Class</th>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Roll No</th>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Section</th>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                      {filteredItems.map(s => (
                         <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-6 py-2.5">
                               <p className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-tight">{s.name}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">F: {s.father}</p>
                            </td>
                            <td className="px-6 py-2.5 text-[11px] font-bold text-[var(--text-primary)]">{s.class}</td>
                            <td className="px-6 py-2.5 text-[11px] font-bold text-[#6366f1]">#{String(s.roll).padStart(2, '0')}</td>
                            <td className="px-6 py-2.5 text-[11px] font-bold text-slate-400">{s.section}</td>
                            <td className="px-6 py-2.5 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                   <StatusBtn active={(attendance[s.id] || '').toLowerCase() === 'present'} label="P" color="bg-emerald-500" activeColor="bg-emerald-600" onClick={() => handleMarkAttendance(s, 'Present')} />
                                   <StatusBtn active={(attendance[s.id] || '').toLowerCase() === 'absent'} label="A" color="bg-rose-500" activeColor="bg-rose-600" onClick={() => handleMarkAttendance(s, 'Absent')} />
                                   <StatusBtn active={(attendance[s.id] || '').toLowerCase() === 'half day' || (attendance[s.id] || '').toLowerCase() === 'half-day'} label="H" color="bg-amber-500" activeColor="bg-amber-600" onClick={() => handleMarkAttendance(s, 'Half Day')} />
                                </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             ) : subTab === 'monthly' ? (
                <div className="p-6">
                   <div className="grid grid-cols-7 gap-2 max-w-sm mx-auto">
                      {DAYS_SHORT.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest pb-2">{d}</div>)}
                      {Array.from({ length: 30 }).map((_, i) => (
                         <div key={i} className="aspect-square border border-[var(--border-color)] dark:border-white/5 rounded p-1 flex items-center justify-center relative hover:border-[#0ea5e9]/50 transition-all cursor-pointer group">
                            <span className="text-[11px] font-black text-slate-400 group-hover:text-[#0ea5e9]">{i+1}</span>
                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500 opacity-60"></div>
                         </div>
                      ))}
                   </div>
                </div>
             ) : (
                <table className="w-full text-left border-collapse">
                   <thead className="sticky top-0 bg-white dark:bg-[#0f172a] z-10 border-b border-[var(--border-color)]">
                      <tr className="bg-gray-50/50">
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Student Name</th>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Month Summary</th>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">View Report</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                      {filteredItems.map(s => (
                         <tr key={s.id} onClick={() => { setLoading(true); api.get('/student-attendance?student_id='+s.id).then(r => { setSelectedStudent({...s, history: r.data}); setShowStudentReportModal(true); }).finally(()=>setLoading(false)); }} className="hover:bg-gray-50/50 cursor-pointer">
                            <td className="px-6 py-2.5">
                               <div className="flex items-center space-x-3">
                                  <DigitalAvatar name={s.name} src={s.photo} />
                                  <div><p className="text-[12px] font-black text-[var(--text-primary)] uppercase">{s.name}</p><p className="text-[9px] text-slate-400 tracking-wider">ROLL: {s.roll} · SECT: {s.section}</p></div>
                               </div>
                            </td>
                            <td className="px-6 py-2.5 text-center">
                               <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Rate: 98%</span>
                            </td>
                            <td className="px-6 py-2.5 text-right text-slate-400"><Eye size={12} /></td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-color)] bg-gray-50/50 flex justify-between shrink-0">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registry Active • v2.1</p>
           <p className="text-[9px] font-black text-[#0ea5e9] uppercase tracking-widest">Little Seeds School Command</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingUpdate && (
        <StandardModal onClose={() => setPendingUpdate(null)} title="Update Attendance" sub="Please Confirm Action">
           <div className="p-8 text-center bg-white dark:bg-[#0f172a]">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
                 <RefreshCw size={28} />
              </div>
              <h3 className="text-[14px] font-black uppercase text-slate-800 dark:text-white mb-2">Change attendance status?</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6 leading-relaxed">You are about to modify the attendance record for this student.</p>
              
              <div className="flex space-x-3">
                 <button onClick={() => setPendingUpdate(null)} className="flex-1 py-3 bg-gray-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest">Cancel</button>
                 <button onClick={confirmUpdate} className="flex-1 py-3 bg-[#0ea5e9] text-white rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Confirm Change</button>
              </div>
           </div>
        </StandardModal>
      )}

      {/* MODAL COMPONENTS */}
      {showStudentReportModal && (
        <StandardModal onClose={() => setShowStudentReportModal(false)} title="Registry Audit" sub={selectedStudent?.name}>
           <div className="p-6 bg-white dark:bg-[#0f172a] space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded text-center">
                 <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Records Found</p>
                 <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{selectedStudent?.history?.length || 0}</p>
              </div>
              <div className="max-h-[300px] overflow-auto custom-scrollbar space-y-2 pr-1">
                 {selectedStudent?.history?.length > 0 ? selectedStudent.history.map((h, i) => {
       const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'present') return 'text-green-600 bg-green-50';
        if (s === 'absent') return 'text-red-600 bg-red-50';
        if (s === 'half day' || s === 'half-day') return 'text-yellow-600 bg-yellow-50';
        return 'text-gray-600 bg-gray-50';
    };
                    const status = (h.status || '').toLowerCase(); // Keep this line to define 'status' for the circle color
                    const colorClasses = getStatusColor(h.status); // Use the new function for text/background color
                    return (
                      <div key={i} className="flex justify-between p-3 bg-gray-50 dark:bg-white/5 border border-[var(--border-color)] rounded text-[10px] items-center transition-all">
                         <div className="flex items-center space-x-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${status === 'present' ? 'bg-emerald-500' : status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                           <span className="font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{new Date(h.attendance_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                         </div>
                         <span className={`font-black px-2 py-0.5 rounded border border-current opacity-80 uppercase tracking-widest text-[8px] ${colorClasses}`}>{h.status}</span>
                      </div>
                    );
                 }) : (
                    <p className="text-center py-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No attendance records found.</p>
                 )}
              </div>
           </div>
        </StandardModal>
      )}
    </div>
  );
};

const NavTabItem = ({ active, label, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0 ${active ? 'text-[#0ea5e9]' : 'text-slate-500 hover:text-[#0ea5e9]/70'}`}
  >
    <Icon size={12} strokeWidth={3} />
    <span>{label}</span>
    {active && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#0ea5e9]"></div>}
  </button>
);

const DigitalAvatar = ({ name, src }) => {
  const getInitials = (n) => (n || 'S').split(' ').map(i => i[0]).join('').slice(0, 2);
  const baseUrl = import.meta.env.VITE_API_URL?.split('/api')[0] || 'http://localhost:8000';
  const cleanUrl = src && !src.startsWith('/') ? `/${src}` : src;
  const fullSrc = src ? (src.startsWith('http') ? src : `${baseUrl}${cleanUrl}`) : null;
  return (
    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-[10px] font-black text-[#6366f1] border border-gray-100 shadow-sm overflow-hidden">
       {fullSrc ? <img src={fullSrc} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} alt={name} /> : getInitials(name)}
    </div>
  );
};

const StatusBtn = ({ active, label, color, activeColor, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-black transition-all shadow-sm border ${
      active 
        ? `${activeColor} text-white border-transparent scale-110 z-10` 
        : `bg-white dark:bg-white/5 text-slate-400 border-[var(--border-color)] hover:border-[#0ea5e9]/50`
    }`}
  >
    {label}
  </button>
);

const StandardModal = ({ onClose, title, sub, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
     <div className="bg-white w-full max-w-[440px] rounded shadow-2xl flex flex-col border border-gray-200 overflow-hidden scale-in">
        <div className="flex justify-between p-4 bg-gray-50 border-b border-gray-100">
           <div>
              <h2 className="text-[11px] font-black text-slate-800 tracking-widest uppercase mb-0.5">{title}</h2>
              <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase leading-none">{sub}</p>
           </div>
           <button onClick={onClose} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><X size={14} strokeWidth={3}/></button>
        </div>
        {children}
     </div>
  </div>
);

export default Attendance;
