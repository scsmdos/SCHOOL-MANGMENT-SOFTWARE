import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Mail, Smartphone, Bell, Search, Plus, Download,
  Edit, Trash2, Send, Users, CheckCircle2, Clock, AlertCircle,
  FileText, ChevronLeft, ChevronRight, TrendingUp, X, CreditCard,
  History, RefreshCw, Loader2
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
          audience: m.audience ?? m.recipient_group ?? 'All',
          type: m.type ?? m.channel ?? 'SMS',
          date: m.sent_at ? m.sent_at.split('T')[0] : 'N/A',
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
      setNotices(prev => prev.filter(n => n.rawId !== rawId));
    } catch {
      setNotices(prev => prev.filter(n => n.rawId !== rawId)); // optimistic
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
        
        {/* Tab Bar */}
        <div className="flex items-center px-4 pt-1 bg-gray-50 dark:bg-[#171e2e] border-b border-[var(--border-color)] dark:border-white/5 shrink-0">
          <TabItem active={activeTab === 'NoticeBoard'} label="NOTICE BOARD" icon={Bell} onClick={() => setActiveTab('NoticeBoard')} />
          <TabItem active={activeTab === 'ParentComm'} label="SEND TO PARENTS" icon={Smartphone} onClick={() => setActiveTab('ParentComm')} />
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
            {/* Sub Toolbar */}
          <div className="px-6 py-3 flex items-center justify-between border-b border-[var(--border-color)] dark:border-white/5 shrink-0">
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors" strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder={
                    activeTab === 'NoticeBoard' ? "Search Notice Title..." : "Search Contacts..."
                  }
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-[320px] h-9 pl-9 pr-4 bg-white dark:bg-[#111827] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1]/50 transition-all shadow-inner" 
                />
             </div>
             <div className="flex items-center space-x-3">
                {activeTab === 'NoticeBoard' && (
                  <button onClick={() => setActiveModal('notice')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-[#f59e0b] text-white text-[11px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600">
                    <Plus size={14} strokeWidth={3} />
                    <span>Post New Notice</span>
                  </button>
                )}
                {activeTab === 'ParentComm' && (
                  <button onClick={() => setActiveModal('compose')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-[#6366f1] text-white text-[11px] font-black shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600">
                    <Send size={14} strokeWidth={3} />
                    <span>Send Message to Parents</span>
                  </button>
                )}
             </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-auto custom-scrollbar p-0">
            {activeTab === 'ParentComm' && (
              <div className="p-12 flex flex-col items-center justify-center space-y-4 opacity-70">
                 <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Users size={32} />
                 </div>
                 <div className="text-center">
                    <h4 className="text-[14px] font-black text-[var(--text-primary)] uppercase">Parent Communication</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Use the 'Send Message' button above to reach parents directly.</p>
                 </div>
              </div>
            )}

            {activeTab === 'NoticeBoard' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {filteredNotices.map(notice => (
                   <div key={notice.id} className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-[var(--border-color)] dark:border-white/5 rounded-xl hover:border-amber-500/30 transition-all group overflow-hidden relative shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                         <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                               <Bell size={20} />
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded text-[8px] font-black uppercase tracking-widest">
                               {notice.visibility}
                            </span>
                         </div>
                         <div className="flex space-x-1">
                            <button onClick={() => handleEditNotice(notice)} className="w-7 h-7 rounded border border-[var(--border-color)] dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"><Edit size={12} /></button>
                            <button onClick={() => handleDeleteNotice(notice.rawId, notice.id)} className="w-7 h-7 rounded border border-[var(--border-color)] dark:border-white/10 flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-500 transition-colors"><Trash2 size={12} /></button>
                         </div>
                      </div>
                      <div>
                         <h4 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight">{notice.title}</h4>
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">ID: {notice.id} • By {notice.publishedBy}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                         <div className="flex items-center text-[10px] font-bold text-slate-400">
                            <Clock size={12} className="mr-1.5" /> Date: {notice.date}
                         </div>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${notice.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            • {notice.status}
                         </span>
                      </div>
                   </div>
                 ))}
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



    </div>
  );
};

/* ── MODAL COMPONENTS ── */

const PostNoticeModal = ({ onClose, onSuccess, editItem }) => {
  const [formData, setFormData] = useState({
    title: editItem?.title || '',
    publish_date: editItem?.date || new Date().toISOString().split('T')[0],
    visibility: editItem?.visibility || 'Parents Only',
    content: editItem?.content || '',
    status: 'Active'
  });

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await api.put(`/notices/${editItem.rawId}`, formData);
      } else {
        await api.post('/notices', formData);
      }
      onSuccess();
      onClose();
    } catch (err) { alert('Save failed: ' + err.message); }
  };

  return (
    <GenericModal title={editItem ? "Update Notice" : "Post New Notice"} icon={Bell} color="amber" onClose={onClose} onSave={handleSubmit}>
      <div className="space-y-4">
        <InputField label="NOTICE TITLE" icon={FileText} placeholder="e.g. Annual Parent Meeting" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="PUBLISH DATE" icon={Clock} type="date" value={formData.publish_date} onChange={v => setFormData({...formData, publish_date: v})} />
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">VISIBILITY</label>
            <select 
              value={formData.visibility}
              onChange={e => setFormData({...formData, visibility: e.target.value})}
              className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-amber-500"
            >
              <option>Public (Everyone)</option>
              <option>Parents Only</option>
              <option>Students Only</option>
              <option>Staff Only</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">DESCRIPTION</label>
          <textarea 
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full h-28 p-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[12px] font-medium text-[var(--text-primary)] outline-none focus:border-amber-500 transition-all custom-scrollbar resize-none"
            placeholder="Details for the notice board..."
          ></textarea>
        </div>
      </div>
    </GenericModal>
  );
};

const ComposeMessageModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    audience: 'Parents Only',
    type: 'SMS & Email',
    content: ''
  });

  const handleSubmit = async () => {
    try {
      await api.post('/messages', formData);
      onSuccess();
      onClose();
    } catch (err) { alert('Send failed: ' + err.message); }
  };

  return (
    <GenericModal title="Message to Parents" icon={Send} color="indigo" onClose={onClose} onSave={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">AUDIENCE</label>
            <select 
              value={formData.audience}
              onChange={e => setFormData({...formData, audience: e.target.value})}
              className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500"
            >
              <option>Parents Only</option>
              <option>Specific Parent (by ID)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">CHANNEL</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500"
            >
              <option>SMS & Email</option>
              <option>SMS Only</option>
              <option>Email Only</option>
            </select>
          </div>
        </div>
        <InputField label="SUBJECT" icon={FileText} placeholder="Enter subject..." value={formData.subject} onChange={v => setFormData({...formData, subject: v})} />
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">MESSAGE BODY</label>
          <textarea 
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full h-24 p-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[12px] font-medium text-[var(--text-primary)] outline-none focus:border-indigo-500 transition-all custom-scrollbar resize-none"
            placeholder="Type your message for parents..."
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
           <div className="mt-8 flex items-center justify-end space-x-3">
              <button onClick={onClose} className="px-6 h-10 text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">Cancel</button>
              <button onClick={onSave} className={`px-8 h-10 text-white text-[11px] font-black rounded-lg transition-all uppercase tracking-widest ${btnColorMap[color]}`}>
                 Submit Details
              </button>
           </div>
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
