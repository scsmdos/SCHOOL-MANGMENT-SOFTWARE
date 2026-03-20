import React, { useState, useEffect, useCallback } from 'react';
import { Download, UserPlus, UserSquare2, CheckCircle2, Clock, XOctagon, Search, Eye, Edit, Trash2, RefreshCw, Loader2, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import AdmissionFormModal from '../components/AdmissionFormModal';
import ViewAdmissionModal from '../components/ViewAdmissionModal';
import IDCardModal from '../components/IDCardModal';
import api from '../api/axios';

const PAGE_SIZE = 15;
const Admissions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isIDCardModalOpen, setIsIDCardModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [idCardData, setIdCardData] = useState(null);
  const [admissionsList, setAdmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0, total: 0 });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        per_page: PAGE_SIZE,
        search: debouncedSearch,
      };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).toLowerCase();
      }

      const res = await api.get('/admissions', { params });
      
      const payload = res.data?.data ?? [];
      const list = payload.map(a => ({
        ...a,
        id: a.admission_no ?? `ADM-${a.id}`,
        rawId: a.id,
        studentName: a.student_name ?? 'N/A',
        fatherName: a.father_name ?? 'N/A',
        className: a.admitted_into_class ?? 'N/A',
        contactNo: a.contact_no ?? 'N/A',
        date: a.created_at ? a.created_at.split('T')[0] : 'N/A',
        status: a.status ?? 'Pending',
        student_photo: a.student_photo ?? null,
        parent_photo: a.parent_photo ?? null,
        parent_email: a.parent_email ?? null,
      }));
      setAdmissionsList(list);
      setTotalPages(res.data?.last_page ?? 1);
      setTotalEntries(res.data?.total || list.length);

      // Stats should ideally come from a separate count query or dashboard-stats
      // For now, we fetch a small summary for the cards if it's the first load or stats are 0
      // Fetch detailed stats for cards
      const statsRes = await api.get('/dashboard-stats');
      if (statsRes.data?.stats) {
        setStats({
          approved: statsRes.data.stats.approvedAdmissions || 0,
          pending: statsRes.data.stats.pendingAdmissions || 0,
          rejected: statsRes.data.stats.rejectedAdmissions || 0,
          total: statsRes.data.stats.totalAdmissions || 0,
        });
      }
    } catch (err) {
      console.error('Admissions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const handleView = (row) => { setViewData(row); setIsViewModalOpen(true); };
  const handleEdit = (row) => { setEditData(row); setIsModalOpen(true); };
  const handleIDCard = (row) => { setIdCardData(row); setIsIDCardModalOpen(true); };

  const handleDelete = async (rawId, displayId) => {
    if (!window.confirm(`Are you sure you want to permanently delete admission ${displayId}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admissions/${rawId}`);
      await fetchAdmissions(); // Refresh list and counts
      toast.success('Admission record deleted permanently');
    } catch (err) {
      toast.error('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (rawId, newStatus) => {
    try {
      if (newStatus === 'Rejected') {
        if (!window.confirm('Are you sure you want to completely reject and PERMANENTLY DELETE this admission entry?')) return;
        await api.delete(`/admissions/${rawId}`);
        await fetchAdmissions();
        toast.success('Admission rejected and permanently deleted.');
      } else {
        await api.put(`/admissions/${rawId}`, { status: newStatus });
        await fetchAdmissions();
        if (newStatus === 'Approved') toast.success('Admission approved successfully!');
        else toast.success(`Status updated to ${newStatus}`);
      }

      // Automatically close modal after any action
      setViewData(null);
      setIsViewModalOpen(false);

    } catch (err) {
      toast.error('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCSV = () => {
    if (admissionsList.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Admin No', 'Student Name', 'Father Name', 'Class', 'Contact No', 'Admission Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...admissionsList.map(row => [
        `"${row.id}"`,
        `"${row.studentName}"`,
        `"${row.fatherName}"`,
        `"${row.className}"`,
        `"${row.contactNo}"`,
        `"${row.date}"`,
        `"${row.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported successfully!');
  };

  const filtered = admissionsList; // Server handled it
  const paginated = admissionsList; 

  const totalApproved = stats.approved;
  const totalPending = stats.pending;
  const totalAdmissions = stats.total;

  return (
    <div className="p-6 bg-[var(--bg-main)] h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Admissions Desk</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">
            {loading ? 'Loading...' : `${totalEntries} admissions found`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* SEARCH BAR */}
          <div className="relative flex items-center mr-2">
            <div className="absolute left-3">
               <Search size={14} className="text-[#64748b]" strokeWidth={2.5} />
            </div>
            <input 
              type="text" 
              placeholder="Search applicant name or Admin No..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-[280px] h-9 pl-9 pr-3 bg-transparent border border-[var(--border-color)] dark:border-[#334155] dark:bg-[#10162A] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] transition-colors"
            />
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-md transition-colors text-xs font-bold shadow-sm h-9"
          >
            <Download size={14} strokeWidth={2.5} />
            <span>Export CSV</span>
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-[#06b6d4] hover:bg-[#0891b2] text-white px-4 py-2 rounded-md transition-colors text-xs font-bold shadow-sm h-9"
          >
            <UserPlus size={14} strokeWidth={2.5} />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid - Exact Colors & Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
        
        {/* Total Admissions */}
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] border-l-2 border-l-[#0ea5e9] rounded-md p-5 flex flex-col justify-between shadow-sm h-[90px]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Total Admissions</p>
            <div className="w-5 h-5 rounded-full bg-[#0369a1]/30 flex items-center justify-center text-[#38bdf8]">
               <UserSquare2 size={12} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none tracking-tight">{totalAdmissions}</h3>
        </div>

        {/* Approved */}
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] border-l-2 border-l-[#22c55e] rounded-md p-5 flex flex-col justify-between shadow-sm h-[90px]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Approved</p>
            <div className="w-5 h-5 rounded-full bg-[#14532d]/40 flex items-center justify-center text-[#4ade80]">
               <CheckCircle2 size={12} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none tracking-tight">{totalApproved}</h3>
        </div>

        {/* Pending Review */}
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] border-l-2 border-l-[#f59e0b] rounded-md p-5 flex flex-col justify-between shadow-sm h-[90px]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Pending Review</p>
            <div className="w-5 h-5 rounded-full bg-[#78350f]/40 flex items-center justify-center text-[#fbbf24]">
               <Clock size={12} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none tracking-tight">{totalPending}</h3>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 size={28} className="animate-spin text-[#06b6d4]" />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Admissions...</p>
              </div>
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
              <tr className="border-y border-gray-200 dark:border-[#334155] transition-colors relative">
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Admin No</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Student Name</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Father's Name</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Class</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Contact No</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Admission Date</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-slate-400 text-sm font-bold">No admissions found.</td></tr>
              ) : paginated.map((row) => (
                <tr key={row.rawId} className="border-b border-gray-200 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#151c2e] transition-colors">
                  <td className="px-5 py-2 text-xs font-bold text-[#38bdf8] whitespace-nowrap">{row.id}</td>
                  <td className="px-5 py-2 text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{row.studentName}</td>
                  <td className="px-5 py-2 text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{row.fatherName}</td>
                  <td className="px-5 py-2 text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">{row.className}</td>
                  <td className="px-5 py-2 text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{row.contactNo}</td>
                  <td className="px-5 py-2 text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{row.date}</td>
                  <td className="px-5 py-2 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest ${
                      row.status === 'Approved' ? 'bg-green-100 border border-green-300 text-green-700 dark:bg-[#14532d]/40 dark:border-[#166534]/50 dark:text-[#4ade80]'
                      : row.status === 'Pending' ? 'bg-yellow-100 border border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400'
                    }`}>{row.status?.toUpperCase()}</span>
                  </td>
                    <td className="px-5 py-2 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {row.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(row.rawId, 'Approved')} 
                              title="Approve" 
                              className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors shadow-sm"
                            >
                              <CheckCircle2 size={10} strokeWidth={2.5}/>
                            </button>
                            <button 
                              onClick={() => handleStatusChange(row.rawId, 'Rejected')} 
                              title="Reject" 
                              className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors shadow-sm"
                            >
                              <XOctagon size={10} strokeWidth={2.5}/>
                            </button>
                          </>
                        )}
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

        {/* Footer Pagination */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-panel-alt)] flex items-center justify-between shrink-0 rounded-b-md">
          <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{filtered.length} entries • Page {page}/{totalPages}</span>
          <div className="flex items-center space-x-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] disabled:opacity-50"><ChevronLeft size={14}/></button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => { const pg = i + 1; return <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 flex items-center justify-center rounded text-[11px] font-bold ${pg === page ? 'bg-[#06b6d4] text-white' : 'bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)]'}`}>{pg}</button>; })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#10162A] border border-[var(--border-color)] text-[var(--text-primary)] disabled:opacity-50"><ChevronRight size={14}/></button>
          </div>
        </div>

      </div>

      {/* Render the modals */}
      <AdmissionFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditData(null); }} 
        onSuccess={() => { setIsModalOpen(false); setEditData(null); fetchAdmissions(); }}
        editData={editData}
      />
      
      <ViewAdmissionModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        data={viewData}
        onStatusChange={handleStatusChange}
      />

      <IDCardModal 
        isOpen={isIDCardModalOpen}
        onClose={() => setIsIDCardModalOpen(false)}
        data={idCardData}
      />

    </div>
  );
};

export default Admissions;
