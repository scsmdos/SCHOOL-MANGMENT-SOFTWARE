const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/frontend/src/pages/TransportManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = '<span className="text-[9px] font-black text-[var(--text-primary)] uppercase">Tracking: <span className="text-slate-400 font-bold ml-1">-</span></span>';
const replacement = `{(() => {
                                 const v = vehicles.find(vh => String(vh.rawId) === String(route.assignedVehicleId));
                                 return (
                                    <>
                                       <div className={\`w-1.5 h-1.5 rounded-full \${v?.lat ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}\`}></div>
                                       <span className="text-[9px] font-black text-[var(--text-primary)] uppercase ml-2">
                                          Tracking: <span className="text-indigo-500 font-black ml-1">
                                             {v?.lat ? \`\${Number(v.lat).toFixed(4)}, \${Number(v.lng).toFixed(4)}\` : 'OFFLINE'}
                                          </span>
                                       </span>
                                    </>
                                 );
                              })()}`;

// We need to also remove the static div before it if we want to replace the whole tracking area
content = content.replace(/<div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"><\/div>\s*<span className="text-\[9px\] font-black text-\[var\(--text-primary\)\] uppercase">Tracking: <span className="text-slate-400 font-bold ml-1">-<\/span><\/span>/, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Tracking UI updated in TransportManagement.jsx!');
