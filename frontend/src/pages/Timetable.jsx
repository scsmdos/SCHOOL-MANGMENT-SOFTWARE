import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid, UserCheck, Clock, ShieldCheck, Plus, X, Save,
  Download, Settings, ChevronDown, Edit, Trash2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useCallback } from 'react';
import api from '../api/axios';

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_PERIODS = [
  { id: 1, label: '1st Period',  time: '08:00 AM – 08:45 AM' },
  { id: 2, label: '2nd Period',  time: '08:45 AM – 09:30 AM' },
  { id: 3, label: '3rd Period',  time: '09:30 AM – 10:15 AM' },
  { id: 4, label: 'Break',       time: '10:15 AM – 10:30 AM', isBreak: true },
  { id: 5, label: '4th Period',  time: '10:30 AM – 11:15 AM' },
  { id: 6, label: '5th Period',  time: '11:15 AM – 12:00 PM' },
  { id: 7, label: 'Lunch',       time: '12:00 PM – 12:45 PM', isBreak: true },
  { id: 8, label: '6th Period',  time: '12:45 PM – 01:30 PM' },
  { id: 9, label: '7th Period',  time: '01:30 PM – 02:15 PM' },
  { id: 10, label: '8th Period', time: '02:15 PM – 03:00 PM' },
];

