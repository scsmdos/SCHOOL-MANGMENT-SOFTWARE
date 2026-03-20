const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

// Append new route
content += `\nRoute::get('/parent-students/{login_id}', function($loginId) {\n    return response()->json(\\App\\Models\\Student::where('contact_number', $loginId)->get()); \n});\n`;

fs.writeFileSync(path, content, 'utf8');
console.log('Parent-students route added!');
