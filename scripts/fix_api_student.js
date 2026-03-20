const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Update line 1084 (0-indexed 1083)
lines[1083] = "    return response()->json(\\App\\Models\\Admission::where('contact_no', $loginId)->get()); ";

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed API route model and field!');
