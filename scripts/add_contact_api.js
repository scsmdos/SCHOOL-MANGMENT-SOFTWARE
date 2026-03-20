const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

const newRoute = `
Route::get('/parent-contact-list', function() {
    return response()->json(\\App\\Models\\Admission::where('status', 'Approved')
        ->select('id', 'student_name', 'father_name', 'contact_no')
        ->get());
});
`;

if (content.indexOf('/parent-contact-list') === -1) {
    fs.appendFileSync(path, newRoute, 'utf8');
    console.log('Added parent-contact-list API!');
} else {
    console.log('API already exists.');
}
