import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  Briefcase,
  Download,
  X,
  ChevronDown,
  RefreshCw,
  Loader2,
  Save
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import api from '../api/axios';

/* ── Sample Data ── */


const ROLES = ['All Roles', 'Teacher', 'Staff', 'Admin'];

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      const list = (res.data?.data ?? res.data ?? []).map(e => ({
        id: e.employee_id ?? `EMP-${e.id}`,
        rawId: e.id,
        name: e.name ?? 'N/A',
        role: e.role ?? e.department ?? 'Staff',
        subject: e.designation ?? e.qualification ?? 'N/A',
        experience: e.experience ?? 'N/A',
        contact: e.contact_number ?? 'N/A',
        email: e.email ?? 'N/A',
        status: e.status ?? 'Active',
        joined: e.joining_date ?? 'N/A',
        salary: e.salary ? `₹${Number(e.salary).toLocaleString()}` : 'N/A'
      }));
      setStaff(list);
    } catch (err) {
      console.error('Staff fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  /* ── Filter Logic ── */
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  /* ── Stats ── */
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'Active').length;
  const onLeave = staff.filter(s => s.status === 'On Leave').length;
  const resignation = staff.filter(s => s.status === 'Resigned').length;

  const handleEdit = (s) => {
    setCurrentStaff(s);
    setIsModalOpen(true);
  };

  const handleDelete = async (rawId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/employees/${rawId}`);
      setStaff(prev => prev.filter(s => s.rawId !== rawId));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Teachers & Staff</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Member Management · Payroll · Records</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchStaff} disabled={loading} className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={`text-[#6366f1] ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm">
            <Download size={13} strokeWidth={2.5} className="text-[#10b981]" /><span>Export CSV</span>
          </button>
          <button onClick={() => { setCurrentStaff(null); setIsModalOpen(true); }}
            className="flex items-center space-x-2 h-9 px-4 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[11px] font-extrabold shadow-sm transition-colors">
            <Plus size={14} strokeWidth={3} /><span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <StatCard label="Total Staff" value={loading ? '...' : totalStaff} icon={Users} color="text-[#6366f1]" bg="bg-[#6366f1]/10 dark:bg-[#6366f1]/20" />
        <StatCard label="Active" value={loading ? '...' : activeStaff} icon={CheckCircle} color="text-[#10b981]" bg="bg-[#10b981]/10 dark:bg-[#10b981]/20" />
        <StatCard label="On Leave" value={loading ? '...' : onLeave} icon={Clock} color="text-[#f59e0b]" bg="bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20" />
        <StatCard label="Resigned" value={loading ? '...' : resignation} icon={Briefcase} color="text-[#f43f5e]" bg="bg-[#f43f5e]/10 dark:bg-[#f43f5e]/20" />
      </div>

      {/* Toolbar Section */}
      <div className="h-14 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] flex items-center justify-between px-2 shrink-0 rounded-t-lg transition-colors overflow-x-auto">
        <div className="flex items-center">
          <div className="flex border-b-[3px] border-[#6366f1] h-14 items-center px-4 bg-white dark:bg-[#10162a] text-[#6366f1]">
            <Users size={14} strokeWidth={3} className="mr-2" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase whitespace-nowrap">STAFF LIST</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pr-2">
          {/* Role Filter */}
          <div className="relative">
             <select 
               value={roleFilter} 
               onChange={(e) => setRoleFilter(e.target.value)}
               className="h-8 pl-3 pr-7 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] appearance-none cursor-pointer shadow-sm transition-colors"
             >
               {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" strokeWidth={2.5} />
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[180px] md:w-[240px] h-8 pl-8 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm"
            />
          </div>
          <div className="bg-[#6366f1] text-white px-2 py-0.5 rounded text-[10px] font-black min-w-[30px] text-center shrink-0">
             {filteredStaff.length}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-b-lg flex-1 overflow-hidden flex flex-col min-h-0 shadow-sm transition-colors relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px]">
             <div className="flex flex-col items-center space-y-3">
               <RefreshCw size={28} className="animate-spin text-[#6366f1]" />
               <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Updating Staff Directory...</p>
             </div>
          </div>
        )}
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
              <tr className="border-b border-gray-200 dark:border-[#334155]">
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase text-left">ID</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase text-left">MEMBER</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase text-left">ROLE & SUBJECT</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase text-left">CONTACT</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase text-left">STATUS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase text-right px-8">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/40 transition-colors">
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <span className="text-[10px] font-black text-[#6366f1] bg-[#6366f1]/5 px-2 py-0.5 rounded border border-[#6366f1]/20">
                      {s.id}
                    </span>
                  </td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-[12px] font-black shrink-0 shadow-md">
                        {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[var(--text-primary)]">{s.name}</p>
                        <p className="text-[9px] font-bold text-[#64748b] flex items-center mt-0.5">
                          <CalendarIcon size={10} className="mr-1" /> Joined {s.joined}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide">{s.role}</p>
                    <p className="text-[10px] text-[#64748b] mt-0.5">{s.subject} · {s.experience}</p>
                  </td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-[10px] text-[var(--text-primary)] font-bold">
                        <Phone size={10} className="mr-1.5 text-[#6366f1]" /> {s.contact}
                      </div>
                      <div className="flex items-center text-[10px] text-[#64748b] font-medium">
                        <Mail size={10} className="mr-1.5 text-[#6366f1]" /> {s.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => handleEdit(s)}
                        className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#6366f1] hover:bg-[#6366f1] hover:text-white transition-all shadow-sm">
                        <Edit size={12} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleDelete(s.rawId)}
                        className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white transition-all shadow-sm">
                        <Trash2 size={12} strokeWidth={2.5} />
                      </button>
                      <button className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-sm">
                        <MoreVertical size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                        <Search size={32} className="text-[#94a3b8]" />
                      </div>
                      <p className="text-[13px] font-black text-[#64748b] uppercase tracking-widest">No staff members found</p>
                      <p className="text-[11px] text-[#64748b] mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <StaffModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          staff={currentStaff} 
          onSave={async (data) => {
            try {
              const payload = {
                name: data.name,
                designation: data.subject,
                department: data.role,
                contact_number: data.contact,
                email: data.email,
                status: data.status,
              };
              if (currentStaff) {
                // Edit existing
                await api.put(`/employees/${currentStaff.rawId}`, payload);
              } else {
                // Add new
                await api.post('/employees', payload);
              }
              setIsModalOpen(false);
              fetchStaff(); // refresh from DB
            } catch (err) {
              alert('Failed to save: ' + (err.response?.data?.error || err.message));
            }
          }}
        />
      )}
    </div>
  );
};

