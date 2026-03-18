import React, { useState, useEffect, useCallback } from 'react';
import { Users, Monitor, IndianRupee, LineChart, RefreshCw, GraduationCap, Bell, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: '--', totalEmployees: '--', monthlyRevenue: '--', revenueChange: '+0%', attendancePct: '--%' });
  const [chartData, setChartData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [notices, setNotices] = useState([]);
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard-stats');
      const d = res.data;
      setStats(d.stats || {});
      setChartData((d.chartData || []).map(item => ({ name: item.name, uv: item.revenue, pv: item.expenses })));
      setAttendanceData((d.attendanceData || []).map(item => ({ label: item.name, value: item.value })));
      setNotices(d.notices || []);
      setRecentAdmissions(d.recentAdmissions || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Fallback for UI if request fails
      setStats({ totalStudents: 'ERR', totalEmployees: 'ERR', monthlyRevenue: 0, revenueChange: '0%', attendancePct: '0%' });
      alert('Dashboard Data Error: Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const formatCurrency = (val) => {
    if (val === '--' || val === undefined || val === null) return '--';
    const num = parseFloat(val);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num}`;
  };

  return (
    <div className="px-6 py-4 bg-[var(--bg-main)] h-[calc(100vh-56px)] overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Upper Status Bar */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center space-x-2.5">
           <div className={`w-2.5 h-2.5 rounded-full block shadow-sm ${loading ? 'bg-amber-400 animate-pulse' : 'bg-[#22C55E]'}`}></div>
           <span className="text-[12px] font-bold text-[var(--text-secondary)] tracking-wider uppercase mt-[2px]">Live Data</span>
           <span className="text-[12px] text-[var(--text-secondary)] font-medium mt-[2px]">- Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <button 
          onClick={fetchDashboard} 
          disabled={loading}
          className="flex items-center space-x-1.5 text-[12px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors tracking-wide p-1 disabled:opacity-50"
        >
          <RefreshCw size={14} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
          <span>REFRESH</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
        
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between shadow-[var(--card-shadow)] transition-colors h-[110px]">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-100 dark:bg-[#1B293C] rounded-lg text-[#38BDF8] transition-colors">
              <GraduationCap size={20} strokeWidth={2.5} />
            </div>
            <div className="px-2 py-0.5 rounded border border-[var(--border-color)] dark:border-[#0F4F24] dark:bg-[#0A2E16] bg-green-50 text-[#22C55E] text-[10px] font-bold tracking-wider flex items-center space-x-0.5">
              <span>↑</span><span>+New</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] leading-none tracking-tight mb-1 transition-colors">
              {loading ? <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span> : (stats.totalStudents ?? '--')}
            </h3>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase">Total Students</p>
          </div>
        </div>

        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between shadow-[var(--card-shadow)] transition-colors h-[110px]">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-100 dark:bg-[#1A3129] rounded-lg text-[#A3E635] transition-colors">
              <Monitor size={20} strokeWidth={2.5} />
            </div>
            <div className="px-2 py-0.5 rounded border border-[var(--border-color)] dark:border-[#0F4F24] dark:bg-[#0A2E16] bg-green-50 text-[#22C55E] text-[10px] font-bold tracking-wider flex items-center space-x-0.5">
              <span>↑</span><span>+Active</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] leading-none tracking-tight mb-1 transition-colors">
              {loading ? <span className="inline-block w-10 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span> : (stats.totalEmployees ?? '--')}
            </h3>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase">Total Staff</p>
          </div>
        </div>

        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between shadow-[var(--card-shadow)] transition-colors h-[110px]">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-100 dark:bg-[#3B2925] rounded-lg text-[#FB923C] transition-colors">
              <IndianRupee size={20} strokeWidth={2.5} />
            </div>
            <div className="px-2 py-0.5 rounded border border-[var(--border-color)] dark:border-[#0F4F24] dark:bg-[#0A2E16] bg-green-50 text-[#22C55E] text-[10px] font-bold tracking-wider flex items-center space-x-0.5">
              <span>↑</span><span>{stats.revenueChange || '+0%'}</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] leading-none tracking-tight mb-1 transition-colors">
              {loading ? <span className="inline-block w-20 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span> : formatCurrency(stats.monthlyRevenue)}
            </h3>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase">Monthly Revenue</p>
          </div>
        </div>

        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between shadow-[var(--card-shadow)] transition-colors h-[110px]">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-100 dark:bg-[#381F2F] rounded-lg text-[#F43F5E] transition-colors">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div className="px-2 py-0.5 rounded border border-[var(--border-color)] dark:border-[#0A3D4C] dark:bg-[#062430] bg-sky-50 text-[#0EA5E9] text-[10px] font-bold tracking-wider flex items-center space-x-0.5">
              <span>↑</span><span>Live</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] leading-none tracking-tight mb-1 transition-colors">
              {loading ? <span className="inline-block w-16 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span> : (stats.attendancePct ?? '--%')}
            </h3>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase">Active Students %</p>
          </div>
        </div>
      </div>

      {/* Analytics Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3 flex-1 min-h-0">
        
        {/* FINANCIAL ANALYTICS AREA CHART */}
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] p-6 rounded-xl flex flex-col shadow-[var(--card-shadow)] transition-colors h-full">
          <div className="mb-4 shrink-0">
            <h3 className="text-[14px] font-bold text-[var(--text-primary)] tracking-wide uppercase transition-colors">Financial Analytics</h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5">Revenue - Last 6 Months</p>
          </div>
          <div className="flex-1 w-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={{ stroke: '#1E293B' }} tickLine={false} tick={{ fill: '#71829B', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71829B', fontSize: 11, fontWeight: 'bold' }} tickFormatter={(v) => v === 0 ? '₹0k' : `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg-panel-alt)', borderColor: 'var(--border-color)', fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="uv" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" isAnimationActive={true} />
                <Area type="monotone" dataKey="pv" stroke="#0A3D4C" strokeDasharray="4 4" strokeWidth={2} fillOpacity={0} isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT SIDE: Attendance + Notices */}
        <div className="flex flex-col gap-3 h-full min-h-0">
          {/* Attendance Bar Chart */}
          <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] p-5 rounded-xl flex flex-col shadow-[var(--card-shadow)] transition-colors flex-1 min-h-0">
            <div className="mb-3 shrink-0">
              <h3 className="text-[14px] font-bold text-[var(--text-primary)] tracking-wide uppercase">Attendance</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5">Weekly Average</p>
            </div>
            <div className="flex-1 w-full min-h-[160px] pt-2">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                   <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#71829B', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                   <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#71829B', fontSize: 11, fontWeight: 'bold' }} />
                   <Tooltip formatter={(val) => [`${val}%`, 'Attendance']} contentStyle={{ background: 'var(--bg-panel-alt)', borderColor: 'var(--border-color)', fontSize: 12, borderRadius: 8 }} />
                   <Bar dataKey="value" fill="#84cc16" radius={[4, 4, 0, 0]} barSize={24} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] p-4 rounded-xl shadow-[var(--card-shadow)] transition-colors shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wide">Recent Notices</h3>
              <Bell size={14} className="text-amber-400" />
            </div>
            <div className="space-y-2.5">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>)
              ) : notices.length > 0 ? notices.map((n, i) => (
                <div key={i} className="flex items-start justify-between">
                  <p className="text-[11px] font-semibold text-[var(--text-primary)] leading-snug pr-2 truncate max-w-[200px]">{n.title}</p>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap shrink-0">{n.time}</span>
                </div>
              )) : (
                <p className="text-[11px] text-slate-400">No notices found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
