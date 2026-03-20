import React, { useState, useEffect, useCallback } from 'react';
import { Download, Search, Eye, Edit, Trash2, Plus, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AddStaffModal from '../components/AddStaffModal';
import ViewTeacherModal from '../components/ViewTeacherModal';
import EditTeacherModal from '../components/EditTeacherModal';
import api from '../api/axios';

const PAGE_SIZE = 15;

const AVATAR_COLORS = [
  'bg-pink-300 text-pink-800 dark:bg-pink-400 dark:text-pink-950',
  'bg-blue-300 text-blue-800 dark:bg-blue-400 dark:text-blue-950',
  'bg-yellow-300 text-yellow-800 dark:bg-yellow-400 dark:text-yellow-950',
  'bg-emerald-300 text-emerald-800 dark:bg-emerald-400 dark:text-emerald-950',
  'bg-indigo-300 text-indigo-800 dark:bg-indigo-400 dark:text-indigo-950',
  'bg-rose-300 text-rose-800 dark:bg-rose-400 dark:text-rose-950',
];

const Teachers = () => {
  const [teachersList, setTeachersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      const list = (res.data?.data ?? res.data ?? []).map((e, i) => ({
        id: e.employee_id ?? `EMP-${e.id}`,
        rawId: e.id,
        name: e.name ?? 'N/A',
        gender: e.gender ?? 'N/A',
        initials: (e.name ?? 'X').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        designation: e.designation ?? 'N/A',
        department: e.department ?? e.role ?? 'Staff',
        phone: e.contact_number ?? 'N/A',
        email: e.email ?? 'N/A',
        status: e.status ?? 'Active',
        joined: e.joining_date ?? 'N/A',
        salary: e.salary ? `₹${Number(e.salary).toLocaleString()}` : 'N/A',
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      }));
      setTeachersList(list);
    } catch (err) {
      console.error('Teachers fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const deptOptions = ['All', ...new Set(teachersList.map(t => t.department).filter(Boolean))];

  const filtered = teachersList.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.phone.includes(q);
    const matchDept = deptFilter === 'All' || t.department === deptFilter;
    return matchSearch && matchDept;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleView = (staff) => { setSelectedStaff(staff); setIsViewModalOpen(true); };
  const handleEdit = (staff) => { setSelectedStaff(staff); setIsEditModalOpen(true); };
  const handleDelete = async (rawId, displayId) => {
    if (!window.confirm(`Delete employee ${displayId}?`)) return;
    try {
      await api.delete(`/employees/${rawId}`);
      setTeachersList(prev => prev.filter(t => t.rawId !== rawId));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['EMP ID', 'Name', 'Gender', 'Designation', 'Department', 'Phone', 'Email', 'Status', 'Joined'];
    const rows = filtered.map(t => [t.id, t.name, t.gender, t.designation, t.department, t.phone, t.email, t.status, t.joined]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Teachers directory exported!');
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Teachers & Staff Directory</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">
            {loading ? 'Loading...' : `${filtered.length} staff members found`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchTeachers} disabled={loading} className="flex items-center space-x-1.5 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-md transition-colors text-xs font-bold shadow-sm h-9 disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-md transition-colors text-[11px] font-extrabold shadow-sm h-9">
            <Download size={14} strokeWidth={2.5} /><span>Export CSV</span>
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-md transition-colors text-[11px] font-extrabold shadow-sm h-9">
            <Plus size={14} strokeWidth={3} /><span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[var(--bg-panel-alt)] border border-gray-200 dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-3 border-b border-[var(--border-color)] dark:border-[#334155] flex items-center justify-between shrink-0 transition-colors bg-[var(--bg-panel-alt)] rounded-t-md">
           <div className="relative flex items-center">
             <div className="absolute left-3"><Search size={14} className="text-[#64748b]" strokeWidth={2.5} /></div>
             <input type="text" placeholder="Search Name or EMP ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
               className="w-[320px] h-9 pl-9 pr-3 bg-white dark:bg-[#10162A] border border-gray-300 dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] dark:focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none" />
           </div>
           <div className="flex items-center rounded border border-[var(--border-color)] dark:border-[#334155] overflow-hidden h-9 bg-white dark:bg-transparent shadow-sm">
              <div className="bg-gray-100 dark:bg-[#1E293B] h-full px-4 flex items-center border-r border-[var(--border-color)] dark:border-r-[#334155]">
                 <span className="text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] tracking-widest uppercase">DEPT</span>
              </div>
              <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
                className="h-full pl-3 pr-6 bg-white dark:bg-[#10162A] text-[var(--text-primary)] text-[11px] font-bold focus:outline-none appearance-none cursor-pointer">
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
           </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 size={28} className="animate-spin text-[#f59e0b]" />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Staff...</p>
              </div>
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
              <tr className="border-y border-gray-200 dark:border-[#334155]">
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase">EMP ID</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase">STAFF NAME</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase">DESIGNATION</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase">CONTACT</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase">EMAIL</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase">STATUS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400 text-sm font-bold">No staff members found.</td></tr>
              ) : paginated.map((row) => (
                <tr key={row.rawId} className="border-b border-gray-100 dark:border-[#334155] hover:bg-white/5 dark:hover:bg-[#151c2e] transition-colors">
                  <td className="px-5 py-1.5 text-[11px] font-bold text-[#0ea5e9] whitespace-nowrap">{row.id}</td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                     <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${row.avatarColor}`}>{row.initials}</div>
                        <div>
                           <div className="text-xs font-bold text-[var(--text-primary)]">{row.name}</div>
                           <div className="text-[8px] font-bold text-[#64748b] tracking-widest uppercase mt-0.5">{row.gender}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <div className="text-xs font-bold text-[var(--text-primary)]">{row.designation}</div>
                    <div className="text-[8px] font-bold text-[#64748b] tracking-widest uppercase mt-0.5">DEPT: {row.department}</div>
                  </td>
                  <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{row.phone}</td>
                  <td className="px-5 py-1.5 text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{row.email}</td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest ${
                      row.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-[#14532d]/40 dark:border-[#166534]/80 dark:text-[#4ade80]'
                      : 'bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-700/40 dark:text-slate-400'
                    }`}>{row.status?.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-1.5 whitespace-nowrap">
                     <div className="flex items-center justify-end space-x-1.5">
                        <button onClick={() => handleView(row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors shadow-sm"><Eye size={10} strokeWidth={2.5}/></button>
                        <button onClick={() => handleEdit(row)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors shadow-sm"><Edit size={10} strokeWidth={2.5}/></button>
                        <button onClick={() => handleDelete(row.rawId, row.id)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors shadow-sm"><Trash2 size={10} strokeWidth={2.5}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-color)] dark:border-[#334155] bg-[var(--bg-panel-alt)] flex items-center justify-between shrink-0 rounded-b-md">
            <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{filtered.length} total • Page {page}/{totalPages}</span>
            <div className="flex items-center space-x-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1E293B] shadow-sm transition-colors disabled:opacity-50"><ChevronLeft size={14}/></button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pg = i + 1;
                  return <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 flex items-center justify-center rounded text-[11px] font-bold shadow-sm ${pg === page ? 'bg-[#65a30d] text-white' : 'bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50'}`}>{pg}</button>;
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1E293B] shadow-sm transition-colors disabled:opacity-50"><ChevronRight size={14}/></button>
            </div>
        </div>

        <AddStaffModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSaved={fetchTeachers} />
        <ViewTeacherModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} data={selectedStaff} />
        <EditTeacherModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} data={selectedStaff} onSaved={fetchTeachers} />
      </div>
    </div>
  );
};

export default Teachers;
