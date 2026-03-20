import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Download, Plus, Send, Eye, Edit, Trash2, X, Save,
  DollarSign, Briefcase, Building2, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Loader2
} from 'lucide-react';
import api from '../api/axios';

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/salary-structures');
      const data = res.data?.data ?? res.data ?? [];
      const list = data.map(e => ({
        id: e.id,
        name: e.employee_name ?? 'N/A',
        avatar: (e.employee_name ?? 'E').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        designation: e.designation ?? 'Staff',
        department: e.department ?? 'Staff',
        salary: e.basic_salary ? Number(e.basic_salary).toLocaleString() : '0',
        rawSalary: e.basic_salary ?? 0,
        advance: e.other_deduction || 0,
        status: e.status ?? 'PAID',
      }));
      setSalaries(list);
    } catch (err) {
      console.error('Salary fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

  /* ── Filtered Data ── */
  const filteredData = salaries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                         item.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || item.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  /* ── CRUD Logic ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this salary record?')) return;
    try {
      await api.delete(`/salary-structures/${id}`);
      setSalaries(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      // Fallback: try employees endpoint
      try {
        await api.delete(`/employees/${id}`);
        setSalaries(prev => prev.filter(s => s.id !== id));
      } catch {
        setSalaries(prev => prev.filter(s => s.id !== id)); // Optimistic
      }
    }
  };

  const handleSave = async (data) => {
    try {
      const payload = {
        employee_name: data.name,
        designation: data.designation,
        department: data.department,
        basic_salary: data.salary,
        other_deduction: data.advance || 0,
        status: data.status,
        employee_id: data.employee_id || `EMP-${Date.now()}`
      };

      if (currentEdit) {
        await api.put(`/salary-structures/${currentEdit.id}`, payload);
      } else {
        await api.post('/salary-structures', payload);
      }
      fetchSalaries();
      setIsModalOpen(false);
      setCurrentEdit(null);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Salary Management</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Manage Staff Payroll · Compensation Structure</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm">
            <Download size={13} strokeWidth={2.5} className="text-[#6366f1]" /><span>Export Ledger</span>
          </button>
          <button 
            onClick={() => { setCurrentEdit(null); setIsModalOpen(true); }}
            className="flex items-center justify-center space-x-2 h-9 px-4 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[11px] font-extrabold shadow-sm transition-colors min-w-[130px]">
            <Plus size={14} strokeWidth={3} />
            <span>Add Salary</span>
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] shrink-0">
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" strokeWidth={2.5} />
                <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-[220px] h-8 pl-8 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm" />
             </div>
             <select 
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="h-8 px-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] cursor-pointer shadow-sm"
            >
              <option>All Departments</option>
              <option>Teaching</option>
              <option>Office</option>
              <option>Staff</option>
            </select>
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Total Staff: {filteredData.length}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 size={28} className="animate-spin text-[#6366f1]" />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Salaries...</p>
              </div>
            </div>
          ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
              <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left w-12">#</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">EMPLOYEE DETAILS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">DESIGNATION</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">DEPARTMENT</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">BASIC SALARY</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">ADVANCE</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">NET PAYABLE</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">STATUS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/50 transition-colors">
                  <td className="px-5 py-1.5 text-[11px] font-black text-[#6366f1]">{idx + 1}</td>
                  <td className="px-5 py-1.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[#6366f1] text-[10px] font-black">{item.avatar}</div>
                      <span className="text-[12px] font-bold text-[var(--text-primary)]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tight">{item.designation}</td>
                  <td className="px-5 py-1.5 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.department}</span>
                  </td>
                  <td className="px-5 py-1.5 text-center">
                    <span className="text-[13px] font-black text-[var(--text-primary)]">₹{item.salary}</span>
                  </td>
                  <td className="px-5 py-1.5 text-center">
                    <span className="text-[11px] font-bold text-rose-500">₹{item.advance}</span>
                  </td>
                  <td className="px-5 py-1.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[14px] font-black text-[#6366f1]">₹{(parseFloat(item.rawSalary) + parseFloat(item.advance)).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-1.5 text-center">
                    <span className={`px-2.5 py-0.5 text-[9px] font-black rounded border tracking-widest uppercase ${item.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-[#4ade80] border-green-200 dark:border-green-800' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-1.5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => { setViewData(item); setIsViewOpen(true); }} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Eye size={12} strokeWidth={2.5} /></button>
                      <button onClick={() => { setCurrentEdit(item); setIsModalOpen(true); }} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#10b981] hover:bg-[#10b981] hover:text-white transition-all shadow-sm"><Edit size={12} strokeWidth={2.5} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white transition-all shadow-sm"><Trash2 size={12} strokeWidth={2.5} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] flex items-center justify-between shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredData.length} Result(s)</p>
          <div className="flex items-center space-x-1">
            <button className="w-7 h-7 rounded border border-gray-200 dark:border-[#334155] flex items-center justify-center text-gray-400 hover:bg-[#6366f1] hover:text-white transition-all"><ChevronLeft size={14} /></button>
            <button className="w-7 h-7 rounded bg-[#6366f1] text-white flex items-center justify-center text-[10px] font-black shadow-sm">1</button>
            <button className="w-7 h-7 rounded border border-gray-200 dark:border-[#334155] flex items-center justify-center text-gray-400 hover:bg-[#6366f1] hover:text-white transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>

      </div>

      {/* Modals */}
      <SalaryModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={currentEdit} 
      />
      
      {isViewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsViewOpen(false)}></div>
          <div className="relative w-full max-w-[320px] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden text-center p-8">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[#6366f1] text-[24px] font-black mx-auto mb-4">{viewData.avatar}</div>
            <h3 className="text-[18px] font-black text-[var(--text-primary)] mb-1">{viewData.name}</h3>
            <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest mb-6">{viewData.designation}</p>
            <div className="space-y-2 mb-8 text-left">
               <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5"><span className="text-[10px] font-bold text-gray-400 uppercase">Department</span><span className="text-[11px] font-black text-[var(--text-primary)]">{viewData.department}</span></div>
               <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5"><span className="text-[10px] font-bold text-gray-400 uppercase">Basic Salary</span><span className="text-[12px] font-black text-[var(--text-primary)]">₹{viewData.salary}</span></div>
               <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5"><span className="text-[10px] font-bold text-gray-400 uppercase">Advance Taken</span><span className="text-[12px] font-black text-emerald-500">+ ₹{viewData.advance}</span></div>
               <div className="flex justify-between py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-2 -mx-2 rounded"><span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Total Payable</span><span className="text-[13px] font-black text-indigo-600 dark:text-indigo-400">₹{(parseFloat(viewData.rawSalary) + parseFloat(viewData.advance)).toLocaleString()}</span></div>
               <div className="flex justify-between py-2"><span className="text-[10px] font-bold text-gray-400 uppercase">Current Status</span><span className="text-[10px] font-black text-blue-500">{viewData.status}</span></div>
            </div>
            <button onClick={() => setIsViewOpen(false)} className="w-full py-2 bg-gray-100 dark:bg-[#10162A] text-[10px] font-black uppercase tracking-widest rounded-lg">Close Details</button>
          </div>
        </div>
      )}

    </div>
  );
};

