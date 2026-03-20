import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Smartphone, 
  Database, 
  Mail, 
  Key, 
  Lock, 
  GraduationCap, 
  CheckCircle2, 
  Calendar, 
  Book, 
  Wallet, 
  FileText, 
  Bus, 
  Award, 
  CalendarDays, 
  HelpCircle,
  Clock,
  Home,
  MapPin,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  RefreshCw,
  Trash2
} from 'lucide-react';
import api from '../api/axios';

const ParentAppManagement = () => {
  const [viewMode, setViewMode] = useState('database');
  const [searchQuery, setSearchQuery] = useState('');
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent-accounts');
      const list = (res.data?.data ?? res.data ?? []).map(p => ({
        id: p.parent_id ?? `PAR-${p.id}`,
        rawId: p.id,
        name: p.parent_name ?? 'N/A',
        relation: p.relation ?? 'Parent',
        avatar: (p.parent_name ?? 'P').charAt(0).toUpperCase(),
        student: p.student_name ?? 'N/A',
        loginId: p.login_id ?? 'N/A',
        pin: p.pin ?? '****',
        lastActive: p.last_login ?? 'Never',
        status: p.status ?? 'Active',
        photoUrl: p.photo_url || null,
        email: p.email || '',
      }));
      setParents(list);
    } catch (err) {
      console.error('Parent accounts fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSyncParents = async () => {
    setSyncing(true);
    try {
      const res = await api.get('/sync-parents');
      alert(`Sync complete! ${res.data.count} new accounts created.`);
      fetchParents();
    } catch (err) {
      alert('Sync error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleResetPin = async () => {
    if (!newPin || newPin.length < 4) return alert('Enter a valid 4-digit PIN');
    setResetting(true);
    try {
      await api.put(`/parent-accounts/${selectedParent.rawId}/reset-pin`, { pin: newPin });
      alert('PIN updated successfully!');
      setSelectedParent(null);
      setNewPin('');
      fetchParents();
    } catch (err) {
      alert('Error updating PIN: ' + (err.response?.data?.message || err.message));
    } finally {
      setResetting(false);
    }
  };

  const handleToggleStatus = async (parent) => {
    const newStatus = parent.status === 'Active' ? 'Blocked' : 'Active';
    try {
      await api.put(`/parent-accounts/${parent.rawId}`, { status: newStatus });
      fetchParents();
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteParent = async (parent) => {
    if (!window.confirm(`Are you sure you want to delete the account for ${parent.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/parent-accounts/${parent.rawId}`);
      alert('Account deleted successfully');
      fetchParents();
    } catch (err) {
      alert('Error deleting account: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => { fetchParents(); }, [fetchParents]);

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.loginId && p.loginId.includes(searchQuery))
  );

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">
      
      {/* Refactored Header (2-page Style) */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-white/5 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-[var(--text-primary)] leading-none mb-1 uppercase tracking-tight">Parent Access Management</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-80 leading-none">Control App Credentials & Monitor Parent Activity</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <div className="flex items-center bg-gray-100 dark:bg-black/20 p-1 rounded-lg border border-[var(--border-color)] dark:border-white/5">
              <button 
                onClick={() => setViewMode('database')} 
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-md transition-all ${viewMode === 'database' ? 'bg-white dark:bg-white/10 text-[#6366f1] shadow-sm font-black' : 'text-slate-500 font-bold'}`}
              >
                 <Database size={13} strokeWidth={2.5} />
                 <span className="text-[10px] uppercase tracking-widest">Database View</span>
              </button>
              <button 
                onClick={() => setViewMode('preview')} 
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-white/10 text-[#6366f1] shadow-sm font-black' : 'text-slate-500 font-bold'}`}
              >
                 <Smartphone size={13} strokeWidth={2.5} />
                 <span className="text-[10px] uppercase tracking-widest">Mobile Preview</span>
              </button>
           </div>
           <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-1"></div>
           <button onClick={handleSyncParents} disabled={syncing} className="flex items-center space-x-2 h-9 px-4 rounded-lg bg-[#6366f1] text-white text-[11px] font-extrabold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50">
             <RefreshCw size={13} strokeWidth={2.5} className={syncing ? 'animate-spin' : ''} />
             <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-white/5 rounded-xl shadow-2xl overflow-hidden transition-all">
        
        {/* Sub Header for Database */}
        {viewMode === 'database' && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-[#171e2e]/30 border-b border-[var(--border-color)] dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-tight">Parent Accounts Database</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 opacity-70">Manage login IDs, reset pins & monitor access</p>
            </div>
            <div className="relative group">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors" strokeWidth={3} />
               <input 
                 type="text" 
                 placeholder="Search Parent, Mobile No, or Student..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-[280px] h-9 pl-9 pr-4 bg-white dark:bg-black/20 border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1]/50 transition-all shadow-inner" 
               />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0f172a] relative">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px]">
              <div className="flex flex-col items-center space-y-2">
                <RefreshCw size={24} className="animate-spin text-[#6366f1]" />
                <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest">Fetching Accounts...</p>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-auto custom-scrollbar p-0">
            {viewMode === 'database' && (
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/30">
                     <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">PARENT DETAILS</th>
                     <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">LINKED STUDENT(S)</th>
                     <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">LOGIN APP ID</th>
                     <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">LAST ACTIVE</th>
                     <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">STATUS</th>
                     <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">ADMIN CONTROLS</th>
                   </tr>
                 </thead>                 <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                   {filteredParents.map((parent) => (
                     <tr key={parent.id} className="border-b border-[var(--border-color)] dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                       <td className="px-6 py-2">
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center overflow-hidden border border-indigo-500/20">
                               {parent.photoUrl ? (
                                  <img src={parent.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                               ) : (
                                  <img src={`https://ui-avatars.com/api/?name=${parent.name}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="Profile" />
                               )}
                            </div>
                            <div>
                               <p className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-tight">{parent.name}</p>
                               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{parent.relation}</p>
                            </div>
                         </div>
                       </td>
                       <td className="px-6 py-2">
                         <div className="inline-flex items-center space-x-2 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                            <GraduationCap size={12} />
                            <span className="text-[10px] font-bold uppercase">{parent.student}</span>
                         </div>
                       </td>
                       <td className="px-6 py-2">
                         <p className="text-[12px] font-black text-[var(--text-primary)]">{parent.loginId}</p>
                         <p className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase">Initial PIN: <span className="text-[var(--text-primary)]">{parent.pin}</span></p>
                       </td>
                       <td className="px-6 py-2 text-center">
                         <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{parent.lastActive}</span>
                       </td>
                       <td className="px-6 py-2 text-center">
                         <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${parent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{parent.status}</span>
                       </td>
                       <td className="px-6 py-2 text-right">
                           <div className="flex items-center justify-end space-x-1 font-extrabold uppercase tracking-widest text-[9px]">
                             <button onClick={() => handleDeleteParent(parent)} className="w-8 h-8 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete Account"><Trash2 size={13} strokeWidth={2.5}/></button>
                             <button onClick={() => setSelectedParent(parent)} className="w-8 h-8 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors" title="Change PIN"><Key size={13} strokeWidth={2.5}/></button>
                             <button onClick={() => handleToggleStatus(parent)} className={`w-8 h-8 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center transition-colors ${parent.status === 'Active' ? 'text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:text-emerald-500'}`} title={parent.status === 'Active' ? 'Block Account' : 'Unblock Account'}><Lock size={13} strokeWidth={2.5}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}

            {viewMode === 'preview' && (
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 p-6 bg-[var(--bg-main)]">

            {/* Preview Info */}
            <div className="max-w-md w-full text-center md:text-left">
               <h3 className="text-[32px] font-black tracking-tight mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  Parent App Preview
               </h3>
               <p className="text-[14px] font-medium text-[var(--text-secondary)] leading-relaxed mb-8">
                 This is how parents interact with the school in real-time. A completely automated, fluid mobile experience delivered straight to their hands.
               </p>

               <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                     <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><CheckCircle2 size={14} /></div>
                     <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">REAL-TIME PUSH NOTIFICATIONS</span>
                  </div>
                  <div className="flex items-center space-x-4">
                     <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><CheckCircle2 size={14} /></div>
                     <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">LIVE TRANSPORT GPS TRACKING</span>
                  </div>
                  <div className="flex items-center space-x-4">
                     <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><CheckCircle2 size={14} /></div>
                     <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">INSTANT FEE & INVOICE PAYMENT</span>
                  </div>
               </div>
            </div>

            {/* Mobile Mockup */}
            <div className="relative w-[320px] h-[650px] bg-[#0A0F1C] rounded-[40px] border-[8px] border-[#1E293B] shadow-2xl overflow-hidden shrink-0">
               {/* Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-[#1E293B] rounded-b-[16px] z-20"></div>

               {/* App Header Background */}
               <div className="" style={{ position:'absolute', top:0, left:0, width:'100%', height:'220px', background:'linear-gradient(to bottom right, #4f46e5, #9333ea, #db2777)', zIndex:0 }}></div>

               {/* App Content */}
               <div className="absolute inset-0 z-10 pt-10 px-5 flex flex-col">
                  {/* Top Bar */}
                  <div className="flex items-end justify-between text-white mb-6">
                     <div>
                        <p className="text-[8px] font-black opacity-80 mb-0.5 uppercase tracking-tighter">09:58 PM • LIVE ACCESS</p>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80">WELCOME BACK</p>
                        <h4 className="text-[20px] font-black leading-tight">Aarav Sharma</h4>
                        <div className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-[8px] font-bold">Class 10 - A • STU-26-0045</div>
                     </div>
                     <div className="relative w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center">
                        <User size={24} className="opacity-80" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1E293B] rounded-full"></div>
                     </div>
                  </div>

                  {/* Highlights Card */}
                  <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl mix-blend-overlay translate-x-10 -translate-y-10"></div>
                     <div>
                        <p className="text-[9px] font-black text-white/70 uppercase">ATTENDANCE</p>
                        <p className="text-[24px] font-black text-white leading-none">92%</p>
                     </div>
                     <div className="w-px h-10 bg-white/20"></div>
                     <div>
                        <p className="text-[9px] font-black text-white/70 uppercase">NEXT CLASS</p>
                        <p className="text-[14px] font-black text-white tracking-tight">Physics Lab</p>
                     </div>
                     <button className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-white/90 transition-colors flex items-center shadow-lg">
                        ID CARD <span className="ml-1 text-[12px]">⤢</span>
                     </button>
                  </div>

                  {/* Icon Grid */}
                  <div className="grid grid-cols-4 gap-y-6 gap-x-2 mt-2 px-1 mb-8">
                     <AppIcon icon={Calendar} label="Timetable" color="text-teal-500" bg="bg-teal-100" />
                     <AppIcon icon={Book} label="Homework" color="text-blue-500" bg="bg-blue-100" />
                     <AppIcon icon={Wallet} label="Fees Paid" color="text-amber-500" bg="bg-amber-100" />
                     <AppIcon icon={FileText} label="Exams" color="text-rose-500" bg="bg-rose-100" />
                     <AppIcon icon={Bus} label="Live Bus" color="text-indigo-500" bg="bg-indigo-100" badge="LIVE" />
                     <AppIcon icon={Award} label="Results" color="text-purple-500" bg="bg-purple-100" />
                     <AppIcon icon={CalendarDays} label="Leaves" color="text-emerald-500" bg="bg-emerald-100" />
                     <AppIcon icon={HelpCircle} label="Support" color="text-slate-700" bg="bg-slate-200" />
                  </div>

                  {/* Updates Section */}
                  <div className="mt-2">
                     <div className="flex items-center justify-between mb-3 px-1">
                        <h5 className="text-[12px] font-black text-white tracking-tight uppercase">Recent Updates</h5>
                        <button className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">VIEW ALL</button>
                     </div>
                     <div className="space-y-3">
                        <UpdateCard icon={Bus} color="text-indigo-400" bg="bg-indigo-500/20" title="School Bus Arriving" time="10m ago" desc="Route RT-02 is approaching your stop." />
                        <UpdateCard icon={Book} color="text-emerald-400" bg="bg-emerald-500/20" title="New Homework" time="2h ago" desc="Mathematics: Complete Ex 5.2 by tomorrow." />
                     </div>
                  </div>
               </div>

               {/* Bottom Nav */}
               <div className="absolute bottom-0 left-0 w-full h-[60px] bg-[#111827]/90 backdrop-blur-md border-t border-white/5 z-20 flex justify-between items-center px-6">
                  <BottomNavItem icon={Home} label="HOME" active />
                  <BottomNavItem icon={Book} label="LEARN" />
                  <BottomNavItem icon={MapPin} label="TRACK" />
                  <BottomNavItem icon={User} label="PROFILE" />
               </div>
            </div>
          </div>
        )}
          </div>

          {/* Footer Area */}
          <div className="px-6 py-3 border-t border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/50 flex items-center justify-between shrink-0">
             <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
               {viewMode === 'database' ? `${filteredParents.length} REGISTERED PARENTS • LIVE CLOUD ACCESS` : 'INTERACTIVE PREVIEW MODE'}
             </p>
             {viewMode === 'database' && (
               <div className="flex items-center space-x-1">
                  <button className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-gray-100 dark:hover:text-white border border-[var(--border-color)] dark:border-white/5 transition-colors"><ChevronLeft size={16} /></button>
                  <button className="w-8 h-8 rounded-lg bg-[#6366f1] text-white flex items-center justify-center text-[11px] font-black shadow-lg shadow-indigo-500/20">1</button>
                  <button className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-gray-100 dark:hover:text-white border border-[var(--border-color)] dark:border-white/5 transition-colors"><ChevronRight size={16} /></button>
               </div>
             )}
          </div>

        </div>
      </div>

      {/* Reset PIN Modal */}
      {selectedParent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-[400px] bg-white dark:bg-[#111827] rounded-3xl border border-[var(--border-color)] dark:border-white/10 shadow-2xl overflow-hidden zoom-in duration-300">
              <div className="p-8 pb-4 text-center">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <Key size={32} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-[20px] font-black text-[var(--text-primary)] uppercase tracking-tight">Security Protocol</h3>
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">Reset App Access PIN for {selectedParent.name}</p>
                 <div className="mt-2 px-3 py-1 bg-indigo-500/5 rounded-full inline-block border border-indigo-500/10">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Login ID: {selectedParent.loginId}</span>
                 </div>
              </div>

              <div className="px-8 py-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[.2em] mb-2 block text-center">Enter New 4-Digit PIN</label>
                 <input
                    type="text"
                    maxLength={4}
                    placeholder="E.G. 5566"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-14 bg-gray-50 dark:bg-black/20 border border-[var(--border-color)] dark:border-white/10 rounded-2xl text-[24px] font-black text-center tracking-[1em] text-indigo-500 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-800"
                 />
                 <p className="text-[9px] font-bold text-slate-400 mt-4 text-center leading-relaxed">Admin overriding PIN will immediately lock out any active session. The parent will need to re-login with the new PIN.</p>
              </div>

              <div className="p-8 pt-4 flex space-x-3">
                 <button onClick={() => setSelectedParent(null)} className="flex-1 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-[var(--border-color)] dark:border-white/5">Cancel</button>
                 <button onClick={handleResetPin} disabled={resetting} className="flex-1 h-12 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all flex items-center justify-center space-x-2">
                    {resetting ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                    <span>{resetting ? 'UPDATING...' : 'CONFIRM RESET'}</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/* Mobile Preview Components */
const AppIcon = ({ icon: Icon, label, color, bg, badge }) => (
  <div className="flex flex-col items-center justify-center relative cursor-pointer group">
    <div className={`w-12 h-12 rounded-[14px] ${bg} ${color} flex items-center justify-center mb-1.5 shadow-sm transform group-hover:scale-95 transition-transform`}>
      <Icon size={22} strokeWidth={2.5} />
    </div>
    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
    {badge && (
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#0A0F1C] animate-pulse">
        {badge}
      </div>
    )}
  </div>
);

const UpdateCard = ({ icon: Icon, color, bg, title, time, desc }) => (
  <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-3 flex space-x-3">
    <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
       <Icon size={18} />
    </div>
    <div className="flex-1">
       <div className="flex justify-between items-start">
          <h6 className="text-[11px] font-black text-white">{title}</h6>
          <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">{time}</span>
       </div>
       <p className="text-[9px] font-medium text-slate-300 mt-0.5 leading-snug">{desc}</p>
    </div>
  </div>
);

const BottomNavItem = ({ icon: Icon, label, active }) => (
  <div className="flex flex-col items-center cursor-pointer">
     <Icon size={20} className={active ? "text-indigo-400" : "text-slate-500"} strokeWidth={active ? 2.5 : 2} />
     <span className={`text-[8px] font-black mt-1 ${active ? "text-indigo-400" : "text-slate-500"}`}>{label}</span>
  </div>
);

export default ParentAppManagement;
