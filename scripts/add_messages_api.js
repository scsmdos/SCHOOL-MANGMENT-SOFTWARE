const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

const route = `
Route::get('/messages', function() {
    return response()->json(\\App\\Models\\ParentNotification::where('type', 'MESSAGE')->orderBy('created_at', 'desc')->get());
});
`;

if (!content.includes("'/messages'")) {
    fs.appendFileSync(path, route);
    console.log('Added /messages route');
}
