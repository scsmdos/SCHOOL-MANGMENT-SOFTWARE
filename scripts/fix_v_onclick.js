const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/frontend/src/pages/TransportManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

// The crash is because 'v' is used in onClick but defined in a sub-IIFE.
// We'll replace the problematic onClick with a search-based find.

const target = "onClick={() => setSelectedMapRoute({ ...route, vehicle: v })}";
const replacement = "onClick={() => { const v = vehicles.find(vh => String(vh.rawId) === String(route.assignedVehicleId)); setSelectedMapRoute({ ...route, vehicle: v }); }}";

if (content.indexOf(target) !== -1) {
    fs.writeFileSync(path, content.replace(target, replacement), 'utf8');
    console.log('Fixed ReferenceError by calculating vehicle inside onClick!');
} else {
    console.log('Target not found.');
    // Try without spaces
    const target2 = target.replace(/\s+/g, '');
    let found = false;
    // Really basic regex approach
    const lines = content.split('\n');
    for (let i=0; i<lines.length; i++) {
        if (lines[i].includes('setSelectedMapRoute({ ...route, vehicle: v })')) {
            lines[i] = lines[i].replace('vehicle: v', 'vehicle: vehicles.find(vh => String(vh.rawId) === String(route.assignedVehicleId))');
            found = true;
        }
    }
    if (found) {
        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log('Fixed via line-by-line search!');
    } else {
        console.log('Still not found.');
    }
}
