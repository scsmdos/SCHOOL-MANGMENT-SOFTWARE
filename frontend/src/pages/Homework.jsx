import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Plus, Edit, Trash2, Eye, CheckSquare,
  Clock, AlertCircle, X, Save, RefreshCw, Loader2, ChevronDown
} from 'lucide-react';
import api from '../api/axios';

const statusConfig = {
  PENDING:   { label: 'PENDING',   bg: 'bg-yellow-100 dark:bg-yellow-900/30',  border: 'border-yellow-300 dark:border-yellow-600/60', text: 'text-yellow-700 dark:text-yellow-400' },
  SUBMITTED: { label: 'SUBMITTED', bg: 'bg-green-100 dark:bg-[#14532d]/40',    border: 'border-green-300 dark:border-[#166534]/80',    text: 'text-green-700 dark:text-[#4ade80]' },
  OVERDUE:   { label: 'OVERDUE',   bg: 'bg-red-100 dark:bg-red-900/30',        border: 'border-red-300 dark:border-red-600/60',        text: 'text-red-600 dark:text-red-400' },
};

const inputCls = 'w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[#6366f1] transition-colors appearance-none';

const Label = ({ children }) => (
  <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{children}</label>
);

const SelArrow = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748b]">
    <ChevronDown size={12} strokeWidth={2.5} />
  </div>
);

