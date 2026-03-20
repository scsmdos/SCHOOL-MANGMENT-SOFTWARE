import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw,
  Loader2,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../api/axios';

const PAGE_SIZE = 15;

const StudentLeaves = () => {
  const [leavesList, setLeavesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(1);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/student-leaves');
      const data = res.data?.data ?? res.data ?? [];
      setLeavesList(data);
      
      const uniqueClasses = [...new Set(data.map(l => l.class_name).filter(Boolean))].sort();
      setClasses(uniqueClasses);
    } catch (err) {
      console.error('Fetch leaves error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/student-leaves/${id}`, { status });
      setLeavesList(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteLeave = async (id) => {
    if (!window.confirm('Delete this leave record?')) return;
    try {
      await api.delete(`/student-leaves/${id}`);
      setLeavesList(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const filtered = leavesList.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.student_name.toLowerCase().includes(q) || l.student_id.toLowerCase().includes(q);
    const matchClass = classFilter === 'All' || l.class_name === classFilter;
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchSearch && matchClass && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 bg-[var(--bg-main)] h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Student Leave Applications</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">
            {loading ? 'Loading...' : `${filtered.length} applications found`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchLeaves} disabled={loading} className="flex items-center space-x-1.5 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-md transition-colors text-xs font-bold shadow-sm h-9 disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors">
        
        {/* Toolbar */}
        <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 transition-colors bg-[var(--bg-panel-alt)]">
           <div className="flex items-center space-x-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" strokeWidth={2.5} />
                <input 
                  type="text" 
                  placeholder="Search Student Name or ID..." 
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-[280px] h-9 pl-9 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#0ea5e9] transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center rounded border border-[var(--border-color)] h-9 bg-white dark:bg-transparent">
                <div className="bg-gray-100 dark:bg-[#1E293B] h-full px-4 flex items-center border-r border-[var(--border-color)]">
                   <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Status</span>
                </div>
                <select 
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="h-full pl-3 pr-6 bg-transparent dark:bg-[#10162A] text-[var(--text-primary)] text-[11px] font-bold focus:outline-none appearance-none cursor-pointer"
                >
                   <option value="All">All Status</option>
                   <option value="Pending">Pending</option>
                   <option value="Approved">Approved</option>
                   <option value="Rejected">Rejected</option>
                </select>
              </div>
           </div>
 
           {/* Class Filter */}
           <div className="flex items-center rounded border border-[var(--border-color)] h-9 bg-white dark:bg-transparent">
              <div className="bg-gray-100 dark:bg-[#1E293B] h-full px-4 flex items-center border-r border-[var(--border-color)]">
                 <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase text-teal-600">Class</span>
              </div>
              <select 
                value={classFilter}
                onChange={e => { setClassFilter(e.target.value); setPage(1); }}
                className="h-full pl-3 pr-6 bg-transparent dark:bg-[#10162A] text-[var(--text-primary)] text-[11px] font-bold focus:outline-none appearance-none cursor-pointer"
              >
                 <option value="All">All Classes</option>
                 {classes.map(c => <option key={c} value={c} className="bg-white dark:bg-[#10162A]">{c}</option>)}
              </select>
              <Filter size={12} className="mr-3 text-slate-400" />
           </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={28} className="animate-spin text-[#0ea5e9]" />
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10 w-full">
              <tr className="border-y border-[var(--border-color)] dark:border-[#334155] transition-colors relative">
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Student Details</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Leave Plan</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Reason</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 text-sm font-bold">No leave applications found.</td></tr>
              ) : paginated.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 dark:border-[#334155] hover:bg-white/5 dark:hover:bg-[#151c2e] transition-colors group">
                  <td className="px-5 py-3 whitespace-nowrap">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{row.student_name}</span>
                        <span className="text-[8px] font-bold text-[#10b981] tracking-widest uppercase mt-0.5">ID: {row.student_id} • CLASS {row.class_name}</span>
                     </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                       <Calendar size={12} className="mr-2 text-slate-400" />
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{row.start_date}</span>
                          <span className="text-[8px] font-bold text-slate-500 tracking-widest uppercase">To {row.end_date}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="max-w-[240px] truncate-2-lines text-[11px] font-medium text-slate-500 italic leading-relaxed">
                       {row.reason}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest transition-colors ${
                      row.status === 'Approved'
                        ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-[#14532d]/40 dark:border-[#166534]/80 dark:text-[#4ade80]'
                        : row.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-800 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400'
                    }`}>{row.status?.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                     <div className="flex items-center justify-end space-x-1.5">
                        {row.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(row.id, 'Approved')} title="Approve" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm"><CheckCircle size={10} strokeWidth={2.5}/></button>
                            <button onClick={() => updateStatus(row.id, 'Rejected')} title="Reject" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><XCircle size={10} strokeWidth={2.5}/></button>
                          </>
                        )}
                        <button onClick={() => deleteLeave(row.id)} title="Delete" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-400 text-gray-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={10} strokeWidth={2.5}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-panel-alt)] flex items-center justify-between shrink-0 transition-colors">
            <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center space-x-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50 transition-colors disabled:opacity-50"><ChevronLeft size={14}/></button>
                <div className="flex items-center px-3 h-8 rounded bg-gray-50 dark:bg-white/5 border border-[var(--border-color)]">
                   <span className="text-[11px] font-bold text-[#10b981]">{page}</span>
                   <span className="mx-1.5 text-slate-400 text-[10px]">/</span>
                   <span className="text-[11px] font-bold text-slate-500">{totalPages}</span>
                </div>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50 transition-colors disabled:opacity-50"><ChevronRight size={14}/></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLeaves;
