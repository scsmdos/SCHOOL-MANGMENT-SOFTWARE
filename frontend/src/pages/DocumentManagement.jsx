import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Upload,
  Download,
  Plus,
  Eye,
  Trash2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  FileCheck,
  FileClock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Calendar,
  Paperclip,
  User,
  Trash,
  RefreshCw,
  Users
} from 'lucide-react';

import api from '../api/axios';

/* ── Sample Data ── */


const DOC_TYPES = ['Aadhar Card', 'Birth Certificate', 'Transfer Certificate', 'Previous Marksheet', 'Income Certificate', 'Address Proof', 'Photo'];

const DocumentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const studRes = await api.get('/admissions');
      const docRes = await api.get('/student-documents');
      
      const allStuds = studRes.data?.data ?? studRes.data ?? [];
      const allDocs = docRes.data?.data ?? docRes.data ?? [];

      const list = allStuds.map(s => ({
        id: s.id,
        name: s.student_name ?? 'Student',
        avatar: (s.student_name ?? 'S').charAt(0).toUpperCase(),
        admNo: s.admission_no ?? `ADM-${s.id}`,
        class: s.admitted_into_class ?? 'N/A',
        docs: allDocs
          .filter(d => String(d.student_id) === String(s.id))
          .map(d => ({
            id: d.id,
            type: d.document_type ?? 'Other',
            title: d.document_name ?? 'Doc',
            size: d.file_size ?? '0 KB',
            expiry: d.expiry_date ?? '-',
            status: d.status ?? 'Pending',
            path: d.file_path 
              ? (d.file_path.startsWith('http') ? d.file_path : `http://localhost:8000${d.file_path.startsWith('/') ? '' : '/'}${d.file_path}`)
              : null
          }))
      }));
      setStudents(list);
    } catch (err) {
      console.error('Documents fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);
  
  // Modal states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const currentStudent = students.find(s => s.id === selectedStudentId);

  /* ── Filtered Data ── */
  const filteredData = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.admNo.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalDocs = students.reduce((acc, s) => acc + s.docs.length, 0);
  const verifiedDocs = students.reduce((acc, s) => acc + s.docs.filter(d => d.status === 'Verified').length, 0);
  const pendingDocs = totalDocs - verifiedDocs;

  /* ── Handlers ── */
  const handleDeleteDoc = async (studentId, docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/student-documents/${docId}`);
      fetchDocs();
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  const handleToggleVerify = async (studentId, docId) => {
    try {
      const student = students.find(s => s.id === studentId);
      const doc = student.docs.find(d => d.id === docId);
      const newStatus = doc.status === 'Verified' ? 'Pending' : 'Verified';
      await api.put(`/student-documents/${docId}`, { status: newStatus });
      fetchDocs();
    } catch (e) { alert('Verify failed: ' + e.message); }
  };

  const handleUploadDocs = async (studentId, rawRows) => {
    setLoading(true);
    try {
      const student = students.find(s => s.id === studentId);
      for (const row of rawRows) {
        const fd = new FormData();
        fd.append('student_id', studentId);
        fd.append('student_name', student.name);
        fd.append('admission_no', student.admNo);
        fd.append('class', student.class);
        fd.append('document_type', row.type);
        fd.append('document_name', row.name);
        fd.append('expiry_date', row.expiry);
        fd.append('remarks', row.remarks);
        fd.append('file_path', row.file); // Backend handles file upload for 'file_path'
        fd.append('file_size', `${(row.file.size/1024).toFixed(1)} KB`);
        fd.append('status', 'Pending');

        await api.post('/student-documents', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      alert('Documents uploaded successfully!');
      fetchDocs();
      setIsUploadOpen(false);
    } catch (e) {
      alert('Upload failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Document Management</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase opacity-70">Student-wise Document Repository & Verification</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchDocs} disabled={loading} className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={`text-indigo-500 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm">
            <Download size={13} strokeWidth={2.5} className="text-[#6366f1]" /><span>Export CSV</span>
          </button>
          <button onClick={() => setIsUploadOpen(true)} className="flex items-center justify-center space-x-2 h-9 px-4 rounded-md bg-[#f59e0b] hover:bg-[#d97706] text-white text-[11px] font-extrabold shadow-sm transition-colors min-w-[150px]">
            <Upload size={14} strokeWidth={3} /><span>Upload Documents</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Docs" value={loading ? '...' : totalDocs} icon={FileText} color="text-blue-500" bg="bg-blue-500/10 dark:bg-blue-500/20" border="border-blue-200 dark:border-blue-900/50" />
        <StatCard label="Verified" value={loading ? '...' : verifiedDocs} icon={FileCheck} color="text-emerald-500" bg="bg-emerald-500/10 dark:bg-emerald-500/20" border="border-emerald-200 dark:border-emerald-900/50" />
        <StatCard label="Pending" value={loading ? '...' : pendingDocs} icon={FileClock} color="text-amber-500" bg="bg-amber-500/10 dark:bg-amber-500/20" border="border-amber-200 dark:border-amber-900/50" />
        <StatCard label="Students" value={loading ? '...' : students.length} icon={Users} color="text-purple-500" bg="bg-purple-500/10 dark:bg-purple-500/20" border="border-purple-200 dark:border-purple-900/50" />
      </div>

      {/* Main Panel */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px]">
             <div className="flex flex-col items-center space-y-3">
               <RefreshCw size={28} className="animate-spin text-indigo-500" />
               <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Accessing Repository...</p>
             </div>
          </div>
        )}
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] shrink-0">
          <div className="flex items-center space-x-4">
             <div className="relative group">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#6366f1] transition-colors" strokeWidth={2.5} />
                <input type="text" placeholder="Search student name or doc type..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-[300px] h-8 pl-8 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm" />
             </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-8 px-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] cursor-pointer shadow-sm">
              <option>All</option>
              <option>Pending</option>
              <option>Verified</option>
            </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
              <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left w-12">#</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">STUDENT</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">ADM. NO</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">CLASS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">TOTAL DOCS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">STATUS</th>
                <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right px-8">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((s, idx) => {
                const pendingCount = s.docs.filter(d => d.status === 'Pending').length;
                return (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/50 transition-colors">
                    <td className="px-5 py-1.5 text-[11px] font-black text-[#6366f1]">{idx + 1}</td>
                    <td className="px-5 py-1.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[#6366f1] text-[10px] font-black shadow-sm">{s.avatar}</div>
                        <div>
                          <p className="text-[12px] font-bold text-[var(--text-primary)] leading-tight">{s.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.class}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-1.5 text-[11px] font-bold text-[#6366f1] tracking-tight">{s.admNo}</td>
                    <td className="px-5 py-1.5 text-[11px] font-black text-[var(--text-primary)]">{s.class}</td>
                    <td className="px-5 py-1.5 text-center">
                      <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded border border-blue-500/20 text-[10px] font-black">
                        <FolderOpen size={10} />
                        <span>{s.docs.length}</span>
                      </div>
                    </td>
                    <td className="px-5 py-1.5 text-center">
                      <div className="flex justify-center">
                        {pendingCount > 0 ? (
                          <span className="w-[100px] py-0.5 text-[9px] font-black rounded border border-amber-200 bg-amber-50 dark:bg-amber-900/20 text-amber-600 uppercase tracking-widest text-center">{pendingCount} Pending</span>
                        ) : (
                          <span className="w-[100px] py-0.5 text-[9px] font-black rounded border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 uppercase tracking-widest flex items-center justify-center space-x-1"><CheckCircle2 size={10} /> <span>All Done</span></span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-1.5 text-right px-8">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button onClick={() => { setSelectedStudentId(s.id); setIsViewOpen(true); }} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><FolderOpen size={12} strokeWidth={2.5} /></button>
                        <button onClick={() => { setSelectedStudentId(s.id); setIsUploadOpen(true); }} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"><Plus size={12} strokeWidth={2.5} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] flex items-center justify-between shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredData.length} Student · {totalDocs} Total Documents</p>
          <div className="flex items-center space-x-1">
            <button className="w-7 h-7 rounded border border-gray-200 dark:border-[#334155] flex items-center justify-center text-gray-400 hover:bg-[#6366f1] hover:text-white transition-all"><ChevronLeft size={14} /></button>
            <button className="w-7 h-7 rounded bg-[#6366f1] text-white flex items-center justify-center text-[10px] font-black shadow-sm">1</button>
            <button className="w-7 h-7 rounded border border-gray-200 dark:border-[#334155] flex items-center justify-center text-gray-400 hover:bg-[#6366f1] hover:text-white transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* View Documents Modal */}
      {isViewOpen && currentStudent && (
        <ViewModal 
          isOpen={isViewOpen} 
          onClose={() => setIsViewOpen(false)} 
          student={currentStudent} 
          onDelete={(docId) => handleDeleteDoc(currentStudent.id, docId)}
          onToggleVerify={(docId) => handleToggleVerify(currentStudent.id, docId)}
          setPreviewDoc={setPreviewDoc}
          setIsPreviewOpen={setIsPreviewOpen}
        />
      )}

      {/* Upload Documents Modal */}
      {isUploadOpen && (
        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
          students={students}
          selectedStudentId={currentStudent?.id}
          onUpload={(studentId, newDocs) => handleUploadDocs(studentId, newDocs)}
        />
      )}
      {/* Document Preview Modal */}
      {isPreviewOpen && previewDoc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="relative w-full max-w-[800px] h-[80vh] bg-[#1a2234] rounded-xl shadow-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in duration-200">
             <div className="px-6 py-4 border-b border-white/5 bg-[#1e293b]/80 flex items-center justify-between">
                <div>
                   <h3 className="text-[14px] font-black text-white uppercase tracking-widest">{previewDoc.title}</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{previewDoc.type}</p>
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500 transition-all text-white">
                  <X size={18} strokeWidth={3} />
                </button>
             </div>
             <div className="flex-1 bg-black/40 flex items-center justify-center p-4 overflow-auto">
              {previewDoc.path ? (
                <div className="max-w-full max-h-full">
                  {previewDoc.path.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                    <img src={previewDoc.path} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-white/10" />
                  ) : (
                    <div className="text-center text-white">
                      <FileText size={80} className="mx-auto mb-4 text-[#6366f1]/50" />
                      <p className="text-[14px] font-black uppercase tracking-widest">Document: {previewDoc.title}</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{previewDoc.type} · No Visual Preview Available</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <FileText size={100} className="text-[#6366f1]/20 mx-auto mb-6" />
                  <p className="text-white font-black text-2xl uppercase tracking-[0.2em] opacity-80">Document Preview</p>
                  <p className="text-gray-500 text-[12px] font-bold mt-2 uppercase tracking-widest">{previewDoc.title} · File Protected</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-[#1a2234] flex space-x-4 justify-center shrink-0">
              <a href={previewDoc.path} download target="_blank" rel="noreferrer" className="px-8 py-2.5 bg-[#6366f1] text-white rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-[#6366f1]/20 border border-white/5 flex items-center">
                <Download size={16} className="mr-3" /> Download File
              </a>
              <button onClick={() => setIsPreviewOpen(false)} className="px-8 py-3 bg-white/5 text-white rounded-xl text-[12px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/* ── STAT CARD COMPONENT ── */
const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
  <div className={`bg-[var(--bg-panel-alt)] border ${border} rounded-lg p-4 shadow-sm flex items-center justify-between transition-all hover:translate-y-[-2px] overflow-hidden relative group`}>
    <div className="z-10">
      <p className="text-[10px] font-extrabold text-[#94a3b8] uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-[24px] font-black ${color} leading-none tracking-tight`}>{value}</p>
    </div>
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${bg} ${color} z-10 transition-transform group-hover:scale-110 shadow-sm`}><Icon size={20} strokeWidth={2.5} /></div>
    <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] ${color} rotate-12 group-hover:opacity-[0.06] transition-opacity`} />
  </div>
);

/* ── VIEW MODAL COMPONENT (Screenshot 1) ── */
const ViewModal = ({ isOpen, onClose, student, onDelete, onToggleVerify, setPreviewDoc, setIsPreviewOpen }) => {
  const verifiedCount = student.docs.filter(d => d.status === 'Verified').length;
  const pendingCount = student.docs.filter(d => d.status === 'Pending').length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-[850px] bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1e293b]/50">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-full bg-[#f59e0b] shadow-lg flex items-center justify-center text-white text-[18px] font-black">{student.avatar}</div>
            <div>
              <h3 className="text-[17px] font-black uppercase tracking-[0.05em] text-[var(--text-primary)]">{student.name}</h3>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{student.admNo} · CLASS: {student.class}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-[#f59e0b] text-white px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider shadow-md">{student.docs.length} DOCUMENTS</div>
             <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white transition-all focus:outline-none border border-transparent dark:border-white/5"><X size={18} strokeWidth={3} /></button>
          </div>
        </div>

        {/* Modal Body - Doc List */}
        <div className="p-8 max-h-[360px] overflow-y-auto custom-scrollbar space-y-3 bg-white dark:bg-[#0f172a]">
          {student.docs.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center opacity-40">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                 <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">No Records Found</p>
              <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Awaiting document submission</p>
            </div>
          ) : (
            student.docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3.5 px-5 bg-gray-50 dark:bg-[#151c2e] rounded-xl border border-gray-200 dark:border-white/5 hover:border-[#6366f1]/30 transition-all shadow-sm group">
                <div className="flex items-center space-x-5">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 group-hover:scale-105 transition-transform">
                    <FileText size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-black text-[var(--text-primary)] tracking-tight mb-0.5">{doc.title}</p>
                    <div className="flex items-center space-x-3 text-[9.5px] font-bold uppercase tracking-widest">
                       <span className="text-slate-500">{doc.type}</span>
                       <span className="text-slate-400 opacity-30">|</span>
                       <span className="text-slate-500">{doc.size}</span>
                       {doc.expiry !== '-' && (
                         <>
                            <span className="text-slate-400 opacity-30">|</span>
                            <span className="text-orange-500/80">Exp: {doc.expiry}</span>
                         </>
                       )}
                       <span className="ml-1 italic text-slate-400 font-medium normal-case opacity-70">Ok</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {doc.status === 'Verified' ? (
                     <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest shadow-sm">
                        <CheckCircle2 size={12} strokeWidth={3} />
                        <span>VERIFIED</span>
                     </div>
                  ) : (
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest shadow-sm">
                        <FileClock size={12} strokeWidth={3} />
                        <span>PENDING</span>
                     </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <button onClick={() => { setPreviewDoc(doc); setIsPreviewOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="View"><Eye size={14} strokeWidth={2.5} /></button>
                    {doc.status === 'Verified' ? (
                      <button onClick={() => onToggleVerify(doc.id)} className="px-4 h-8 bg-white dark:bg-[#1e293b] text-orange-500 dark:text-orange-400 rounded-lg border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-sm">UNDO</button>
                    ) : (
                      <button onClick={() => onToggleVerify(doc.id)} className="px-5 h-8 bg-[#10b981] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all shadow-sm shadow-emerald-500/10 active:scale-95">VERIFY</button>
                    )}
                    <button onClick={() => onDelete(doc.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Delete"><Trash2 size={14} strokeWidth={2.5} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1e293b]/50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">{verifiedCount} Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw size={14} className="text-amber-500" />
              <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">{pendingCount} Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle size={14} className="text-rose-500" />
              <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest">{student.docs.length - (verifiedCount + pendingCount)} Rejected</span>
            </div>
          </div>
          <button onClick={onClose} className="px-10 py-2.5 bg-[#1a2234] hover:bg-[#0f172a] text-white rounded-lg text-[11px] font-black uppercase tracking-widest border border-white/5 transition-all shadow-lg active:scale-95">CLOSE</button>
        </div>
      </div>
    </div>
  );
};

/* ── UPLOAD MODAL COMPONENT (Screenshot 2) ── */
const UploadModal = ({ isOpen, onClose, students, selectedStudentId, onUpload }) => {
  const [studentId, setStudentId] = useState(selectedStudentId || (students.length > 0 ? students[0].id : 0));
  const [rows, setRows] = useState([{ id: Date.now(), type: 'Select Type', name: '', expiry: '', remarks: '', file: null }]);

  const selectedStudent = students.find(s => s.id === parseInt(studentId));

  const addRow = () => {
    setRows([...rows, { id: Date.now(), type: 'Select Type', name: '', expiry: '', remarks: '', file: null }]);
  };

  const removeRow = (id) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleFinalUpload = () => {
    const validRows = rows.filter(r => r.name && r.file);
    if (validRows.length === 0) {
      alert("Please fill name and attach files for at least one record.");
      return;
    }
    onUpload(parseInt(studentId), validRows);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-[850px] bg-white dark:bg-[#0f172a] rounded-xl shadow-3xl border border-gray-200 dark:border-white/5 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#171e2e] shrink-0">
          <div className="flex items-center space-x-3 text-orange-500 dark:text-orange-400">
            <div className="bg-orange-500/15 p-2 rounded-lg shadow-sm"><Upload size={18} strokeWidth={3} /></div>
            <h3 className="text-[14px] font-black uppercase tracking-[0.1em] text-[var(--text-primary)] dark:text-white">UPLOAD DOCUMENTS FOR STUDENT</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-rose-500 hover:text-white border border-gray-300 dark:border-white/5 transition-all focus:outline-none"><X size={15} strokeWidth={3} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 bg-white dark:bg-[#111827]">
          
          {/* STEP 1 */}
          <section className="space-y-4">
             <div className="flex items-center space-x-2">
                <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                <h4 className="text-[9px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">STEP 1 — SELECT STUDENT</h4>
                <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
             </div>
             
             <div className="p-4 bg-gray-50 dark:bg-[#1e293b]/30 rounded-xl border border-gray-100 dark:border-white/5 space-y-3">
                <select value={studentId} onChange={e => setStudentId(e.target.value)}
                  className="w-full h-9 px-4 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-lg text-[12px] font-black text-[var(--text-primary)] dark:text-white focus:outline-none focus:border-orange-500 transition-all shadow-inner">
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} | {s.admNo} | Class: {s.class}</option>)}
                </select>
                
                {selectedStudent && (
                  <div className="flex items-center space-x-3 p-2 bg-white/40 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-left duration-300">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-[12px] font-black shadow-lg">{selectedStudent.avatar}</div>
                    <div>
                      <p className="text-[12px] font-black text-[var(--text-primary)] dark:text-white">{selectedStudent.name}</p>
                      <p className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">{selectedStudent.admNo} - Class {selectedStudent.class}</p>
                    </div>
                  </div>
                )}
             </div>
          </section>

          {/* STEP 2 */}
          <section className="space-y-4 pb-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                  <h4 className="text-[9px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">STEP 2 — ADD DOCUMENTS</h4>
                  <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                </div>
                <button onClick={addRow} className="ml-4 flex items-center space-x-2 px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-500/20 transition-all shadow-sm">
                  <Plus size={14} strokeWidth={3} /><span>ADD ROW</span>
                </button>
             </div>

             <div className="space-y-4">
                {rows.map((row, index) => (
                  <div key={row.id} className="p-4 bg-gray-50 dark:bg-[#1e293b]/30 rounded-xl border border-gray-100 dark:border-white/5 relative group animate-in slide-in-from-bottom duration-300">
                     {rows.length > 1 && (
                       <button onClick={() => removeRow(row.id)} className="absolute -right-2 -top-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all opacity-0 group-hover:opacity-100"><Trash size={12} strokeWidth={3} /></button>
                     )}
                     
                     <div className="mb-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-[0.2em]">DOCUMENT #{index + 1}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1">DOC TYPE *</label>
                           <select value={row.type} onChange={e => updateRow(row.id, 'type', e.target.value)}
                             className="w-full h-9 px-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] dark:text-white focus:outline-none focus:border-orange-500/50 transition-all">
                             <option>Select Type</option>
                             {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1">DOC NAME *</label>
                           <input value={row.name} onChange={e => updateRow(row.id, 'name', e.target.value)}
                             placeholder="e.g. Rahul_Aadhaar" className="w-full h-9 px-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1">EXPIRY DATE</label>
                           <div className="relative">
                              <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input type="date" value={row.expiry} onChange={e => updateRow(row.id, 'expiry', e.target.value)}
                                className="w-full h-9 px-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] dark:text-white focus:outline-none focus:border-orange-500/50 transition-all uppercase" />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1">ATTACH FILE (PDF/IMAGE)</label>
                           <div className="relative group/upload">
                              <input type="file" onChange={e => updateRow(row.id, 'file', e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                              <div className="w-full h-9 px-3 bg-white dark:bg-[#0f172a] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg flex items-center justify-between group-hover/upload:border-orange-500/30 transition-all">
                                 <span className="text-[9px] font-bold text-gray-500 dark:text-slate-500 truncate max-w-[80%] uppercase tracking-widest">{row.file ? row.file.name : 'Click to attach...'}</span>
                                 <Paperclip size={13} className="text-slate-500 group-hover/upload:text-orange-400" />
                              </div>
                           </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                           <label className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1">REMARKS</label>
                           <textarea value={row.remarks} onChange={e => updateRow(row.id, 'remarks', e.target.value)}
                             placeholder="Optional note..." rows="1" className="w-full h-9 px-3 py-2 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none"></textarea>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#171e2e] flex items-center justify-end space-x-3 shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-[var(--text-primary)] dark:text-white rounded-lg text-[11px] font-black uppercase tracking-widest border border-gray-300 dark:border-white/5 transition-all">CANCEL</button>
          <button onClick={handleFinalUpload} className="flex items-center space-x-2 px-8 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white dark:text-[#0f172a] hover:dark:text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/10 transition-all">
            <Upload size={14} strokeWidth={3} /><span>UPLOAD {rows.filter(r => r.name && r.file).length} DOC(S)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
