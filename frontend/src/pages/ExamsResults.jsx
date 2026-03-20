import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, BookOpen, Award, TrendingUp, CheckCircle,
  Clock, AlertCircle, Search, Plus, Edit, Trash2, Eye, X, Save, BarChart2, RefreshCw
} from 'lucide-react';
import api from '../api/axios';
import logoImg from '../assets/logo.jpeg';

/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */


const examTypeColors = {
  'UNIT TEST':   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
  'MID-TERM':    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700',
  'HALF YEARLY': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
  'ANNUAL':      'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700',
};

const statusConfig = {
  UPCOMING:  { bg: 'bg-yellow-100 dark:bg-yellow-900/30',  border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-700 dark:text-yellow-400' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-[#14532d]/40',    border: 'border-green-300 dark:border-[#166534]/80', text: 'text-green-700 dark:text-[#4ade80]' },
  ONGOING:   { bg: 'bg-blue-100 dark:bg-blue-900/30',      border: 'border-blue-300 dark:border-blue-700',      text: 'text-blue-700 dark:text-blue-400' },
};

const gradeBadge = {
  'A+': 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400',
  'A':  'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
  'B':  'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
  'C':  'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400',
  'D':  'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
  'F':  'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
};

const tabs = [
  { id: 'exams',   label: 'EXAMS SCHEDULE', icon: FileText },
  { id: 'results', label: 'RESULTS & MARKS', icon: Award },
];

const inputCls = (focus = '#f59e0b') =>
  `w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[${focus}] transition-colors`;

/* ══════════════════════════════════════════
   MODALS
══════════════════════════════════════════ */

/* — Add Exam Modal — */
const defaultExam = { name: '', subject: '', class: '', date: '', duration: '', totalMarks: 100, examType: 'UNIT TEST', status: 'UPCOMING' };

