import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Mail, Smartphone, Bell, Search, Plus, Download,
  Edit, Trash2, Send, Users, CheckCircle2, Clock, AlertCircle,
  FileText, ChevronLeft, ChevronRight, TrendingUp, X, CreditCard,
  History, RefreshCw, Loader2, Eye
} from 'lucide-react';
import api from '../api/axios';

const CommunicationManagement = () => {
  const [activeTab, setActiveTab] = useState('NoticeBoard');
  const [search, setSearch] = useState('');
  
  // Data states
  const [notices, setNotices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const truncateWords = (text, limit = 8) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '...';
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [nv, mv] = await Promise.allSettled([
        api.get('/notices'),
        api.get('/messages'),
      ]);

      if (nv.status === 'fulfilled') {
        const list = (nv.value.data?.data ?? nv.value.data ?? []).map(n => ({
          id: n.notice_id ?? `NOT-${n.id}`,
          rawId: n.id,
          title: n.title ?? 'N/A',
          content: n.content ?? '',
          publishedBy: n.published_by ?? n.author ?? 'Admin',
          date: n.publish_date ? n.publish_date.split('T')[0] : (n.created_at ? n.created_at.split('T')[0] : 'N/A'),
          status: n.status ?? 'Active',
          visibility: n.visibility ?? 'Public',
        }));
        setNotices(list);
      }

      if (mv.status === 'fulfilled') {
        const list = (mv.value.data?.data ?? mv.value.data ?? []).map(m => ({
          id: m.message_id ?? `MSG-${m.id}`,
          rawId: m.id,
          subject: m.subject ?? m.title ?? 'N/A',
          content: m.message ?? m.content ?? '',
          audience: m.recipient_login_id === 'BROADCAST' ? 'ALL PARENTS' : `ID: ${m.recipient_login_id}`,
          type: m.type ?? m.channel ?? 'SMS',
          date: m.created_at ? m.created_at.split('T')[0] : 'N/A',
          status: m.status ?? 'Delivered',
          count: m.recipient_count ?? m.count ?? 0,
        }));
        setMessages(list);
      }
    } catch (err) {
      console.error('Communication fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Filtered Data ── */
  const filteredMessages = messages.filter(m => m.subject.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()));
  const filteredNotices = notices.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.id.toLowerCase().includes(search.toLowerCase()));
  const filteredTemplates = templates.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  const closeModal = () => { setActiveModal(null); setEditItem(null); };

  const handleDeleteNotice = async (rawId, displayId) => {
    if (!window.confirm(`Delete notice ${displayId}?`)) return;
    try {
      await api.delete(`/notices/${rawId}`);
      // Also delete from parent notifications table if it was broadcasted
      await api.delete(`/parent-notifications/notice/${rawId}`); 
      setNotices(prev => prev.filter(n => n.rawId !== rawId));
    } catch {
      setNotices(prev => prev.filter(n => n.rawId !== rawId));
    }
  };

  const handleDeleteMessage = async (rawId, displayId) => {
    if (!window.confirm(`Delete sent message ${displayId}?`)) return;
    try {
      // Delete from notifications table
      await api.delete(`/parent-notifications/${rawId}`);
      setMessages(prev => prev.filter(m => m.rawId !== rawId));
    } catch {
       setMessages(prev => prev.filter(m => m.rawId !== rawId));
    }
  };

  const handleEditNotice = (notice) => { setEditItem(notice); setActiveModal('notice'); };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-[22px] font-black text-[var(--text-primary)] tracking-tight leading-none mb-1 uppercase tracking-[0.05em]">Communication Hub</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-[0.1em] uppercase opacity-70">Unified Messaging & Notice Board System</p>
        </div>
        <button className="flex items-center space-x-2 h-9 px-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-extrabold text-[var(--text-primary)] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm">
          <Download size={13} strokeWidth={2.5} className="text-[#6366f1]" /><span>Export Logs</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
        <StatCard label="Active Notices" value={loading ? '...' : String(notices.filter(n => n.status === 'Active').length)} sub="On Board" icon={Bell} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20 shadow-amber-500/5" />
        <StatCard label="Total Notices" value={loading ? '...' : String(notices.length)} sub="All Time" icon={AlertCircle} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20 shadow-rose-500/5" />
      </div>

      {/* Content Area with Tabs */}
      <div className="flex-1 flex flex-col bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-white/5 rounded-xl shadow-2xl overflow-hidden transition-all">
        
        {/* Unified Tab Bar & Toolbar */}
        <div className="flex items-center justify-between px-4 bg-gray-50 dark:bg-[#171e2e] border-b border-[var(--border-color)] dark:border-white/5 shrink-0 overflow-x-auto custom-scrollbar-h">
          <div className="flex items-center pt-1 shrink-0">
            <TabItem active={activeTab === 'NoticeBoard'} label="NOTICE BOARD" icon={Bell} onClick={() => setActiveTab('NoticeBoard')} />
            <TabItem active={activeTab === 'ParentComm'} label="SEND TO PARENTS" icon={Smartphone} onClick={() => setActiveTab('ParentComm')} />
          </div>

          <div className="flex items-center space-x-4 py-2 shrink-0">
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors" strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder={
                    activeTab === 'NoticeBoard' ? "Search Notice Title..." : "Search Sent Messages..."
                  }
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-[280px] h-9 pl-9 pr-4 bg-white dark:bg-[#111827] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1]/50 transition-all shadow-inner" 
                />
             </div>
             <div className="flex items-center space-x-2">
                {activeTab === 'NoticeBoard' && (
                  <button onClick={() => setActiveModal('notice')} className="flex items-center space-x-2 px-5 h-9 rounded-lg bg-[#f59e0b] text-white text-[11px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600">
                    <Plus size={14} strokeWidth={3} />
                    <span>Post New Notice</span>
                  </button>
                )}
                {activeTab === 'ParentComm' && (
                  <button onClick={() => setActiveModal('compose')} className="flex items-center space-x-2 px-5 h-9 rounded-lg bg-[#6366f1] text-white text-[11px] font-black shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600">
                    <Send size={14} strokeWidth={3} />
                    <span>Send Message to Parents</span>
                  </button>
                )}
             </div>
          </div>
        </div>

          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0f172a] relative">
            {loading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px]">
                <div className="flex flex-col items-center space-y-2">
                  <RefreshCw size={24} className="animate-spin text-[#6366f1]" />
                  <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest">Updating Hub...</p>
                </div>
              </div>
            )}

          {/* Body Content */}
          <div className="flex-1 overflow-auto custom-scrollbar p-0">
            {activeTab === 'ParentComm' && (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#0f172a] z-10">
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Message Details</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Message Content</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Audience</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map(msg => (
                      <tr key={msg.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                           <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                                 <Mail size={14} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-[var(--text-primary)] uppercase leading-none mb-1">{msg.subject}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.05em]">ID: {msg.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="max-w-[200px]">
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                                 {truncateWords(msg.content)}
                              </p>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex flex-col">
                              <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20 rounded text-[9px] font-black uppercase tracking-widest w-fit mb-1">
                                {msg.audience}
                              </span>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{msg.date}</p>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => setViewItem(msg)} className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all"><Eye size={12} /></button>
                              <button onClick={() => handleDeleteMessage(msg.rawId, msg.id)} className="w-7 h-7 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm shadow-rose-500/10"><Trash2 size={12} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMessages.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center opacity-50">
                          <Users size={32} className="mx-auto mb-3 text-slate-400" />
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No sent messages found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'NoticeBoard' && (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#0f172a] z-10">
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Notice Title</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Notice Content</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">Visibility</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotices.map(notice => (
                      <tr key={notice.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                                <Bell size={14} />
                             </div>
                             <div>
                                <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight mb-1">{notice.title}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.05em]">ID: {notice.id}</p>
                             </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="max-w-[250px]">
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                                 {truncateWords(notice.content)}
                              </p>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                           <div className="flex flex-col items-center">
                              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded text-[8px] font-black uppercase tracking-widest mb-1">
                                   {notice.visibility}
                              </span>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{notice.date}</p>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                             <button onClick={() => setViewItem(notice)} className="w-7 h-7 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all"><Eye size={12} /></button>
                             <button onClick={() => handleEditNotice(notice)} className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all shadow-sm shadow-indigo-500/10"><Edit size={12} /></button>
                             <button onClick={() => handleDeleteNotice(notice.rawId, notice.id)} className="w-7 h-7 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm shadow-rose-500/10"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredNotices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center opacity-50">
                          <Bell size={32} className="mx-auto mb-3 text-slate-400" />
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No active notices found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}



          </div>

          {/* Footer Area */}
          <div className="px-6 py-3 border-t border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/50 flex items-center justify-between shrink-0">
             <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
               {activeTab === 'NoticeBoard' ? `${filteredNotices.length} Active Notices` : 'Parent Direct Messaging'}
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
      {activeModal === 'compose' && (
        <ComposeMessageModal onClose={closeModal} onSuccess={fetchAll} />
      )}

      {activeModal === 'notice' && (
        <PostNoticeModal onClose={closeModal} onSuccess={fetchAll} editItem={editItem} />
      )}

      {viewItem && (
        <GenericModal 
          title={`Detailed View : ${viewItem.title || viewItem.subject}`} 
          icon={Eye} 
          color={activeTab === 'NoticeBoard' ? 'amber' : 'indigo'} 
          onClose={() => setViewItem(null)}
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-[var(--border-color)] dark:border-white/10 rounded-xl">
               <p className="text-[13px] font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {viewItem.content}
               </p>
            </div>
            <div className="flex items-center justify-between px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
               <span>DATE: {viewItem.date}</span>
               <span>ID: {viewItem.id}</span>
            </div>
          </div>
        </GenericModal>
      )}



    </div>
  );
};

/* ── MODAL COMPONENTS ── */

const PostNoticeModal = ({ onClose, onSuccess, editItem }) => {
  const [formData, setFormData] = useState({
    title: editItem?.title || '',
    publish_date: editItem?.date || new Date().toISOString().split('T')[0],
    content: editItem?.message || editItem?.content || '',
    type: 'NOTICE'
  });

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.content) return alert('Please fill title and message');
      
      const payload = {
        title: formData.title,
        content: formData.content
      };

      if (editItem) {
        // 1. Update main notices table
        await api.put(`/notices/${editItem.rawId}`, payload);
        
        // 2. Update existing notification in parent-notifications table
        // We match by title/content because we didn't have notice_id before, 
        // but now we'll favor updating based on notice_id if possible.
        try {
          // If we add notice_id to the table, we should update where notice_id = editItem.rawId
          await api.put(`/parent-notifications/sync-notice/${editItem.rawId}`, {
             title: formData.title,
             message: formData.content
          });
        } catch (e) { console.log("Notification sync update failed/no route", e); }
      } else {
        // 1. Save to main notices table (New)
        const res = await api.post('/notices', payload);
        const newId = res.data.id || res.data.data?.id;
        
        // 2. Broadcast to parent app notifications
        await api.post('/parent-notifications', {
          notice_id: newId,
          title: formData.title,
          message: formData.content,
          type: 'NOTICE',
          recipient_login_id: null 
        });
      }
      onSuccess();
      onClose();
    } catch (err) { alert('Operation failed: ' + err.message); }
  };

  return (
    <GenericModal title="Admin Global Notice" icon={Bell} color="amber" onClose={onClose} onSave={handleSubmit}>
      <div className="space-y-4">
        <InputField label="NOTICE TITLE" icon={FileText} placeholder="e.g. School Holiday Announcement" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">NOTICE DESCRIPTION</label>
          <textarea 
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full h-32 p-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[12px] font-medium text-[var(--text-primary)] outline-none focus:border-amber-500 transition-all custom-scrollbar resize-none"
            placeholder="Write the notice details here for the Parent App..."
          ></textarea>
        </div>
        <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest text-center mt-2 border border-amber-500/20 py-1 rounded">THIS WILL BE SHOWN ON ALL PARENTS' HOME SCREEN</p>
      </div>
    </GenericModal>
  );
};

const ComposeMessageModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    recipient_login_id: '',
    content: ''
  });
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState(['All Classes']);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    api.get('/parent-contact-list').then(res => setParents(res.data)).catch(() => {});
    api.get('/classes-list').then(res => setClasses(['All Classes', ...res.data])).catch(() => {});
  }, []);

  const filteredParents = parents.filter(p => {
    const matchesSearch = p.student_name.toLowerCase().includes(search.toLowerCase()) || p.contact_no.includes(search);
    const matchesClass = selectedClass === 'All Classes' || (p.class && selectedClass && p.class.toLowerCase().trim() === selectedClass.toLowerCase().trim());
    return matchesSearch && matchesClass;
  });

  const handleSubmit = async () => {
    if (!formData.subject || !formData.content) return alert('Please fill title and message');
    try {
      await api.post('/parent-notifications', {
        title: formData.subject,
        message: formData.content,
        type: 'MESSAGE',
        recipient_login_id: formData.recipient_login_id || null
      });
      onSuccess();
      onClose();
    } catch (err) { alert('Send failed: ' + err.message); }
  };

  return (
    <GenericModal title="Secure Direct Message" icon={Send} color="indigo" onClose={onClose} onSave={handleSubmit}>
      <div className="space-y-4">
        {/* Step 1: Target Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">FILTER CLASS</label>
            <select 
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="md:col-span-2 flex flex-col relative">
            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">SEARCH STUDENT NAME / ROLL NO</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} strokeWidth={2.5} />
              </div>
              <input 
                type="text"
                placeholder={selectedClass === 'All Classes' ? "Search all students..." : `Search in Class ${selectedClass}...`}
                value={search}
                onFocus={() => setShowDropdown(true)}
                onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                className="w-full h-10 pl-9 pr-4 bg-white dark:bg-white/[0.03] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
              {showDropdown && search.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg shadow-2xl z-[110] max-h-[200px] overflow-auto custom-scrollbar">
                  {filteredParents.map(p => (
                    <div key={p.id} 
                      className="p-3 hover:bg-indigo-500/10 border-b border-gray-100 dark:border-white/5 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setFormData({...formData, recipient_login_id: p.contact_no});
                        setSearch(`${p.student_name} (${p.father_name})`);
                        setSelectedStudent(p);
                        setShowDropdown(false);
                      }}
                    >
                      <div>
                         <span className="text-[11px] font-black text-[var(--text-primary)] uppercase block leading-none">{p.student_name}</span>
                         <span className="text-[9px] font-bold text-slate-500 opacity-70">F: {p.father_name} • Class: {p.class}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px] font-black">ROLL {p.roll_no || '-'}</span>
                    </div>
                  ))}
                  {filteredParents.length === 0 && (
                    <div className="p-4 text-center text-[10px] font-bold text-slate-500 uppercase">No student found in {selectedClass}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Step 2: Confirmation / Info */}
        {selectedStudent ? (
           <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                 <div>
                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase block">Message for {selectedStudent.student_name}</span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Parent's Phone: {selectedStudent.contact_no}</span>
                 </div>
              </div>
              <button onClick={() => {setSelectedStudent(null); setSearch(''); setFormData({...formData, recipient_login_id: ''});}} className="text-[8px] font-black text-rose-500 uppercase hover:underline">Change</button>
           </div>
        ) : (
           <div className="flex items-center space-x-2 py-2 px-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
              <Smartphone size={12} className="text-indigo-500" />
              <span className="text-[10px] font-black text-indigo-500 uppercase">Destination: <span className="text-[var(--text-primary)]">BROADCAST TO ALL PARENTS</span></span>
           </div>
        )}

        {/* Step 3: Message Content */}
        <InputField label="MESSAGE TITLE" icon={FileText} placeholder="e.g. Conduct Warning" value={formData.subject} onChange={v => setFormData({...formData, subject: v})} />

        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">PRIVATE MESSAGE BODY</label>
          <textarea 
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full h-32 p-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[12px] font-medium text-[var(--text-primary)] outline-none focus:border-indigo-500 transition-all custom-scrollbar resize-none"
            placeholder="Describe the matter clearly for the parent..."
          ></textarea>
        </div>
      </div>
    </GenericModal>
  );
};