/* ── Sub-components ── */

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-lg p-4 shadow-sm flex items-center transition-all hover:translate-y-[-2px]">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center mr-4 ${bg} ${color}`}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{label}</p>
      <p className="text-[22px] font-black text-[var(--text-primary)] leading-none mt-1">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-[#4ade80] border-green-200 dark:border-green-800',
    'On Leave': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Resigned': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] font-black rounded border tracking-widest uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};

const StaffModal = ({ isOpen, onClose, staff, onSave }) => {
  const [formData, setFormData] = useState(staff || {
    name: '',
    role: 'Teacher',
    subject: '',
    experience: '',
    contact: '',
    email: '',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    salary: '₹0'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass = "w-full h-10 px-3 bg-gray-50 dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded-md text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[500px] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <div className="flex items-center space-x-3 text-[#6366f1]">
            <div className="bg-[#6366f1]/15 p-1.5 rounded"><Users size={16} strokeWidth={2.5} /></div>
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">
              {staff ? 'Update Staff Member' : 'Add Staff Member'}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-[#0f172a] border dark:border-[#334155] text-[#64748b] hover:text-white transition-all"><X size={15} strokeWidth={3} /></button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1a2234] flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Alok Mishra" />
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className={inputClass}>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Subject / Dept</label>
              <input name="subject" value={formData.subject} onChange={handleChange} className={inputClass} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Experience</label>
              <input name="experience" value={formData.experience} onChange={handleChange} className={inputClass} placeholder="e.g. 5 Years" />
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Joined Date</label>
              <input type="date" name="joined" value={formData.joined} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Contact Number</label>
              <input name="contact" value={formData.contact} onChange={handleChange} className={inputClass} placeholder="+91 0000000000" />
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Email Address</label>
              <input name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="member@school.edu" />
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Salary (Monthly)</label>
              <input name="salary" value={formData.salary} onChange={handleChange} className={inputClass} placeholder="₹0" />
            </div>
            <div>
              <label className="text-[9px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 block">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234] shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] text-[var(--text-primary)] rounded">Cancel</button>
          <button onClick={() => onSave(formData)}
            className="flex items-center space-x-2 px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded text-[10px] font-extrabold uppercase tracking-widest shadow-md transition-all">
            <Save size={13} strokeWidth={3} /><span>Save Member</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
