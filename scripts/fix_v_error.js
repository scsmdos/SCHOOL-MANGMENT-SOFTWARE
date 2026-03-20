const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/frontend/src/pages/TransportManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `                <div className="flex-1 space-y-3">
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
                                       <div className={`w-1.5 h-1.5 rounded-full $\{v?.lat ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                       <span className="text-[9px] font-black text-[var(--text-primary)] uppercase ml-2">
                                          Tracking: <span className="text-indigo-500 font-black ml-1">
                                             {v?.lat ? \`$\{Number(v.lat).toFixed(4)}, $\{Number(v.lng).toFixed(4)}\` : 'OFFLINE'}
                                          </span>
                                       </span>
                                    </>
                                 );
                              })()}
                          </div>
                          <button 
                             onClick={() => setSelectedMapRoute({ ...route, vehicle: v })}
                             className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline cursor-pointer"
                           >
                              View Map
                           </button>
                       </div>
                    </div>
                  ))}
                </div>`;

const newBlock = `                <div className="flex-1 space-y-3">
                  {filteredRoutes.map(route => {
                    const vehicle = vehicles.find(vh => String(vh.rawId) === String(route.assignedVehicleId));
                    return (
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
                               <div className={\`w-1.5 h-1.5 rounded-full $\{vehicle?.lat ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}\`}></div>
                               <span className="text-[9px] font-black text-[var(--text-primary)] uppercase ml-2">
                                  Tracking: <span className="text-indigo-500 font-black ml-1">
                                     {vehicle?.lat ? \`$\{Number(vehicle.lat).toFixed(4)}, $\{Number(vehicle.lng).toFixed(4)}\` : 'OFFLINE'}
                                  </span>
                               </span>
                            </div>
                            <button 
                              onClick={() => setSelectedMapRoute({ ...route, vehicle })}
                              className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline cursor-pointer"
                            >
                               View Map
                            </button>
                         </div>
                      </div>
                    );
                  })}
                </div>\`;

// Replace while ignoring whitespace variations slightly if possible, but let's try direct first.
// If direct fails, I'll use a more robust regex-based approach.
if (content.indexOf(oldBlock) !== -1) {
    fs.writeFileSync(path, content.replace(oldBlock, newBlock), 'utf8');
    console.log('Fixed ReferenceError!');
} else {
    console.log('Count not find oldBlock. Trying line-based replacement...');
    let lines = content.split('\\n');
    let start = -1;
    let end = -1;
    for(let i=0; i<lines.length; i++) {
        if (lines[i].includes('filteredRoutes.map(route => (') ) start = i;
        if (start !== -1 && lines[i].includes('                </div>') && i > start + 50) {
            end = i;
            break;
        }
    }
    if (start !== -1 && end !== -1) {
        lines.splice(start, end - start + 1, newBlock);
        fs.writeFileSync(path, lines.join('\\n'), 'utf8');
        console.log('Fixed ReferenceError via line search!');
    } else {
        console.log('Failed to find markers.');
    }
}
