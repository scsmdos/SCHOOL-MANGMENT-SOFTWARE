const fs = require('fs');
const path = 'd:/KYP-SOFTWARE/SCHOOL-MANGMENT-SOFTWARE/backend/routes/api.php';
let content = fs.readFileSync(path, 'utf8');

// The incorrect part: App\HttpControllers
content = content.replace("App\\HttpControllers\\TransportController", "App\\Http\\Controllers\\TransportController");

fs.writeFileSync(path, content, 'utf8');
console.log('API routes corrected!');