const AddExamModal = ({ isOpen, onClose, onSave, classes, subjects }) => {
  const [form, setForm] = useState(defaultExam);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => setForm(defaultExam);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { reset(); onClose(); }}></div>
      <div className="relative w-full max-w-[540px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] flex flex-col max-h-[94vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <div className="flex items-center space-x-3 text-[#f59e0b]">
            <div className="bg-[#f59e0b]/15 p-1.5 rounded"><FileText size={16} strokeWidth={2.5} /></div>
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">Schedule New Exam</h3>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#0f172a] border dark:border-[#334155] text-[#64748b]">
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1a2234] overflow-y-auto custom-scrollbar grid grid-cols-1 gap-5">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Exam Name</label>
            <input type="text" name="name" value={form.name} onChange={ch} placeholder="e.g. Unit Test 1" className={inputCls()} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Subject</label>
              <select name="subject" value={form.subject} onChange={ch} className={inputCls()}>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Class</label>
              <select name="class" value={form.class} onChange={ch} className={inputCls()}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Exam Date</label>
              <input type="date" name="date" value={form.date} onChange={ch} className={inputCls()} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Duration</label>
              <input type="text" name="duration" value={form.duration} onChange={ch} placeholder="e.g. 90 min" className={inputCls()} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Total Marks</label>
              <input type="number" name="totalMarks" value={form.totalMarks} onChange={ch} min="0" className={inputCls()} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Exam Type</label>
              <select name="examType" value={form.examType} onChange={ch} className={inputCls()}>
                <option value="UNIT TEST">Unit Test</option>
                <option value="MID-TERM">Mid-Term</option>
                <option value="HALF YEARLY">Half Yearly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Status</label>
            <select name="status" value={form.status} onChange={ch} className={inputCls()}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end space-x-3 bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] shrink-0">
          <button onClick={() => { reset(); onClose(); }} className="px-5 py-2.5 bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[10px] font-extrabold tracking-widest uppercase">CANCEL</button>
          <button onClick={() => { const id = `EX-${Math.floor(100 + Math.random() * 900)}`; onSave({ ...form, id, totalMarks: Number(form.totalMarks) }); reset(); onClose(); }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
            <Save size={13} strokeWidth={3} /><span>SAVE EXAM</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* — Edit Exam Modal — */
const EditExamModal = ({ isOpen, onClose, data, onSave, classes, subjects }) => {
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[540px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] flex flex-col max-h-[94vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <div className="flex items-center space-x-3 text-[#eab308]">
            <div className="bg-[#eab308]/15 p-1.5 rounded"><Edit size={16} strokeWidth={2.5} /></div>
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">Update Exam</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#0f172a] border dark:border-[#334155] text-[#64748b]"><X size={14} strokeWidth={3} /></button>
        </div>
        <div className="p-6 bg-white dark:bg-[#1a2234] overflow-y-auto custom-scrollbar grid grid-cols-1 gap-5">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Exam Name</label>
            <input type="text" name="name" value={form.name || ''} onChange={ch} className={inputCls('#eab308')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Subject</label>
              <select name="subject" value={form.subject || ''} onChange={ch} className={inputCls('#eab308')}>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Class</label>
              <select name="class" value={form.class || ''} onChange={ch} className={inputCls('#eab308')}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Exam Date</label>
              <input type="date" name="date" value={form.date || ''} onChange={ch} className={inputCls('#eab308')} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Duration</label>
              <input type="text" name="duration" value={form.duration || ''} onChange={ch} className={inputCls('#eab308')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Total Marks</label>
              <input type="number" name="totalMarks" value={form.totalMarks || ''} onChange={ch} className={inputCls('#eab308')} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Exam Type</label>
              <select name="examType" value={form.examType || 'UNIT TEST'} onChange={ch} className={inputCls('#eab308')}>
                <option value="UNIT TEST">Unit Test</option>
                <option value="MID-TERM">Mid-Term</option>
                <option value="HALF YEARLY">Half Yearly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Status</label>
            <select name="status" value={form.status || 'UPCOMING'} onChange={ch} className={inputCls('#eab308')}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end space-x-3 bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[10px] font-extrabold tracking-widest uppercase">CANCEL</button>
          <button onClick={() => { onSave({ ...form, totalMarks: Number(form.totalMarks) }); onClose(); }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#84cc16] hover:bg-[#65a30d] text-white rounded text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
            <Save size={13} strokeWidth={3} /><span>UPDATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* — Add Result Modal — */
const defaultResult = { examId: '', studentName: '', class: '', subject: '', marksObtained: '', totalMarks: 100, grade: 'A', status: 'PASS' };

const AddResultModal = ({ isOpen, onClose, onSave, exams, students, classes, subjects }) => {
  const [form, setForm] = useState(defaultResult);
  const ch = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // If exam is selected, auto-fill class and subject
    if (name === 'examId' && value) {
      const selectedExam = exams.find(ex => ex.id === value);
      if (selectedExam) {
        updatedForm.class = selectedExam.class;
        updatedForm.subject = selectedExam.subject;
        updatedForm.totalMarks = selectedExam.totalMarks;
      }
    }

    setForm(updatedForm);
  };

  const reset = () => setForm(defaultResult);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  if (!isOpen) return null;

  const pct = form.marksObtained && form.totalMarks
    ? Math.round((Number(form.marksObtained) / Number(form.totalMarks)) * 100)
    : 0;

  // Filter students based on selected class
  const filteredStudents = students.filter(s => !form.class || s.admitted_into_class === form.class);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { reset(); onClose(); }}></div>
      <div className="relative w-full max-w-[540px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] flex flex-col max-h-[96vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <div className="flex items-center space-x-3 text-[#10b981]">
            <div className="bg-[#10b981]/15 p-1.5 rounded"><Award size={16} strokeWidth={2.5} /></div>
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">Enter Result / Marks</h3>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#0f172a] border dark:border-[#334155] text-[#64748b]"><X size={14} strokeWidth={3} /></button>
        </div>

        <div className="p-6 bg-white dark:bg-[#1a2234] overflow-y-auto custom-scrollbar grid grid-cols-1 gap-5">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Select Exam</label>
            <select name="examId" value={form.examId} onChange={ch} className={inputCls('#10b981')}>
              <option value="">-- Select Exam --</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.id} — {ex.name} ({ex.class})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Student Name</label>
              <select name="studentName" value={form.studentName} onChange={ch} className={inputCls('#10b981')}>
                <option value="">-- Select Student --</option>
                {filteredStudents.map(s => <option key={s.id} value={s.student_name}>{s.student_name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Class</label>
              <select name="class" value={form.class} onChange={ch} className={inputCls('#10b981')}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Subject</label>
              <select name="subject" value={form.subject} onChange={ch} className={inputCls('#10b981')}>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Marks Obtained</label>
              <input type="number" name="marksObtained" value={form.marksObtained} onChange={ch} min="0" className={inputCls('#10b981')} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Total Marks</label>
              <input type="number" name="totalMarks" value={form.totalMarks} onChange={ch} min="0" className={inputCls('#10b981')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Grade</label>
              <select name="grade" value={form.grade} onChange={ch} className={inputCls('#10b981')}>
                {['A+','A','B','C','D','F'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Result</label>
              <select name="status" value={form.status} onChange={ch} className={inputCls('#10b981')}>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
              </select>
            </div>
          </div>
          {/* Live Percentage Preview */}
          {form.marksObtained !== '' && (
            <div className="rounded-lg bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] p-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Calculated Percentage</span>
              <div className="flex items-center space-x-3">
                <div className="w-[120px] bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 33 ? 'bg-[#10b981]' : 'bg-[#f43f5e]'}`} style={{ width: `${pct}%` }}></div>
                </div>
                <span className={`text-[14px] font-black ${pct >= 33 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>{pct}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex justify-end space-x-3 bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] shrink-0">
          <button onClick={() => { reset(); onClose(); }} className="px-5 py-2.5 bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[10px] font-extrabold tracking-widest uppercase">CANCEL</button>
          <button onClick={() => {
            const newId = `RS-${Math.floor(100 + Math.random() * 900)}`;
            onSave({ ...form, id: newId, marksObtained: Number(form.marksObtained), totalMarks: Number(form.totalMarks), percentage: pct });
            reset(); onClose();
          }} className="flex items-center space-x-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
            <Save size={13} strokeWidth={3} /><span>SAVE RESULT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* — Premium Futuristic View Result Modal — */
const ViewResultModal = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  if (!isOpen || !data) return null;

  const pct = data.percentage || 0;
  const isPass = !['F', 'FAIL', 'E'].includes(data.grade?.toUpperCase());
  const statusColorUrl = isPass ? 'from-[#00D2A6] to-[#00C6FF]' : 'from-[#F43F5E] to-[#FB923C]';
  const textPassFailClass = isPass ? 'text-[#00D2A6]' : 'text-[#F43F5E]';
  const glowShadow = isPass ? 'shadow-[0_0_15px_rgba(0,210,166,0.3)]' : 'shadow-[0_0_15px_rgba(244,63,94,0.3)]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Premium Dark Modal Container */}
      <div className="relative w-full max-w-[500px] bg-[#1A2133] rounded-[14px] shadow-2xl border border-[#2A334B] flex flex-col overflow-hidden font-sans">
        
        {/* Neon Top Accent Line */}
        <div className={`w-full h-1.5 bg-gradient-to-r ${statusColorUrl}`}></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A334B] bg-[#1A2133] shrink-0">
          <div className="flex items-center space-x-3">
             <div className="bg-[#00D2A6]/10 p-1.5 rounded text-[#00D2A6]">
                <BarChart2 size={18} strokeWidth={2.5} />
             </div>
             <h3 className="text-[14px] font-[900] uppercase tracking-[0.15em] text-white">Result Card</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded bg-[#1E2538] border border-[#2A334B] text-[#94A3B8] hover:text-white transition-colors">
             <X size={15} strokeWidth={3} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 bg-[#1A2133] flex flex-col">
          
          {/* School Header — Logo + School Name + Subtitle */}
          <div className="flex items-center space-x-4 mb-6 border-b border-[#2A334B] pb-4">
             <div className="w-[52px] h-[52px] bg-white rounded-[10px] p-0.5 border-2 border-[#EAB308] flex-shrink-0 flex items-center justify-center">
                 <img src={logoImg} alt="School Logo" className="w-[90%] h-[90%] object-contain" />
             </div>
             <div>
                <h4 className="text-white text-[15px] font-[900] tracking-wide uppercase">Little Seeds School</h4>
                <p className="text-[#94A3B8] text-[10px] font-[600] tracking-wide mt-0.5">An English Medium School</p>
             </div>
          </div>

          {/* Student Banner */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-[800] text-[#64748B] uppercase tracking-[0.2em] mb-1">Student</span>
              <h2 className="text-[22px] font-[900] text-white leading-none tracking-tight mb-1.5">{data.studentName}</h2>
              <p className="text-[11px] font-[600] text-[#94A3B8] tracking-widest">{data.class}</p>
              {/* Subject row */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[9px] font-[800] text-[#64748B] uppercase tracking-widest">Subject:</span>
                <span className="text-[11px] font-[800] text-[#E2E8F0]">{data.subject || 'N/A'}</span>
              </div>
              {/* Father's name row */}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[9px] font-[800] text-[#64748B] uppercase tracking-widest">Father:</span>
                <span className="text-[11px] font-[800] text-[#E2E8F0]">{data.fatherName || 'N/A'}</span>
              </div>
            </div>
            
            {/* Glowing Grade Box */}
            <div className={`w-[60px] h-[60px] rounded-[16px] flex items-center justify-center text-[28px] font-[900] border-[2px] bg-[#2563EB]/10 border-[#3B82F6] text-[#60A5FA] shadow-[0_0_20px_rgba(59,130,246,0.3)]`}>
              {data.grade || '-'}
            </div>
          </div>

          {/* Modern Progress Bar */}
          <div className="mb-6">
            <div className="flex flex-col mb-2 space-y-1">
              <div className="flex items-end justify-between">
                 <span className="text-[10px] font-[800] text-[#64748B] uppercase tracking-[0.2em]">Score</span>
                 <span className={`text-[15px] font-[900] ${textPassFailClass}`}>{pct}%</span>
              </div>
            </div>
            <div className="w-full bg-[#2A334B] h-2.5 rounded-full overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${statusColorUrl} ${glowShadow}`}
                style={{ width: `${pct}%` }}></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-[#1E273A] border border-[#2A334B] rounded-[12px] p-4 flex flex-col items-center justify-center">
                <span className="text-[8.5px] font-[800] text-[#64748B] uppercase tracking-widest mb-1.5 text-center">Marks Obtained</span>
                <span className="text-[20px] font-[900] text-white leading-none">{data.marksObtained || '-'}</span>
             </div>
             <div className="bg-[#1E273A] border border-[#2A334B] rounded-[12px] p-4 flex flex-col items-center justify-center">
                <span className="text-[8.5px] font-[800] text-[#64748B] uppercase tracking-widest mb-1.5 text-center">Total Marks</span>
                <span className="text-[20px] font-[900] text-white leading-none">{data.totalMarks || '-'}</span>
             </div>
             <div className="bg-[#1E273A] border border-[#2A334B] rounded-[12px] p-4 flex flex-col items-center justify-center">
                <span className="text-[8.5px] font-[800] text-[#64748B] uppercase tracking-widest mb-1.5 text-center">Result</span>
                <span className={`text-[16px] font-[900] tracking-widest leading-none ${textPassFailClass}`}>{isPass ? 'PASS' : 'FAIL'}</span>
             </div>
          </div>

          {/* Footer IDs */}
          <div className="mt-6 flex items-center justify-center pt-5 border-t border-[#2A334B]">
             <span className="text-[9px] font-[700] text-[#475569] uppercase tracking-[0.2em]">
                Exam ID: {data.examId} &nbsp;&nbsp;•&nbsp;&nbsp; Result ID: {data.id}
             </span>
          </div>
          
        </div>

      </div>
    </div>
  );
};



/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const ExamsResults = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [examsList, setExamsList] = useState([]);
  const [resultsList, setResultsList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [admissionClasses, setAdmissionClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [modals, setModals] = useState({
    addExam: false, editExam: false,
    addResult: false, viewResult: false
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, rv, cv, sv, stuv, admv] = await Promise.allSettled([
        api.get('/exams'),
        api.get('/exam-results'),
        api.get('/academic-classes'),
        api.get('/academic-subjects'),
        api.get('/students-for-dropdown'),
        api.get('/get-classes')
      ]);

      if (cv.status === 'fulfilled') setClassList(cv.value.data?.data ?? cv.value.data ?? []);
      if (sv.status === 'fulfilled') setSubjectList(sv.value.data?.data ?? sv.value.data ?? []);
      if (stuv && stuv.status === 'fulfilled') setStudentList(stuv.value.data?.data ?? stuv.value.data ?? []);
      if (admv && admv.status === 'fulfilled') setAdmissionClasses(admv.value.data || []);



      if (ev.status === 'fulfilled') {
        const list = (ev.value.data?.data ?? ev.value.data ?? []).map(e => ({
          id: e.exam_id ?? `EX-${e.id}`,
          rawId: e.id,
          name: e.exam_name ?? e.name ?? 'Exam',
          subject: e.subject ?? 'N/A',
          class: e.class ?? 'All',
          date: e.exam_date ? e.exam_date.split('T')[0] : 'N/A',
          duration: e.duration ?? 'N/A',
          totalMarks: e.total_marks ?? 100,
          examType: (e.exam_type ?? 'UNIT TEST').toUpperCase(),
          status: (e.status ?? 'UPCOMING').toUpperCase(),
        }));
        setExamsList(list);
      }

      if (rv.status === 'fulfilled') {
        const list = (rv.value.data?.data ?? rv.value.data ?? []).map(r => ({
          id: r.result_id ?? `RS-${r.id}`,
          rawId: r.id,
          examId: r.exam_id ?? 'N/A',
          studentName: r.student_name ?? 'Student',
          fatherName: r.father_name ?? 'N/A', // Read here
          class: r.class ?? 'N/A',
          subject: r.subject ?? 'N/A',
          marksObtained: r.marks_obtained ?? 0,
          totalMarks: r.total_marks ?? 100,
          grade: r.grade ?? 'N/A',
          percentage: r.percentage ?? 0,
          status: (r.status ?? 'PASS').toUpperCase(),
        }));
        setResultsList(list);
      }
    } catch (err) {
      console.error('Exams/Results fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openM  = (k, row = null) => { setSelectedItem(row); setModals(p => ({ ...p, [k]: true })); };
  const closeM = (k) => setModals(p => ({ ...p, [k]: false }));

  const handleAddExam = async (data) => {
    try {
      const payload = {
        exam_id: data.id,
        exam_name: data.name,
        name: data.name,
        subject: data.subject,
        class: data.class,
        exam_date: data.date,
        start_date: data.date, // Also send to original column
        duration: data.duration,
        total_marks: data.totalMarks,
        exam_type: data.examType,
        term: data.name, // Also send to original column
        status: data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase() // Map UPCOMING -> Upcoming
      };
      await api.post('/exams', payload);
      fetchAll();
    } catch (err) { alert('Failed to save exam: ' + (err.response?.data?.error || err.message)); }
  };

  const handleUpdateExam = async (data) => {
    try {
      const payload = {
        exam_name: data.name,
        name: data.name,
        subject: data.subject,
        class: data.class,
        exam_date: data.date,
        duration: data.duration,
        total_marks: data.totalMarks,
        exam_type: data.examType,
        status: data.status
      };
      await api.put(`/exams/${data.rawId}`, payload);
      fetchAll();
    } catch (err) { alert('Failed to update exam: ' + (err.response?.data?.error || err.message)); }
  };

  const handleDeleteExam = async (rawId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/exams/${rawId}`);
      fetchAll();
    } catch (err) { alert('Failed to delete: ' + (err.response?.data?.error || err.message)); }
  };

  const handleAddResult = async (data) => {
    try {
      const selectedExam = examsList.find(ex => ex.id === data.examId);
      const selectedStudent = studentList.find(s => s.student_name === data.studentName && s.admitted_into_class === data.class);
      
      const payload = {
        result_id: data.id,
        exam_id: selectedExam ? selectedExam.rawId : null,
        exam_name: data.examId,
        student_id: selectedStudent ? selectedStudent.id : null,
        student_name: data.studentName,
        father_name: selectedStudent ? selectedStudent.father_name : 'N/A',
        class: data.class,
        subject: data.subject,
        marks_obtained: data.marksObtained,
        max_marks: data.totalMarks,
        total_marks: data.totalMarks,
        percentage: data.percentage,
        grade: data.grade,
        status: data.status
      };
      await api.post('/exam-results', payload);
      fetchAll();
    } catch (err) { alert('Failed to save result: ' + (err.response?.data?.error || err.message)); }
  };

  const handleDeleteResult = async (rawId) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await api.delete(`/exam-results/${rawId}`);
      fetchAll();
    } catch (err) { alert('Failed to delete: ' + (err.response?.data?.error || err.message)); }
  };

  const filteredExams = examsList.filter(e =>
    String(e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(e.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    String(e.class || '').toLowerCase().includes(search.toLowerCase()) ||
    String(e.id || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredResults = resultsList.filter(r =>
    String(r.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(r.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    String(r.class || '').toLowerCase().includes(search.toLowerCase()) ||
    String(r.examId || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalExams    = examsList.length;
  const upcoming      = examsList.filter(e => e.status === 'UPCOMING').length;
  const completed     = examsList.filter(e => e.status === 'COMPLETED').length;
  const passRate      = resultsList.length
    ? Math.round((resultsList.filter(r => r.status === 'PASS').length / resultsList.length) * 100) : 0;

  const statCards = [
    { label: 'TOTAL EXAMS',    value: totalExams, icon: FileText,   iconColor: 'text-[#f59e0b]', iconBg: 'bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20' },
    { label: 'UPCOMING',       value: upcoming,   icon: Clock,      iconColor: 'text-[#6366f1]', iconBg: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20' },
    { label: 'COMPLETED',      value: completed,  icon: CheckCircle,iconColor: 'text-[#10b981]', iconBg: 'bg-[#10b981]/10 dark:bg-[#10b981]/20' },
    { label: 'PASS RATE',      value: `${passRate}%`, icon: TrendingUp, iconColor: 'text-[#06b6d4]', iconBg: 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20' },
  ];

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Exams &amp; Results</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Schedule Exams · Record Results · Track Performance</p>
        </div>

        {/* Right side — search + total + action button */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative flex items-center">
            <div className="absolute left-3"><Search size={14} className="text-[#64748b]" strokeWidth={2.5} /></div>
            <input type="text"
              placeholder={activeTab === 'exams' ? 'Search exams...' : 'Search results...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-[240px] h-9 pl-9 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#f59e0b] transition-colors shadow-sm" />
          </div>

          {/* Total badge */}
          <div className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase border border-[var(--border-color)] dark:border-[#334155] px-3 h-9 rounded bg-white dark:bg-[#10162A] flex items-center whitespace-nowrap">
            Total: <span className="ml-1.5 font-black text-[var(--text-primary)]">{activeTab === 'exams' ? filteredExams.length : filteredResults.length}</span>
          </div>

          {/* Action button */}
          <div className="flex items-center space-x-2">
            <button onClick={fetchAll} disabled={loading} className="flex items-center justify-center w-9 h-9 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] text-[#6366f1] rounded transition-colors shadow-sm disabled:opacity-50">
              <RefreshCw size={14} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
            </button>
            {activeTab === 'exams'
              ? <button onClick={() => openM('addExam')} className="flex items-center space-x-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-md text-[11px] font-extrabold shadow-sm h-9 transition-colors whitespace-nowrap">
                  <Plus size={14} strokeWidth={3} /><span>Schedule Exam</span>
                </button>
              : <button onClick={() => openM('addResult')} className="flex items-center space-x-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-md text-[11px] font-extrabold shadow-sm h-9 transition-colors whitespace-nowrap">
                  <Plus size={14} strokeWidth={3} /><span>Enter Result</span>
                </button>
            }
          </div>
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
                <span className="text-2xl font-black text-[var(--text-primary)] leading-none mt-1">{loading ? '...' : stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + Table Container */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#10162A]/50 backdrop-blur-[2px]">
             <div className="flex flex-col items-center space-y-3">
               <RefreshCw size={28} className="animate-spin text-[#6366f1]" />
               <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Exams & Results...</p>
             </div>
          </div>
        )}

        {/* Tab Headers + Search/Total in same row */}
        <div className="flex items-end justify-between px-2 pt-2 border-b border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] transition-colors shrink-0">

          {/* Tabs — left side */}
          <div className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                  className={`flex items-center space-x-2 px-4 py-3 text-[10px] font-bold tracking-widest uppercase border-b-[3px] transition-all duration-200 ${isActive ? 'border-[#f59e0b] text-[#f59e0b] bg-white dark:bg-[#10162a]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                  <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Total — right side */}
          <div className="flex items-center space-x-2 pb-2">
            <div className="relative flex items-center">
              <div className="absolute left-3"><Search size={13} className="text-[#64748b]" strokeWidth={2.5} /></div>
              <input type="text"
                placeholder={activeTab === 'exams' ? 'Search exams...' : 'Search results...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-[220px] h-8 pl-8 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#f59e0b] transition-colors shadow-sm" />
            </div>
            <div className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase border border-[var(--border-color)] dark:border-[#334155] px-3 h-8 rounded bg-white dark:bg-[#10162A] flex items-center whitespace-nowrap">
              Total: <span className="ml-1.5 font-black text-[var(--text-primary)]">{activeTab === 'exams' ? filteredExams.length : filteredResults.length}</span>
            </div>
          </div>
        </div>


        {/* ── EXAMS TABLE ── */}
        {activeTab === 'exams' && (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                  {['EXAM ID', 'EXAM NAME', 'SUBJECT', 'CLASS', 'DATE', 'DURATION', 'TOTAL MARKS', 'TYPE', 'STATUS', 'ACTIONS'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap ${h === 'ACTIONS' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExams.map(row => {
                  const st = statusConfig[row.status] || statusConfig.UPCOMING;
                  const tc = examTypeColors[row.examType] || '';
                  return (
                    <tr key={row.id} className="border-b border-gray-200 dark:border-[#334155] hover:bg-white/5 dark:hover:bg-[#151c2e] transition-colors">
                      <td className="px-5 py-3 text-[11px] font-bold text-[#f59e0b] whitespace-nowrap">{row.id}</td>
                      <td className="px-5 py-3 text-[12px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.name}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.subject}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.class}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.date}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.duration}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap text-center">{row.totalMarks}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded border tracking-widest uppercase ${tc}`}>{row.examType}</span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded border tracking-widest uppercase ${st.bg} ${st.border} ${st.text}`}>{row.status}</span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => openM('editExam', row)} title="Edit" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors shadow-sm"><Edit size={10} strokeWidth={2.5} /></button>
                          <button onClick={() => handleDeleteExam(row.rawId)} title="Delete" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors shadow-sm"><Trash2 size={10} strokeWidth={2.5} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredExams.length === 0 && (
                  <tr><td colSpan={10} className="px-5 py-12 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">No exams found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── RESULTS TABLE ── */}
        {activeTab === 'results' && (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                  {['RESULT ID', 'STUDENT NAME', 'CLASS', 'SUBJECT', 'MARKS', 'PERCENTAGE', 'GRADE', 'RESULT', 'ACTIONS'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap ${h === 'ACTIONS' ? 'text-right' : h === 'PERCENTAGE' || h === 'GRADE' || h === 'RESULT' ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(row => {
                  const isPass = row.status === 'PASS';
                  const gradeClass = gradeBadge[row.grade] || gradeBadge['A'];
                  return (
                    <tr key={row.id} className="border-b border-gray-200 dark:border-[#334155] hover:bg-white/5 dark:hover:bg-[#151c2e] transition-colors">
                      <td className="px-5 py-3 text-[11px] font-bold text-[#10b981] whitespace-nowrap">{row.id}</td>
                      <td className="px-5 py-3 text-[12px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.studentName}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.class}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.subject}</td>
                      <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.marksObtained} / {row.totalMarks}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center space-x-2 justify-center">
                          <div className="w-[60px] bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isPass ? 'bg-[#10b981]' : 'bg-[#f43f5e]'}`} style={{ width: `${row.percentage}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-[var(--text-primary)]">{row.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded border tracking-widest ${gradeClass}`}>{row.grade}</span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded border tracking-widest uppercase ${isPass ? 'bg-green-100 dark:bg-[#14532d]/40 border-green-300 dark:border-[#166534]/80 text-green-700 dark:text-[#4ade80]' : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'}`}>{row.status}</span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => openM('viewResult', row)} title="View" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#10b981] text-[#10b931] hover:bg-[#10b981]/10 transition-colors shadow-sm"><Eye size={10} strokeWidth={2.5} /></button>
                          <button onClick={() => handleDeleteResult(row.rawId)} title="Delete" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors shadow-sm"><Trash2 size={10} strokeWidth={2.5} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredResults.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">No results found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modals */}
      <AddExamModal      isOpen={modals.addExam}     onClose={() => closeM('addExam')}     onSave={handleAddExam} classes={classList} subjects={subjectList} />
      <EditExamModal     isOpen={modals.editExam}    onClose={() => closeM('editExam')}    data={selectedItem} onSave={handleUpdateExam} classes={classList} subjects={subjectList} />
      <AddResultModal    isOpen={modals.addResult}   onClose={() => closeM('addResult')}   onSave={handleAddResult} exams={examsList} students={studentList} classes={admissionClasses} subjects={subjectList} />
      <ViewResultModal   isOpen={modals.viewResult}  onClose={() => closeM('viewResult')}  data={selectedItem} />
    </div>
  );
};

export default ExamsResults;
