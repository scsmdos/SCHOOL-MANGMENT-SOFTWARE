import React, { useState, useEffect, useCallback } from 'react';
import { Download, Search, Eye, Edit, Trash2, CreditCard, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import EditStudentModal from '../components/EditStudentModal';
import ViewStudentModal from '../components/ViewStudentModal';
import IDCardModal from '../components/IDCardModal';
import api from '../api/axios';

const PAGE_SIZE = 15;

const Students = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isIDCardModalOpen, setIsIDCardModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [idCardData, setIdCardData] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch unique classes for filters (this should be cached or a separate endpoint, but for now we follow old logic)
  const fetchClasses = useCallback(async () => {
     try {
       const res = await api.get('/get-classes'); // Custom endpoint for just class names
       setClasses(res.data || []);
     } catch (e) { console.error('Error fetching classes:', e); }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      // Use Server-Side Pagination & Filtering
      const params = {
        page: page,
        per_page: PAGE_SIZE,
        search: debouncedSearch,
      };
      if (classFilter !== 'All') {
        params.admitted_into_class = classFilter;
      }

      const res = await api.get('/admissions', { params });
      
      const payload = res.data?.data ?? [];
      const students = payload.map(s => {
        const resolvePhoto = (url) => {
          if (!url) return null;
          if (url.startsWith('http')) return url;
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
          return `${baseUrl}${url}`;
        };
        return {
          ...s,
          id: s.admission_no ?? `ADM-${s.id}`,
          rawId: s.id,
          name: s.student_name ?? 'N/A',
          gender: s.gender ?? 'N/A',
          fatherName: s.father_name ?? 'N/A',
          className: s.admitted_into_class ?? 'N/A',
          roll: s.roll_no ?? 'N/A',
          phone: s.contact_no ?? 'N/A',
          status: s.status ?? 'Pending',
          avatar: resolvePhoto(s.student_photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.student_name ?? 'S')}&size=100&background=1e293b&color=a2a9b5&bold=true`,
          parentAvatar: resolvePhoto(s.parent_photo) || null,
          parent_email: s.parent_email || null,
          qualification_father: s.qualification_father || '-',
          qualification_mother: s.qualification_mother || '-',
        };
      });
      setAllStudents(students);
      setTotalPages(res.data?.last_page ?? 1);
      setTotalEntries(res.data?.total ?? students.length);
    } catch (err) {
      console.error('Students fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, classFilter]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = allStudents; // Now matches server response
  const paginated = allStudents; // Server already sent current page

  const handleDelete = async (rawId, displayId) => {
    if (!window.confirm(`Delete student ${displayId}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admissions/${rawId}`);
      setAllStudents(prev => prev.filter(s => s.rawId !== rawId));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleView = (row) => { setViewData(row); setIsViewModalOpen(true); };
  const handleEdit = (row) => { setViewData(row); setIsEditModalOpen(true); };
  const handleIDCard = (row) => {
    // Transform Students row to match IDCardModal expectation if needed
    setIdCardData({
      ...row,
      studentName: row.name,
      student_photo: row.student_photo // IDCardModal uses this
    });
    setIsIDCardModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Gender', 'Father Name', 'Class', 'Roll', 'Phone', 'Status'];
    const rows = filtered.map(s => [s.id, s.name, s.gender, s.fatherName, s.className, s.roll, s.phone, s.status]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Students Directory</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">
            {loading ? 'Loading...' : `${filtered.length} students found`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchStudents} disabled={loading} className="flex items-center space-x-1.5 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-md transition-colors text-xs font-bold shadow-sm h-9 disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-md transition-colors text-xs font-bold shadow-sm h-9">
            <Download size={14} strokeWidth={2.5} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors">
        
        {/* Toolbar */}
        <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 transition-colors bg-[var(--bg-panel-alt)] rounded-t-md">
           <div className="relative flex items-center">
             <div className="absolute left-3">
               <Search size={14} className="text-[#64748b]" strokeWidth={2.5} />
             </div>
             <input 
               type="text" 
               placeholder="Search Name, ID or Phone..." 
               value={search}
               onChange={e => { setSearch(e.target.value); setPage(1); }}
               className="w-[280px] h-9 pl-9 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm dark:shadow-none"
             />
           </div>

           <div className="flex items-center rounded border border-[var(--border-color)] dark:border-[#334155] overflow-hidden h-9 bg-[var(--bg-panel-alt)] shadow-sm dark:shadow-none">
              <div className="bg-gray-100 dark:bg-[#1E293B] h-full px-4 flex items-center justify-center border-r border-[var(--border-color)] dark:border-r-[#334155] transition-colors">
                 <span className="text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] tracking-widest uppercase">Class</span>
              </div>
              <div className="relative h-full bg-transparent transition-colors">
                <select 
                  value={classFilter}
                  onChange={e => { setClassFilter(e.target.value); setPage(1); }}
                  className="h-full pl-3 pr-6 bg-transparent text-[var(--text-primary)] text-[11px] font-bold focus:outline-none appearance-none cursor-pointer"
                >
                   <option value="All">All</option>
                   {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-white flex items-center justify-center">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 size={28} className="animate-spin text-[#0ea5e9]" />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Students...</p>
              </div>
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10 w-full">
              <tr className="border-y border-[var(--border-color)] dark:border-[#334155] transition-colors relative">
                <th className="px-2 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap pl-4">Student ID</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Full Name</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Father Name</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Class & Roll</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Phone No</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 text-sm font-bold">
                    {search || classFilter !== 'All' ? 'No students match your search.' : 'No students found in database.'}
                  </td>
                </tr>
              ) : paginated.map((row) => (
                <tr key={row.rawId} className="border-b border-gray-200 dark:border-[#334155] hover:bg-white/5 dark:hover:bg-[#151c2e] transition-colors group">
                  <td className="px-2 py-2 pl-4 text-[11px] font-bold text-[#0ea5e9] whitespace-nowrap cursor-pointer hover:underline">{row.id}</td>
                  <td className="px-5 py-2 whitespace-nowrap">
                     <div className="flex items-center space-x-2">
                        <img src={row.avatar} alt={row.name} className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-[#334155]" onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&size=50&background=1e293b&color=a2a9b5&bold=true`; }} />
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-[var(--text-primary)]">{row.name}</span>
                           <span className="text-[8px] font-bold text-[#64748b] tracking-widest uppercase mt-0.5">{row.gender}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-5 py-2 text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{row.fatherName}</td>
                  <td className="px-5 py-2 whitespace-nowrap">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{row.className}</span>
                    <span className="block text-[8px] font-bold text-[#64748b] tracking-widest uppercase mt-0.5">ROLL: {row.roll}</span>
                  </td>
                  <td className="px-5 py-2 text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{row.phone}</td>
                  <td className="px-5 py-2 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest transition-colors ${
                      row.status === 'Approved'
                        ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-[#14532d]/40 dark:border-[#166534]/80 dark:text-[#4ade80]'
                        : row.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-800 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400'
                    }`}>{row.status?.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-2 whitespace-nowrap">
                     <div className="flex items-center justify-end space-x-1.5">
                        <button onClick={() => handleIDCard(row)} title="Generate ID Card" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#d946ef] text-[#d946ef] hover:bg-[#d946ef]/10 transition-colors shadow-sm"><CreditCard size={10} strokeWidth={2.5}/></button>
                        <button onClick={() => handleView(row)} title="View" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors shadow-sm"><Eye size={10} strokeWidth={2.5}/></button>
                        <button onClick={() => handleEdit(row)} title="Edit" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-colors shadow-sm"><Edit size={10} strokeWidth={2.5}/></button>
                        <button onClick={() => handleDelete(row.rawId, row.id)} title="Delete" className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors shadow-sm"><Trash2 size={10} strokeWidth={2.5}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-panel-alt)] flex items-center justify-between shrink-0 transition-colors rounded-b-md">
            <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center space-x-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1E293B] shadow-sm transition-colors disabled:opacity-50"><ChevronLeft size={14}/></button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pg = i + 1;
                  return <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 flex items-center justify-center rounded text-[11px] font-bold shadow-sm transition-colors ${pg === page ? 'bg-[#65a30d] text-white' : 'bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1E293B]'}`}>{pg}</button>;
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1E293B] shadow-sm transition-colors disabled:opacity-50"><ChevronRight size={14}/></button>
            </div>
        </div>

        <EditStudentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} data={viewData} onSaved={fetchStudents} />
        <ViewStudentModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} data={viewData} />
        <IDCardModal isOpen={isIDCardModalOpen} onClose={() => setIsIDCardModalOpen(false)} data={idCardData} />
      </div>
    </div>
  );
};

export default Students;