/* ── HELPER COMPONENTS ── */

const GenericModal = ({ title, icon: Icon, color, children, onClose, onSave }) => {
  const colorMap = {
    amber: 'bg-amber-500 shadow-amber-500/30 text-white',
    indigo: 'bg-indigo-500 shadow-indigo-500/30 text-white',
    emerald: 'bg-emerald-500 shadow-emerald-500/30 text-white'
  };

  const btnColorMap = {
    amber: 'bg-amber-500 shadow-amber-500/40 hover:bg-amber-600',
    indigo: 'bg-indigo-500 shadow-indigo-500/40 hover:bg-indigo-600',
    emerald: 'bg-emerald-500 shadow-emerald-500/40 hover:bg-emerald-600'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--bg-panel-alt)] w-full max-w-[550px] rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-[var(--border-color)] dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/[0.02]">
           <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${colorMap[color]}`}>
                 <Icon size={20} />
              </div>
              <div>
                 <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-tight">{title}</h3>
                 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-70">Communication Hub</p>
              </div>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">
           {children}
           {onSave && (
             <div className="mt-8 flex items-center justify-end space-x-3">
                <button onClick={onClose} className="px-6 h-10 text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">Cancel</button>
                <button onClick={onSave} className={`px-8 h-10 text-white text-[11px] font-black rounded-lg transition-all uppercase tracking-widest ${btnColorMap[color]}`}>
                   Submit Details
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

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

const StatCard = ({ label, value, sub, icon: Icon, color, bg, border }) => (
  <div className={`p-3 rounded-xl border ${border} bg-[var(--bg-panel-alt)] flex items-center justify-between items-center group hover:translate-y-[-2px] transition-all relative overflow-hidden shadow-sm`}>
    <div className="z-10 relative">
      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-[26px] font-black ${color} leading-none tracking-tight`}>{value}</p>
      <p className="text-[8px] font-bold text-slate-500 uppercase mt-1.5">{sub}</p>
    </div>
    <div className={`w-11 h-11 rounded-lg ${bg} ${color} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform z-10 relative`}>
      <Icon size={20} strokeWidth={2.5} />
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

export default CommunicationManagement;
