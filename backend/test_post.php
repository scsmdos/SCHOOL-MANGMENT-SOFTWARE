<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
$payload = [
    'type' => 'Expense',
    'title' => 'Test Expense',
    'category' => 'MAINTENANCE',
    'amount' => '500.00',
    'payee_name' => 'Supplier X',
    'date' => date('Y-m-d'),
    'status' => 'Completed',
    'transaction_id' => 'EXP-' . time(),
    'voucher_id' => 'EXP-' . time()
];

$request = Request::create('api/transactions', 'POST', $payload);
$response = $app->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
