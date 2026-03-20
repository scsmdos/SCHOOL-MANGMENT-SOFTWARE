const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/frontend/src/pages/TransportManagement.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// 1. Add state at line 16
lines.splice(15, 4, 
  '  const [routes, setRoutes] = useState([]);',
  '  const [vehicles, setVehicles] = useState([]);',
  '  const [drivers, setDrivers] = useState([]);',
  '  const [loading, setLoading] = useState(true);',
  '  const [selectedMapRoute, setSelectedMapRoute] = useState(null);'
);

// 2. Refresh line numbers for second replacement
let newContent = lines.join('\n');
lines = newContent.split('\n');

// Find the "View Map" button
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('View Map') && lines[i].includes('<button')) {
        lines[i] = lines[i].replace('<button className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline">View Map</button>', 
          `<button 
                             onClick={() => setSelectedMapRoute({ ...route, vehicle: v })}
                             className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline cursor-pointer"
                           >
                              View Map
                           </button>`);
    }
}

// 3. Add the Modal at the end of the MODALS section
let modalEndIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeModal === 'driver' && (") ) {
        // Find the next closing brace 
        for (let j = i; j < lines.length; j++) {
            if (lines[j].includes(')}')) {
                modalEndIndex = j;
                break;
            }
        }
        break;
    }
}

if (modalEndIndex !== -1) {
    const modalCode = `
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
                          <p className="text-[9px] font-bold text-slate-300">{selectedMapRoute.vehicle?.lat?.toFixed(4)}, {selectedMapRoute.vehicle?.lng?.toFixed(4)}</p>
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
      )}`;
    lines.splice(modalEndIndex + 1, 0, modalCode);
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Map View logic integrated!');
