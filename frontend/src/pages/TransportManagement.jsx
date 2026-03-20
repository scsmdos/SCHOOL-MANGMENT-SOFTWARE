import React, { useState, useEffect, useCallback } from 'react';
import {
  Bus, MapPin, Navigation, Users, AlertTriangle, Download, Search, Plus,
  Map as MapIcon, Settings, MoreVertical, Wrench, Fuel, CheckCircle2,
  ChevronLeft, ChevronRight, User, Phone, CreditCard, Calendar, X,
  ArrowRight, TrendingUp, Activity, RefreshCw, Loader2, Tag, Clock, Trash2, Send, Hash, UserCheck
} from 'lucide-react';
import api from '../api/axios';

const TransportManagement = () => {
  const [activeTab, setActiveTab] = useState('Tracking');
  const [search, setSearch] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  // Live data state
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapRoute, setSelectedMapRoute] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rv, vv, dv] = await Promise.allSettled([
        api.get('/transport-routes'),
        api.get('/transport-vehicles'),
        api.get('/transport-drivers'),
      ]);

      if (rv.status === 'fulfilled') {
        const list = (rv.value.data?.data ?? rv.value.data ?? []).map(r => ({
          rawId: r.id,
          id: r.route_id ?? `RT-${r.id}`,
          name: r.route_name ?? r.name ?? 'N/A',
          stops: r.total_stops ? `${r.total_stops} Stops` : '0 Stops',
          vehicleId: r.assigned_vehicle_id || r.vehicle_number || 'N/A',
          assignedVehicleId: r.assigned_vehicle_id,
          assignedDriverId: r.assigned_driver_id,
          students: r.total_students ?? 0,
          status: r.status ?? 'ACTIVE',
          tracking: 'Live',
        }));
        setRoutes(list);
      }

      if (vv.status === 'fulfilled') {
        const list = (vv.value.data?.data ?? vv.value.data ?? []).map(v => ({
          rawId: v.id,
          id: v.vehicle_id ?? `VEH-${v.id}`,
          regNo: v.registration_no ?? v.reg_no ?? 'N/A',
          type: v.vehicle_type ?? 'BUS',
          seats: v.seating_capacity ?? v.seats ?? v.capacity ?? 0,
          nextService: v.next_service_date ?? v.next_service ?? 'Pending',
          fuel: v.fuel_level ?? 100,
          status: v.status ?? 'ACTIVE',
          lat: v.current_lat,
          lng: v.current_lng,
          isTracking: v.is_tracking,
        }));
        setVehicles(list);
      }

      if (dv.status === 'fulfilled') {
        const list = (dv.value.data?.data ?? dv.value.data ?? []).map(d => ({
          rawId: d.id,
          id: d.driver_id ?? `DRV-${d.id}`,
          name: d.name ?? 'N/A',
          phone: d.contact_number ?? d.phone ?? 'N/A',
          license: d.license_no ?? 'N/A',
          experience: d.experience ?? 'N/A',
          assignedVehicle: d.vehicle_id ?? d.assigned_vehicle ?? 'Unassigned',
          status: d.status ?? 'ON DUTY',
        }));
        setDrivers(list);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (resource, id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/${resource}/${id}`);
      fetchAll();
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const simulateLocation = async () => {
    if (vehicles.length === 0) return alert('No vehicles to simulate');
    const v = vehicles[Math.floor(Math.random() * vehicles.length)];
    const lat = 25.5941 + (Math.random() - 0.5) * 0.01; // Mock Patna Area
    const lng = 85.1376 + (Math.random() - 0.5) * 0.01;
    try {
       await api.post(`/vehicle-location-update/${v.rawId}`, { lat, lng });
       fetchAll();
       alert(`Simulated move for ${v.regNo}`);
    } catch (err) { alert('Simulation failed'); }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Filtered Data ── */
  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));
  const filteredVehicles = vehicles.filter(v => v.regNo.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase()));
  const filteredDrivers = drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()));

  const closeModal = () => setActiveModal(null);

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-[22px] font-black text-[var(--text-primary)] tracking-tight leading-none mb-1 uppercase tracking-[0.05em]">GPS Transport Tracking</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-[0.1em] uppercase opacity-70">Real-time Vehicles & Route Management System</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={simulateLocation} className="flex items-center space-x-2 h-9 px-4 rounded-lg bg-emerald-500 text-white text-[11px] font-extrabold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
            <Activity size={13} strokeWidth={2.5} /><span>Simulate GPS Move</span>
          </button>
          <button onClick={fetchAll} disabled={loading} className="flex items-center space-x-2 h-9 px-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-extrabold text-[var(--text-primary)] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={2.5} className={`text-[#6366f1] ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 h-9 px-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-extrabold text-[var(--text-primary)] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm">
            <Download size={13} strokeWidth={2.5} className="text-[#6366f1]" /><span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-4 shrink-0">
        <StatCard label="Active Vehicles" value={loading ? '...' : String(vehicles.length)} sub="Total Registered" icon={Bus} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20 shadow-indigo-500/5" />
        <StatCard label="Live Routes" value={loading ? '...' : String(routes.length)} sub="Total Network" icon={Navigation} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20 shadow-amber-500/5" />
        <StatCard label="Total Drivers" value={loading ? '...' : String(drivers.length)} sub="Directory Count" icon={Users} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20 shadow-emerald-500/5" />
        <StatCard label="System Alerts" value="0" sub="Systems Normal" icon={AlertTriangle} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20 shadow-rose-500/5" />
      </div>

      {/* Content Area with Tabs */}
      <div className="flex-1 flex flex-col bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-white/5 rounded-xl shadow-2xl overflow-hidden transition-all">
        
        {/* Tab Bar */}
        <div className="flex items-center px-4 pt-1 bg-gray-50 dark:bg-[#171e2e] border-b border-[var(--border-color)] dark:border-white/5 shrink-0">
          <TabItem active={activeTab === 'Tracking'} label="LIVE ROUTES & TRACKING" icon={Navigation} onClick={() => setActiveTab('Tracking')} />
          <TabItem active={activeTab === 'Vehicles'} label="VEHICLES & MAINTENANCE" icon={Bus} onClick={() => setActiveTab('Vehicles')} />
          <TabItem active={activeTab === 'Drivers'} label="DRIVER DIRECTORY" icon={Users} onClick={() => setActiveTab('Drivers')} />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0f172a]">
          
          {/* Sub Toolbar */}
          <div className="px-6 py-3 flex items-center justify-between border-b border-[var(--border-color)] dark:border-white/5 shrink-0">
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors" strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder={
                    activeTab === 'Tracking' ? "Search Route ID or Name..." :
                    activeTab === 'Vehicles' ? "Search Vehicle ID or Reg. No..." : "Search Driver Name or ID..."
                  }
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-[320px] h-9 pl-9 pr-4 bg-white dark:bg-[#111827] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1]/50 transition-all shadow-inner" 
                />
             </div>
             <div className="flex items-center space-x-3">
                <button onClick={fetchAll} disabled={loading} className="flex items-center space-x-2 px-4 h-9 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-black text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50">
                   <RefreshCw size={13} strokeWidth={3} className={`text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
                   <span>Refresh</span>
                </button>
                {activeTab === 'Tracking' && (
                  <button onClick={() => setActiveModal('route')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-[#f59e0b] text-white text-[11px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600">
                    <Plus size={14} strokeWidth={3} />
                    <span>Create Route</span>
                  </button>
                )}
                {activeTab === 'Vehicles' && (
                  <button onClick={() => setActiveModal('vehicle')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-[#818cf8] text-white text-[11px] font-black shadow-lg shadow-indigo-500/20 transition-all hover:bg-[#6366f1]">
                    <Plus size={14} strokeWidth={3} />
                    <span>Add Vehicle</span>
                  </button>
                )}
                {activeTab === 'Drivers' && (
                  <button onClick={() => setActiveModal('driver')} className="flex items-center space-x-2 px-6 h-9 rounded-lg bg-[#10b981] text-white text-[11px] font-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600">
                    <Plus size={14} strokeWidth={3} />
                    <span>Add Driver</span>
                  </button>
                )}
             </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            {loading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[2px]">
                <div className="flex flex-col items-center space-y-2">
                  <RefreshCw size={24} className="animate-spin text-[#6366f1]" />
                  <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest">Updating Fleet...</p>
                </div>
              </div>
            )}
            {activeTab === 'Tracking' && (
              <div className="p-6 flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  {filteredRoutes.map(route => (
                    <div key={route.id} className="p-3.5 bg-gray-50 dark:bg-white/[0.02] border border-[var(--border-color)] dark:border-white/5 rounded-xl group transition-all">
                       <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                                <Navigation size={20} />
                             </div>
                             <div>
                                <h4 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center">
                                   {route.name}
                                   <span className="ml-2 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-bold rounded border border-indigo-500/20">{route.id}</span>
                                </h4>
                                <div className="flex items-center space-x-3 mt-1">
                                   <div className="flex items-center text-[9px] font-bold text-rose-500 uppercase">
                                      <MapPin size={11} className="mr-1" /> {route.stops}
                                   </div>
                                   <div className="flex items-center text-[9px] font-bold text-slate-500 uppercase">
                                      <Bus size={11} className="mr-1" /> {route.vehicleId}
                                   </div>
                                   <div className="flex items-center text-[9px] font-bold text-emerald-500 uppercase">
                                      <Users size={11} className="mr-1" /> {route.students}
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                             <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-widest">
                                {route.status}
                             </span>
                             <button onClick={() => handleDelete('transport-routes', route.rawId)} className="text-rose-500 hover:text-rose-600">
                                <Trash2 size={14} />
                             </button>
                          </div>
                       </div>
                       <div className="p-2 bg-white dark:bg-black/20 border border-[var(--border-color)] dark:border-white/5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                             {(() => {
                                 const v = vehicles.find(vh => String(vh.rawId) === String(route.assignedVehicleId));
                                 return (
                                    <>
                                       <div className={`w-1.5 h-1.5 rounded-full ${v?.lat ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                       <span className="text-[9px] font-black text-[var(--text-primary)] uppercase ml-2">
                                          Tracking: <span className="text-indigo-500 font-black ml-1">
                                             {v?.lat ? `${Number(v.lat).toFixed(4)}, ${Number(v.lng).toFixed(4)}` : 'OFFLINE'}
                                          </span>
                                       </span>
                                    </>
                                 );
                              })()}
                          </div>
                          <button 
                             onClick={() => { const v = vehicles.find(vh => String(vh.rawId) === String(route.assignedVehicleId)); setSelectedMapRoute({ ...route, vehicle: v }); }}
                             className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline cursor-pointer"
                           >
                              View Map
                           </button>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Real-time Telemetry Section */}
                <div className="w-full lg:w-[350px] border border-[var(--border-color)] dark:border-white/5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] p-4">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Telemetry Data</h4>
                      <MapPin size={14} className="text-amber-500" />
                   </div>
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-4">Real-time GPS Activity</p>
                   
                   <div className="h-[140px] w-full relative flex items-end justify-between px-2 mb-4 group/chart">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                               <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                         </defs>
                         <path 
                           d="M0,80 Q10,75 20,85 T40,60 T60,50 T80,30 T100,70 L100,100 L0,100 Z" 
                           fill="url(#chartGradient)" 
                           className="transition-all duration-700 group-hover/chart:opacity-80"
                         />
                         <path 
                           d="M0,80 Q10,75 20,85 T40,60 T60,50 T80,30 T100,70" 
                           fill="none" 
                           stroke="#6366f1" 
                           strokeWidth="2" 
                           className="transition-all duration-700"
                         />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Activity size={40} className="text-indigo-500/10 animate-pulse" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white dark:bg-white/5 border border-[var(--border-color)] dark:border-white/5 rounded-xl">
                         <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Avg Speed</p>
                         <p className="text-[18px] font-black text-indigo-500">42 <span className="text-[10px]">KM/H</span></p>
                      </div>
                      <div className="p-3 bg-white dark:bg-white/5 border border-[var(--border-color)] dark:border-white/5 rounded-xl">
                         <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Signal Strength</p>
                         <p className="text-[18px] font-black text-emerald-500">98 <span className="text-[10px]">%</span></p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'Vehicles' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/30">
                    <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">VEHICLE ID</th>
                    <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">REGISTRATION DETAILS</th>
                    <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">SPECS / NEXT SERVICE</th>
                    <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">FUEL & STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-2.5">
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                              <Bus size={16} />
                           </div>
                           <span className="text-[11px] font-black text-[var(--text-primary)] uppercase">{v.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-2.5">
                        <p className="text-[11px] font-black text-indigo-500 uppercase tracking-tight">{v.regNo}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{v.type}</p>
                      </td>
                      <td className="px-6 py-2.5">
                        <div className="space-y-0.5">
                           <p className="text-[10px] font-black text-[var(--text-primary)] flex items-center">
                              <TrendingUp size={11} className="mr-1.5 text-emerald-500" /> {v.seats} Seats
                           </p>
                           <p className="text-[9px] font-bold text-rose-500 flex items-center">
                              <Wrench size={11} className="mr-1.5" /> Service: {v.nextService}
                           </p>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-right">
                         <div className="flex items-center justify-end space-x-2">
                             <div className="inline-flex flex-col items-end mr-3">
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-widest mb-1.5">
                                   {v.status}
                                </span>
                                <div className="flex items-center space-x-2">
                                   <Fuel size={11} className="text-slate-400" />
                                   <div className="w-16 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500" style={{ width: `${v.fuel}%` }}></div>
                                   </div>
                                   <span className="text-[9px] font-black text-[var(--text-primary)]">{v.fuel}%</span>
                                </div>
                             </div>
                             <button onClick={() => handleDelete('transport-vehicles', v.rawId)} className="w-7 h-7 text-rose-500 hover:bg-rose-500 hover:text-white rounded border border-rose-500/20 flex items-center justify-center transition-all">
                                <Trash2 size={12} />
                             </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Drivers' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {filteredDrivers.map(driver => (
                   <div key={driver.id} className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-[var(--border-color)] dark:border-white/5 rounded-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative">
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center space-x-3">
                           <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 relative">
                              <User size={24} />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-[#0f172a] rounded-full flex items-center justify-center border border-[var(--border-color)]">
                                 <CheckCircle2 size={10} className="text-emerald-500" />
                              </div>
                           </div>
                           <div>
                              <h4 className="text-[13px] font-black text-[var(--text-primary)] uppercase">{driver.name}</h4>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{driver.id}</p>
                           </div>
                        </div>
                        <button onClick={() => handleDelete('transport-drivers', driver.rawId)} className="w-8 h-8 text-rose-500 hover:bg-rose-500 hover:text-white rounded border border-rose-500/20 flex items-center justify-center transition-all">
                           <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="space-y-2 relative z-10">
                         <div className="flex items-center text-[9px] font-black text-slate-600 dark:text-slate-400">
                            <Phone size={11} className="mr-2 text-indigo-500" /> {driver.phone}
                         </div>
                         <div className="flex items-center text-[9px] font-black text-slate-600 dark:text-slate-400">
                            <CreditCard size={11} className="mr-2 text-amber-500" /> {driver.license}
                         </div>
                         <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-color)] dark:border-white/5">
                            <p className="text-[8px] font-bold text-slate-500 uppercase">Bus: <span className="text-indigo-500 font-black">{driver.assignedVehicle}</span></p>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-[7px] font-black uppercase">
                               {driver.status}
                            </span>
                         </div>
                      </div>
                      <IconBackground icon={User} color="text-emerald-500" />
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="px-6 py-3 border-t border-[var(--border-color)] dark:border-white/5 bg-gray-50 dark:bg-[#171e2e]/50 flex items-center justify-between shrink-0">
             <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
               {activeTab === 'Tracking' ? `${filteredRoutes.length} Active Routes` : 
                activeTab === 'Vehicles' ? `${filteredVehicles.length} Registered Vehicles` : `${filteredDrivers.length} Certified Drivers`}
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
      {activeModal === 'route' && (
        <AddRouteModal onClose={closeModal} onSuccess={fetchAll} vehicles={vehicles} drivers={drivers} />
      )}
      {activeModal === 'vehicle' && (
        <AddVehicleModal onClose={closeModal} onSuccess={fetchAll} />
      )}
      {activeModal === 'driver' && (
        <AddDriverModal onClose={closeModal} onSuccess={fetchAll} vehicles={vehicles} />
      )}

      {/* Live Map Modal */}
      {selectedMapRoute && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                 <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
                       <MapPin size={16} className="mr-2 text-blue-500" />
                       Live Tracking: {selectedMapRoute.name}
                    </h3>
                    <p className="text-[9px] font-extrabold text-slate-500 uppercase mt-0.5 tracking-tight">
                       Bus: {selectedMapRoute.vehicle?.regNo || 'N/A'} — Driver: {drivers.find(d => String(d.rawId) === String(selectedMapRoute.assignedDriverId))?.name || 'Unknown'}
                    </p>
                 </div>
                 <button onClick={() => setSelectedMapRoute(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <X size={18} />
                 </button>
              </div>
              <div className="flex-1 bg-slate-800 relative">
                 {selectedMapRoute.vehicle?.lat ? (
                    <iframe
                       width="100%"
                       height="100%"
                       frameBorder="0"
                       scrolling="no"
                       marginHeight="0"
                       marginWidth="0"
                       src={"https://maps.google.com/maps?q=" + selectedMapRoute.vehicle.lat + "," + selectedMapRoute.vehicle.lng + "&hl=en&z=14&output=embed"}
                       className="border-none"
                    ></iframe>
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                       <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin"></div>
                       <p className="text-[11px] font-black uppercase tracking-widest">Awaiting GPS Signal...</p>
                    </div>
                 )}
                 <div className="absolute bottom-6 left-6 p-4 bg-[#0f172a]/90 backdrop-blur border border-white/10 rounded-xl shadow-xl w-64 z-10 transition-all">
                    <div className="flex items-center space-x-3 mb-4">
                       <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Bus size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-extrabold text-blue-500 uppercase leading-none mb-1">On Route</p>
                          <p className="text-xs font-black text-white uppercase">{selectedMapRoute.vehicle?.regNo}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Coordinates</p>
                          <p className="text-[9px] font-bold text-slate-300">{Number(selectedMapRoute.vehicle?.lat || 0).toFixed(4)}, {Number(selectedMapRoute.vehicle?.lng || 0).toFixed(4)}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Status</p>
                          <div className="flex items-center space-x-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                             <p className="text-[9px] font-bold text-emerald-500">ACTIVE</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-4 bg-[#0f172a] border-t border-white/10 flex items-center justify-between">
                 <div className="flex items-center space-x-6 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center"><Users size={12} className="mr-2" /> {selectedMapRoute.students} Students</span>
                    <span className="flex items-center"><Navigation size={12} className="mr-2" /> {selectedMapRoute.stops}</span>
                 </div>
                 <button 
                   onClick={() => window.open("https://www.google.com/maps/dir/?api=1&destination=" + selectedMapRoute.vehicle?.lat + "," + selectedMapRoute.vehicle?.lng, '_blank')}
                   className="px-4 py-2 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center shadow-lg shadow-blue-500/20"
                 >
                    <Navigation size={12} className="mr-2" /> View Full Path
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/* ── MODAL COMPONENTS ── */

const AddRouteModal = ({ onClose, onSuccess, vehicles, drivers }) => {
  const [formData, setFormData] = useState({
    name: '',
    total_stops: '',
    vehicle_number: '',
    assigned_vehicle_id: '',
    assigned_driver_id: '',
    driver_name: '',
    driver_contact: '',
    start_time: '',
    status: 'ACTIVE'
  });

  const handleSubmit = async () => {
    try {
      await api.post('/transport-routes', formData);
      onSuccess();
      onClose();
    } catch (err) { alert('Save failed: ' + err.message); }
  };

  const handleVehicleChange = (vId) => {
    const v = vehicles.find(vh => String(vh.rawId) === String(vId));
    if (v) {
      setFormData({
        ...formData,
        assigned_vehicle_id: v.rawId,
        vehicle_number: v.regNo
      });
    }
  };

  const handleDriverChange = (driverId) => {
    const d = drivers.find(drv => String(drv.rawId) === String(driverId));
    if (d) {
      setFormData({
        ...formData,
        assigned_driver_id: d.rawId,
        driver_name: d.name,
        driver_contact: d.phone
      });
    }
  };

  return (
    <GenericModal title="Create New Route" icon={Navigation} color="amber" onClose={onClose} onSave={handleSubmit}>
      <div className="grid grid-cols-2 gap-5">
        <InputField label="ROUTE NAME" icon={Navigation} placeholder="City Center" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
        <InputField label="TOTAL STOPS" icon={MapPin} placeholder="e.g. 5" value={formData.total_stops} onChange={v => setFormData({...formData, total_stops: v})} />
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">ASSIGN VEHICLE</label>
          <select 
            value={formData.assigned_vehicle_id}
            onChange={e => handleVehicleChange(e.target.value)}
            className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-amber-500"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.rawId}>{v.regNo} ({v.id})</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">ASSIGN DRIVER</label>
          <select 
            value={formData.assigned_driver_id}
            onChange={e => handleDriverChange(e.target.value)}
            className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-amber-500"
          >
            <option value="">Select Driver</option>
            {drivers.map(d => <option key={d.id} value={d.rawId}>{d.name}</option>)}
          </select>
        </div>
        <InputField label="START TIME" icon={Clock} type="time" value={formData.start_time} onChange={v => setFormData({...formData, start_time: v})} />
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">STATUS</label>
          <select 
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-amber-500"
          >
            <option>ACTIVE</option>
            <option>INACTIVE</option>
          </select>
        </div>
      </div>
    </GenericModal>
  );
};

const AddVehicleModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    reg_no: '',
    vehicle_type: 'BUS',
    capacity: '',
    fuel_level: '100%',
    status: 'ACTIVE'
  });

  const handleSubmit = async () => {
    try {
      await api.post('/transport-vehicles', formData);
      onSuccess();
      onClose();
    } catch (err) { alert('Save failed: ' + err.message); }
  };

  return (
    <GenericModal title="Add New Vehicle" icon={Bus} color="indigo" onClose={onClose} onSave={handleSubmit}>
      <div className="grid grid-cols-2 gap-5">
        <InputField label="REGISTRATION NO" icon={CreditCard} placeholder="e.g. BR01-1234" value={formData.reg_no} onChange={v => setFormData({...formData, reg_no: v})} />
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">VEHICLE TYPE</label>
          <select 
            value={formData.vehicle_type}
            onChange={e => setFormData({...formData, vehicle_type: e.target.value})}
            className="h-10 px-3 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] dark:border-white/10 rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500"
          >
            <option>BUS</option>
            <option>VAN</option>
            <option>MINI BUS</option>
          </select>
        </div>
        <InputField label="SEATING CAPACITY" icon={Users} type="number" value={formData.capacity} onChange={v => setFormData({...formData, capacity: v})} />
        <InputField label="FUEL LEVEL (%)" icon={Fuel} placeholder="e.g. 100%" value={formData.fuel_level} onChange={v => setFormData({...formData, fuel_level: v})} />
      </div>
    </GenericModal>
  );
};

