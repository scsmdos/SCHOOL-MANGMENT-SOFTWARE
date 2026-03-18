import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare, Users, UserCheck, UserX, TrendingUp, Calendar,
  Search, Plus, X, Save, ChevronLeft, ChevronRight,
  BarChart2, Clock, Download, Filter, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '../api/axios';

/* ══════════════════════════════════════════
   CONSTANTS & DATA
══════════════════════════════════════════ */
const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'];
const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];



/* ══════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════ */
const STATUS = {
  present: { label: 'Present', short: 'P', bg: 'bg-green-100 dark:bg-green-900/30',  border: 'border-green-300 dark:border-green-700',  text: 'text-green-700 dark:text-[#4ade80]',  activeBg: 'bg-[#10b981]', dot: 'bg-[#10b981]' },
  absent:  { label: 'Absent',  short: 'A', bg: 'bg-red-100 dark:bg-red-900/30',      border: 'border-red-300 dark:border-red-700',      text: 'text-red-600 dark:text-red-400',      activeBg: 'bg-[#f43f5e]', dot: 'bg-[#f43f5e]' },
  late:    { label: 'Late',    short: 'L', bg: 'bg-yellow-100 dark:bg-yellow-900/30',border: 'border-yellow-300 dark:border-yellow-700',text: 'text-yellow-700 dark:text-yellow-400',activeBg: 'bg-[#f59e0b]', dot: 'bg-[#f59e0b]' },
  holiday: { label: 'Holiday', short: 'H', bg: 'bg-purple-100 dark:bg-purple-900/30',border: 'border-purple-300 dark:border-purple-700',text: 'text-purple-600 dark:text-purple-400',activeBg: 'bg-[#a855f7]', dot: 'bg-[#a855f7]' },
};

/* ══════════════════════════════════════════
   HELPER
══════════════════════════════════════════ */
const fmtDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
};