/* ── Edit Modal ── */
const EditHomeworkModal = ({ isOpen, onClose, data, onSaved, teachers, classes, subjects }) => {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const ch = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/homework/${form.rawId}`, {
        subject:     form.subject,
        class_name:  form.class,
        description: form.topic,
        assigned_by: form.assignedBy,
        due_date:    form.dueDate,
        status:      form.status,
        teacher_name: form.assignedBy,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[520px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-3 text-[#eab308]">
            <div className="bg-[#eab308]/10 p-1.5 rounded"><Edit size={16} strokeWidth={2.5} /></div>
            <h3 className="text-[14px] font-black uppercase tracking-widest text-[var(--text-primary)]">Update Homework</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#10162A] border dark:border-[#334155] text-[#64748b]">
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1a2234] grid grid-cols-1 gap-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Subject Dropdown */}
            <div className="flex flex-col space-y-1.5">
              <Label>Subject</Label>
              <div className="relative">
                <select name="subject" value={form.subject || ''} onChange={ch} className={inputCls}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <SelArrow />
              </div>
            </div>
            {/* Class Dropdown */}
            <div className="flex flex-col space-y-1.5">
              <Label>Class</Label>
              <div className="relative">
                <select name="class" value={form.class || ''} onChange={ch} className={inputCls}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <SelArrow />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label>Topic / Description</Label>
            <textarea name="topic" value={form.topic || ''} onChange={ch} rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teacher Dropdown */}
            <div className="flex flex-col space-y-1.5">
              <Label>Assigned By (Teacher)</Label>
              <div className="relative">
                <select name="assignedBy" value={form.assignedBy || ''} onChange={ch} className={inputCls}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <SelArrow />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Due Date</Label>
              <input type="date" name="dueDate" value={form.dueDate || ''} onChange={ch} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label>Status</Label>
            <div className="relative">
              <select name="status" value={form.status || 'PENDING'} onChange={ch} className={inputCls}>
                <option value="PENDING">PENDING</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
              <SelArrow />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end space-x-3 bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] pt-4">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[11px] font-extrabold tracking-widest uppercase">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 px-6 py-2.5 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-60 text-white rounded text-[11px] font-extrabold tracking-widest uppercase shadow-sm">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} strokeWidth={3} />}
            <span>{saving ? 'Saving...' : 'Update'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── View Modal ── */
const ViewHomeworkModal = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !data) return null;
  const st = statusConfig[data.status] || statusConfig.PENDING;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[480px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-3 text-[#6366f1]">
            <div className="bg-[#6366f1]/10 p-1.5 rounded"><Eye size={16} strokeWidth={2.5} /></div>
            <h3 className="text-[14px] font-black uppercase tracking-widest text-[var(--text-primary)]">Homework Details</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#10162A] border dark:border-[#334155] text-[#64748b]">
            <X size={14} strokeWidth={3} />
          </button>
        </div>
        <div className="p-6 bg-white dark:bg-[#1a2234] grid grid-cols-1 gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1">Homework ID</p>
              <p className="text-[13px] font-black text-[#6366f1]">{data.id}</p>
            </div>
            <span className={`px-2.5 py-1 text-[9px] font-black rounded border tracking-widest uppercase ${st.bg} ${st.border} ${st.text}`}>{data.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-[#334155] pt-4">
            <div><p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1">Subject</p><p className="text-[12px] font-bold text-[var(--text-primary)]">{data.subject}</p></div>
            <div><p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1">Class</p><p className="text-[12px] font-bold text-[var(--text-primary)]">{data.class}</p></div>
            <div><p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1">Assigned By</p><p className="text-[12px] font-bold text-[var(--text-primary)]">{data.assignedBy}</p></div>
            <div><p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1">Due Date</p><p className="text-[12px] font-bold text-[var(--text-primary)]">{data.dueDate}</p></div>
          </div>
          <div className="border-t border-gray-100 dark:border-[#334155] pt-4">
            <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-2">Topic / Description</p>
            <p className="text-[12px] font-bold text-[var(--text-primary)] leading-relaxed break-words whitespace-pre-wrap">{data.topic}</p>
          </div>
        </div>
        <div className="px-6 pb-5 flex justify-end bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] pt-4">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[11px] font-extrabold tracking-widest uppercase">Close</button>
        </div>
      </div>
    </div>
  );
};

/* ── Assign New Homework Modal ── */
const defaultHW = { subject: '', class: '', topic: '', assignedBy: '', dueDate: '', status: 'PENDING' };

const AssignHomeworkModal = ({ isOpen, onClose, onSaved, teachers, classes, subjects }) => {
  const [form, setForm] = useState(defaultHW);
  const [saving, setSaving] = useState(false);

  const reset = () => setForm(defaultHW);
  const ch = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; reset(); }
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!form.subject) { alert('Please select a Subject'); return; }
    if (!form.class)   { alert('Please select a Class');   return; }
    setSaving(true);
    try {
      await api.post('/homework', {
        subject:      form.subject,
        class_name:   form.class,
        description:  form.topic,
        assigned_by:  form.assignedBy,
        teacher_name: form.assignedBy,
        due_date:     form.dueDate,
        status:       form.status || 'PENDING',
      });
      onSaved?.();
      reset();
      onClose();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { reset(); onClose(); }}></div>
      <div className="relative w-full max-w-[540px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <div className="flex items-center space-x-3 text-[#6366f1]">
            <div className="bg-[#6366f1]/15 p-1.5 rounded"><ClipboardList size={16} strokeWidth={2.5} /></div>
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">Assign New Homework</h3>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#0f172a] border border-gray-300 dark:border-[#334155] text-[#64748b] hover:text-[var(--text-primary)]">
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1a2234] overflow-y-auto custom-scrollbar grid grid-cols-1 gap-5">

          {/* Subject + Class */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label>Subject *</Label>
              <div className="relative">
                <select name="subject" value={form.subject} onChange={ch} className={inputCls}>
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <SelArrow />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Class *</Label>
              <div className="relative">
                <select name="class" value={form.class} onChange={ch} className={inputCls}>
                  <option value="">— Select Class —</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <SelArrow />
              </div>
            </div>
          </div>

          {/* Topic */}
          <div className="flex flex-col space-y-1.5">
            <Label>Topic / Description</Label>
            <textarea name="topic" value={form.topic} onChange={ch} rows={3}
              placeholder="Describe the homework task in detail..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[#6366f1] resize-none transition-colors" />
          </div>

          {/* Assigned By + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label>Assigned By (Teacher)</Label>
              <div className="relative">
                <select name="assignedBy" value={form.assignedBy} onChange={ch} className={inputCls}>
                  <option value="">— Select Teacher —</option>
                  {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <SelArrow />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Due Date</Label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={ch} className={inputCls} />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col space-y-1.5">
            <Label>Status</Label>
            <div className="relative">
              <select name="status" value={form.status} onChange={ch} className={inputCls}>
                <option value="PENDING">PENDING</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
              <SelArrow />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end space-x-3 bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] shrink-0">
          <button onClick={() => { reset(); onClose(); }}
            className="px-5 py-2.5 bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[10px] font-extrabold tracking-widest uppercase">
            CANCEL
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 text-white rounded text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} strokeWidth={3} />}
            <span>{saving ? 'Saving...' : 'ASSIGN HOMEWORK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const Homework = () => {
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  // Dynamic dropdown data
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [empRes, clsRes, subRes] = await Promise.all([
        api.get('/employees'),
        api.get('/academic-classes'),
        api.get('/academic-subjects'),
      ]);
      const empList = empRes.data?.data ?? empRes.data ?? [];
      setTeachers(empList.map(e => e.name).filter(Boolean));

      const clsList = clsRes.data?.data ?? clsRes.data ?? [];
      setClasses(clsList.map(c => c.name).filter(Boolean));

      const subList = subRes.data?.data ?? subRes.data ?? [];
      setSubjects(subList.map(s => s.name).filter(Boolean));
    } catch (err) {
      console.error('Dropdown fetch error:', err);
    }
  }, []);

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/homework');
      const list = (res.data?.data ?? res.data ?? []).map(hw => ({
        id: hw.homework_id ?? `HW-${hw.id}`,
        rawId: hw.id,
        subject: hw.subject ?? 'N/A',
        class: hw.class_name ?? hw.class ?? 'N/A',
        topic: hw.description ?? hw.topic ?? 'N/A',
        assignedBy: hw.assigned_by ?? hw.teacher_name ?? 'N/A',
        dueDate: hw.due_date ? hw.due_date.split('T')[0] : 'N/A',
        status: hw.status ?? 'PENDING',
      }));
      setHomeworkList(list);
    } catch (err) {
      console.error('Homework fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHomework(); fetchDropdowns(); }, [fetchHomework, fetchDropdowns]);

  const statCards = [
    { label: 'TOTAL ASSIGNED', value: String(homeworkList.length),                                       icon: ClipboardList, iconColor: 'text-[#6366f1]', iconBg: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20' },
    { label: 'SUBMITTED',      value: String(homeworkList.filter(h => h.status === 'SUBMITTED').length), icon: CheckSquare,   iconColor: 'text-[#10b981]', iconBg: 'bg-[#10b981]/10 dark:bg-[#10b981]/20' },
    { label: 'PENDING',        value: String(homeworkList.filter(h => h.status === 'PENDING').length),   icon: Clock,         iconColor: 'text-[#f59e0b]', iconBg: 'bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20' },
    { label: 'OVERDUE',        value: String(homeworkList.filter(h => h.status === 'OVERDUE').length),   icon: AlertCircle,   iconColor: 'text-[#f43f5e]', iconBg: 'bg-[#f43f5e]/10 dark:bg-[#f43f5e]/20' },
  ];

  const filtered = homeworkList.filter(hw =>
    hw.subject.toLowerCase().includes(search.toLowerCase()) ||
    hw.class.toLowerCase().includes(search.toLowerCase()) ||
    hw.topic.toLowerCase().includes(search.toLowerCase()) ||
    hw.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (row) => { setSelectedItem(row); setShowEdit(true); };
  const handleView = (row) => { setSelectedItem(row); setShowView(true); };

  const handleDelete = async (rawId, displayId) => {
    if (!window.confirm(`Delete homework ${displayId}?`)) return;
    try {
      await api.delete(`/homework/${rawId}`);
      setHomeworkList(prev => prev.filter(item => item.rawId !== rawId));
    } catch {
      setHomeworkList(prev => prev.filter(item => item.rawId !== rawId));
    }
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Homework Manager</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Assign, Track & Manage Student Homework</p>
        </div>
        <button onClick={() => setShowAssign(true)} className="flex items-center space-x-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-md transition-colors text-[11px] font-extrabold shadow-sm h-9">
          <Plus size={14} strokeWidth={3} /><span>Assign Homework</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[var(--bg-panel-alt)] border border-gray-200 dark:border-[#334155] rounded-lg p-4 flex items-center shadow-sm transition-colors cursor-default hover:bg-white/5">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">{stat.label}</span>
                <span className="text-2xl font-black text-[var(--text-primary)] leading-none mt-1">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="bg-[var(--bg-panel-alt)] border border-gray-200 dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-[#334155] flex items-center justify-between shrink-0">
          <div className="relative flex items-center">
            <div className="absolute left-3"><Search size={14} className="text-[#64748b]" strokeWidth={2.5} /></div>
            <input
              type="text"
              placeholder="Search homework..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[300px] h-9 pl-9 pr-3 bg-white dark:bg-[#10162A] border border-gray-300 dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#64748b] tracking-widest uppercase border border-gray-200 dark:border-[#334155] px-3 h-9 rounded bg-white dark:bg-[#10162A]">
            Total: <span className="ml-1.5 text-[var(--text-primary)]">{filtered.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 size={28} className="animate-spin text-[#6366f1]" />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Homework...</p>
              </div>
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
              <tr className="border-b border-gray-200 dark:border-[#334155]">
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">HW ID</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">SUBJECT</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">CLASS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">TOPIC</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">ASSIGNED BY</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">DUE DATE</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">STATUS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const st = statusConfig[row.status] || statusConfig.PENDING;
                return (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-white/5 dark:hover:bg-[#151c2e] transition-colors group">
                    <td className="px-5 py-1.5 text-[11px] font-bold text-[#6366f1] whitespace-nowrap cursor-pointer hover:underline" onClick={() => handleView(row)}>{row.id}</td>
                    <td className="px-5 py-1.5 text-[12px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.subject}</td>
                    <td className="px-5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.class}</td>
                    <td className="px-5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] max-w-[200px] truncate">{row.topic}</td>
                    <td className="px-5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.assignedBy}</td>
                    <td className="px-5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">{row.dueDate}</td>
                    <td className="px-5 py-1.5 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded border tracking-widest ${st.bg} ${st.border} ${st.text}`}>{row.status}</span>
                    </td>
                    <td className="px-5 py-1.5 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button onClick={() => handleView(row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 transition-colors shadow-sm"><Eye size={10} strokeWidth={2.5} /></button>
                        <button onClick={() => handleEdit(row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors shadow-sm"><Edit size={10} strokeWidth={2.5} /></button>
                        <button onClick={() => handleDelete(row.rawId, row.id)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors shadow-sm"><Trash2 size={10} strokeWidth={2.5} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {loading ? 'Loading...' : 'No homework found. Click "Assign Homework" to add one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssignHomeworkModal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        onSaved={fetchHomework}
        teachers={teachers}
        classes={classes}
        subjects={subjects}
      />
      <EditHomeworkModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        data={selectedItem}
        onSaved={fetchHomework}
        teachers={teachers}
        classes={classes}
        subjects={subjects}
      />
      <ViewHomeworkModal isOpen={showView} onClose={() => setShowView(false)} data={selectedItem} />
    </div>
  );
};

export default Homework;
