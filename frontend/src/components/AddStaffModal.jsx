import React, { useState, useEffect } from 'react';
import { X, Save, MonitorPlay, Loader2 } from 'lucide-react';
import api from '../api/axios';

const defaultForm = {
  name: '',
  gender: '',
  department: '',
  designation: '',
  contact_number: '',
  email: '',
  status: 'Active',
};

const inputCls = "w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none";
const selCls  = "w-full h-10 px-3 pr-8 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded text-xs font-bold text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none";

const SelArrow = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748b]">
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </div>
);

const Label = ({ children }) => (
  <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{children}</label>
);

const AddStaffModal = ({ isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setForm(defaultForm); // reset on open
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const ch = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Full Name is required'); return; }
    setSaving(true);
    try {
      await api.post('/employees', form);
      onSaved?.();   // trigger parent refresh
      onClose();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-[700px] bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#334155]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-3 text-[#f59e0b]">
            <div className="bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20 p-1.5 rounded">
              <MonitorPlay size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-widest text-[var(--text-primary)]">Register New Personnel</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-[#10162A] text-[#64748b] hover:text-white hover:bg-[#e11d48] border border-transparent dark:border-[#334155] transition-colors">
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1a2234]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

            {/* FULL NAME */}
            <div className="md:col-span-2 flex flex-col space-y-1.5">
              <Label>Full Name *</Label>
              <input type="text" name="name" value={form.name} onChange={ch} placeholder="Enter Full Name" className={inputCls} />
            </div>

            {/* GENDER */}
            <div className="flex flex-col space-y-1.5">
              <Label>Gender</Label>
              <div className="relative">
                <select name="gender" value={form.gender} onChange={ch} className={selCls}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <SelArrow />
              </div>
            </div>

            {/* DEPARTMENT */}
            <div className="flex flex-col space-y-1.5">
              <Label>Department</Label>
              <div className="relative">
                <select name="department" value={form.department} onChange={ch} className={selCls}>
                  <option value="">Select Department</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                  <option value="Support">Support</option>
                  <option value="Accounts">Accounts</option>
                </select>
                <SelArrow />
              </div>
            </div>

            {/* DESIGNATION */}
            <div className="flex flex-col space-y-1.5">
              <Label>Designation</Label>
              <div className="relative">
                <select name="designation" value={form.designation} onChange={ch} className={selCls}>
                  <option value="">Select Designation</option>
                  <option value="TGT">Trained Graduate Teacher (TGT)</option>
                  <option value="PGT">Post Graduate Teacher (PGT)</option>
                  <option value="PRT">Primary Teacher (PRT)</option>
                  <option value="Clerk">Clerk</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="Peon">Peon</option>
                </select>
                <SelArrow />
              </div>
            </div>

            {/* STATUS */}
            <div className="flex flex-col space-y-1.5">
              <Label>Status</Label>
              <div className="relative">
                <select name="status" value={form.status} onChange={ch} className={selCls}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                </select>
                <SelArrow />
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div className="flex flex-col space-y-1.5">
              <Label>Phone Number</Label>
              <input type="text" name="contact_number" value={form.contact_number} onChange={ch} placeholder="+91 XXXXX XXXXX" className={inputCls} />
            </div>

            {/* EMAIL */}
            <div className="flex flex-col space-y-1.5">
              <Label>Email Address</Label>
              <input type="email" name="email" value={form.email} onChange={ch} placeholder="email@school.edu" className={inputCls} />
            </div>

          </div>

          {/* Footer */}
          <div className="pt-6 mt-4 flex justify-end items-center space-x-3 border-t border-gray-200 dark:border-[#334155]">
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded text-[11px] font-extrabold tracking-widest uppercase hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 text-white rounded text-[11px] font-extrabold tracking-widest uppercase shadow-sm transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={3} />}
              <span>{saving ? 'Saving...' : 'Save Staff'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
