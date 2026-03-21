import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Key, Shield, Plus, Trash2, Search, 
  Smartphone, MapPin, Camera, Clock, Activity,
  Database, RefreshCw, CheckCircle2, XCircle, ChevronRight,
  FileText, ArrowUpCircle, Info, X, Lock, Loader2, User
} from 'lucide-react';
import api from '../api/axios';

const TeacherAppAdmin = () => {
  const [tab, setTab] = useState('classes');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ class_name: '', login_id: '', pin: '' });
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({ classes: 0, active: 0 });
  const [classesList, setClassesList] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/class-accounts');
      const payload = res.data?.data ?? res.data ?? [];
      setData(payload);

      const clRes = await api.get('/classes-list');
      setClassesList(clRes.data || []);

      const statsRes = await api.get('/dashboard-stats'); 
      if (statsRes.data?.stats) {
          setStats({
              classes: statsRes.data.stats.totalClasses || 0,
              active: payload.filter(x => x.status === 'Active').length
          });
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!formData.class_name || !formData.login_id || !formData.pin) {
        return alert('Please fill in all fields.');
    }
    setSaving(true);
    try {
      await api.post('/class-accounts', formData);
      setShowModal(false);
      setFormData({ class_name: '', login_id: '', pin: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error creating account'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class account? Access will be revoked immediately.')) return;
    try {
      await api.delete(`/class-accounts/${id}`);
      fetchData();
    } catch (err) { alert('Error deleting account'); }
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1 uppercase tracking-[0.05em]">Class Attendance Gateways</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-[0.15em] uppercase opacity-70">
            {loading ? 'SYNCING DATA...' : `MANAGING ${data.length} DIGITAL CLASS REGISTERS`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder={`Search classes...`}
              value={search}
              onChange={e => { setSearch(e.target.value); }}
              className="w-[280px] h-9 pl-9 pr-4 bg-transparent border border-[var(--border-color)] dark:border-[#334155] dark:bg-[#10162A] rounded text-[11px] font-medium text-[var(--text-primary)] placeholder:text-[#64748b] focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm"
            />
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-[#06b6d4] hover:bg-[#0891b2] text-white px-4 h-9 rounded transition-colors text-xs font-bold shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Setup New Class Access</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 shrink-0">
        <StatCard label="Available Classes" value={String(stats.classes)} sub="School Capacity" icon={Users} color="text-[#38bdf8]" bg="bg-[#0369a1]/30" borderLeft="border-l-[#0ea5e9]" />
        <StatCard label="Active Gateways" value={String(stats.active)} sub="Live Mobile Access" icon={Shield} color="text-[#22c55e]" bg="bg-[#14532d]/40" borderLeft="border-l-[#22c55e]" />
      </div>

      {/* Main Panel Area */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-all">
        
        {/* Tab Selection Bar (Fixed to Classes) */}
        <div className="flex items-center px-4 bg-gray-50 dark:bg-[#171e2e] border-b border-[var(--border-color)] dark:border-white/5 shrink-0">
          <TabItem active={true} label="STUDENT ATTENDANCE ACCOUNTS" icon={Users} onClick={() => {}} />
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-auto relative custom-scrollbar bg-[var(--bg-panel-alt)]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px] z-50">
               <RefreshCw className="animate-spin text-[#06b6d4]" size={28} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                <tr className="border-y border-gray-200 dark:border-[#334155]">
                  <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Class Identification</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase whitespace-nowrap">Credential Management</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase text-center whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-slate-500 dark:text-[#94a3b8] tracking-widest uppercase text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#151c2e] transition-colors group">
                    <td className="px-5 py-2">
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded bg-[#0369a1]/30 text-[#38bdf8] flex items-center justify-center border border-sky-500/20 shadow-sm">
                              <Users size={14} strokeWidth={2.5} />
                           </div>
                           <div>
                              <p className="text-xs font-bold uppercase text-[var(--text-primary)]">{item.class_name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {item.id}</p>
                           </div>
                        </div>
                    </td>
                    <td className="px-5 py-2">
                        <div>
                           <p className="text-xs font-bold text-[var(--text-primary)]">{item.login_id}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PIN: {item.pin}</p>
                        </div>
                    </td>
                    <td className="px-5 py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest border ${item.status === 'Active' ? 'bg-green-100 border-green-300 text-green-700 dark:bg-[#14532d]/40 dark:border-[#166534]/50 dark:text-[#4ade80]' : 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400'}`}>
                            {item.status?.toUpperCase()}
                        </span>
                    </td>
                    <td className="px-5 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                           <button onClick={() => handleDelete(item.id)} className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors shadow-sm"><Trash2 size={10} /></button>
                        </div>
                    </td>
                  </tr>
                ))}
                {!loading && data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center opacity-50">
                      <Database size={32} className="mx-auto text-slate-400 mb-2" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No class accounts found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-panel-alt)] flex items-center justify-between shrink-0">
           <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{data.length} gateways configured</span>
        </div>
      </div>

      {/* SETUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[var(--bg-panel)] w-full max-w-[480px] rounded-lg shadow-2xl flex flex-col border border-[var(--border-color)] animate-in zoom-in duration-300">
              <div className="flex items-center justify-between p-4 px-6 bg-[var(--bg-panel-alt)] border-b border-[var(--border-color)] shrink-0 transition-colors">
                 <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center border border-[#0ea5e9]/20 shadow-sm">
                       <Smartphone size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h2 className="text-[13px] font-bold text-[var(--text-primary)] tracking-widest uppercase mb-0.5">Account Setup</h2>
                       <p className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase leading-none">Class Authentication Gate</p>
                    </div>
                 </div>
                 <button onClick={() => setShowModal(false)} className="w-6 h-6 rounded flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white hover:bg-[#e11d48] hover:border-[#e11d48] transition-colors"><X size={14} strokeWidth={2.5}/></button>
              </div>

              <div className="p-8 space-y-5 bg-[var(--bg-panel)]">
                  <div className="flex flex-col">
                     <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-0.5">Class Name Selection<span className="text-[#f43f5e]">*</span></label>
                     <select 
                       value={formData.class_name} 
                       onChange={e => setFormData({...formData, class_name: e.target.value})}
                       className="w-full h-9 px-3 rounded text-[var(--text-primary)] text-[11px] font-medium focus:outline-none focus:border-[#0ea5e9] transition-colors bg-[var(--bg-main)] border border-[var(--border-color)] appearance-none"
                     >
                        <option value="">SELECT CLASS</option>
                        {classesList.map(c => (
                          <option key={c} value={c}>{c.toUpperCase()}</option>
                        ))}
                     </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <InputGroup label="App Login ID" required placeholder="E.G. CLASS-X-2026" value={formData.login_id} onChange={v => setFormData({...formData, login_id: v})} />
                     <InputGroup label="Secret PIN" required placeholder="4-6 DIGITS" value={formData.pin} onChange={v => setFormData({...formData, pin: v})} />
                  </div>

                  <div className="mt-4 p-3 rounded bg-[#f0f9ff]/50 dark:bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 flex items-start space-x-3 transition-colors">
                     <Info size={14} className="text-[#0ea5e9] shrink-0 mt-0.5" />
                     <p className="text-[9px] font-medium text-[var(--text-secondary)] leading-normal uppercase tracking-wider">Access keys will be active immediately. Teachers can use these to mark student attendance.</p>
                  </div>
              </div>

              <div className="bg-[var(--bg-panel-alt)] border-t border-[var(--border-color)] p-4 px-6 flex justify-end items-center shrink-0">
                 <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mr-3 hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
                 <button onClick={handleCreate} disabled={saving} className="flex items-center space-x-2 px-6 py-2 rounded bg-[#06b6d4] hover:bg-[#0891b2] text-white transition-colors shadow-sm disabled:opacity-50">
                    {saving ? <Loader2 size={12} strokeWidth={2.5} className="animate-spin" /> : <Lock size={12} strokeWidth={2.5} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{saving ? 'Processing...' : 'Generate Access'}</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, required, placeholder, type = "text", value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-0.5">{label}{required && <span className="text-[#f43f5e]">*</span>}</label>
    <input type={type} onChange={e => onChange(e.target.value)} placeholder={placeholder} value={value || ''} className="w-full h-9 px-3 rounded text-[var(--text-primary)] text-[11px] font-medium placeholder:text-gray-400 dark:placeholder:text-[#334155] focus:outline-none focus:border-[#0ea5e9] transition-colors bg-[var(--bg-main)] border border-[var(--border-color)]" />
  </div>
);

const StatCard = ({ label, value, sub, icon: Icon, color, bg, borderLeft }) => (
  <div className={`bg-[var(--bg-panel-alt)] border border-[var(--border-color)] ${borderLeft} border-l-[3px] rounded-md p-5 flex flex-col justify-between shadow-sm h-[90px] group transition-all hover:translate-y-[-2px]`}>
    <div className="flex justify-between items-start mb-2">
      <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">{label}</p>
      <div className={`w-5 h-5 rounded-full ${bg} flex items-center justify-center ${color}`}><Icon size={12} strokeWidth={2.5} /></div>
    </div>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none tracking-tight">{value}</h3>
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{sub}</p>
    </div>
  </div>
);

const TabItem = ({ active, label, icon: Icon, onClick }) => (
  <button onClick={onClick} className={`flex items-center space-x-3 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all relative shrink-0 ${active ? 'text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
    <Icon size={14} strokeWidth={3} className={active ? 'text-[#0ea5e9]' : 'text-slate-500'} />
    <span>{label}</span>
    {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>}
  </button>
);

const TextRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-2">
    <Icon size={10} className="text-[#0ea5e9]" />
    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{label}:</span>
    <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase">{value}</span>
  </div>
);

export default TeacherAppAdmin;
