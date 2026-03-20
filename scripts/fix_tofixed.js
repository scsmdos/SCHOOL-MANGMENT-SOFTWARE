const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/frontend/src/pages/TransportManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace problematic toFixed calls
content = content.replace(/selectedMapRoute\.vehicle\?\.lat\?\.toFixed\(4\)/g, 'Number(selectedMapRoute.vehicle?.lat || 0).toFixed(4)');
content = content.replace(/selectedMapRoute\.vehicle\?\.lng\?\.toFixed\(4\)/g, 'Number(selectedMapRoute.vehicle?.lng || 0).toFixed(4)');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed toFixed string error!');
