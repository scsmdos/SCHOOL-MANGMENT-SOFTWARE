const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

const oldRoute = "Route::get('/classes-list', function() {\n    return response()->json(\\App\\Models\\AcademicClass::pluck('class_name'));\n});";
const newRoute = "Route::get('/classes-list', function() {\n    return response()->json(\\App\\Models\\AcademicClass::pluck('name'));\n});";

if (content.includes(oldRoute)) {
    content = content.replace(oldRoute, newRoute);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed /classes-list route');
} else {
    // If it was already different or not found, just ensure it's there correctly
    if (!content.includes("'/classes-list'")) {
        fs.appendFileSync(path, "\n" + newRoute);
        console.log('Added /classes-list route correctly');
    }
}
