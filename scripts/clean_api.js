const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the line where the generic routes end
let lastValidLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Route::delete('/{resource}/{id}'")) {
        lastValidLine = i;
        break;
    }
}

if (lastValidLine !== -1) {
    let newLines = lines.slice(0, lastValidLine + 1);
    newLines.push('\n// ═══════════════════════════════════════');
    newLines.push('// TRANSPORT TRACKING & PARENT MOBILE');
    newLines.push('// ═══════════════════════════════════════');
    newLines.push("Route::get('/student-bus-tracking/{admission_no}', [\\App\\Http\Controllers\\TransportController::class, 'getStudentBusTracking']);");
    newLines.push("Route::post('/vehicle-location-update/{vehicle_id}', [\\App\\Http\Controllers\\TransportController::class, 'updateLocation']);");
    newLines.push("Route::get('/parent-students/{login_id}', function($loginId) {");
    newLines.push("    return response()->json(\\App\\Models\\Student::where('contact_number', $loginId)->get()); ");
    newLines.push("});");
    
    fs.writeFileSync(path, newLines.join('\n'), 'utf8');
    console.log('API routes cleaned and fixed!');
} else {
    console.log('Could not find marker for cleaning.');
}
