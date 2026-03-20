const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

const route = `
Route::get('/classes-list', function() {
    return response()->json(\\App\\Models\\AcademicClass::pluck('class_name'));
});
`;

if (!content.includes("'/classes-list'")) {
    fs.appendFileSync(path, route);
    console.log('Added /classes-list route');
}
