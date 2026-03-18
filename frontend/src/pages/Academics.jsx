import React, { useState, useCallback, useEffect } from 'react';
import { 
  Layers,
  Monitor,
  Book,
  Calendar,
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react';

import api from '../api/axios';
import { 
  EditClassModal, AddClassModal,
  EditSubjectModal, AddSubjectModal,
  EditSyllabusModal, AddSyllabusModal,
  EditEventModal, AddAcademicEventModal,
  AddParentEventModal
} from '../components/AcademicModals';

const tabs = [
  { id: 'classes', label: 'CLASSES', icon: Book },
  { id: 'subjects', label: 'SUBJECTS & CURRICULUM', icon: BookOpen },
  { id: 'syllabus', label: 'LESSON PLAN & SYLLABUS', icon: Layers },
  { id: 'academic', label: 'ACADEMIC CALENDAR', icon: Calendar },
  { id: 'parent', label: 'PARENT CALENDAR', icon: Calendar }
];

const Academics = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [syllabusList, setSyllabusList] = useState([]);
  const [academicEventsList, setAcademicEventsList] = useState([]);
  const [parentEventsList, setParentEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);   // for dropdowns
  const [classNames, setClassNames] = useState([]); // for dropdowns

  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState('');
  const [modals, setModals] = useState({
    class: false, subject: false, syllabus: false, event: false,
    addClass: false, addSubject: false, addSyllabus: false, addAcEvent: false, addParentEvent: false
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cr, sr, syr, er, empr] = await Promise.allSettled([
        api.get('/academic-classes'),
        api.get('/academic-subjects'),
        api.get('/academic-syllabi'),
        api.get('/academic-events'),
        api.get('/employees'),
      ]);

      if (cr.status === 'fulfilled') {
        const list = (cr.value.data?.data ?? cr.value.data ?? []).map(c => ({
          rawId: c.id,
          id: c.class_id ?? `CLS-${c.id}`,
          name: c.name ?? 'N/A',
          teacher: c.coordinator ?? 'N/A',
          students: c.students ?? 0,
          status: c.status ?? 'ACTIVE'
        }));
        setClassesList(list);
        setClassNames([...new Set(list.map(c => c.name).filter(Boolean))]);
      }
      if (sr.status === 'fulfilled') {
        const list = (sr.value.data?.data ?? sr.value.data ?? []).map(s => ({
          rawId: s.id,
          id: s.sub_code ?? `SUB-${s.id}`,
          name: s.name ?? 'N/A',
          type: s.type ?? 'THEORY',
          classes: s.classes ?? 'N/A',
          credits: s.credits ?? 0,
          status: s.status ?? 'ACTIVE'
        }));
        setSubjectsList(list);
      }
      if (syr.status === 'fulfilled') {
        const list = (syr.value.data?.data ?? syr.value.data ?? []).map(s => ({
          rawId: s.id,
          id: s.plan_id ?? `SYL-${s.id}`,
          subject: s.subject ?? s.name ?? 'N/A',
          chapter: s.chapter ?? s.lesson_name ?? 'N/A',
          teacher: s.teacher ?? 'N/A',
          progress: s.progress ?? 0,
          date: s.targetDate ? s.targetDate.split('T')[0] : (s.target_date ? s.target_date.split('T')[0] : '')
        }));
        setSyllabusList(list);
      }
      if (er.status === 'fulfilled') {
        const list = (er.value.data?.data ?? er.value.data ?? []).map(e => ({
          rawId: e.id,
          id: e.event_id ?? `EVT-${e.id}`,
          name: e.title ?? e.name ?? 'N/A',
          date: e.date ? e.date.split('T')[0] : '',
          category: e.type ?? e.event_type ?? 'N/A',
          status: e.status ?? 'Upcoming',
        }));
        setAcademicEventsList(list);
      }
      if (empr.status === 'fulfilled') {
        const empList = (empr.value.data?.data ?? empr.value.data ?? []).map(e => e.name ?? e.employee_name).filter(Boolean);
        setTeachers([...new Set(empList)]);
      }
    } catch (err) {
      console.error('Academics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openModal = (type, row = null) => { setSelectedItem(row); setModals(prev => ({ ...prev, [type]: true })); };
  const closeModal = (type) => setModals(prev => ({ ...prev, [type]: false }));

  // ── CLASSES CRUD ──
  const handleAddClass = async (data) => {
    try {
      const res = await api.post('/academic-classes', { name: data.name, coordinator: data.teacher, students: data.students, status: data.status });
      const c = res.data;
      setClassesList(prev => [{ rawId: c.id, id: c.class_id ?? `CLS-${c.id}`, name: c.name, teacher: c.coordinator, students: c.students, status: c.status }, ...prev]);
      setClassNames(prev => [...new Set([...prev, data.name])]);
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleSaveClass = async (data) => {
    try {
      await api.put(`/academic-classes/${data.rawId}`, { name: data.name, coordinator: data.teacher, students: data.students, status: data.status });
      setClassesList(prev => prev.map(c => c.rawId === data.rawId ? { ...c, ...data } : c));
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleDeleteClass = async (rawId) => {
    if (!window.confirm('Delete this class?')) return;
    try { await api.delete(`/academic-classes/${rawId}`); setClassesList(prev => prev.filter(c => c.rawId !== rawId)); }
    catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };

  // ── SUBJECTS CRUD ──
  const handleAddSubject = async (data) => {
    try {
      const res = await api.post('/academic-subjects', { name: data.name, type: data.type, classes: data.classes, credits: data.credits });
      const s = res.data;
      setSubjectsList(prev => [{ rawId: s.id, id: s.sub_code ?? `SUB-${s.id}`, name: s.name, type: s.type, classes: s.classes, credits: s.credits }, ...prev]);
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleSaveSubject = async (data) => {
    try {
      await api.put(`/academic-subjects/${data.rawId}`, { name: data.name, type: data.type, classes: data.classes, credits: data.credits });
      setSubjectsList(prev => prev.map(s => s.rawId === data.rawId ? { ...s, ...data } : s));
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleDeleteSubject = async (rawId) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await api.delete(`/academic-subjects/${rawId}`); setSubjectsList(prev => prev.filter(s => s.rawId !== rawId)); }
    catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };

  // ── SYLLABUS CRUD ──
  const handleAddSyllabus = async (data) => {
    try {
      const res = await api.post('/academic-syllabi', { subject: data.subject, chapter: data.chapter, teacher: data.teacher, progress: data.progress, targetDate: data.date });
      const s = res.data;
      setSyllabusList(prev => [{ rawId: s.id, id: s.plan_id ?? `SYL-${s.id}`, subject: s.subject, chapter: s.chapter, teacher: s.teacher, progress: s.progress, date: data.date }, ...prev]);
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleSaveSyllabus = async (data) => {
    try {
      await api.put(`/academic-syllabi/${data.rawId}`, { subject: data.subject, chapter: data.chapter, teacher: data.teacher, progress: data.progress, targetDate: data.date });
      setSyllabusList(prev => prev.map(s => s.rawId === data.rawId ? { ...s, ...data } : s));
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleDeleteSyllabus = async (rawId) => {
    if (!window.confirm('Delete this lesson plan?')) return;
    try { await api.delete(`/academic-syllabi/${rawId}`); setSyllabusList(prev => prev.filter(s => s.rawId !== rawId)); }
    catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };

  // ── EVENTS CRUD ──
  const handleAddAcEvent = async (data) => {
    try {
      const res = await api.post('/academic-events', { title: data.name, date: data.date, type: data.category, status: data.status });
      const e = res.data;
      setAcademicEventsList(prev => [{ rawId: e.id, id: e.event_id ?? `EVT-${e.id}`, name: e.title, date: data.date, category: e.type, status: e.status }, ...prev]);
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleSaveEvent = async (data) => {
    try {
      await api.put(`/academic-events/${data.rawId}`, { title: data.name, date: data.date, type: data.category, status: data.status });
      setAcademicEventsList(prev => prev.map(ev => ev.rawId === data.rawId ? { ...ev, ...data } : ev));
    } catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };
  const handleDeleteEvent = async (rawId) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.delete(`/academic-events/${rawId}`); setAcademicEventsList(prev => prev.filter(e => e.rawId !== rawId)); }
    catch(e) { alert('Failed: ' + (e.response?.data?.error || e.message)); }
  };

  const handleAddParentEvent = (data) => setParentEventsList(prev => [...prev, data]);

  // ── FILTER helper ──
  const filterBySearch = (arr, keys) => {
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter(item => keys.some(k => (item[k] ?? '').toString().toLowerCase().includes(q)));
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Academic Hub</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Automated Academic Tracking & Management System</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchAll} disabled={loading} className="flex items-center space-x-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[var(--text-primary)] px-4 py-2 rounded-md transition-colors text-[11px] font-extrabold shadow-sm h-9 disabled:opacity-50">
            <RefreshCw size={14} strokeWidth={2.5} className={`text-[#10b981] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] px-4 py-2 rounded-md transition-colors text-[11px] font-extrabold shadow-sm h-9">
            <Download size={14} strokeWidth={2.5} /><span>Export</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        {[
          { label: 'TOTAL CLASSES', value: classesList.length, icon: Monitor, color: '#10b981' },
          { label: 'ACTIVE SUBJECTS', value: subjectsList.length, icon: Book, color: '#0ea5e9' },
          { label: 'SYLLABUS PLANS', value: syllabusList.length, icon: Layers, color: '#a855f7' },
          { label: 'EVENTS IN CALENDAR', value: academicEventsList.length, icon: Calendar, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-lg p-4 flex items-center space-x-4 shadow-sm">
            <div className="p-2.5 rounded-lg" style={{ background: s.color + '20' }}>
              <s.icon size={20} style={{ color: s.color }} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">{s.label}</p>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none mt-0.5">{loading ? '...' : s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex space-x-1 border-b border-[var(--border-color)] mb-4 shrink-0 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-[10px] font-extrabold tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#10b981] text-[#10b981]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon size={13} strokeWidth={2.5} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-[var(--bg-panel-alt)] border border-gray-200 dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 overflow-hidden shadow-sm">

        {/* Toolbar */}
        <div className="p-3 px-4 border-b border-gray-200 dark:border-[#334155] flex items-center justify-between shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" strokeWidth={2.5} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-[260px] h-9 pl-9 pr-3 bg-white dark:bg-[#10162A] border border-gray-300 dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#10b981] dark:focus:border-[#10b981] transition-colors"
            />
          </div>
          {activeTab === 'classes' && <button onClick={() => openModal('addClass')} className="flex items-center space-x-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-md text-[11px] font-extrabold shadow-sm h-9"><Plus size={14} strokeWidth={2.5}/><span>New Class</span></button>}
          {activeTab === 'subjects' && <button onClick={() => openModal('addSubject')} className="flex items-center space-x-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-md text-[11px] font-extrabold shadow-sm h-9"><Plus size={14} strokeWidth={2.5}/><span>New Subject</span></button>}
          {activeTab === 'syllabus' && <button onClick={() => openModal('addSyllabus')} className="flex items-center space-x-2 bg-[#a855f7] hover:bg-[#9333ea] text-white px-4 py-2 rounded-md text-[11px] font-extrabold shadow-sm h-9"><Plus size={14} strokeWidth={2.5}/><span>New Plan</span></button>}
          {activeTab === 'academic' && <button onClick={() => openModal('addAcEvent')} className="flex items-center space-x-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-md text-[11px] font-extrabold shadow-sm h-9"><Plus size={14} strokeWidth={2.5}/><span>Add Event</span></button>}
          {activeTab === 'parent' && <button onClick={() => openModal('addParentEvent')} className="flex items-center space-x-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-md text-[11px] font-extrabold shadow-sm h-9"><Plus size={14} strokeWidth={2.5}/><span>Add Event</span></button>}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 size={28} className="animate-spin text-[#10b981]" />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* CLASSES TAB */}
              {activeTab === 'classes' && (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                    <tr className="border-y border-gray-200 dark:border-[#334155]">
                      {['Class ID','Class Name','Class Teacher','Total Students','Status','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterBySearch(classesList, ['name','teacher','id']).length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-14 text-slate-400 text-sm font-bold">No classes found. Click "New Class" to add one.</td></tr>
                    ) : filterBySearch(classesList, ['name','teacher','id']).map(row => (
                      <tr key={row.rawId} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#151c2e] transition-colors">
                        <td className="px-5 py-1.5 text-[11px] font-bold text-[#10b981]">{row.id}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.name}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.teacher}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.students}</td>
                        <td className="px-5 py-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest ${row.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{row.status}</span>
                        </td>
                        <td className="px-5 py-1.5">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button onClick={() => openModal('class', row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors"><Edit size={10} strokeWidth={2.5}/></button>
                            <button onClick={() => handleDeleteClass(row.rawId)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"><Trash2 size={10} strokeWidth={2.5}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* SUBJECTS TAB */}
              {activeTab === 'subjects' && (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                    <tr className="border-y border-gray-200 dark:border-[#334155]">
                      {['Sub Code','Subject Name','Type','Assigned Classes','Credits','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterBySearch(subjectsList, ['name','type','id']).length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-14 text-slate-400 text-sm font-bold">No subjects found. Click "New Subject" to add one.</td></tr>
                    ) : filterBySearch(subjectsList, ['name','type','id']).map(row => (
                      <tr key={row.rawId} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#151c2e] transition-colors">
                        <td className="px-5 py-1.5 text-[11px] font-bold text-[#0ea5e9]">{row.id}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.name}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.type}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)] max-w-[180px] truncate">{row.classes}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.credits}</td>
                        <td className="px-5 py-1.5">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button onClick={() => openModal('subject', row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors"><Edit size={10} strokeWidth={2.5}/></button>
                            <button onClick={() => handleDeleteSubject(row.rawId)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"><Trash2 size={10} strokeWidth={2.5}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* SYLLABUS TAB */}
              {activeTab === 'syllabus' && (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                    <tr className="border-y border-gray-200 dark:border-[#334155]">
                      {['Plan ID','Subject','Chapter / Topic','Teacher','Progress','Target Date','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterBySearch(syllabusList, ['subject','chapter','teacher','id']).length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-14 text-slate-400 text-sm font-bold">No lesson plans found. Click "New Plan" to add one.</td></tr>
                    ) : filterBySearch(syllabusList, ['subject','chapter','teacher','id']).map(row => (
                      <tr key={row.rawId} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#151c2e] transition-colors">
                        <td className="px-5 py-1.5 text-[11px] font-bold text-[#a855f7]">{row.id}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.subject}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.chapter}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.teacher}</td>
                        <td className="px-5 py-1.5">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-16">
                              <div className="h-1.5 rounded-full bg-[#a855f7]" style={{ width: `${Math.min(row.progress, 100)}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">{row.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.date}</td>
                        <td className="px-5 py-1.5">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button onClick={() => openModal('syllabus', row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors"><Edit size={10} strokeWidth={2.5}/></button>
                            <button onClick={() => handleDeleteSyllabus(row.rawId)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"><Trash2 size={10} strokeWidth={2.5}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ACADEMIC CALENDAR TAB */}
              {activeTab === 'academic' && (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                    <tr className="border-y border-gray-200 dark:border-[#334155]">
                      {['Event ID','Event Name','Date','Category','Status','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterBySearch(academicEventsList, ['name','category','id']).length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-14 text-slate-400 text-sm font-bold">No events found. Click "Add Event" to schedule one.</td></tr>
                    ) : filterBySearch(academicEventsList, ['name','category','id']).map(row => (
                      <tr key={row.rawId} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#151c2e] transition-colors">
                        <td className="px-5 py-1.5 text-[11px] font-bold text-[#f59e0b]">{row.id}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.name}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.date}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.category}</td>
                        <td className="px-5 py-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest ${
                            row.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : row.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>{row.status}</span>
                        </td>
                        <td className="px-5 py-1.5">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button onClick={() => openModal('event', row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors"><Edit size={10} strokeWidth={2.5}/></button>
                            <button onClick={() => handleDeleteEvent(row.rawId)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"><Trash2 size={10} strokeWidth={2.5}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* PARENT CALENDAR TAB */}
              {activeTab === 'parent' && (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                    <tr className="border-y border-gray-200 dark:border-[#334155]">
                      {['Event ID','Event Title','Date','Type','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterBySearch(parentEventsList, ['name','type','id']).length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-14 text-slate-400 text-sm font-bold">No parent events yet. Click "Add Event" to schedule one.</td></tr>
                    ) : filterBySearch(parentEventsList, ['name','type','id']).map(row => (
                      <tr key={row.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#151c2e] transition-colors">
                        <td className="px-5 py-1.5 text-[11px] font-bold text-[#6366f1]">{row.id}</td>
                        <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)]">{row.name}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.date}</td>
                        <td className="px-5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">{row.type}</td>
                        <td className="px-5 py-1.5">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button onClick={() => setParentEventsList(prev => prev.filter(e => e.id !== row.id))} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"><Trash2 size={10} strokeWidth={2.5}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AddClassModal isOpen={modals.addClass} onClose={() => closeModal('addClass')} onSave={handleAddClass} teachers={teachers} />
      <EditClassModal isOpen={modals.class} onClose={() => closeModal('class')} data={selectedItem} onSave={handleSaveClass} teachers={teachers} />

      <AddSubjectModal isOpen={modals.addSubject} onClose={() => closeModal('addSubject')} onSave={handleAddSubject} classNames={classNames} />
      <EditSubjectModal isOpen={modals.subject} onClose={() => closeModal('subject')} data={selectedItem} onSave={handleSaveSubject} classNames={classNames} />

      <AddSyllabusModal isOpen={modals.addSyllabus} onClose={() => closeModal('addSyllabus')} onSave={handleAddSyllabus} teachers={teachers} classNames={classNames} />
      <EditSyllabusModal isOpen={modals.syllabus} onClose={() => closeModal('syllabus')} data={selectedItem} onSave={handleSaveSyllabus} teachers={teachers} classNames={classNames} />

      <AddAcademicEventModal isOpen={modals.addAcEvent} onClose={() => closeModal('addAcEvent')} onSave={handleAddAcEvent} />
      <EditEventModal isOpen={modals.event} onClose={() => closeModal('event')} data={selectedItem} onSave={handleSaveEvent} />

      <AddParentEventModal isOpen={modals.addParentEvent} onClose={() => closeModal('addParentEvent')} onSave={handleAddParentEvent} />
    </div>
  );
};

export default Academics;
