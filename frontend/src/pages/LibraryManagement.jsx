import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Book,
  Search,
  Plus,
  Download,
  BookOpen,
  Clock,
  Video,
  Edit,
  Trash2,
  Scan,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Hash,
  User,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  PlayCircle,
  ArrowRight,
  X,
  Calendar,
  Layers as CategoryIcon,
  Tag,
  Hash as ISBNIcon,
  Archive,
  UserCheck,
  Send,
  History,
  FileUp,
  Monitor,
  Share2,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';

/* ── Sample Library Data ── */
const INITIAL_BOOKS = [
  {
    id: 'MATH-001',
    title: 'Advanced Calculus',
    author: 'Guddu Kumar',
    category: 'Mathematics',
    shelf: '12-A',
    totalCopies: 20,
    availableUnits: 15,
    isbn: 'ISBN-90921-22',
    publisher: 'Science Press',
    status: 'Available'
  },
  {
    id: 'SCI-102',
    title: 'Organic Chemistry',
    author: 'Dr. R.K. Sharma',
    category: 'Science',
    shelf: '08-B',
    totalCopies: 15,
    availableUnits: 12,
    isbn: 'ISBN-88211-45',
    publisher: 'Elite Pub',
    status: 'Limited'
  },
  {
    id: 'HIST-505',
    title: 'Modern World History',
    author: 'Amit Singh',
    category: 'History',
    shelf: '04-C',
    totalCopies: 10,
    availableUnits: 10,
    isbn: 'ISBN-77211-99',
    publisher: 'Heritage Books',
    status: 'Available'
  }
];

const INITIAL_CIRCULATION = [
  {
    id: 'ISS-9385',
    bookId: 'MATH-002',
    bookTitle: 'Unknown Book',
    issuedTo: 'Krish Kumar',
    role: 'STUDENT',
    outDate: '2026-02-28',
    dueDate: '2026-03-05',
    status: 'OVERDUE',
    overdueDays: 12
  },
  {
    id: 'ISS-5965',
    bookId: 'MATH-002',
    bookTitle: 'Unknown Book',
    issuedTo: 'Krish Kumar',
    role: 'STUDENT',
    outDate: '2026-02-28',
    dueDate: '2026-03-26',
    returnDate: '2026-03-01',
    status: 'RETURNED'
  }
];

const INITIAL_MEDIA = [
  {
    id: 'RES-01',
    title: 'Intro to Quantum Physics',
    type: 'Video Lecture',
    format: 'MP4',
    size: '1.2 GB',
    addedDate: '2026-03-10'
  },
  {
    id: 'RES-02',
    title: 'Mathematics Formula Sheet',
    type: 'Document',
    format: 'PDF',
    size: '450 KB',
    addedDate: '2026-03-12'
  }
];