const AddDriverModal = ({ onClose, onSuccess, vehicles }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_no: '',
    experience: '',
    status: 'ON DUTY'
  });

  const handleSubmit = async () => {
    try {
      await api.post('/transport-drivers', formData);
      onSuccess();
      onClose();
    } catch (err) { alert('Save failed: ' + err.message); }
  };

  return (
    <GenericModal title="Register Driver" icon={User} color="emerald" onClose={onClose} onSave={handleSubmit}>
      <div className="grid grid-cols-2 gap-5">
        <InputField label="DRIVER NAME" icon={User} placeholder="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
        <InputField label="PHONE NUMBER" icon={Phone} placeholder="Contact No" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
        <InputField label="LICENSE NO" icon={CreditCard} placeholder="License ID" value={formData.license_no} onChange={v => setFormData({...formData, license_no: v})} />
        <InputField label="EXPERIENCE" icon={Activity} placeholder="e.g. 5 Years" value={formData.experience} onChange={v => setFormData({...formData, experience: v})} />
      </div>
    </GenericModal>
  );
};

/* ── HELPER COMPONENTS ── */

const GenericModal = ({ title, icon: Icon, color, children, onClose, onSave }) => {
  const colorMap = {
    amber: 'bg-amber-500 shadow-amber-500/30',
    indigo: 'bg-indigo-500 shadow-indigo-500/30',
    emerald: 'bg-emerald-500 shadow-emerald-500/30'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-panel-alt)] w-full max-w-[550px] rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-color)] dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/[0.02]">
           <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${colorMap[color]}`}>
                 <Icon size={20} />
              </div>
              <div>
                 <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-tight">{title}</h3>
                 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-70">Transport System</p>
              </div>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">
           {children}
           <div className="mt-8 flex items-center justify-end space-x-3">
              <button onClick={onClose} className="px-6 h-10 text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">Cancel</button>
              <button onClick={onSave} className={`px-8 h-10 text-white text-[11px] font-black rounded-lg transition-all uppercase tracking-widest ${colorMap[color]}`}>
                 Save Record
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

const IconBackground = ({ icon: Icon, color }) => (
  <Icon className={`absolute -right-6 -bottom-6 w-32 h-32 ${color} opacity-[0.03] rotate-12 transition-opacity group-hover:opacity-[0.05] pointer-events-none`} />
);

export default TransportManagement;