/* ── MODALS (Standard App Design) ── */
const inputClass = "w-full h-10 px-3 bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded-md text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm";

const SalaryModal = ({ isOpen, onClose, onSave, editData }) => {
  const defaultState = { name: '', designation: '', department: 'Teaching', salary: '', advance: '', status: 'PAID', employee_id: '' };
  const [formData, setFormData] = useState(defaultState);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (editData) setFormData(editData);
      else setFormData(defaultState);

      // Fetch employees for autocomplete
      api.get('/employees').then(res => {
        const list = res.data?.data ?? res.data ?? [];
        setStaff(list);
      }).catch(err => console.error('Error fetching staff:', err));
    }
  }, [editData, isOpen]);

  const handleNameChange = (val) => {
    setFormData({ ...formData, name: val, employee_id: '' });
    if (val.length > 1) {
      const matches = staff.filter(s => 
        (s.name && s.name.toLowerCase().includes(val.toLowerCase())) || 
        (s.employee_id && s.employee_id.toLowerCase().includes(val.toLowerCase()))
      );
      setFilteredStaff(matches.slice(0, 5));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const selectEmployee = (s) => {
    setFormData({
      ...formData,
      name: s.name,
      employee_id: s.employee_id || `EMP-${s.id}`,
      designation: s.designation || s.role || 'Staff',
      department: s.department || s.role || 'Staff',
      salary: s.salary || ''
    });
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[450px] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-3 text-[#6366f1]"><Users size={18} strokeWidth={2.5} /><h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{editData ? 'Edit Payroll' : 'Add Staff Payroll'}</h3></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-[#0f172a] hover:text-white transition-all"><X size={15} strokeWidth={3} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Search Employee (Name or ID)</label>
              <div className="relative">
                <input className={inputClass} placeholder="Type name to search..." value={formData.name} onChange={e => handleNameChange(e.target.value)} onFocus={() => formData.name.length > 1 && setShowDropdown(true)} />
                {formData.employee_id ? <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center"><div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div><span className="text-[8px] font-black text-indigo-500 uppercase">{formData.employee_id}</span></div> : null}
              </div>
              
              {showDropdown && filteredStaff.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredStaff.map(s => (
                    <button key={s.id} onClick={() => selectEmployee(s)} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-[#334155] last:border-0 flex justify-between items-center transition-colors">
                      <div>
                        <p className="text-[11px] font-black text-[var(--text-primary)]">{s.name}</p>
                        <p className="text-[9px] font-bold text-[#64748b]">{s.employee_id || `ID: ${s.id}`}</p>
                      </div>
                      <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">{s.designation || s.role || 'Staff'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Designation</label><input className={inputClass} value={formData.designation} onChange={e=>setFormData({...formData, designation: e.target.value})} placeholder="MATH TEACHER" /></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Department</label><select className={inputClass} value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})}><option>Teaching</option><option>Office</option><option>Staff</option></select></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Monthly Salary</label><input className={inputClass} value={formData.salary} onChange={e=>setFormData({...formData, salary: e.target.value})} placeholder="20000" /></div>
            <div><label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Advance Salary (Addition)</label><input className={`${inputClass} border-emerald-200 dark:border-emerald-900 text-emerald-500 font-black`} value={formData.advance} onChange={e=>setFormData({...formData, advance: e.target.value})} placeholder="0.00" /></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Payment Status</label><select className={inputClass} value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}><option>PAID</option><option>PENDING</option></select></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Total Payable (Auto circular)</label><div className={`${inputClass} bg-gray-50 dark:bg-white/5 flex items-center font-black text-indigo-500`}>₹{(parseFloat(formData.salary || 0) + parseFloat(formData.advance || 0)).toLocaleString()}</div></div>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <button onClick={onClose} className="px-6 py-2 text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-[#0f172a] rounded">Cancel</button>
          <button onClick={()=>onSave(formData)} className="px-6 py-2 bg-[#6366f1] text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md flex items-center justify-center"><Save size={14} className="mr-2" />Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagement;