/* ══════════════════════════════════════════
   MARK ATTENDANCE MODAL (for single student quick edit)
══════════════════════════════════════════ */
const QuickMarkModal = ({ isOpen, onClose, student, date, current, onSave }) => {
  const [status, setStatus] = useState(current || 'present');
  useEffect(() => { setStatus(current || 'present'); }, [current, student]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[380px] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-3 text-[#6366f1]">
            <div className="bg-[#6366f1]/15 p-1.5 rounded"><CheckSquare size={15} strokeWidth={2.5} /></div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">Mark Attendance</h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)]">{student.name} · Roll {student.roll}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#0f172a] border dark:border-[#334155] text-[#64748b]"><X size={13} strokeWidth={3} /></button>
        </div>
        <div className="p-5 bg-white dark:bg-[#1a2234]">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Date: {fmtDate(date)}</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS).filter(([k]) => k !== 'holiday').map(([key, cfg]) => (
              <button key={key} onClick={() => setStatus(key)}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg border-2 transition-all font-bold text-[12px] ${
                  status === key
                    ? `${cfg.activeBg} border-transparent text-white shadow-sm`
                    : `bg-gray-50 dark:bg-[#10162A] border-gray-200 dark:border-[#334155] text-[var(--text-primary)] hover:border-gray-300`
                }`}>
                <div className={`w-3 h-3 rounded-full ${status === key ? 'bg-white/70' : cfg.dot}`}></div>
                <span>{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded">CANCEL</button>
          <button onClick={() => { onSave(status); onClose(); }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            <Save size={11} strokeWidth={3} /><span>SAVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const Attendance = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedClass, setSelectedClass] = useState('Class 5');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quickModal, setQuickModal] = useState({ open: false, student: null });

  // Calendar month state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear]   = useState(new Date().getFullYear());

  const fetchClassStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admissions?admitted_into_class=${selectedClass}`);
      const list = (res.data?.data ?? res.data ?? []).map(s => ({
        id: s.id,
        rawId: s.id,
        name: s.student_name ?? 'Student',
        roll: s.roll_no ?? s.id,
      }));
      setStudents(list);

      const attRes = await api.get(`/student-attendance?class_name=${selectedClass}&attendance_date=${selectedDate}`);
      const attData = {};
      (attRes.data?.data ?? attRes.data ?? []).forEach(a => {
        const key = `${selectedClass}|${a.attendance_date}|${a.student_id}`;
        attData[key] = a.status;
      });
      setAttendance(attData);
    } catch (err) {
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => { fetchClassStudents(); }, [fetchClassStudents]);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    String(s.roll).includes(search)
  );

  const buildAttendanceKey = (cls, date, sid) => `${cls}|${date}|${sid}`;
  const getAttendance = (sid) => attendance[buildAttendanceKey(selectedClass, selectedDate, sid)] || null;

  const markAll = (status) => {
    const updates = {};
    students.forEach(s => { updates[buildAttendanceKey(selectedClass, selectedDate, s.id)] = status; });
    setAttendance(prev => ({ ...prev, ...updates }));
  };

  const markSingle = (sid, status) => {
    setAttendance(prev => ({
      ...prev,
      [buildAttendanceKey(selectedClass, selectedDate, sid)]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        class_name: selectedClass,
        attendance_date: selectedDate,
        status: attendance[buildAttendanceKey(selectedClass, selectedDate, s.id)] || 'present'
      }));
      await api.post('/student-attendance/bulk', { records });
      alert('Attendance saved successfully!');
    } catch (e) {
      alert('Failed to save attendance: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  /* — Stats for today's selected class & date — */
  const present  = students.filter(s => getAttendance(s.id) === 'present').length;
  const absent   = students.filter(s => getAttendance(s.id) === 'absent').length;
  const late     = students.filter(s => getAttendance(s.id) === 'late').length;
  const unmarked = students.length - present - absent - late;
  const rate     = students.length ? Math.round(((present + late) / students.length) * 100) : 0;

  /* — Monthly calendar helpers — */
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay    = new Date(calYear, calMonth, 1).getDay();

  const getDayStats = (day) => {
    const date = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayStudents = students;
    const p = todayStudents.filter(s => attendance[buildAttendanceKey(selectedClass, date, s.id)] === 'present').length;
    const a = todayStudents.filter(s => attendance[buildAttendanceKey(selectedClass, date, s.id)] === 'absent').length;
    const l = todayStudents.filter(s => attendance[buildAttendanceKey(selectedClass, date, s.id)] === 'late').length;
    const hasData = p + a + l > 0;
    return { p, a, l, hasData, total: todayStudents.length };
  };

  /* — Student-wise: total stats — */
  const getStudentStats = (sid) => {
    let p = 0, a = 0, l = 0, total = 0;
    Object.keys(attendance).forEach(key => {
      const [cls, , id] = key.split('|');
      if (cls === selectedClass && id === sid) {
        total++;
        const val = attendance[key];
        if (val === 'present') p++;
        else if (val === 'absent') a++;
        else if (val === 'late') l++;
      }
    });
    return { p, a, l, total, rate: total ? Math.round(((p+l)/total)*100) : 0 };
  };

  const tabs = [
    { id: 'daily',   label: 'DAILY ATTENDANCE', icon: CheckSquare },
    { id: 'monthly', label: 'MONTHLY REPORT',   icon: Calendar },
    { id: 'student', label: 'STUDENT REPORT',   icon: BarChart2 },
  ];

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Attendance</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Track · Mark · Report</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchClassStudents} disabled={loading} className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={`text-[#6366f1] ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
          <button onClick={() => markAll('present')}
            className="flex items-center justify-center space-x-2 h-9 px-4 rounded-md bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-extrabold shadow-sm transition-colors min-w-[140px]">
            <UserCheck size={14} strokeWidth={2.5} /><span>Mark All Present</span>
          </button>
          <button onClick={handleSaveAttendance} disabled={loading}
            className="flex items-center justify-center space-x-2 h-9 px-6 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[11px] font-extrabold shadow-sm transition-all min-w-[150px] disabled:opacity-50">
            <Save size={14} strokeWidth={2.5} /><span>SAVE ATTENDANCE</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 shrink-0">
        {[
          { label: 'TOTAL', value: students.length,  icon: Users,       ic: 'text-[#6366f1]', ib: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20' },
          { label: 'PRESENT',value: present,          icon: UserCheck,   ic: 'text-[#10b981]', ib: 'bg-[#10b981]/10 dark:bg-[#10b981]/20' },
          { label: 'ABSENT', value: absent,           icon: UserX,       ic: 'text-[#f43f5e]', ib: 'bg-[#f43f5e]/10 dark:bg-[#f43f5e]/20' },
          { label: 'LATE',   value: late,             icon: Clock,       ic: 'text-[#f59e0b]', ib: 'bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20' },
          { label: 'RATE',   value: `${rate}%`,       icon: TrendingUp,  ic: 'text-[#06b6d4]', ib: 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-lg p-4 flex items-center shadow-sm transition-colors cursor-default hover:bg-white/5 dark:hover:bg-[#1a2234]">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${s.ib} ${s.ic}`}><Icon size={18} strokeWidth={2.5} /></div>
              <div>
                <p className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">{s.label}</p>
                <p className="text-[20px] font-black text-[var(--text-primary)] leading-none mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Panel ── */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#10162A]/50 backdrop-blur-[2px]">
             <div className="flex flex-col items-center space-y-3">
               <RefreshCw size={28} className="animate-spin text-[#6366f1]" />
               <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Attendance...</p>
             </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-2 pt-2 border-b border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] shrink-0">
          <div className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-[10px] font-bold tracking-widest uppercase border-b-[3px] transition-all duration-200 ${isActive ? 'border-[#6366f1] text-[#6366f1] bg-white dark:bg-[#10162a]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                  <Icon size={13} strokeWidth={isActive ? 3 : 2} /><span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controls — right side */}
          <div className="flex items-center space-x-2 pb-2">
            {/* Class selector */}
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="h-8 pl-3 pr-7 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] appearance-none cursor-pointer shadow-sm transition-colors">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Date picker — only for daily tab */}
            {activeTab === 'daily' && (
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="h-8 px-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm" />
            )}

            {/* Search — daily & student tab */}
            {(activeTab === 'daily' || activeTab === 'student') && (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" strokeWidth={2.5} />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-[160px] h-8 pl-8 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm" />
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════ DAILY TAB ════════════════════════ */}
        {activeTab === 'daily' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Sub-header */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 dark:bg-[#151c2e] border-b border-[var(--border-color)] dark:border-[#334155] shrink-0">
              <p className="text-[11px] font-bold text-[var(--text-secondary)]">
                📅 {fmtDate(selectedDate)} — <span className="text-[var(--text-primary)]">{selectedClass}</span>
                {unmarked > 0 && <span className="ml-2 text-[#f59e0b] font-black">· {unmarked} unmarked</span>}
              </p>
              <div className="flex items-center space-x-2">
                {['present','absent','late'].map(s => (
                  <button key={s} onClick={() => markAll(s)}
                    className={`flex items-center justify-center px-3 h-7 rounded text-[9px] font-extrabold uppercase tracking-widest border ${STATUS[s].bg} ${STATUS[s].border} ${STATUS[s].text} hover:opacity-80 transition-opacity min-w-[90px]`}>
                    All {STATUS[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                  <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                    <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">ROLL</th>
                    <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">STUDENT NAME</th>
                    <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">STATUS</th>
                    <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">MARK ATTENDANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(student => {
                    const att = getAttendance(student.id);
                    const cfg = att ? STATUS[att] : null;
                    return (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/50 transition-colors">
                        <td className="px-5 py-3 text-[11px] font-black text-[#6366f1]">#{String(student.roll).padStart(2,'0')}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-[11px] font-black shrink-0">
                              {student.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-[var(--text-primary)]">{student.name}</p>
                              <p className="text-[10px] text-[var(--text-secondary)]">{student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {cfg
                            ? <span className={`px-2.5 py-0.5 text-[9px] font-black rounded border tracking-widest uppercase ${cfg.bg} ${cfg.border} ${cfg.text}`}>{cfg.label}</span>
                            : <span className="px-2.5 py-0.5 text-[9px] font-black rounded border tracking-widest uppercase bg-gray-100 dark:bg-[#0f172a] border-gray-300 dark:border-[#334155] text-slate-400">UNMARKED</span>
                          }
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end space-x-1">
                            {['present','absent','late'].map(s => {
                              const sc = STATUS[s];
                              const isActive = att === s;
                              return (
                                <button key={s} onClick={() => markSingle(student.id, s)}
                                  title={sc.label}
                                  className={`px-3 h-7 rounded font-extrabold text-[9px] tracking-widest uppercase border transition-all ${
                                    isActive
                                      ? `${sc.activeBg} border-transparent text-white shadow-sm`
                                      : `bg-white dark:bg-[#10162A] ${sc.border} ${sc.text} hover:opacity-80`
                                  }`}>
                                  {sc.short}
                                </button>
                              );
                            })}
                            <button onClick={() => setQuickModal({ open: true, student })}
                              title="Edit"
                              className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 transition-colors shadow-sm ml-1">
                              <CheckSquare size={11} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Progress bar footer */}
            <div className="px-5 py-3 border-t border-[var(--border-color)] dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0 flex items-center space-x-4">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">Attendance Progress</span>
              <div className="flex-1 bg-gray-200 dark:bg-[#334155] h-2.5 rounded-full overflow-hidden flex">
                {present > 0 && <div className="bg-[#10b981] h-full transition-all" style={{ width: `${(present/students.length)*100}%` }}></div>}
                {late > 0    && <div className="bg-[#f59e0b] h-full transition-all" style={{ width: `${(late/students.length)*100}%` }}></div>}
                {absent > 0  && <div className="bg-[#f43f5e] h-full transition-all" style={{ width: `${(absent/students.length)*100}%` }}></div>}
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                {[['Present', '#10b981', present], ['Late', '#f59e0b', late], ['Absent', '#f43f5e', absent]].map(([l, c, v]) => (
                  <div key={l} className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: c }}></div>
                    <span className="text-[9px] font-bold text-[var(--text-secondary)]">{l}: <span className="text-[var(--text-primary)]">{v}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════ MONTHLY TAB ════════════════════════ */}
        {activeTab === 'monthly' && (
          <div className="flex-1 overflow-auto custom-scrollbar p-5">
            {/* Month navigator */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[#1a2234] transition-colors shadow-sm">
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <h3 className="text-[15px] font-black text-[var(--text-primary)] tracking-wide">{MONTHS[calMonth]} {calYear}</h3>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[#1a2234] transition-colors shadow-sm">
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for first week */}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`}></div>)}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const isToday = dateStr === todayStr;
                const isWeekend = new Date(calYear, calMonth, day).getDay() === 0 || new Date(calYear, calMonth, day).getDay() === 6;
                const stats = getDayStats(day);

                return (
                  <button key={day} onClick={() => { setSelectedDate(dateStr); setActiveTab('daily'); }}
                    className={`rounded-lg p-2 min-h-[72px] flex flex-col transition-all border hover:shadow-md ${
                      isToday
                        ? 'bg-[#6366f1]/10 border-[#6366f1] dark:bg-[#6366f1]/20'
                        : isWeekend
                        ? 'bg-gray-50 dark:bg-[#0f172a]/50 border-gray-100 dark:border-[#334155]/50 opacity-60'
                        : 'bg-white dark:bg-[#10162A] border-gray-100 dark:border-[#334155] hover:border-[#6366f1]'
                    }`}>
                    <span className={`text-[11px] font-black mb-1.5 ${isToday ? 'text-[#6366f1]' : 'text-[var(--text-primary)]'}`}>{day}</span>
                    {stats.hasData && !isWeekend && (
                      <div className="space-y-0.5 mt-auto w-full">
                        <div className="w-full h-1 rounded-full overflow-hidden bg-gray-100 dark:bg-[#334155] flex">
                          <div className="bg-[#10b981] h-full" style={{ width: `${(stats.p/stats.total)*100}%` }}></div>
                          <div className="bg-[#f59e0b] h-full" style={{ width: `${(stats.l/stats.total)*100}%` }}></div>
                          <div className="bg-[#f43f5e] h-full" style={{ width: `${(stats.a/stats.total)*100}%` }}></div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[8px] font-bold text-[#10b981]">P:{stats.p}</span>
                          <span className="text-[8px] font-bold text-[#f59e0b]">L:{stats.l}</span>
                          <span className="text-[8px] font-bold text-[#f43f5e]">A:{stats.a}</span>
                        </div>
                      </div>
                    )}
                    {isWeekend && <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 mt-auto">Weekend</span>}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-5 mt-5 pt-4 border-t border-[var(--border-color)] dark:border-[#334155]">
              <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Legend:</span>
              {[['Present','#10b981'], ['Late','#f59e0b'], ['Absent','#f43f5e']].map(([l, c]) => (
                <div key={l} className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: c }}></div>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">{l}</span>
                </div>
              ))}
              <span className="text-[9px] font-bold text-[var(--text-secondary)] ml-2">· Click any date to mark attendance</span>
            </div>
          </div>
        )}

        {/* ════════════════════════ STUDENT REPORT TAB ════════════════════════ */}
        {activeTab === 'student' && (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                  {['ROLL', 'STUDENT', 'PRESENT', 'ABSENT', 'LATE', 'TOTAL DAYS', 'ATTENDANCE RATE'].map(h => (
                    <th key={h} className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const stats = getStudentStats(student.id);
                  const rateColor = stats.rate >= 75 ? '#10b981' : stats.rate >= 50 ? '#f59e0b' : '#f43f5e';
                  return (
                    <tr key={student.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/50 transition-colors">
                      <td className="px-5 py-4 text-[11px] font-black text-[#6366f1]">#{String(student.roll).padStart(2,'0')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-[11px] font-black shrink-0">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-[var(--text-primary)]">{student.name}</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">{student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded border bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-[#4ade80]">{stats.p}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded border bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400">{stats.a}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded border bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400">{stats.l}</span>
                      </td>
                      <td className="px-5 py-4 text-[12px] font-bold text-[var(--text-primary)]">{stats.total}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-[100px] bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${stats.rate}%`, background: rateColor }}></div>
                          </div>
                          <span className="text-[12px] font-black" style={{ color: rateColor }}>{stats.rate}%</span>
                          {stats.rate < 75 && <AlertCircle size={13} className="text-[#f43f5e]" strokeWidth={2.5} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>{/* end main panel */}

      {/* Quick Mark Modal */}
      <QuickMarkModal
        isOpen={quickModal.open}
        onClose={() => setQuickModal({ open: false, student: null })}
        student={quickModal.student}
        date={selectedDate}
        current={quickModal.student ? getAttendance(quickModal.student.id) : null}
        onSave={(status) => {
          if (quickModal.student) markSingle(quickModal.student.id, status);
        }}
      />
    </div>
  );
};

export default Attendance;
