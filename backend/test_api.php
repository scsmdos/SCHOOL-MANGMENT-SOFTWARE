<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$req = Illuminate\Http\Request::create('/api/parent-login', 'POST', ['login_id' => '8102522355', 'pin' => '2355']);
$res = app()->handle($req);
echo substr($res->getContent(), 0, 500);
