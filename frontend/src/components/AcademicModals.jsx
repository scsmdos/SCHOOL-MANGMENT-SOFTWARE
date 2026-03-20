import React, { useEffect, useState } from 'react';
import { X, Save, Edit, Plus, Monitor, BookOpen, Layers, Calendar } from 'lucide-react';

/* ══════════════════════════════════════
   SHARED MODAL WRAPPER
══════════════════════════════════════ */
const ModalWrapper = ({ isOpen, onClose, title, icon: Icon, iconColor, iconBg, saveBtnColor, saveLabel = 'Save Entry', children, onSave }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[520px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <div className={`flex items-center space-x-3 ${iconColor}`}>
            <div className={`${iconBg} p-1.5 rounded`}>
              {Icon && <Icon size={16} strokeWidth={2.5} />}
            </div>
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{title}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#0f172a] border border-gray-300 dark:border-[#334155] text-[#64748b] hover:text-white hover:bg-[#e11d48] hover:border-[#e11d48] transition-colors">
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1a2234] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end space-x-3 bg-white dark:bg-[#1a2234] border-t border-gray-200 dark:border-[#334155] shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[10px] font-extrabold tracking-widest uppercase">
            CANCEL
          </button>
          <button onClick={onSave} className={`flex items-center space-x-2 px-5 py-2.5 ${saveBtnColor} text-white rounded text-[10px] font-extrabold tracking-widest uppercase shadow-sm`}>
            <Save size={13} strokeWidth={3} />
            <span>{saveLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* helper for form fields */
const Field = ({ label, children }) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{label}</label>
    {children}
  </div>
);

const inputCls = `w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[#10b981] transition-colors`;
const selectCls = `w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#10b981] transition-colors appearance-none cursor-pointer`;

/* Dynamic dropdown with + Create New Option */
const CreativeSelect = ({ name, value, onChange, options, placeholder, isNew, setIsNew }) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <select 
          name={name} 
          value={isNew ? 'CREATE_NEW' : value} 
          onChange={(e) => {
            if (e.target.value === 'CREATE_NEW') {
              setIsNew(true);
              onChange({ target: { name, value: '' } });
            } else {
              setIsNew(false);
              onChange(e);
            }
          }} 
          className={selectCls}
        >
          <option value="">{placeholder || `-- Select Option --`}</option>
          {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          <option value="CREATE_NEW" className="font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 italic">+ CREATE NEW</option>
        </select>
        {!isNew && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}
      </div>
      {isNew && (
        <div className="flex items-center space-x-2 animate-in slide-in-from-top-1 duration-200">
          <input 
            type="text" 
            name={name} 
            value={value} 
            onChange={onChange} 
            placeholder="Type new name here..." 
            className={`${inputCls} flex-1 border-blue-400 dark:border-blue-500`}
            autoFocus 
          />
          <button 
            type="button"
            onClick={() => setIsNew(false)} 
            className="h-10 px-3 flex items-center justify-center bg-gray-100 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

const DynSelect = ({ name, value, onChange, options, placeholder }) => (
  <div className="relative">
    <select name={name} value={value} onChange={onChange} className={selectCls}>
      <option value="">{placeholder || `-- Select --`}</option>
      {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  </div>
);

/* ══════════════════════════════════════
    1. ADD CLASS
══════════════════════════════════════ */
const defaultClass = { name: '', teacher: '', students: 0, status: 'ACTIVE' };

export const AddClassModal = ({ isOpen, onClose, onSave, teachers = [], classNames = [] }) => {
  const [form, setForm] = useState(defaultClass);
  const [isNew, setIsNew] = useState(false);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(defaultClass); setIsNew(false); };

  return (
    <ModalWrapper isOpen={isOpen} onClose={() => { reset(); onClose(); }}
      title="Register New Class" icon={Monitor}
      iconColor="text-[#10b981]" iconBg="bg-[#10b981]/15"
      saveBtnColor="bg-[#10b981] hover:bg-[#059669]"
      onSave={() => { onSave({ ...form, students: Number(form.students) }); reset(); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Class Name *">
          <CreativeSelect 
            name="name" 
            value={form.name} 
            onChange={ch} 
            options={classNames} 
            placeholder="Select Class Name" 
            isNew={isNew} 
            setIsNew={setIsNew} 
          />
        </Field>
        <Field label="Class Teacher">
          {teachers.length > 0 ? (
            <DynSelect name="teacher" value={form.teacher} onChange={ch} options={teachers} placeholder="-- Select Teacher --" />
          ) : (
            <input type="text" name="teacher" value={form.teacher} onChange={ch} placeholder="Teacher Name" className={inputCls} />
          )}
        </Field>
        <Field label="Total Students">
          <input type="number" name="students" value={form.students} onChange={ch} min="0" className={inputCls} />
        </Field>
        <Field label="Status">
          <DynSelect name="status" value={form.status} onChange={ch} options={['ACTIVE', 'INACTIVE']} />
        </Field>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   1b. EDIT CLASS
══════════════════════════════════════ */
export const EditClassModal = ({ isOpen, onClose, data, onSave, teachers = [], classNames = [] }) => {
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}
      title="Update Class Record" icon={Edit}
      iconColor="text-[#eab308]" iconBg="bg-[#eab308]/15"
      saveBtnColor="bg-[#eab308] hover:bg-[#ca8a04]" saveLabel="Update"
      onSave={() => { onSave({ ...form, students: Number(form.students) }); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Class Name *">
          <input 
            type="text" 
            name="name" 
            value={form.name || ''} 
            onChange={ch} 
            list="available-classes-edit"
            className={inputCls} 
          />
          <datalist id="available-classes-edit">
            {classNames.map((c, i) => <option key={i} value={c} />)}
          </datalist>
        </Field>
        <Field label="Class Teacher">
          {teachers.length > 0 ? (
            <DynSelect name="teacher" value={form.teacher || ''} onChange={ch} options={teachers} placeholder="-- Select Teacher --" />
          ) : (
            <input type="text" name="teacher" value={form.teacher || ''} onChange={ch} className={inputCls} />
          )}
        </Field>
        <Field label="Total Students">
          <input type="number" name="students" value={form.students || ''} onChange={ch} className={inputCls} />
        </Field>
        <Field label="Status">
          <DynSelect name="status" value={form.status || 'ACTIVE'} onChange={ch} options={['ACTIVE', 'INACTIVE']} />
        </Field>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   2. ADD SUBJECT
══════════════════════════════════════ */
const defaultSubject = { name: '', type: 'THEORY', classes: '', teacher: '' };

export const AddSubjectModal = ({ isOpen, onClose, onSave, classNames = [], teachers = [], subjectNames = [] }) => {
  const [form, setForm] = useState(defaultSubject);
  const [isNewClass, setIsNewClass] = useState(false);
  const [isNewSubject, setIsNewSubject] = useState(false);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(defaultSubject); setIsNewClass(false); setIsNewSubject(false); };

  return (
    <ModalWrapper isOpen={isOpen} onClose={() => { reset(); onClose(); }}
      title="Add New Subject" icon={BookOpen}
      iconColor="text-[#06b6d4]" iconBg="bg-[#06b6d4]/15"
      saveBtnColor="bg-[#06b6d4] hover:bg-[#0891b2]"
      onSave={() => { onSave({ ...form }); reset(); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Subject Name *">
          <CreativeSelect 
            name="name" 
            value={form.name} 
            onChange={ch} 
            options={subjectNames} 
            placeholder="Select Subject" 
            isNew={isNewSubject} 
            setIsNew={setIsNewSubject} 
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <DynSelect name="type" value={form.type} onChange={ch} options={['THEORY', 'PRACTICAL', 'ACTIVITY']} />
          </Field>
          <Field label="Assigned Teacher">
            {teachers.length > 0 ? (
              <DynSelect name="teacher" value={form.teacher} onChange={ch} options={teachers} placeholder="-- Select Teacher --" />
            ) : (
              <input type="text" name="teacher" value={form.teacher} onChange={ch} placeholder="Teacher name" className={inputCls} />
            )}
          </Field>
        </div>
        <Field label="Assigned Classes">
          <CreativeSelect 
            name="classes" 
            value={form.classes} 
            onChange={ch} 
            options={classNames} 
            placeholder="Select Class" 
            isNew={isNewClass} 
            setIsNew={setIsNewClass} 
          />
        </Field>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   2b. EDIT SUBJECT
══════════════════════════════════════ */
export const EditSubjectModal = ({ isOpen, onClose, data, onSave, classNames = [], teachers = [], subjectNames = [] }) => {
  const [form, setForm] = useState({});
  const [isNewClass, setIsNewClass] = useState(false);
  const [isNewSubject, setIsNewSubject] = useState(false);
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}
      title="Update Subject Record" icon={Edit}
      iconColor="text-[#eab308]" iconBg="bg-[#eab308]/15"
      saveBtnColor="bg-[#eab308] hover:bg-[#ca8a04]" saveLabel="Update"
      onSave={() => { onSave({ ...form }); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Subject Name *">
          <CreativeSelect 
            name="name" 
            value={form.name || ''} 
            onChange={ch} 
            options={subjectNames} 
            placeholder="Select Subject" 
            isNew={isNewSubject} 
            setIsNew={setIsNewSubject} 
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <DynSelect name="type" value={form.type || 'THEORY'} onChange={ch} options={['THEORY', 'PRACTICAL', 'ACTIVITY']} />
          </Field>
          <Field label="Assigned Teacher">
            {teachers.length > 0 ? (
              <DynSelect name="teacher" value={form.teacher || ''} onChange={ch} options={teachers} placeholder="-- Select Teacher --" />
            ) : (
              <input type="text" name="teacher" value={form.teacher || ''} onChange={ch} placeholder="Teacher name" className={inputCls} />
            )}
          </Field>
        </div>
        <Field label="Assigned Classes">
          <CreativeSelect 
            name="classes" 
            value={form.classes || ''} 
            onChange={ch} 
            options={classNames} 
            placeholder="Select Class" 
            isNew={isNewClass} 
            setIsNew={setIsNewClass} 
          />
        </Field>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   3. ADD SYLLABUS / LESSON PLAN
══════════════════════════════════════ */
const defaultSyllabus = { subject: '', chapter: '', teacher: '', progress: 0, date: '' };

export const AddSyllabusModal = ({ isOpen, onClose, onSave, teachers = [], classNames = [] }) => {
  const [form, setForm] = useState(defaultSyllabus);
  const [isNew, setIsNew] = useState(false);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(defaultSyllabus); setIsNew(false); };

  return (
    <ModalWrapper isOpen={isOpen} onClose={() => { reset(); onClose(); }}
      title="Plan New Lesson" icon={Layers}
      iconColor="text-[#a855f7]" iconBg="bg-[#a855f7]/15"
      saveBtnColor="bg-[#a855f7] hover:bg-[#9333ea]"
      onSave={() => { onSave({ ...form, progress: Number(form.progress) }); reset(); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Subject / Class *">
          <CreativeSelect 
            name="subject" 
            value={form.subject} 
            onChange={ch} 
            options={classNames} 
            placeholder="Select Class" 
            isNew={isNew} 
            setIsNew={setIsNew} 
          />
        </Field>
        <Field label="Chapter / Topic *">
          <input type="text" name="chapter" value={form.chapter} onChange={ch} placeholder="Chapter Name" className={inputCls} />
        </Field>
        <Field label="Assigned Teacher">
          {teachers.length > 0 ? (
            <DynSelect name="teacher" value={form.teacher} onChange={ch} options={teachers} placeholder="-- Select Teacher --" />
          ) : (
            <input type="text" name="teacher" value={form.teacher} onChange={ch} placeholder="Teacher Name" className={inputCls} />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Progress (%)">
            <input type="number" name="progress" value={form.progress} onChange={ch} min="0" max="100" className={inputCls} />
          </Field>
          <Field label="Target Date">
            <input type="date" name="date" value={form.date} onChange={ch} className={inputCls} />
          </Field>
        </div>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   3b. EDIT SYLLABUS
══════════════════════════════════════ */
export const EditSyllabusModal = ({ isOpen, onClose, data, onSave, teachers = [], classNames = [] }) => {
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}
      title="Update Lesson Plan" icon={Edit}
      iconColor="text-[#eab308]" iconBg="bg-[#eab308]/15"
      saveBtnColor="bg-[#eab308] hover:bg-[#ca8a04]" saveLabel="Update"
      onSave={() => { onSave({ ...form, progress: Number(form.progress) }); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Subject / Class">
          {classNames.length > 0 ? (
            <DynSelect name="subject" value={form.subject || ''} onChange={ch} options={classNames} placeholder="-- Select Class --" />
          ) : (
            <input type="text" name="subject" value={form.subject || ''} onChange={ch} className={inputCls} />
          )}
        </Field>
        <Field label="Chapter / Topic">
          <input type="text" name="chapter" value={form.chapter || ''} onChange={ch} className={inputCls} />
        </Field>
        <Field label="Assigned Teacher">
          {teachers.length > 0 ? (
            <DynSelect name="teacher" value={form.teacher || ''} onChange={ch} options={teachers} placeholder="-- Select Teacher --" />
          ) : (
            <input type="text" name="teacher" value={form.teacher || ''} onChange={ch} className={inputCls} />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Progress (%)">
            <input type="number" name="progress" min="0" max="100" value={form.progress || ''} onChange={ch} className={inputCls} />
          </Field>
          <Field label="Target Date">
            <input type="date" name="date" value={form.date || ''} onChange={ch} className={inputCls} />
          </Field>
        </div>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   4. ADD ACADEMIC EVENT  — single date field
══════════════════════════════════════ */
const CATEGORIES = ['FESTIVAL', 'HOLIDAY', 'EXAM', 'SPORTS', 'CULTURAL', 'MEETING', 'OTHER'];
const defaultAcEvent = { name: '', date: '', category: 'FESTIVAL', status: 'Upcoming', description: '' };

export const AddAcademicEventModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState(defaultAcEvent);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => setForm(defaultAcEvent);

  return (
    <ModalWrapper isOpen={isOpen} onClose={() => { reset(); onClose(); }}
      title="Schedule New Event" icon={Calendar}
      iconColor="text-[#f59e0b]" iconBg="bg-[#f59e0b]/15"
      saveBtnColor="bg-[#f59e0b] hover:bg-[#d97706]"
      onSave={() => { if (!form.name || !form.date) { alert('Please fill Event Name and Date'); return; } onSave({ ...form }); reset(); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Event Name *">
          <input type="text" name="name" value={form.name} onChange={ch} placeholder="e.g. Annual Sports Day" className={inputCls} />
        </Field>
        <Field label="Event Date *">
          <input type="date" name="date" value={form.date} onChange={ch} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <DynSelect name="category" value={form.category} onChange={ch} options={CATEGORIES} />
          </Field>
          <Field label="Status">
            <DynSelect name="status" value={form.status} onChange={ch} options={['Upcoming', 'Ongoing', 'Completed']} />
          </Field>
        </div>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   4b. EDIT ACADEMIC EVENT
══════════════════════════════════════ */
export const EditEventModal = ({ isOpen, onClose, data, onSave }) => {
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}
      title="Update Calendar Event" icon={Edit}
      iconColor="text-[#eab308]" iconBg="bg-[#eab308]/15"
      saveBtnColor="bg-[#eab308] hover:bg-[#ca8a04]" saveLabel="Update"
      onSave={() => { onSave(form); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Event Name *">
          <input type="text" name="name" value={form.name || ''} onChange={ch} className={inputCls} />
        </Field>
        <Field label="Event Date *">
          <input type="date" name="date" value={form.date || ''} onChange={ch} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <DynSelect name="category" value={form.category || 'FESTIVAL'} onChange={ch} options={CATEGORIES} />
          </Field>
          <Field label="Status">
            <DynSelect name="status" value={form.status || 'Upcoming'} onChange={ch} options={['Upcoming', 'Ongoing', 'Completed']} />
          </Field>
        </div>
      </div>
    </ModalWrapper>
  );
};

/* ══════════════════════════════════════
   5. ADD PARENT EVENT
══════════════════════════════════════ */
const defaultParentEvent = { name: '', date: '', type: 'Event', description: '', targetClass: '' };

export const AddParentEventModal = ({ isOpen, onClose, onSave, eventTypes = [], classNames = [] }) => {
  const [form, setForm] = useState(defaultParentEvent);
  const [isNewType, setIsNewType] = useState(false);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(defaultParentEvent); setIsNewType(false); };

  return (
    <ModalWrapper isOpen={isOpen} onClose={() => { reset(); onClose(); }}
      title="Schedule Parent Event" icon={Calendar}
      iconColor="text-[#6366f1]" iconBg="bg-[#6366f1]/15"
      saveBtnColor="bg-[#6366f1] hover:bg-[#4f46e5]"
      onSave={() => {
        const newId = `PEV-${Math.floor(100 + Math.random() * 900)}`;
        onSave({ ...form, id: newId });
        reset(); onClose();
      }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Event Title *">
          <input type="text" name="name" value={form.name} onChange={ch} placeholder="e.g. Annual Parent Teacher Meeting" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starting Date *">
            <input type="date" name="date" value={form.date} onChange={ch} className={inputCls} />
          </Field>
          <Field label="Closing Date">
            <input type="date" name="end_date" value={form.end_date || ''} onChange={ch} className={inputCls} />
          </Field>
        </div>
        <Field label="Target Class (Optional - Blank for All)">
          <DynSelect name="targetClass" value={form.targetClass} onChange={ch} options={classNames} placeholder="-- All Classes --" />
        </Field>
        <Field label="Type">
          <CreativeSelect 
            name="type" 
            value={form.type} 
            onChange={ch} 
            options={eventTypes} 
            placeholder="Select Type" 
            isNew={isNewType} 
            setIsNew={setIsNewType} 
          />
        </Field>
        <Field label="Description (Optional)">
          <textarea name="description" value={form.description} onChange={ch} rows={3} placeholder="Short description..." className="w-full px-3 py-2 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[#6366f1] resize-none transition-colors" />
        </Field>
      </div>
    </ModalWrapper>
  );
};

export const EditParentEventModal = ({ isOpen, onClose, data, onSave, eventTypes = [], classNames = [] }) => {
  const [form, setForm] = useState({});
  const [isNewType, setIsNewType] = useState(false);
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);
  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}
      title="Update Parent Event" icon={Edit}
      iconColor="text-[#eab308]" iconBg="bg-[#eab308]/15"
      saveBtnColor="bg-[#eab308] hover:bg-[#ca8a04]" saveLabel="Update"
      onSave={() => { onSave(form); onClose(); }}>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Event Title *">
          <input type="text" name="name" value={form.name || ''} onChange={ch} placeholder="Event Name" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starting Date *">
            <input type="date" name="date" value={form.date || ''} onChange={ch} className={inputCls} />
          </Field>
          <Field label="Closing Date">
            <input type="date" name="end_date" value={form.end_date || ''} onChange={ch} className={inputCls} />
          </Field>
        </div>
        <Field label="Target Class (Optional - Blank for All)">
          <DynSelect name="targetClass" value={form.targetClass || ''} onChange={ch} options={classNames} placeholder="-- All Classes --" />
        </Field>
        <Field label="Type">
          <CreativeSelect 
            name="type" 
            value={form.type || 'Event'} 
            onChange={ch} 
            options={eventTypes} 
            placeholder="Select Type" 
            isNew={isNewType} 
            setIsNew={setIsNewType} 
          />
        </Field>
        <Field label="Description (Optional)">
          <textarea name="description" value={form.description || ''} onChange={ch} rows={3} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[#eab308] resize-none transition-colors" />
        </Field>
      </div>
    </ModalWrapper>
  );
};