const LibraryManagement = () => {
  const [activeTab, setActiveTab] = useState('Catalog');
  const [books, setBooks] = useState([]);
  const [circulation, setCirculation] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'addBook', 'issueBook', 'addMedia'
  const [currentEdit, setCurrentEdit] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, circRes, medRes] = await Promise.all([
        api.get('/library-books'),
        api.get('/library-issuances'),
        api.get('/library-digital-assets')
      ]);

      const allBooks = (bookRes.data?.data ?? bookRes.data ?? []).map(b => ({
        id: b.book_id ?? `BK-${b.id}`,
        rawId: b.id,
        title: b.title ?? 'N/A',
        author: b.author ?? 'N/A',
        category: b.category ?? 'General',
        shelf: b.location ?? 'N/A',
        totalCopies: b.copies ?? 1,
        availableUnits: b.available_copies ?? 1,
        isbn: b.isbn ?? 'N/A',
        publisher: b.publisher ?? 'N/A',
        status: b.status ?? 'Available',
      }));
      setBooks(allBooks);

      setCirculation((circRes.data?.data ?? circRes.data ?? []).map(c => {
        const book = allBooks.find(b => b.id === c.book_id);
        return {
          id: c.issue_id ?? `ISS-${c.id}`,
          rawId: c.id,
          bookId: c.book_id,
          bookTitle: book ? book.title : (c.book_title ?? 'Unknown Book'),
          issuedTo: c.issued_to_name ?? 'N/A',
          role: c.user_type ?? 'Student',
          outDate: c.issue_date,
          dueDate: c.due_date,
          returnDate: c.return_date,
          status: c.status ?? 'Issued',
          overdueDays: 0
        };
      }));

      setMedia((medRes.data?.data ?? medRes.data ?? []).map(m => ({
        id: m.asset_id ?? `RES-${m.id}`,
        rawId: m.id,
        title: m.title ?? 'N/A',
        type: m.category ?? 'Digital Resource',
        format: m.format ?? 'PDF',
        size: m.size ?? '0 KB',
        link: m.link ?? '',
        addedDate: m.created_at?.split('T')[0] ?? '2026-03-18'
      })));

    } catch (err) {
      console.error('Library fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await api.delete(`/library-books/${id}`);
      fetchData();
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/library-digital-assets/${id}`);
      fetchData();
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const handleReturnBook = async (id) => {
    try {
      await api.put(`/library-issuances/${id}`, {
        status: 'Returned',
        return_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) { alert('Return failed: ' + err.message); }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Filtered Data Logic ── */
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCirculation = circulation.filter(c => 
    c.issuedTo.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.bookTitle.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMedia = media.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const closeModal = () => {
    setActiveModal(null);
    setCurrentEdit(null);
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300" onClick={() => setOpenMenuId(null)}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-black text-[var(--text-primary)] tracking-tight leading-none mb-1 uppercase tracking-[0.05em]">Digital Library System</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-[0.1em] uppercase opacity-70">Asset Management & E-Resource Center</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchData} disabled={loading} className="flex items-center space-x-2 h-9 px-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-extrabold text-[var(--text-primary)] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={`text-[#6366f1] ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
        <button className="flex items-center space-x-2 h-9 px-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-extrabold text-[var(--text-primary)] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm">
          <Download size={13} strokeWidth={2.5} className="text-[#6366f1]" /><span>Export Data</span>
        </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <StatCard label="Total Books" value={loading ? '...' : String(books.length)} icon={Book} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20 shadow-indigo-500/5" />
        <StatCard label="Currently Issued" value={loading ? '...' : String(circulation.filter(c => c.status === 'Issued' || c.status === 'OVERDUE').length)} icon={BookOpen} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20 shadow-blue-500/5" />
        <StatCard label="Overdue Returns" value={loading ? '...' : String(circulation.filter(c => c.status === 'OVERDUE').length)} icon={Clock} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20 shadow-rose-500/5" />
        <StatCard label="Digital Assets" value={loading ? '...' : String(media.length)} icon={Video} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20 shadow-emerald-500/5" />
      </div>

      {/* Content Area with Tabs */}
      <div className="flex-1 flex flex-col bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-white/5 rounded-xl shadow-2xl overflow-hidden transition-all">
        
        {/* Tab Bar */}
        <div className="flex items-center px-4 pt-1 bg-gray-50 dark:bg-[#171e2e] border-b border-[var(--border-color)] dark:border-white/5 shrink-0">
          <TabItem active={activeTab === 'Catalog'} label="BOOK CATALOG" icon={Book} onClick={() => setActiveTab('Catalog')} />
          <TabItem active={activeTab === 'Circulation'} label="CIRCULATION / ISSUED" icon={BookOpen} onClick={() => setActiveTab('Circulation')} />
          <TabItem active={activeTab === 'Media'} label="E-LIBRARY & MEDIA" icon={Video} onClick={() => setActiveTab('Media')} />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0f172a] relative">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px]">
              <div className="flex flex-col items-center space-y-2">
                <RefreshCw size={24} className="animate-spin text-[#6366f1]" />
                <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest">Updating Library...</p>
              </div>
            </div>
          )}
          
          {/* Sub Toolbar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)] dark:border-white/5 shrink-0">
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors" strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder={
                    activeTab === 'Catalog' ? "Search Book Title / ID / Author..." :
                    activeTab === 'Circulation' ? "Search Borrower / Book ID..." : "Search E-Resources..."
                  }
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-[320px] h-9 pl-9 pr-4 bg-white dark:bg-[#111827] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1]/50 transition-all shadow-inner" 
                />
             </div>
             <div className="flex items-center space-x-2">
                {activeTab === 'Catalog' && (
                  <button onClick={() => setActiveModal('addBook')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-[#818cf8] text-white text-[11px] font-black shadow-lg shadow-indigo-500/20 transition-all hover:bg-[#6366f1]">
                    <Plus size={14} strokeWidth={3} />
                    <span>Add Book</span>
                  </button>
                )}
                {activeTab === 'Circulation' && (
                  <button onClick={() => setActiveModal('issueBook')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-[#818cf8] text-white text-[11px] font-black shadow-lg shadow-indigo-500/20 transition-all hover:bg-[#6366f1]">
                    <ArrowRight size={14} strokeWidth={3} />
                    <span>Issue / Return Book</span>
                  </button>
                )}
                {activeTab === 'Media' && (
                  <button onClick={() => setActiveModal('addMedia')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-cyan-500 text-white text-[11px] font-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-600">
                    <Plus size={14} strokeWidth={3} />
                    <span>Add E-Resource</span>
                  </button>
                )}
             </div>
          </div>

          {/* Tab Content Rendering */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {activeTab === 'Catalog' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/30 px-6">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">BOOK ID</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">TITLE & AUTHOR</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">CATEGORY / SHELF</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">AVAILABILITY</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-2.5">
                        <span className="text-[11px] font-black text-[#818cf8] tracking-tight">{book.id}</span>
                      </td>
                      <td className="px-6 py-2.5">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-10 rounded shadow-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                            book.category === 'Mathematics' ? 'bg-orange-500' : 
                            book.category === 'Science' ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`}>
                            <Book size={14} className="text-white/80" />
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-[var(--text-primary)] leading-tight uppercase tracking-tight">{book.title}</p>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5">By {book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2.5">
                        <div>
                          <p className="text-[11px] font-black text-[var(--text-primary)]">{book.category}</p>
                          <p className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">{book.shelf}</p>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded border border-[#10b981]/20 text-[9px] font-black uppercase tracking-widest">
                            {book.availableUnits} / {book.totalCopies} AVAIL
                          </div>
                          <div className="w-24 h-1 bg-gray-100 dark:bg-white/5 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-[#10b981]" style={{ width: `${(book.availableUnits / book.totalCopies) * 100}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => { setCurrentEdit(book); setActiveModal('addBook'); }} className="w-7 h-7 bg-white dark:bg-white/5 text-amber-500 rounded border border-gray-200 dark:border-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                            <Edit size={12} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => handleDeleteBook(book.rawId)} className="w-7 h-7 bg-white dark:bg-white/5 text-rose-500 rounded border border-gray-200 dark:border-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Circulation' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/30 px-6">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">ISSUE ID</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">BOOK INFO</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">ISSUED TO</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">TIMELINE</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                  {filteredCirculation.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-2.5">
                        <span className="text-[11px] font-black text-[#818cf8] tracking-tight">{issue.id}</span>
                      </td>
                      <td className="px-6 py-2.5">
                        <div>
                          <p className="text-[12px] font-black text-[var(--text-primary)] leading-tight uppercase tracking-tight">{issue.bookTitle}</p>
                          <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5 uppercase tracking-tighter">ID: {issue.bookId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-2.5">
                        <div>
                          <p className="text-[12px] font-black text-[var(--text-primary)]">{issue.issuedTo}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{issue.role}</p>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-slate-400">Out: {issue.outDate}</p>
                          {issue.status === 'OVERDUE' ? (
                            <>
                              <p className="text-[9px] font-bold text-rose-500">Due: {issue.dueDate}</p>
                              <p className="text-[8px] font-black text-rose-500/80 italic">({issue.overdueDays} days overdue)</p>
                            </>
                          ) : (
                            <>
                              <p className="text-[9px] font-bold text-slate-400">Due: {issue.dueDate}</p>
                              <p className="text-[8px] font-black text-emerald-500 italic">Returned: {issue.returnDate}</p>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <span className={`px-2.5 py-1 rounded inline-block text-[9px] font-black uppercase tracking-widest ${
                             issue.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                             issue.status === 'Returned' ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20' :
                             'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                           }`}>
                             {issue.status}
                           </span>
                           {issue.status !== 'Returned' && (
                             <button 
                               onClick={() => handleReturnBook(issue.rawId)}
                               className="h-7 px-3 bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] font-black rounded border border-indigo-600 shadow-sm transition-all uppercase tracking-widest"
                             >
                               Return
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Media' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedia.map(item => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-[#1e293b]/30 border border-[var(--border-color)] dark:border-white/5 rounded-xl hover:translate-y-[-2px] transition-all group shadow-sm relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'Document' ? 'bg-orange-500/10 text-orange-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                        {item.type === 'Document' ? <FileText size={20} /> : <PlayCircle size={20} />}
                      </div>
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleMenu(item.id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-slate-500 hover:text-[var(--text-primary)] transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === item.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-white/10 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                              <button onClick={() => { setOpenMenuId(null); if(item.link) { window.open(item.link, '_blank'); } else { alert('\u26a0 Is PDF ka file server pe nahi hai.\n\nYe purani entry hai. Is item ko DELETE karo aur phir "Add E-Resource" button se dobara PDF upload karo. Naya upload hone ke baad View/Download seedha kaam karega!'); } }} className="w-full px-3 py-2 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2">
                                <Eye size={14} className="text-blue-500" /> <span>View / Open</span>
                             </button>
                              <button onClick={() => { setOpenMenuId(null); if(item.link) { window.open(item.link, '_blank'); } else { alert('\u26a0 Download ke liye file server pe honi chahiye.\n\nYe purani entry hai. Is item ko DELETE karo phir dobara upload karo!'); } }} className="w-full px-3 py-2 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2">
                                <Download size={14} className="text-emerald-500" /> <span>Download</span>
                             </button>
                              <button onClick={() => { setOpenMenuId(null); if(item.link) { navigator.clipboard.writeText(item.link); alert('✅ Link copied!'); } else { alert('⚠️ Is item ka koi link nahi hai.\n\nIs item ko DELETE karke dobara PDF upload karo!'); } }} className="w-full px-3 py-2 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2">
                                <Share2 size={14} className="text-cyan-500" /> <span>Share Link</span>
                             </button>
                             <div className="h-[1px] bg-[var(--border-color)] dark:bg-white/10 my-1 mx-2"></div>
                             <button onClick={() => handleDeleteMedia(item.rawId)} className="w-full px-3 py-2 text-left text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 flex items-center space-x-2">
                                <Trash2 size={14} /> <span>Delete Asset</span>
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div onClick={() => setOpenMenuId(null)}>
                      <h4 className="text-[13px] font-black text-[var(--text-primary)] mb-1 group-hover:text-[#6366f1] transition-colors">{item.title}</h4>
                      <div className="flex items-center space-x-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>{item.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                        <span>{item.format}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                        <span>{item.size}</span>
                      </div>
                      <p className="text-[8px] font-medium text-slate-600 dark:text-gray-500 mt-2">ADDED ON {item.addedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 border-t border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/50 flex items-center justify-between shrink-0">
             <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
               {activeTab === 'Catalog' ? `${filteredBooks.length} Total Books` : 
                activeTab === 'Circulation' ? `${filteredCirculation.length} Active Records` : `${filteredMedia.length} Digital Assets`}
             </p>
             <div className="flex items-center space-x-1">
                <button className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-gray-100 dark:hover:text-white border border-[var(--border-color)] dark:border-white/5 transition-colors"><ChevronLeft size={16} /></button>
                <button className="w-8 h-8 rounded-lg bg-[#6366f1] text-white flex items-center justify-center text-[11px] font-black shadow-lg shadow-indigo-500/20">1</button>
                <button className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-gray-100 dark:hover:text-white border border-[var(--border-color)] dark:border-white/5 transition-colors"><ChevronRight size={16} /></button>
             </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      {activeModal === 'addBook' && (
        <AddBookModal 
          isOpen={true} 
          onClose={closeModal} 
          book={currentEdit} 
          onSuccess={fetchData}
        />
      )}
      
      {activeModal === 'issueBook' && (
        <IssueBookModal 
          isOpen={true} 
          onClose={closeModal} 
          onSuccess={fetchData}
          books={books}
          circulation={circulation}
        />
      )}

      {activeModal === 'addMedia' && (
        <AddMediaModal 
          isOpen={true} 
          onClose={closeModal} 
          onSuccess={fetchData}
        />
      )}

    </div>
  );
};

/* ── MODAL COMPONENTS ── */

const AddBookModal = ({ isOpen, onClose, book, onSuccess }) => {
  const [formData, setFormData] = useState(book ? {
    book_id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    location: book.shelf,
    copies: book.totalCopies,
    available_copies: book.totalCopies,
  } : {
    book_id: '',
    title: '',
    author: '',
    category: 'Mathematics',
    location: '',
    copies: 1,
    available_copies: 1,
  });

  const handleSubmit = async () => {
    try {
      if (book) {
        await api.put(`/library-books/${book.rawId}`, formData);
      } else {
        await api.post('/library-books', formData);
      }
      onSuccess();
      onClose();
    } catch (err) { alert('Save failed: ' + err.message); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-[var(--bg-panel-alt)] w-full max-w-[550px] rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/[0.02]">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                {book ? <Edit size={20} /> : <Plus size={20} />}
             </div>
             <div>
                <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-tight">{book ? 'Edit Book Record' : 'Add New Book'}</h3>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-70">Cataloging System</p>
             </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] transition-colors"><X size={18} /></button>
        </div>
 
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-5">
            <InputField label="BOOK ID" icon={Hash} placeholder="e.g. BK-101" value={formData.book_id} onChange={v => setFormData({...formData, book_id: v})} />
            <InputField label="BOOK TITLE" icon={Book} placeholder="e.g. Advanced AI" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
            <InputField label="AUTHOR NAME" icon={User} placeholder="e.g. John Doe" value={formData.author} onChange={v => setFormData({...formData, author: v})} />
            <InputField label="CATEGORY" icon={CategoryIcon} placeholder="e.g. Science" value={formData.category} onChange={v => setFormData({...formData, category: v})} />
            <InputField label="SHELF NO" icon={Archive} placeholder="e.g. 101-B" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
            <InputField label="TOTAL COPIES" icon={Layers} placeholder="e.g. 50" type="number" value={formData.copies} onChange={v => setFormData({...formData, copies: v, available_copies: v})} />
          </div>
 
          <div className="mt-6 flex items-center justify-end space-x-3">
             <button onClick={onClose} className="px-6 h-10 text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">Cancel</button>
             <button onClick={handleSubmit} className="px-8 h-10 bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-black rounded-lg shadow-lg shadow-indigo-500/40 transition-all uppercase tracking-widest">
               {book ? 'Update Record' : 'Save Book'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const IssueBookModal = ({ isOpen, onClose, onSuccess, books, circulation }) => {
  const [mode, setMode] = useState('issue'); // 'issue' or 'return'
  const [formData, setFormData] = useState({
    issue_id: `ISS-${Math.floor(Math.random() * 10000)}`,
    book_id: '',
    issued_to_id: '',
    issued_to_name: '',
    user_type: 'Student',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
  });

  const [returnId, setReturnId] = useState('');
  
  // Dropdown states
  const [students, setStudents] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showReturnDropdown, setShowReturnDropdown] = useState(false);

  useEffect(() => {
    api.get('/students-for-dropdown').then(res => setStudents(res.data?.data || res.data || [])).catch(e => console.error(e));
  }, []);

  const filteredStudents = students.filter(s => 
    (s.student_name && s.student_name.toLowerCase().includes(formData.issued_to_name.toLowerCase())) ||
    (s.id && s.id.toString().includes(formData.issued_to_name))
  );

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(formData.book_id.toLowerCase()) || 
    b.id.toLowerCase().includes(formData.book_id.toLowerCase())
  );

  const filteredCirculation = circulation.filter(c => 
    c.status !== 'Returned' && 
    (c.id.toLowerCase().includes(returnId.toLowerCase()) || c.bookId.toLowerCase().includes(returnId.toLowerCase()))
  );

  const handleSubmit = async () => {
    try {
      if (mode === 'issue') {
        await api.post('/library-issuances', formData);
      } else {
        // Find the record by issue_id or book_id
        const res = await api.get('/library-issuances');
        const issue = (res.data?.data ?? res.data ?? []).find(i => i.issue_id === returnId || i.book_id === returnId);
        if (!issue) return alert('No active issuance found for this ID');
        
        await api.put(`/library-issuances/${issue.id}`, {
          status: 'Returned',
          return_date: new Date().toISOString().split('T')[0]
        });
      }
      onSuccess();
      onClose();
    } catch (err) { alert('Operation failed: ' + err.message); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-panel-alt)] w-full max-w-[600px] rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-2xl animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] dark:border-white/10 flex items-center justify-between bg-indigo-50 dark:bg-indigo-500/5">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BookOpen size={20} />
             </div>
             <div>
                <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-tight">Circulation Desk</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                   <button onClick={() => setMode('issue')} className={`text-[10px] font-black uppercase tracking-widest ${mode === 'issue' ? 'text-indigo-500 underline decoration-2 underline-offset-4' : 'text-slate-500 opacity-60'}`}>Issue Book</button>
                   <span className="text-slate-300">|</span>
                   <button onClick={() => setMode('return')} className={`text-[10px] font-black uppercase tracking-widest ${mode === 'return' ? 'text-indigo-500 underline decoration-2 underline-offset-4' : 'text-slate-500 opacity-60'}`}>Return Book</button>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">
           {mode === 'issue' ? (
             <>
               <div className="grid grid-cols-2 gap-5 overflow-visible">
                  
                  {/* Dynamic User Dropdown */}
                  <div className="relative">
                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">ISSUED TO (STUDENT/STAFF)</label>
                    <div className="relative isolate flex items-center">
                      <User size={14} className="absolute left-3 text-slate-400 z-10" />
                      <input 
                        type="text"
                        placeholder="Type Name or ID..."
                        value={formData.issued_to_name}
                        onChange={e => { setFormData({...formData, issued_to_name: e.target.value}); setShowUserDropdown(true); }}
                        onFocus={() => setShowUserDropdown(true)}
                        onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                        className="w-full h-10 pl-9 pr-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] focus:border-indigo-500 transition-colors z-0"
                      />
                    </div>
                    {showUserDropdown && filteredStudents.length > 0 && (
                      <div className="absolute top-[100%] left-0 w-full mt-1 bg-white dark:bg-[#1e293b] shadow-2xl border border-[var(--border-color)] dark:border-white/10 rounded-lg max-h-60 overflow-y-auto z-[9999] custom-scrollbar">
                        {filteredStudents.slice(0, 50).map((s, i) => (
                          <div 
                            key={i} 
                            onClick={() => { setFormData({...formData, issued_to_name: s.student_name, issued_to_id: s.id.toString(), user_type: 'Student'}); setShowUserDropdown(false); }}
                            className="px-3 py-2 border-b border-gray-100 dark:border-white/5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                          >
                            <p className="text-[11px] font-bold text-[var(--text-primary)]">{s.student_name} <span className="text-[9px] text-slate-500 ml-1">({s.admitted_into_class || 'Class N/A'})</span></p>
                            <p className="text-[9px] font-medium text-slate-500 mt-0.5">ID: {s.id}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Book Dropdown */}
                  <div className="relative">
                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">BOOK ID / TITLE</label>
                    <div className="relative isolate flex items-center">
                      <Book size={14} className="absolute left-3 text-slate-400 z-10" />
                      <input 
                        type="text"
                        placeholder="Type Book Title or ID..."
                        value={formData.book_id}
                        onChange={e => { setFormData({...formData, book_id: e.target.value}); setShowBookDropdown(true); }}
                        onFocus={() => setShowBookDropdown(true)}
                        onBlur={() => setTimeout(() => setShowBookDropdown(false), 200)}
                        className="w-full h-10 pl-9 pr-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] focus:border-indigo-500 transition-colors z-0"
                      />
                    </div>
                    {showBookDropdown && filteredBooks.length > 0 && (
                      <div className="absolute top-[100%] left-0 w-full mt-1 bg-white dark:bg-[#1e293b] shadow-2xl border border-[var(--border-color)] dark:border-white/10 rounded-lg max-h-60 overflow-y-auto z-[9999] custom-scrollbar">
                        {filteredBooks.slice(0, 50).map((b, i) => (
                          <div 
                            key={i} 
                            onClick={() => { setFormData({...formData, book_id: b.id}); setShowBookDropdown(false); }}
                            className="px-3 py-2 border-b border-gray-100 dark:border-white/5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                          >
                            <p className="text-[11px] font-bold text-[var(--text-primary)]">{b.title} <span className="text-[9px] text-indigo-500 ml-1">{b.availableUnits} left</span></p>
                            <p className="text-[9px] font-medium text-slate-500 mt-0.5">{b.id} • {b.author}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <InputField label="STUDENT / MEMBER ID (AUTO-FILLED)" icon={UserCheck} placeholder="Auto-filled" value={formData.issued_to_id} onChange={v => setFormData({...formData, issued_to_id: v})} />

                  <div className="flex flex-col">
                     <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">USER TYPE</label>
                     <select 
                       value={formData.user_type}
                       onChange={e => setFormData({...formData, user_type: e.target.value})}
                       className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500 transition-colors"
                     >
                        <option className="bg-white dark:bg-[#1e293b]">Student</option>
                        <option className="bg-white dark:bg-[#1e293b]">Teacher</option>
                        <option className="bg-white dark:bg-[#1e293b]">Staff</option>
                     </select>
                  </div>
                  <InputField label="ISSUE DATE" icon={Calendar} type="date" value={formData.issue_date} onChange={v => setFormData({...formData, issue_date: v})} />
                  <InputField label="RETURN DEADLINE" icon={History} type="date" value={formData.due_date} onChange={v => setFormData({...formData, due_date: v})} />
               </div>
               <button onClick={handleSubmit} className="w-full mt-4 flex items-center justify-center space-x-2 px-8 h-11 bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-indigo-500/40 transition-all uppercase tracking-widest group">
                 <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 <span>Confirm Issue</span>
               </button>
             </>
           ) : (
             <div className="space-y-6">
                <div className="p-5 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start space-x-4">
                   <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                      <AlertCircle size={20} className="text-amber-600" />
                   </div>
                   <div>
                      <h4 className="text-[13px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-tight">Quick Return</h4>
                      <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/60 font-medium mt-1">Provide the **Issue ID** or **Book ID** to process an immediate return and release the asset.</p>
                   </div>
                </div>

                <div className="relative">
                  <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">ISSUE ID OR BOOK ID (ACTIVE ISSUANCES)</label>
                  <div className="relative isolate flex items-center">
                    <Hash size={14} className="absolute left-3 text-slate-400 z-10" />
                    <input 
                      type="text"
                      placeholder="Type Book ID or Title..."
                      value={returnId}
                      onChange={e => { setReturnId(e.target.value); setShowReturnDropdown(true); }}
                      onFocus={() => setShowReturnDropdown(true)}
                      onBlur={() => setTimeout(() => setShowReturnDropdown(false), 200)}
                      className="w-full h-10 pl-9 pr-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] focus:border-emerald-500 transition-colors z-0"
                    />
                  </div>
                  {showReturnDropdown && filteredCirculation.length > 0 && (
                    <div className="absolute top-[100%] left-0 w-full mt-1 bg-white dark:bg-[#1e293b] shadow-2xl border border-[var(--border-color)] dark:border-white/10 rounded-lg max-h-60 overflow-y-auto z-[9999] custom-scrollbar">
                      {filteredCirculation.slice(0, 50).map((c, i) => (
                        <div 
                          key={i} 
                          onClick={() => { setReturnId(c.id); setShowReturnDropdown(false); }}
                          className="px-3 py-2 border-b border-gray-100 dark:border-white/5 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        >
                          <p className="text-[11px] font-bold text-[var(--text-primary)]">{c.bookTitle} <span className="text-[9px] text-emerald-500 ml-1">Issue: {c.id}</span></p>
                          <p className="text-[9px] font-medium text-slate-500 mt-0.5">Issued To: {c.issuedTo}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleSubmit} className="w-full flex items-center justify-center space-x-2 px-8 h-11 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-emerald-500/40 transition-all uppercase tracking-widest">
                   <XCircle size={14} />
                   <span>Process Return Now</span>
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const AddMediaModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const MAX_SIZE_MB = 150;

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('❌ Only PDF files are allowed!');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`❌ File too large! Max size is ${MAX_SIZE_MB}MB. Your file: ${(file.size/1024/1024).toFixed(1)}MB`);
      return;
    }
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace('.pdf', ''));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return setError('❌ Please enter a title!');
    if (!selectedFile) return setError('❌ Please select a PDF file!');
    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Step 1: Upload the actual PDF file
      const formDataUpload = new FormData();
      formDataUpload.append('pdf', selectedFile);
      const uploadRes = await api.post('/library-pdf-upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(pct);
        },
      });
      const fileUrl = uploadRes.data.link;
      const fileSize = uploadRes.data.size;

      // Step 2: Save metadata with the actual link
      await api.post('/library-digital-assets', {
        title: title.trim(),
        category: 'PDF Document',
        format: 'PDF',
        size: fileSize,
        link: fileUrl,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError('❌ Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-panel-alt)] w-full max-w-[500px] rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] dark:border-white/10 flex items-center justify-between bg-cyan-50 dark:bg-cyan-500/5">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <FileText size={20} />
             </div>
             <div>
                <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-tight">Upload PDF Resource</h3>
                <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400/70 uppercase tracking-widest">Only PDF • Max 150MB</p>
             </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <InputField label="DOCUMENT TITLE" icon={FileText} placeholder="e.g. Class 10 Science Notes" value={title} onChange={setTitle} />

          {error && (
            <div className="px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-[11px] font-bold text-rose-600 dark:text-rose-400">{error}</div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,application/pdf"
          />

          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed ${selectedFile ? 'border-cyan-500 bg-cyan-500/5' : 'border-[var(--border-color)] dark:border-white/10'} rounded-2xl p-8 flex flex-col items-center justify-center group hover:border-cyan-500 transition-all cursor-pointer relative`}
          >
            {selectedFile ? (
              <>
                <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center mb-3">
                   <FileText size={24} />
                </div>
                <p className="text-[12px] font-black text-[var(--text-primary)] text-center line-clamp-1 px-10">{selectedFile.name}</p>
                <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-tight mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF • READY</p>
                {!isUploading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setError(''); }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <X size={14} />
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <FileUp size={24} />
                </div>
                <p className="text-[12px] font-black text-[var(--text-primary)]">Click to Select PDF</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">PDF Only • Max 150MB</p>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Uploading...</span>
                <span className="text-[10px] font-black text-[var(--text-primary)]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-1">
            <button disabled={isUploading} onClick={onClose} className="px-6 h-10 text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className={`px-8 h-10 bg-cyan-500 hover:bg-cyan-600 text-white text-[11px] font-black rounded-lg shadow-lg shadow-cyan-500/40 transition-all uppercase tracking-widest flex items-center space-x-2 ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading
                ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Uploading...</span></>
                : <><FileUp size={14} /><span>Upload PDF</span></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ── HELPER COMPONENTS ── */

const InputField = ({ label, icon: Icon, placeholder, type = 'text', value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <div className="relative group">
       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={14} strokeWidth={2.5} />
       </div>
       <input 
         type={type} 
         placeholder={placeholder}
         value={value || ''}
         onChange={e => onChange(e.target.value)}
         className="w-full h-10 pl-9 pr-4 bg-white dark:bg-white/[0.03] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all shadow-inner" 
       />
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
  <div className={`p-4 rounded-xl border ${border} bg-[var(--bg-panel-alt)] flex items-center justify-between items-center group hover:translate-y-[-2px] transition-all relative overflow-hidden shadow-sm`}>
    <div className="z-10 relative">
      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-[26px] font-black ${color} leading-none tracking-tight`}>{value}</p>
    </div>
    <div className={`w-11 h-11 rounded-lg ${bg} ${color} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform z-10 relative`}>
      <Icon size={20} alt={label} strokeWidth={2.5} />
    </div>
    <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${color} opacity-[0.03] rotate-12 group-hover:opacity-[0.06] transition-opacity`} />
  </div>
);

const TabItem = ({ active, label, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-3 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${active ? 'text-[#818cf8]' : 'text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    <Icon size={14} className={active ? 'text-[#818cf8]' : 'text-slate-500'} strokeWidth={3} />
    <span>{label}</span>
    {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#818cf8] shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>}
  </button>
);


export default LibraryManagement;