const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'];
const TEACHERS = ['Alok Mishra', 'Priya Sharma', 'Reena Singh', 'Guddu Kumar', 'Anita Devi', 'Rahul Verma'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer', 'Art', 'Physical Ed.'];

const SUBJECT_COLORS = {
  'Mathematics':    { bg: 'bg-violet-500/20 dark:bg-violet-500/30', border: 'border-violet-400', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-500' },
  'Science':        { bg: 'bg-cyan-500/20 dark:bg-cyan-500/30',     border: 'border-cyan-400',   text: 'text-cyan-700 dark:text-cyan-300',   badge: 'bg-cyan-500' },
  'English':        { bg: 'bg-green-500/20 dark:bg-green-500/30',   border: 'border-green-400',  text: 'text-green-700 dark:text-green-300', badge: 'bg-green-500' },
  'Hindi':          { bg: 'bg-orange-500/20 dark:bg-orange-500/30', border: 'border-orange-400', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-500' },
  'Social Studies': { bg: 'bg-yellow-500/20 dark:bg-yellow-500/30', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-500' },
  'Computer':       { bg: 'bg-blue-500/20 dark:bg-blue-500/30',     border: 'border-blue-400',   text: 'text-blue-700 dark:text-blue-300',   badge: 'bg-blue-500' },
  'Art':            { bg: 'bg-pink-500/20 dark:bg-pink-500/30',     border: 'border-pink-400',   text: 'text-pink-700 dark:text-pink-300',   badge: 'bg-pink-500' },
  'Physical Ed.':   { bg: 'bg-rose-500/20 dark:bg-rose-500/30',     border: 'border-rose-400',   text: 'text-rose-700 dark:text-rose-300',   badge: 'bg-rose-500' },
};

/* ── Initial sample data — keyed as "class|periodId|day" ── */
const buildKey = (cls, periodId, day) => `${cls}|${periodId}|${day}`;



/* ══════════════════════════════════════════
   TIME GRID CONFIGURATION MODAL
══════════════════════════════════════════ */
const ConfigureGridModal = ({ isOpen, onClose, periods, onApply }) => {
  const [draft, setDraft] = useState([]);
  useEffect(() => { if (isOpen) setDraft(periods.map(p => ({ ...p }))); }, [isOpen, periods]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (idx, field, val) => {
    setDraft(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[700px] bg-white dark:bg-[#1a2234] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] flex flex-col max-h-[90vh] overflow-hidden transition-colors">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-[#2d3a52] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-4">
            <div className="bg-[#6366f1]/15 dark:bg-[#6366f1]/20 p-2.5 rounded-lg">
              <Clock size={20} strokeWidth={2.5} className="text-[#6366f1] dark:text-[#818cf8]" />
            </div>
            <div>
              <h3 className="text-[15px] font-black uppercase tracking-widest text-[var(--text-primary)]">Time Grid Configuration</h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">Manage Periods, Intervals and Breaks</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[#64748b] hover:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[#334155] transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body — scrollable list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar bg-white dark:bg-[#1a2234]">
          {draft.map((p, idx) => (
            <div key={p.id} className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#2d3a52] rounded-xl px-5 py-4 flex items-center space-x-4 transition-colors">
              {/* Period number badge */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black shrink-0 ${
                p.isBreak
                  ? 'bg-[#f59e0b]/15 text-[#d97706] dark:bg-[#f59e0b]/20 dark:text-[#f59e0b]'
                  : 'bg-[#6366f1]/15 text-[#4f46e5] dark:bg-[#6366f1]/20 dark:text-[#818cf8]'
              }`}>{idx + 1}</div>

              {/* Label */}
              <div className="flex-1">
                <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Label Name</label>
                <input
                  type="text"
                  value={p.label}
                  onChange={e => update(idx, 'label', e.target.value)}
                  className="mt-1 w-full h-10 px-3 bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded-lg text-[12px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1] transition-colors"
                />
              </div>

              {/* Time Range */}
              <div className="flex-1">
                <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Time Range</label>
                <input
                  type="text"
                  value={p.time}
                  onChange={e => update(idx, 'time', e.target.value)}
                  placeholder="e.g. 08:00 AM – 08:45 AM"
                  className="mt-1 w-full h-10 px-3 bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded-lg text-[12px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1] transition-colors"
                />
              </div>

              {/* Break toggle */}
              <div className="flex flex-col items-center shrink-0">
                <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Break</label>
                <button
                  onClick={() => update(idx, 'isBreak', !p.isBreak)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    p.isBreak ? 'bg-[#f59e0b]' : 'bg-gray-300 dark:bg-[#334155]'
                  }`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    p.isBreak ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2d3a52] flex items-center justify-between bg-gray-50 dark:bg-[#10162A] shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#10b981]/15 dark:bg-[#10b981]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
            </div>
            <span className="text-[10px] font-bold text-[#10b981]">Changes will reflect instantly on the UI.</span>
          </div>
          <button
            onClick={() => { onApply(draft); onClose(); }}
            className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-[11px] font-extrabold tracking-widest uppercase shadow-sm transition-colors">
            APPLY CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
};


const defaultSlot = { subject: '', teacher: '', room: '' };

const SlotModal = ({ isOpen, onClose, onSave, onDelete, slotKey, existing, context, subjects, teachers }) => {
  const [form, setForm] = useState(defaultSlot);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    setForm(existing ? { ...existing } : defaultSlot);
  }, [existing, slotKey]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const inp = 'w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[#6366f1] transition-colors';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[440px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <div className="flex items-center space-x-3 text-[#6366f1]">
            <div className="bg-[#6366f1]/15 p-1.5 rounded"><Grid size={16} strokeWidth={2.5} /></div>
            <div>
              <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                {existing ? 'Edit Slot' : 'Assign Slot'}
              </h3>
              {context && <p className="text-[10px] font-bold text-[#64748b] mt-0.5">{context}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#0f172a] border dark:border-[#334155] text-[#64748b]"><X size={14} strokeWidth={3} /></button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1a2234] grid grid-cols-1 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Subject</label>
            <select name="subject" value={form.subject} onChange={ch} className={inp}>
              <option value="">-- Select Subject --</option>
              {subjects.map((s, idx) => {
                const name = s.name || s.subject_name || s;
                return <option key={idx} value={name}>{name}</option>;
              })}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <select name="teacher" value={form.teacher} onChange={ch} className={inp}>
              <option value="">-- Select Teacher --</option>
              {teachers.map((t, idx) => {
                const name = t.name || t.employee_name || t.full_name || t;
                return <option key={idx} value={name}>{name}</option>;
              })}
            </select>

          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Room / Venue</label>
            <input type="text" name="room" value={form.room} onChange={ch} placeholder="e.g. Room 101 / Lab 1 / Ground" className={inp} />
          </div>

          {/* Subject color preview */}
          {SUBJECT_COLORS[form.subject] && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded border ${SUBJECT_COLORS[form.subject].bg} ${SUBJECT_COLORS[form.subject].border}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${SUBJECT_COLORS[form.subject].badge}`}></div>
              <span className={`text-[11px] font-bold ${SUBJECT_COLORS[form.subject].text}`}>{form.subject}</span>
              <span className="text-[10px] text-[#64748b]">·</span>
              <span className="text-[10px] font-bold text-[#64748b]">{form.teacher}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] shrink-0">
          <div>
            {existing && (
              <button onClick={() => { onDelete(slotKey); onClose(); }}
                className="flex items-center space-x-1.5 px-4 py-2 text-[10px] font-extrabold text-[#f43f5e] border border-[#f43f5e] rounded hover:bg-[#f43f5e]/10 transition-colors tracking-widest uppercase">
                <Trash2 size={11} strokeWidth={2.5} /><span>Remove</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[10px] font-extrabold tracking-widest uppercase">CANCEL</button>
            <button onClick={() => { onSave(slotKey, { ...form }); onClose(); }}
              className="flex items-center space-x-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
              <Save size={12} strokeWidth={3} /><span>{existing ? 'UPDATE' : 'ASSIGN'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SLOT CELL COMPONENT
══════════════════════════════════════════ */
const SlotCell = ({ slot, onClick }) => {
  if (!slot) {
    return (
      <div onClick={onClick}
        className="group h-[72px] flex items-center justify-center rounded border border-dashed border-gray-200 dark:border-[#334155] hover:border-[#6366f1] hover:bg-[#6366f1]/5 cursor-pointer transition-all duration-150">
        <Plus size={14} className="text-gray-300 dark:text-[#334155] group-hover:text-[#6366f1] transition-colors" strokeWidth={2} />
      </div>
    );
  }

  const c = SUBJECT_COLORS[slot.subject] || SUBJECT_COLORS['Mathematics'];
  return (
    <div onClick={onClick}
      className={`h-[72px] rounded border px-2.5 py-2 cursor-pointer hover:opacity-90 transition-all duration-150 relative overflow-hidden ${c.bg} ${c.border}`}>
      <div className={`absolute top-1.5 right-1.5 px-1 py-0 text-[7px] font-black text-white rounded ${c.badge}`}
        style={{ fontSize: '7px', letterSpacing: '0.08em' }}>PRC</div>
      <p className={`text-[12px] font-black leading-tight ${c.text}`}>{slot.subject}</p>
      <p className="text-[10px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wide mt-0.5">{slot.teacher}</p>
      {slot.room && <p className="text-[9px] font-bold text-[#94a3b8] mt-0.5">{slot.room}</p>}
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const Timetable = () => {
  const [activeTab, setActiveTab]         = useState('class');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [slots, setSlots]                 = useState({});
  const [loading, setLoading]             = useState(true);
  const [ready, setReady]                 = useState(false);
  const [modal, setModal]                 = useState({ open: false, key: null, context: '', periodId: null, day: null });
  const [showConfig, setShowConfig]       = useState(false);
  const [periods, setPeriods]             = useState(DEFAULT_PERIODS);
  
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const fetchBaseData = useCallback(async () => {
    try {
      const [cv, sv, tv] = await Promise.allSettled([
        api.get('/academic-classes'),
        api.get('/academic-subjects'),
        api.get('/employees')
      ]);
      if (cv.status === 'fulfilled') {
        const raw = cv.value.data?.data ?? cv.value.data ?? [];
        setClasses(raw);
        if (raw.length > 0 && !selectedClass) {
          const first = raw[0];
          const name = first.name || first.class_name || (typeof first === 'string' ? first : '');
          if (name) setSelectedClass(name);
        }
      }
      if (sv.status === 'fulfilled') {
        const raw = sv.value.data?.data ?? sv.value.data ?? [];
        setSubjects(raw);
        if (raw.length > 0 && !selectedSubject) {
          const first = raw[0];
          const name = first.name || first.subject_name || (typeof first === 'string' ? first : '');
          if (name) setSelectedSubject(name);
        }
      }
      if (tv.status === 'fulfilled') setTeachers(tv.value.data?.data ?? tv.value.data ?? []);
      setReady(true);
    } catch (e) { console.error(e); setReady(true); }
  }, [selectedClass, selectedSubject]);

  useEffect(() => { fetchBaseData(); }, [fetchBaseData]);


  const fetchTimetable = useCallback(async () => {
    if (!ready || (activeTab === 'class' && !selectedClass)) return;
    setLoading(true);
    try {
      const url = activeTab === 'class' 
        ? `/timetables?class_name=${selectedClass}` 
        : `/timetables`;
      const res = await api.get(url);

      const data = res.data?.data ?? res.data ?? [];
      const newSlots = {};
      data.forEach(s => {
          const key = buildKey(s.class_name, s.period, s.day);
          newSlots[key] = { id: s.id, subject: s.subject_name, teacher: s.teacher_name, room: s.room, class: s.class_name };
      });
      setSlots(newSlots);
    } catch (err) {
      console.error('Timetable fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, activeTab, selectedSubject]);

  useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

  const openSlotModal = (cls, periodId, day) => {
    const key = buildKey(cls, periodId, day);
    const period = periods.find(p => p.id === periodId);
    setModal({ open: true, key, context: `${cls}  ·  ${day}  ·  ${period?.label} (${period?.time})`, periodId, day });
  };

  const toSqlTime = (timeStr) => {
    if (!timeStr) return '08:00:00';
    let [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  };

  const handleSave = async (key, data) => {
    try {
      setLoading(true);
      const period = periods.find(p => p.id === modal.periodId);
      const clsObj = classes.find(c => (c.name || c.class_name) === selectedClass);
      const subObj = subjects.find(s => (s.name || s.subject_name) === data.subject);
      const teaObj = teachers.find(t => (t.name || t.employee_name || t.full_name) === data.teacher);

      const payload = {
        class_name: selectedClass,
        day: modal.day,
        period: String(modal.periodId),
        subject_name: data.subject,
        teacher_name: data.teacher,
        room: data.room,
        start_time: toSqlTime(period?.time.split(' – ')[0]),
        end_time: toSqlTime(period?.time.split(' – ')[1]),
        academic_class_id: clsObj?.id || 1,
        subject_id: subObj?.id || 1,
        employee_id: teaObj?.id || 1
      };
      
      const existing = slots[key];
      if (existing && existing.id) {
        await api.put(`/timetables/${existing.id}`, payload);
      } else {
        await api.post('/timetables', payload);
      }
      fetchTimetable();
    } catch (e) { 
      const msg = e.response?.data?.error || e.message;
      alert('Failed to save slot: ' + msg); 
    }
    finally { setLoading(false); }
  };

  const handleDelete = async (key) => {
    try {
      const existing = slots[key];
      if (existing && existing.id) {
        await api.delete(`/timetables/${existing.id}`);
        fetchTimetable();
      } else {
        setSlots(prev => { const n = { ...prev }; delete n[key]; return n; });
      }
    } catch (e) { alert('Failed to delete slot: ' + e.message); }
  };

  const existing = modal.key ? slots[modal.key] : null;

  /* — Stats Memoized — */
  const classesWithData = useMemo(() => classes.filter(cls =>
    periods.some(p => !p.isBreak && DAYS.some(d => slots[buildKey(cls.name || cls.class_name || cls, p.id, d)]))
  ).length, [classes, periods, slots]);

  const teachersActive = useMemo(() => new Set(Object.values(slots).map(s => s.teacher)).size, [slots]);

  const totalPeriods = useMemo(() => Object.keys(slots).filter(k => {
    const [cls] = k.split('|');
    return cls === selectedClass;
  }).length, [slots, selectedClass]);

  const conflicts = useMemo(() => {
    let c = 0;
    const classNames = classes.map(cls => cls.name || cls.class_name || (typeof cls === 'string' ? cls : ''));
    if (classNames.length === 0) return 0;

    DAYS.forEach(day => {
      periods.filter(p => !p.isBreak).forEach(p => {
        const teacherUsed = {};
        classNames.forEach(cls => {
          const slot = slots[buildKey(cls, p.id, day)];
          if (slot) {
            if (teacherUsed[slot.teacher]) c++;
            teacherUsed[slot.teacher] = true;
          }
        });
      });
    });
    return c;
  }, [classes, periods, slots]);

  const statCards = useMemo(() => [
    { label: 'CLASSES SCHEDULED', value: `${classesWithData} / ${classes.length || CLASSES.length}`, icon: Grid, iconColor: 'text-[#6366f1]', iconBg: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20' },
    { label: 'ACTIVE TEACHERS',   value: `${teachersActive} / ${teachers.length || TEACHERS.length}`, icon: UserCheck, iconColor: 'text-[#06b6d4]', iconBg: 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20' },
    { label: 'TOTAL PERIODS / WEEK', value: totalPeriods,                           icon: Clock, iconColor: 'text-[#a855f7]', iconBg: 'bg-[#a855f7]/10 dark:bg-[#a855f7]/20' },
    {
      label: 'CONFLICT STATUS',
      value: conflicts === 0 ? '0 Warnings' : `${conflicts} Conflicts`,
      icon: conflicts === 0 ? ShieldCheck : AlertTriangle,
      iconColor: conflicts === 0 ? 'text-[#10b981]' : 'text-[#f43f5e]',
      iconBg: conflicts === 0 ? 'bg-[#10b981]/10 dark:bg-[#10b981]/20' : 'bg-[#f43f5e]/10 dark:bg-[#f43f5e]/20',
    },
  ], [classesWithData, classes.length, teachersActive, teachers.length, totalPeriods, conflicts]);

  /* — Subject overview: show all classes for a subject across the grid — */
  const getSubjectSlot = (periodId, day) => {
    for (const c of classes) {
      const clsName = c.name || c.class_name || c;
      const s = slots[buildKey(clsName, periodId, day)];
      if (s && s.subject === selectedSubject) return { ...s, class: clsName };
    }
    return null;
  };


  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Timetable Scheduler</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Advanced Visual Grid Management System</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchTimetable} disabled={loading} className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={`text-indigo-500 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
          <button onClick={() => setShowConfig(true)} className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm">
            <Settings size={13} strokeWidth={2.5} className="text-[#6366f1]" /><span>Period Setup</span>
          </button>
          <button className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm">
            <Download size={13} strokeWidth={2.5} className="text-[#10b981]" /><span>Export Grid</span>
          </button>
          <button onClick={() => {
            const p = periods.find(p => !p.isBreak); // Fixed: using lowercase periods state
            if (p) openSlotModal(selectedClass, p.id, 'Monday');
          }} className="flex items-center space-x-2 h-9 px-4 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[11px] font-extrabold shadow-sm transition-colors">
            <Plus size={13} strokeWidth={3} /><span>Assign Slot</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-lg p-4 flex items-center shadow-sm transition-colors cursor-default hover:bg-white/5 dark:hover:bg-[#1a2234]">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">{stat.label}</span>
                <span className="text-[22px] font-black text-[var(--text-primary)] leading-none mt-1">{loading ? '...' : stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timetable Grid Container */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px]">
             <div className="flex flex-col items-center space-y-3">
               <RefreshCw size={28} className="animate-spin text-[#6366f1]" />
               <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Updating Timetable...</p>
             </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-2 pt-2 border-b border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] shrink-0">
          <div className="flex space-x-1">
            {[
              { id: 'class',   label: 'CLASS TIMETABLE',   icon: Grid },
              { id: 'subject', label: 'SUBJECT OVERVIEW',  icon: Clock },
            ].map(tab => {
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

          {/* Dropdown selector */}
          <div className="relative pb-2">
            {activeTab === 'class' ? (
              <div className="relative">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                  className="h-8 pl-3 pr-8 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] appearance-none cursor-pointer shadow-sm transition-colors">
                  {classes.map((c, idx) => {
                    const name = c.name || c.class_name || c;
                    return <option key={idx} value={name}>{name}</option>;
                  })}
                </select>

                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="relative">
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                  className="h-8 pl-3 pr-8 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] appearance-none cursor-pointer shadow-sm transition-colors">
                  {subjects.map((s, idx) => {
                    const name = s.name || s.subject_name || s;
                    return <option key={idx} value={name}>{name}</option>;
                  })}
                </select>

                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full border-collapse" style={{ minWidth: '860px' }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-[var(--bg-panel-alt)] border-b border-[var(--border-color)] dark:border-[#334155]">
                <th className="w-[130px] px-4 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase text-left whitespace-nowrap border-r border-[var(--border-color)] dark:border-[#334155]">TIME / DAY</th>
                {DAYS.map(day => (
                  <th key={day} className="px-3 py-3 text-[11px] font-extrabold tracking-widest uppercase text-center text-[#6366f1] dark:text-[#818cf8] whitespace-nowrap">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className={`border-b border-[var(--border-color)] dark:border-[#334155] ${period.isBreak ? 'bg-gray-50 dark:bg-[#0f172a]/50' : 'hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/40'} transition-colors`}>
                  {/* Period label */}
                  <td className="px-4 py-2 border-r border-[var(--border-color)] dark:border-[#334155] align-middle w-[130px]">
                    {period.isBreak ? (
                      <div className="text-center">
                        <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-widest">{period.label}</span>
                        <p className="text-[9px] text-[#94a3b8] mt-0.5">{period.time}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[11px] font-black text-[var(--text-primary)]">{period.label}</p>
                        <p className="text-[9px] font-medium text-[#64748b] mt-0.5">{period.time}</p>
                      </div>
                    )}
                  </td>

                  {/* Day cells */}
                  {DAYS.map(day => {
                    if (period.isBreak) {
                      return (
                        <td key={day} className="px-3 py-2 text-center">
                          <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">{period.label}</span>
                        </td>
                      );
                    }

                    const slot = activeTab === 'class'
                      ? slots[buildKey(selectedClass, period.id, day)]
                      : getSubjectSlot(period.id, day);

                    return (
                      <td key={day} className="px-2 py-2 min-w-[130px]">
                        {activeTab === 'class' ? (
                          <SlotCell slot={slot} onClick={() => openSlotModal(selectedClass, period.id, day)} />
                        ) : slot ? (
                          <div className={`h-[72px] rounded border px-2.5 py-2 relative overflow-hidden ${(SUBJECT_COLORS[slot.subject] || SUBJECT_COLORS['Mathematics']).bg} ${(SUBJECT_COLORS[slot.subject] || SUBJECT_COLORS['Mathematics']).border}`}>
                            <div className={`absolute top-1.5 right-1.5 px-1 text-white rounded ${(SUBJECT_COLORS[slot.subject] || SUBJECT_COLORS['Mathematics']).badge}`} style={{ fontSize: '7px', fontWeight: 900 }}>
                              {slot.class}
                            </div>
                            <p className={`text-[12px] font-black leading-tight ${(SUBJECT_COLORS[slot.subject] || SUBJECT_COLORS['Mathematics']).text}`}>{slot.subject}</p>
                            <p className="text-[10px] font-bold text-[#64748b] dark:text-slate-400 mt-0.5">{slot.teacher}</p>
                            <p className="text-[9px] font-bold text-[#94a3b8] mt-0.5">{slot.room}</p>
                          </div>
                        ) : (
                          <div className="h-[72px] rounded border border-dashed border-gray-100 dark:border-[#1e293b]"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 px-4 py-3 border-t border-[var(--border-color)] dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <span className="text-[9px] font-extrabold text-[#64748b] uppercase tracking-widest mr-1">Subjects:</span>
          {Object.entries(SUBJECT_COLORS).map(([sub, c]) => (
            <div key={sub} className="flex items-center space-x-1.5">
              <div className={`w-2 h-2 rounded-full ${c.badge}`}></div>
              <span className="text-[9px] font-bold text-[#64748b]">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slot Modal */}
      <SlotModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, key: null, context: '', periodId: null, day: null })}
        onSave={handleSave}
        onDelete={handleDelete}
        slotKey={modal.key}
        existing={existing}
        context={modal.context}
        subjects={subjects}
        teachers={teachers}
      />

      {/* Configure Grid Modal */}
      <ConfigureGridModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        periods={periods}
        onApply={setPeriods}
      />
    </div>
  );
};

export default Timetable;
