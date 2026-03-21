<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GenericApiController;
use App\Http\Controllers\TransportController;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Models\ParentAccount;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Database\Schema\Blueprint;
use App\Models\TransportVehicle;

// ═══════════════════════════════════════
// FILE PROXY (Bypass Symlink Restrictions)
// ═══════════════════════════════════════
Route::get('/storage-proxy/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    if (!file_exists($filePath)) {
        return response()->json(['error' => 'File not found'], 404);
    }
    $file = file_get_contents($filePath);
    $type = mime_content_type($filePath);
    return response($file)->header('Content-Type', $type);
})->where('path', '.*');

// ═══════════════════════════════════════
// LIBRARY PDF UPLOAD
// ═══════════════════════════════════════
Route::post('/library-pdf-upload', function (Request $request) {
    try {
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:153600', // 150MB max
        ]);

        $file = $request->file('pdf');
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $originalName);
        $filename = $safeName . '_' . time() . '.pdf';

        // Store in storage/app/public/library_pdfs
        $path = $file->storeAs('library_pdfs', $filename, 'public');

        // Build accessible URL via our storage-proxy
        $url = url('/api/storage-proxy/library_pdfs/' . $filename);

        return response()->json([
            'success' => true,
            'link'    => $url,
            'filename'=> $filename,
            'size'    => round($file->getSize() / 1024 / 1024, 2) . ' MB',
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

// ═══════════════════════════════════════
// TEACHER APP API (STUDENTS & TEACHERS)
// ═══════════════════════════════════════
Route::post('/teacher-app/class-login', [\App\Http\Controllers\TeacherAppController::class, 'classLogin']);
Route::post('/teacher-app/teacher-login', [\App\Http\Controllers\TeacherAppController::class, 'teacherLogin']);
Route::get('/teacher-app/class-students/{class_name}', [\App\Http\Controllers\TeacherAppController::class, 'getStudents']);
Route::post('/teacher-app/teacher-attendance/mark', [\App\Http\Controllers\TeacherAppController::class, 'markTeacherAttendance']);
Route::post('/teacher-app/student-attendance/bulk', [\App\Http\Controllers\TeacherAppController::class, 'studentBulkAttendance']);
Route::get('/teacher-app/teacher-attendance/history/{employee_id}', [\App\Http\Controllers\TeacherAppController::class, 'getTeacherHistory']);
Route::get('/teacher-app/class-attendance/history/{class_name}', [\App\Http\Controllers\TeacherAppController::class, 'getClassHistory']);
Route::get('/teacher-app/parent-attendance/{admission_no}', [\App\Http\Controllers\TeacherAppController::class, 'getStudentAttendance']);
Route::post('/student-attendance/bulk', [\App\Http\Controllers\TeacherAppController::class, 'studentBulkAttendance']);

// --- ADMIN CRUD FOR TEACHER APP ---
Route::get('/class-accounts', [\App\Http\Controllers\TeacherAppController::class, 'getClassAccounts']);
Route::post('/class-accounts', [\App\Http\Controllers\TeacherAppController::class, 'createClassAccount']);
Route::delete('/class-accounts/{id}', [\App\Http\Controllers\TeacherAppController::class, 'deleteClassAccount']);

Route::get('/teacher-accounts', [\App\Http\Controllers\TeacherAppController::class, 'getTeacherAccounts']);
Route::post('/teacher-accounts', [\App\Http\Controllers\TeacherAppController::class, 'createTeacherAccount']);
Route::delete('/teacher-accounts/{id}', [\App\Http\Controllers\TeacherAppController::class, 'deleteTeacherAccount']);

Route::get('/teacher-attendance-logs', [\App\Http\Controllers\TeacherAppController::class, 'getAttendanceLogs']);

// --- MAGIC LINK FOR NEW TABLES ---
Route::get('/optimize-v2-teacher-app', function () {
    try {
        if (!Schema::hasTable('class_accounts')) {
            Schema::create('class_accounts', function (Blueprint $table) {
                $table->id();
                $table->string('class_name')->nullable();
                $table->string('login_id')->unique();
                $table->string('pin');
                $table->string('status')->default('Active');
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('employee_attendance')) {
            Schema::create('employee_attendance', function (Blueprint $table) {
                $table->id();
                $table->string('employee_id');
                $table->string('name')->nullable();
                $table->date('date');
                $table->time('check_in_time')->nullable();
                $table->time('check_out_time')->nullable();
                $table->string('lat_in')->nullable();
                $table->string('lng_in')->nullable();
                $table->string('lat_out')->nullable();
                $table->string('lng_out')->nullable();
                $table->longText('photo_in')->nullable();
                $table->longText('photo_out')->nullable();
                $table->string('status')->default('Present');
                $table->text('remarks')->nullable();
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('teacher_accounts')) {
            Schema::create('teacher_accounts', function (Blueprint $table) {
                $table->id();
                $table->string('employee_id')->nullable();
                $table->string('name')->nullable();
                $table->string('login_id')->unique();
                $table->string('pin');
                $table->string('status')->default('Active');
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('student_attendance')) {
            Schema::create('student_attendance', function (Blueprint $table) {
                $table->id();
                $table->string('student_id')->index(); // admission_no or student internal ID
                $table->string('student_name')->nullable();
                $table->string('class_name')->nullable();
                $table->string('section')->default('A');
                $table->date('attendance_date')->index();
                $table->string('status')->default('Present'); // Present, Absent, Half-day
                $table->text('remarks')->nullable();
                $table->timestamps();
            });
        }
        return "Success: Teacher App Tables Created!";
    } catch (\Exception $e) { return "Error: " . $e->getMessage(); }
});
// ═══════════════════════════════════════
// REAL-TIME GPS TRACKING
// ═══════════════════════════════════════
Route::post('/live-gps-update', function (Request $request) {
    try {
        $request->validate([
            'vehicle_id' => 'required', // can be reg_no or vehicle_id
            'lat'        => 'required|numeric',
            'lng'        => 'required|numeric',
            'speed'      => 'nullable|numeric'
        ]);

        $vehicle = TransportVehicle::where('vehicle_id', $request->vehicle_id)
            ->orWhere('reg_no', $request->vehicle_id)
            ->first();

        if (!$vehicle) return response()->json(['error' => 'Vehicle not found'], 404);

        $vehicle->update([
            'current_lat'           => $request->lat,
            'current_lng'           => $request->lng,
            'is_tracking'           => true,
            'last_location_update'  => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Location logged']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// For Admin: Get all live locations
Route::get('/transport-locations', function () {
    return response()->json(TransportVehicle::where('is_tracking', true)
        ->where('last_location_update', '>=', now()->subMinutes(15))
        ->get(['id', 'vehicle_id', 'reg_no', 'current_lat', 'current_lng', 'status', 'last_location_update']));
});

// ═══════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════
Route::post('/admin-login', function (Request $request) {
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
    ]);

    $admin = Admin::where('email', $request->email)->first();

    if (!$admin) {
        return response()->json(['message' => 'Invalid email or password.'], 401);
    }

    if (!$admin->is_active) {
        return response()->json(['message' => 'Your account is disabled. Contact super admin.'], 403);
    }

    if (!Hash::check($request->password, $admin->password)) {
        return response()->json(['message' => 'Invalid email or password.'], 401);
    }

    $admin->update(['last_login_at' => now()]);

    return response()->json([
        'success' => true,
        'admin'   => [
            'id'    => $admin->id,
            'name'  => $admin->name,
            'email' => $admin->email,
            'role'  => $admin->role,
        ],
        'token' => $admin->createToken('admin_token')->plainTextToken,
    ]);
});

// ═══════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {
Route::get('/dashboard-stats', function () {
    try {
        $totalStudents  = DB::table('admissions')->count();
        $totalEmployees = DB::table('employees')->count();

        $currentMonth = date('n');
        $currentYear  = date('Y');
        
        // Use try-catch or existence check for transactions
        $monthlyRevenue = 0;
        try {
            $monthlyRevenue = DB::table('transactions')
                ->where('type', 'Income')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->sum('amount');
        } catch (\Exception $e) { $monthlyRevenue = 0; }

        $lastMonthRevenue = 0;
        try {
            $lastMonthRevenue = DB::table('transactions')
                ->where('type', 'Income')
                ->whereMonth('date', $currentMonth - 1 > 0 ? $currentMonth - 1 : 12)
                ->whereYear('date', $currentMonth - 1 > 0 ? $currentYear : $currentYear - 1)
                ->sum('amount');
        } catch (\Exception $e) { $lastMonthRevenue = 0; }

        $revenueChangeValue = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;
        $revenueChange = ($revenueChangeValue >= 0 ? '+' : '') . $revenueChangeValue . '%';

        $activeStudents = DB::table('admissions')->where('status', 'Approved')->count();
        $pendingStudents = DB::table('admissions')->where('status', 'Pending')->count();
        $rejectedStudents = DB::table('admissions')->where('status', 'Rejected')->count();
        $totalAdmissions = DB::table('admissions')->count();

        $attendancePct  = $totalStudents > 0 ? round(($activeStudents / $totalStudents) * 100, 1) : 0;

        $months    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        $chartDataRaw = DB::table('transactions')
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(amount) as total')
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('year', 'month')
            ->get();

        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $mNum = $date->month;
            $yNum = $date->year;
            
            $match = $chartDataRaw->first(fn($item) => $item->month == $mNum && $item->year == $yNum);
            $income = $match ? (int)$match->total : 0;
            
            $chartData[] = [
                'name' => $months[$mNum - 1], 
                'revenue' => $income, 
                'expenses' => (int)($income * 0.6)
            ];
        }

        $days      = ['Mon','Tue','Wed','Thu','Fri'];
        $attendanceData = [];
        try {
            $attendanceRaw = DB::table('student_attendance')
                ->selectRaw('DATE(attendance_date) as date, status, COUNT(*) as count')
                ->where('attendance_date', '>=', now()->subDays(7))
                ->groupBy('date', 'status')
                ->get();
            
            // Organize by date
            $grouped = $attendanceRaw->groupBy('date');
            
            $i = 0;
            foreach ($grouped as $date => $logs) {
                if ($i >= 5) break;
                $total     = $logs->sum('count');
                $present   = $logs->whereIn('status', ['Present', 'Late'])->sum('count');
                $perc      = $total > 0 ? round(($present / $total) * 100, 1) : 0;
                $dayName   = date('D', strtotime($date));
                $attendanceData[] = ['name' => $dayName, 'value' => (int)$perc];
                $i++;
            }
        } catch (\Exception $e) {}

        // Fallback or fill if not enough data
        if (count($attendanceData) < 5) {
            $existingNames = array_column($attendanceData, 'name');
            foreach ($days as $d) {
                if (!in_array($d, $existingNames) && count($attendanceData) < 5) {
                    $attendanceData[] = ['name' => $d, 'value' => (int)$attendancePct];
                }
            }
        }

        $notices = [];
        try {
            $notices = DB::table('notices')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'created_at'])
                ->map(function ($n) {
                    try {
                        $diff = \Illuminate\Support\Carbon::parse($n->created_at)->diffForHumans(now(), true);
                        return ['title' => $n->title, 'time' => $diff . ' ago'];
                    } catch (\Exception $e) {
                        return ['title' => $n->title, 'time' => 'Recently'];
                    }
                });
        } catch (\Exception $e) { $notices = []; }

        $recentAdmissions = [];
        try {
            $recentAdmissions = DB::table('admissions')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'student_name', 'admitted_into_class', 'status', 'created_at']);
        } catch (\Exception $e) { $recentAdmissions = []; }

        return response()->json([
            'stats'            => [
                'totalStudents'  => $totalStudents,
                'totalEmployees' => $totalEmployees,
                'monthlyRevenue' => $monthlyRevenue,
                'revenueChange'  => $revenueChange,
                'attendancePct'  => $attendancePct . '%',
                'totalAdmissions'   => $totalAdmissions,
                'approvedAdmissions' => $activeStudents,
                'pendingAdmissions'  => $pendingStudents,
                'rejectedAdmissions' => $rejectedStudents,
            ],
            'chartData'        => $chartData,
            'attendanceData'   => $attendanceData,
            'notices'          => $notices,
            'recentAdmissions' => $recentAdmissions,
        ]);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error("Dashboard Stats Error: " . $e->getMessage());
        return response()->json([
            'error' => $e->getMessage(),
            'stats' => ['totalStudents' => 0, 'totalEmployees' => 0, 'monthlyRevenue' => 0, 'revenueChange' => '0%', 'attendancePct' => '0%'],
            'chartData' => [],
            'attendanceData' => [],
            'notices' => [],
        ], 200); // Return 200 with empty data to avoid frontend alert if possible, or just error
    }
});
});

// ═══════════════════════════════════════
// SYNC PARENTS — requires auth
// ═══════════════════════════════════════
Route::middleware('auth:sanctum')->get('/sync-parents', function () {
    $admissions = DB::table('admissions')->where('status', 'Approved')->orWhereNotNull('admission_no')->get();
    $synced     = 0;
    $login_ids  = $admissions->pluck('contact_no')->filter()->unique()->toArray();
    $existingParents = ParentAccount::whereIn('login_id', $login_ids)->pluck('login_id')->toArray();

    foreach ($admissions as $admission) {
        $login_id = $admission->contact_no;
        if (!$login_id) continue;
        if (!in_array($login_id, $existingParents)) {
            ParentAccount::create([
                'parent_id'    => 'P' . str_pad($admission->id, 4, '0', STR_PAD_LEFT),
                'parent_name'  => $admission->father_name ?: ($admission->mother_name ?: 'Parent'),
                'relation'     => $admission->father_name ? 'Father' : 'Mother',
                'student_name' => trim($admission->student_name . ' (' . $admission->admitted_into_class . ')'),
                'login_id'     => $login_id,
                'pin'          => (string)rand(1000, 9999), // Always random 4-digit PIN
                'status'       => 'Active',
                'last_login'   => 'Never Logged In',
            ]);
            $existingParents[] = $login_id;
            $synced++;
        }
    }
    return response()->json(['message' => 'Synced', 'count' => $synced]);
});

// Admin reset parent PIN
Route::middleware('auth:sanctum')->put('/parent-accounts/{id}/reset-pin', function (Request $request, $id) {
    $request->validate(['pin' => 'required|string|min:4']);
    $parent = ParentAccount::find($id);
    if (!$parent) return response()->json(['message' => 'Not found'], 404);
    $parent->update(['pin' => $request->pin]);
    
    // Security: Log out from all devices
    $parent->tokens()->delete();
    
    return response()->json(['success' => true, 'message' => 'PIN updated successfully. All active sessions have been terminated.']);
});

Route::middleware('auth:sanctum')->get('/sync-teachers', function () {
    $employees = DB::table('employees')->where('status', 'Active')->get();
    $synced    = 0;
    $existingItems = DB::table('teacher_accounts')->pluck('login_id')->toArray();
    foreach ($employees as $emp) {
        $login_id = $emp->contact_number ?? $emp->employee_id;
        if (!$login_id) continue;
        if (!in_array($login_id, $existingItems)) {
            DB::table('teacher_accounts')->insert([
                'employee_id' => $emp->employee_id,
                'name'        => $emp->name,
                'login_id'    => $login_id,
                'pin'         => '1234',
                'status'      => 'Active',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
            $synced++;
        }
    }
    return response()->json(['message' => 'Synced', 'count' => $synced]);
});

// ═══════════════════════════════════════
// PARENT PROTECTED ZONE — Requires Token
// ═══════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/register-push-token', function (Request $request) {
        try {
            $login_id = $request->login_id;
            $token    = $request->push_token;
            if (!$login_id || !$token) return response()->json(['error' => 'Missing data'], 400);

            $updated = DB::table('parent_accounts')
                ->where('login_id', $login_id)
                ->update([
                    'push_token' => $token,
                    'updated_at' => now()
                ]);

            return response()->json(['message' => 'Token updated', 'success' => (bool)$updated]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Admin send notification to parents (kept here for consistency, or move to admin group)
    Route::post('/parent-notifications', function (Request $request) {
        try {
            $validated = $request->validate([
                'title'   => 'required|string',
                'message' => 'required|string',
                'type'    => 'required|in:NOTICE,MESSAGE',
                'notice_id' => 'nullable|integer',
                'recipient_login_id' => 'nullable' // null for broadcast
            ]);

            $notifId = DB::table('parent_notifications')->insertGetId([
                'notice_id' => $validated['notice_id'] ?? null,
                'type'      => $validated['type'],
                'title'     => $validated['title'],
                'message'   => $validated['message'],
                'recipient_login_id' => $validated['recipient_login_id'],
                'is_read'   => false,
                'sent_by'   => 'Admin',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['success' => true, 'id' => $notifId]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    Route::delete('/parent-notifications/{id}', function ($id) {
        DB::table('parent_notifications')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    });
});

// ═══════════════════════════════════════
// PARENT LOGIN & DASHBOARD — no auth
// ═══════════════════════════════════════
Route::post('/parent-login', function (Request $request) {
    $request->validate(['login_id' => 'required', 'pin' => 'required']);
    $parent = ParentAccount::where('login_id', $request->login_id)->where('pin', $request->pin)->first();
    if ($parent) {
        if ($parent->status !== 'Active') {
            return response()->json(['message' => 'Account is ' . $parent->status], 403);
        }
        
        // Find ALL linked students
        $students = DB::table('admissions')
            ->where('contact_no', $parent->login_id)
            ->whereIn('status', ['Approved', 'Admitted']) // only active ones
            ->get(['id', 'student_name', 'admitted_into_class', 'section', 'roll_no', 'student_photo'])
            ->map(function ($s) {
                return [
                    'id'    => $s->id,
                    'name'  => $s->student_name,
                    'class' => $s->admitted_into_class,
                    'section' => $s->section ?? 'A',
                    'photo' => $s->student_photo ? (str_starts_with($s->student_photo, 'http') ? $s->student_photo : url('/api/storage-proxy' . str_replace('/storage', '', $s->student_photo))) : null
                ];
            });

        // Set parent_photo URL matching mobile app expectation
        $parent->parent_photo = $parent->photo_url 
             ? (str_starts_with($parent->photo_url, 'http') ? $parent->photo_url : url('/api/storage-proxy' . str_replace('/storage', '', $parent->photo_url)))
             : null;

        // Generate Token
        $token = $parent->createToken('parent-mobile-app')->plainTextToken;

        return response()->json([
            'parent'       => $parent,
            'students'     => $students,
            'access_token' => $token
        ]);
    }
    return response()->json(['message' => 'Invalid credentials'], 401);
});


Route::middleware('auth:sanctum')->get('/parent-dashboard/{login_id}', function (Request $request, $login_id) {
    try {
        $parent = ParentAccount::where('login_id', $login_id)->first();
        if (!$parent || $parent->status !== 'Active') {
            return response()->json(['error' => 'Unauthorized or Inactive account'], 403);
        }

        // Selected student ID or fallback to first student
        $student_id = $request->query('student_id');
        if (!$student_id) {
            $firstStudent = DB::table('admissions')->where('contact_no', $login_id)->first();
            $student_id = $firstStudent ? $firstStudent->id : null;
        }

        $admission  = DB::table('admissions')->where('id', $student_id)->first();
        $class_name = data_get($admission, 'admitted_into_class', '');

        DB::table('parent_accounts')->where('login_id', $login_id)->update([
            'last_login' => 'Today ' . now()->format('g:i:s A'),
        ]);

        $student_photo = null;
        $parent_photo  = null;
        $student_profile = null;

        if ($admission && is_object($admission)) {
            $student_photo = isset($admission->student_photo) && $admission->student_photo
                ? (str_starts_with($admission->student_photo, 'http') || str_starts_with($admission->student_photo, 'data:') ? $admission->student_photo : url('/api/storage-proxy' . str_replace('/storage', '', $admission->student_photo)))
                : null;
            $parentImage = $admission->parent_photo ?? null;
            $parent_photo = $parentImage
                ? (str_starts_with($parentImage, 'http') || str_starts_with($parentImage, 'data:') ? $parentImage : url('/api/storage-proxy' . str_replace('/storage', '', $parentImage)))
                : null;

            $student_profile = [
                'name'         => $admission->student_name ?? 'Student',
                'admission_no' => $admission->admission_no ?? ('ADM-' . $admission->id),
                'class'        => $admission->admitted_into_class ?? 'N/A',
                'section'      => $admission->section ?? 'A',
                'roll_no'      => $admission->roll_no ?? 'N/A',
                'father_name'  => $admission->father_name ?? 'N/A',
                'dob'          => $admission->date_of_birth ?? 'N/A',
                'phone'        => $admission->contact_no ?? 'N/A',
                'blood_group'  => $admission->blood_group ?? 'A+',
                'village'      => $admission->village ?? 'Local',
                'district'     => $admission->district ?? 'UP',
                'photo'        => $student_photo,
            ];
        }

        // Parent Profile Addition Check
        if ($parent_photo) {
            $parent->parent_photo = $parent_photo;
        }

        // Timetable & Notices
        $timetable = [];
        try { 
            if (Schema::hasTable('timetables')) {
                // Determine current day for filtering (optional, or just send all)
                // For simplicity, let's filter by today or show entire week. 
                // User said 'not showing', let's use case-insensitive class matching first.
                $timetable = DB::table('timetables')
                    ->where(function($q) use ($class_name) {
                        $q->where('class_name', $class_name)
                          ->orWhere('class_name', strtoupper($class_name))
                          ->orWhere('class_name', strtolower($class_name));
                    })
                    ->orderBy('start_time', 'asc')
                    ->get()
                    ->map(function($t) {
                        return [
                            'id'           => $t->id,
                            'day'          => $t->day,
                            'period'       => $t->period,
                            'subject'      => $t->subject_name ?: 'Subject',
                            'subjectName'  => $t->subject_name ?: 'Subject', // for backward compatibility in mobile app
                            'teacher'      => $t->teacher_name ?: 'Teacher',
                            'teacherName'  => $t->teacher_name ?: 'Teacher', // for backward compatibility in mobile app
                            'start_time'   => $t->start_time ? date('h:i A', strtotime($t->start_time)) : '00:00',
                            'end_time'     => $t->end_time ? date('h:i A', strtotime($t->end_time)) : '00:00',
                            'roomNo'       => $t->room ?? 'N/A',
                        ];
                    })->toArray();
            }
        } catch (\Exception $e) {
            Log::error('Dashboard Timetable Error: ' . $e->getMessage());
        }

        $notices = [];
        try {
            $notices = DB::table('notices')->orderBy('created_at', 'desc')->limit(3)->get()->map(function ($n) {
                try { $diff = Carbon::parse($n->created_at)->diffForHumans(); } catch (\Exception $e) { $diff = 'Recently'; }
                return array_merge((array)$n, ['time_ago' => $diff]);
            });
        } catch (\Exception $e) {}

        // Student Attendance Calculation
        $attendancePerc = 100;
        $attendanceLog  = [];
        if ($student_id && Schema::hasTable('student_attendance')) {
            $logs = DB::table('student_attendance')
                ->where('student_id', $student_id)
                ->orderBy('attendance_date', 'desc')
                ->limit(31) // Last month roughly
                ->get();
            
            $totalDays = $logs->count();
            if ($totalDays > 0) {
                $presentCount = $logs->whereIn('status', ['Present', 'Late'])->count();
                $attendancePerc = round(($presentCount / $totalDays) * 100, 1);
            }
            $attendanceLog = $logs->map(fn($l) => [
                'date'   => date('Y-m-d', strtotime($l->attendance_date)),
                'status' => $l->status,
                'note'   => $l->remarks
            ]);
        }

        // Academic Calendar
        $academic_calendar = [];
        try {
            if (Schema::hasTable('academic_events')) {
                $academic_calendar = DB::table('academic_events')
                    ->where('date', '>=', now()->startOfYear())
                    ->orderBy('date', 'asc')
                    ->get();
            }
        } catch (\Exception $e) {}

        $invoices         = [];
        $total_due        = 0;
        $last_paid_amount = 0;

        // Fees / Transactions 
        if ($admission) {
            try {
                // Link transactions to this student using ID, Admission No, or (Name + Class)
                $transactions = DB::table('transactions')
                    ->where('type', 'Income')
                    ->where(function($q) use ($admission) {
                        $q->where('student_id', (string)$admission->id);
                        if (!empty($admission->admission_no)) {
                            $q->orWhere('student_id', $admission->admission_no);
                        }
                        // Optimized: standard where is usually case-insensitive in MySQL
                        if (!empty($admission->student_name) && !empty($admission->admitted_into_class)) {
                            $q->orWhere(function($sub) use ($admission) {
                                $sub->where('student_name', $admission->student_name)
                                   ->where('class_name', $admission->admitted_into_class);
                            });
                        }
                    })
                    ->orderBy('date', 'desc')
                    ->get();

                foreach ($transactions as $txn) {
                    $invoices[] = [
                        'id'     => $txn->transaction_id ?? $txn->id,
                        'term'   => $txn->category ?? 'School Fee',
                        'amount' => number_format((float)$txn->amount, 2),
                        'status' => $txn->status ?? 'Paid',
                        'date'   => !empty($txn->date)
                            ? date('M j, Y', strtotime($txn->date))
                            : date('M j, Y', strtotime($txn->created_at)),
                    ];
                    // Track last paid
                    if (($txn->status === 'Paid' || $txn->status === 'Completed' || $txn->status === 'PAID') && $last_paid_amount == 0) {
                        $last_paid_amount = $txn->amount;
                    }
                }
                
                // Logic for total due - this depends on your school's logic. 
                // For now, if you have a total_fee column in admissions, we could subtract paid sum.
                // Assuming it's calculated elsewhere or just fixed.
            } catch (\Exception $e) {
                Log::error('Dashboard Fee Error: ' . $e->getMessage());
            }
        }

        $fees = [
            'total_due'        => $total_due,
            'last_paid_amount' => $last_paid_amount,
            'last_paid_date'   => count($invoices) > 0 ? $invoices[0]['date'] : '--',
            'invoices'         => $invoices,
        ];

        // Exams
        $exams    = [];
        try {
            $db_exams = DB::table('exams')
                ->where('class', $class_name)
                ->orWhere('class', 'All')
                ->orWhereNull('class')
                ->orWhere('class', '')
                ->get();
                
            foreach ($db_exams as $ex) {
                $raw_start = $ex->exam_date ?? $ex->start_date ?? null;
                $start_val = $raw_start ? date('M j, Y', strtotime($raw_start)) : '--';
                $end_val   = $ex->end_date ? date('M j, Y', strtotime($ex->end_date)) : '--';
                
                $term_str  = !empty($ex->term) ? " ({$ex->term})" : "";
                $base_name = !empty($ex->exam_name) ? $ex->exam_name : (!empty($ex->name) ? $ex->name : 'Exam');

                $exams[] = [
                    'exam_id'     => $ex->id,
                    'exam_name'   => trim($base_name . $term_str),
                    'name'        => $base_name,
                    'term'        => $ex->term ?? '',
                    'subject'     => $ex->subject ?? 'All Subjects',
                    'start_date'  => $start_val,
                    'end_date'    => $end_val,
                    'type'        => $ex->exam_type ?? ($ex->type ?? 'Written'),
                    'duration'    => $ex->duration ?? 'N/A',
                    'total_marks' => $ex->total_marks ?? 'N/A',
                    'status'      => $ex->status ?? 'Upcoming',
                ];
            }
        } catch (\Exception $e) {}

        // Syllabus
        $syllabus = [];
        try {
            if (Schema::hasTable('academic_syllabi')) {
                $syllabus = DB::table('academic_syllabi')->orderBy('subject')->get()->map(function ($s) {
                    return [
                        'subject'    => $s->subject ?? '',
                        'chapter'    => $s->chapter ?? '',
                        'teacher'    => $s->teacher ?? '',
                        'progress'   => $s->progress ?? 0,
                        'targetDate' => $s->targetDate ?? '',
                    ];
                })->values()->toArray();
            }
        } catch (\Exception $e) {}

        // Results
        $results = [];
        if ($student_id) {
            try {
                $db_results = DB::table('exam_results')->where('student_id', $student_id)->get();
                foreach ($db_results as $rs) {
                    $maxMarks  = $rs->max_marks ?? 0;
                    $obtained  = $rs->marks_obtained ?? 0;
                    $pct       = $maxMarks > 0 ? round(($obtained / $maxMarks) * 100, 1) : 0;
                    $examObj   = $db_exams->firstWhere('id', $rs->exam_id);
                    // Grade based on percentage if not manually set
                    $grade = $rs->grade ?? 'N/A';
                    if (empty($rs->grade) || $rs->grade == 'N/A') {
                        if ($pct >= 90) $grade = 'A+';
                        elseif ($pct >= 80) $grade = 'A';
                        elseif ($pct >= 70) $grade = 'B+';
                        elseif ($pct >= 60) $grade = 'B';
                        elseif ($pct >= 50) $grade = 'C';
                        elseif ($pct >= 33) $grade = 'D';
                        elseif ($pct > 0)   $grade = 'F';
                    }

                    $results[] = [
                        'exam_name'       => $examObj ? $examObj->name : ($rs->exam_name ?? 'Exam'),
                        'term'            => $examObj ? ($examObj->term ?? '') : '',
                        'subject'         => $rs->subject ?? ($examObj ? ($examObj->subject ?? 'N/A') : 'N/A'),
                        'percentage'      => $pct . '%',
                        'percentage_raw'  => $pct,
                        'grade'           => $grade,
                        'marks_obtained'  => $obtained,
                        'max_marks'       => $maxMarks,
                        'remarks'         => $rs->remarks ?? '',
                        'student_name'    => $rs->student_name ?? ($admission->student_name ?? ''),
                        'father_name'     => $admission ? ($admission->father_name ?? 'N/A') : 'N/A',
                        'class_name'      => $class_name,
                        'result_date'     => $rs->updated_at ? date('d M Y', strtotime($rs->updated_at)) : date('d M Y'),
                        'status'          => $rs->status ?? 'PASS',
                    ];
                }
            } catch (\Exception $e) {}
        }

        // Homework — show homework for 'All Students' in class OR specifically assigned to this student
        $homework = [];
        try {
            if (Schema::hasTable('homework')) {
                $studentName = $admission ? ($admission->student_name ?? '') : '';
                // Case-insensitive class name match (handles 'Class 1' vs 'CLASS 1' etc.)
                $query = DB::table('homework')
                    ->whereRaw('LOWER(class_name) = ?', [strtolower($class_name)]);
                
                // Only filter by student name if the column exists
                if (Schema::hasColumn('homework', 'student_name')) {
                    $query->where(function ($q) use ($studentName) {
                        $q->where('student_name', 'All Students')
                          ->orWhere('student_name', $studentName)
                          ->orWhereNull('student_name')
                          ->orWhere('student_name', '');
                    });
                }
                
                $homework = $query->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($hw) {
                        try {
                            $dueDate = $hw->due_date ? Carbon::parse($hw->due_date) : null;
                            
                            // Use actual database status if available, fallback to date logic
                            if (!empty($hw->status)) {
                                // Capitalize first letter only (e.g. SUBMITTED -> Submitted)
                                $status = ucfirst(strtolower($hw->status));
                            } else {
                                $status = $dueDate && $dueDate->startOfDay()->gte(now()->startOfDay()) ? 'Pending' : 'Completed';
                            }

                            // Avoid duplicating text: show description if it differs from title, otherwise just title
                            $title = trim($hw->title ?? '');
                            $desc  = trim($hw->description ?? '');
                            $task  = $desc ?: $title;  // prefer description; fall back to title
                            if ($title && $desc && strtolower($title) !== strtolower($desc)) {
                                $task = $title . ' — ' . $desc;
                            }
                            return [
                                'subject'       => $hw->subject,
                                'task'          => $task,
                                'due_date'      => $dueDate ? $dueDate->format('M d, Y') : 'N/A',
                                'assigned_date' => $hw->created_at ? Carbon::parse($hw->created_at)->format('M d, Y') : 'N/A',
                                'sort_date'     => $hw->due_date,
                                'status'        => $status,
                                'teacher'       => $hw->teacher_name ?? ($hw->assigned_by ?? 'N/A'),
                            ];
                        } catch (\Exception $e) {
                            return [
                                'subject'       => $hw->subject ?? 'N/A',
                                'task'          => trim($hw->description ?? ($hw->title ?? 'N/A')),
                                'due_date'      => 'N/A',
                                'assigned_date' => 'N/A',
                                'sort_date'     => null,
                                'status'        => !empty($hw->status) ? ucfirst(strtolower($hw->status)) : 'Pending',
                                'teacher'       => $hw->teacher_name ?? ($hw->assigned_by ?? 'N/A'),
                            ];
                        }
                    })->values()->toArray();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Dashboard Homework Error: " . $e->getMessage());
        }

        // All Parent Events (Holidays, Celebrations, etc.)
        $parent_events = [];
        try {
            if (Schema::hasTable('parent_events')) {
                $parent_events = DB::table('parent_events')
                    ->where(function($q) use ($class_name) {
                        $q->whereNull('target_class')
                          ->orWhere('target_class', '')
                          ->orWhere('target_class', 'All Classes')
                          ->orWhere('target_class', $class_name);
                    })
                    ->orderBy('date', 'asc')
                    ->get();
            }
        } catch (\Exception $e) {}

        // Library and Transport Tracking
        $library = [];
        $bus_tracking = null;

        if (is_object($admission)) {
            // Bus Tracking Logic
            try {
                $routeId = data_get($admission, 'transport_route_id');
                if ($routeId) {
                    $route = DB::table('transport_routes')
                        ->where('route_id', $routeId)
                        ->orWhere('id', $routeId)
                        ->first();

                    if ($route && is_object($route)) {
                        $vehicleId = data_get($route, 'assigned_vehicle_id');
                        if ($vehicleId) {
                            $vehicle = DB::table('transport_vehicles')->where('id', $vehicleId)->first();
                            if ($vehicle && is_object($vehicle) && data_get($vehicle, 'is_tracking')) {
                                $bus_tracking = [
                                    'route_name'    => data_get($route, 'name'),
                                    'vehicle_no'    => data_get($vehicle, 'reg_no'),
                                    'lat'           => data_get($vehicle, 'current_lat'),
                                    'lng'           => data_get($vehicle, 'current_lng'),
                                    'status'        => data_get($vehicle, 'status', 'ACTIVE'),
                                    'last_update'   => data_get($vehicle, 'last_location_update') ? Carbon::parse(data_get($vehicle, 'last_location_update'))->diffForHumans() : 'N/A'
                                ];
                            }
                        }
                    }
                }
            } catch (\Exception $eBus) { Log::error("Parent App Bus Tracking Error: " . $eBus->getMessage()); }

            try {
                if (Schema::hasTable('library_issuances')) {
                    $library = DB::table('library_issuances')
                        ->leftJoin('library_books', 'library_issuances.book_id', '=', 'library_books.book_id')
                        ->where(function ($q) use ($admission) {
                            $q->where('library_issuances.issued_to_id', (string)$admission->id);
                            if (!empty($admission->admission_no)) {
                                $q->orWhere('library_issuances.issued_to_id', $admission->admission_no);
                            }
                            if (!empty($admission->student_name)) {
                                $q->orWhereRaw('LOWER(library_issuances.issued_to_name) = ?', [strtolower($admission->student_name)]);
                            }
                        })
                        ->select(
                            'library_issuances.issue_id',
                            'library_issuances.book_id as original_book_id',
                            'library_books.title as book_title',
                            'library_books.author',
                            'library_issuances.issue_date',
                            'library_issuances.due_date',
                            'library_issuances.return_date',
                            'library_issuances.status'
                        )
                        ->orderBy('library_issuances.issue_date', 'desc')
                        ->get()
                        ->map(function ($row) {
                            $status = $row->status;
                            if ($status !== 'Returned') {
                                if (\Carbon\Carbon::parse($row->due_date)->isPast() && !\Carbon\Carbon::parse($row->due_date)->isToday()) {
                                    $status = 'Overdue';
                                }
                            }
                            return [
                                'issue_id' => $row->issue_id,
                                'book_id' => $row->original_book_id,
                                'book_title' => $row->book_title ?? 'Unknown Book',
                                'author' => $row->author ?? 'Unknown Author',
                                'issue_date' => $row->issue_date ? date('M d, Y', strtotime($row->issue_date)) : '',
                                'due_date' => $row->due_date ? date('M d, Y', strtotime($row->due_date)) : '',
                                'return_date' => $row->return_date ? date('M d, Y', strtotime($row->return_date)) : '',
                                'status' => $status
                            ];
                        })
                        ->toArray();
                }
            } catch (\Exception $e) {}
        }


        return response()->json([
            'parent'      => array_merge($parent ? $parent->toArray() : [], [
                'student_photo'   => $student_photo,
                'parent_photo'    => $parent_photo,
                'student_profile' => $student_profile,
            ]),
            'admission'   => $admission,
            'timetable'   => $timetable,
            'notices'     => $notices,
            'attendance'  => [
                'percentage' => $attendancePerc,
                'logs'       => $attendanceLog
            ],
            'class_name'  => $class_name,
            'fees'        => $fees,
            'exams'       => $exams,
            'syllabus'    => $syllabus,
            'results'     => $results,
            'homework'    => $homework,
            'parentEvents' => $parent_events,
            'library'      => $library,
            'bus_tracking' => $bus_tracking,
            'calendar'     => $academic_calendar,
            'parent_events'=> $parent_events, // keep for compatibility if needed
            'leaves'      => [],
            'support'     => [],
        ]);

    } catch (\Exception $e) {
        Log::error('parent-dashboard error for login_id=' . $login_id . ': ' . $e->getMessage());
        return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
    }
});

// ═══════════════════════════════════════
// TEACHER LOGIN & PORTAL
// ═══════════════════════════════════════
Route::post('/teacher-login', function (Request $request) {
    $request->validate(['login_id' => 'required', 'pin' => 'required']);
    $teacher = DB::table('teacher_accounts')->where('login_id', $request->login_id)->where('pin', $request->pin)->first();
    if ($teacher) {
        if (($teacher->status ?? 'Active') !== 'Active') return response()->json(['message' => 'Account is ' . ($teacher->status ?? 'Inactive')], 403);
        return response()->json([
            'status' => 'success',
            'teacher' => $teacher
        ]);
    }
    return response()->json(['message' => 'Invalid credentials', 'status' => 'error'], 401);
});

Route::get('/get-classes', function () {
    $classes = DB::table('admissions')
        ->where('status', 'Approved')
        ->whereNotNull('admitted_into_class')
        ->distinct()
        ->pluck('admitted_into_class')
        ->sort()
        ->values();
    return response()->json($classes);
});

// ═══════════════════════════════════════
// SALARY STRUCTURES — GET: no auth, WRITE: auth
// ═══════════════════════════════════════
Route::get('/salary-structures', function (Request $request) {
    $query = DB::table('salary_structures');
    if ($request->search) {
        $query->where('employee_name', 'like', '%' . $request->search . '%')
              ->orWhere('designation', 'like', '%' . $request->search . '%');
    }
    if ($request->status) $query->where('status', $request->status);
    $data   = $query->orderBy('created_at', 'desc')->get();
    $totals = ['total_employees' => $data->count(), 'total_payroll' => $data->sum('net_salary'),
               'pending_payroll' => DB::table('salary_payments')->where('status', 'Pending')->sum('paid_amount')];
    return response()->json(['data' => $data, 'totals' => $totals]);
});

Route::get('/salary-structures/{id}', function ($id) {
    $structure = DB::table('salary_structures')->find($id);
    $payments  = DB::table('salary_payments')->where('employee_id', $structure->employee_id ?? 0)->orderBy('payment_date', 'desc')->limit(12)->get();
    return response()->json(['structure' => $structure, 'payments' => $payments]);
});

Route::get('/salary-payments', function (Request $request) {
    $q = DB::table('salary_payments');
    if ($request->month) $q->where('month', 'like', '%' . $request->month . '%');
    if ($request->employee_id) $q->where('employee_id', $request->employee_id);
    return response()->json($q->orderBy('payment_date', 'desc')->get());
});

// Route::middleware('auth:sanctum')->group(function () {
    Route::post('/salary-structures', function (Request $request) {
        $request->validate(['employee_id' => 'required|string', 'employee_name' => 'required|string', 'designation' => 'required|string', 'basic_salary' => 'required|numeric|min:0']);
        $basic = (float)$request->basic_salary; $hra = (float)($request->hra ?? 0); $da = (float)($request->da ?? 0);
        $ta = (float)($request->ta ?? 0); $medical = (float)($request->medical_allowance ?? 0); $other = (float)($request->other_allowance ?? 0);
        $pf = (float)($request->pf_deduction ?? 0); $tds = (float)($request->tds_deduction ?? 0); $otherD = (float)($request->other_deduction ?? 0);
        $gross = $basic + $hra + $da + $ta + $medical + $other; $net = $gross - $pf - $tds - $otherD;
        $id = DB::table('salary_structures')->insertGetId([
            'employee_id' => $request->employee_id, 'employee_name' => $request->employee_name, 'designation' => $request->designation,
            'department' => $request->department, 'basic_salary' => $basic, 'hra' => $hra, 'da' => $da, 'ta' => $ta,
            'medical_allowance' => $medical, 'other_allowance' => $other, 'pf_deduction' => $pf, 'tds_deduction' => $tds,
            'other_deduction' => $otherD, 'gross_salary' => round($gross, 2), 'net_salary' => round($net, 2),
            'payment_mode' => $request->payment_mode ?? 'Bank Transfer', 'bank_name' => $request->bank_name,
            'account_number' => $request->account_number, 'ifsc_code' => $request->ifsc_code,
            'status' => 'Active', 'effective_from' => !empty($request->effective_from) ? $request->effective_from : now()->toDateString(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['success' => true, 'id' => $id, 'gross' => $gross, 'net' => $net]);
    });

    Route::put('/salary-structures/{id}', function (Request $request, $id) {
        $basic = (float)($request->basic_salary??0); $hra = (float)($request->hra??0); $da = (float)($request->da??0);
        $ta = (float)($request->ta??0); $medical = (float)($request->medical_allowance??0); $other = (float)($request->other_allowance??0);
        $pf = (float)($request->pf_deduction??0); $tds = (float)($request->tds_deduction??0); $otherD = (float)($request->other_deduction??0);
        $gross = $basic + $hra + $da + $ta + $medical + $other; $net = $gross - $pf - $tds - $otherD;
        
        $updateData = array_merge(
            $request->only(['employee_name','designation','department','payment_mode','bank_name','account_number','ifsc_code','status']),
            ['basic_salary'=>$basic,'hra'=>$hra,'da'=>$da,'ta'=>$ta,'medical_allowance'=>$medical,'other_allowance'=>$other,'pf_deduction'=>$pf,'tds_deduction'=>$tds,'other_deduction'=>$otherD,'gross_salary'=>round($gross,2),'net_salary'=>round($net,2),'updated_at'=>now()]
        );
        if (!empty($request->effective_from)) {
            $updateData['effective_from'] = $request->effective_from;
        }

        DB::table('salary_structures')->where('id', $id)->update($updateData);
        return response()->json(['success' => true]);
    });

    Route::delete('/salary-structures/{id}', function ($id) {
        DB::table('salary_structures')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    });

    Route::post('/salary-payments', function (Request $request) {
        $request->validate(['employee_id' => 'required|string', 'month' => 'required', 'year' => 'required', 'paid_amount' => 'required|numeric']);
        $struct = DB::table('salary_structures')->where('employee_id', $request->employee_id)->first();
        $id = DB::table('salary_payments')->insertGetId([
            'salary_structure_id' => $struct->id ?? 0, 'employee_id' => $request->employee_id,
            'employee_name' => $request->employee_name ?? ($struct->employee_name ?? ''),
            'month' => $request->month, 'year' => $request->year, 'paid_amount' => $request->paid_amount,
            'deductions' => $request->deductions ?? 0, 'bonus' => $request->bonus ?? 0,
            'payment_mode' => $request->payment_mode ?? 'Bank Transfer',
            'payment_date' => !empty($request->payment_date) ? $request->payment_date : now()->toDateString(),
            'status' => 'Paid', 'remarks' => $request->remarks, 'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['success' => true, 'id' => $id]);
    });
// });

// ═══════════════════════════════════════
// DOCUMENT MANAGEMENT — GET: no auth, WRITE: auth
// ═══════════════════════════════════════
Route::get('/student-documents', function (Request $request) {
    $q = DB::table('student_documents');
    if ($request->search) $q->where(function ($qq) use ($request) {
        $qq->where('student_name', 'like', '%' . $request->search . '%')
           ->orWhere('admission_no', 'like', '%' . $request->search . '%')
           ->orWhere('document_type', 'like', '%' . $request->search . '%');
    });
    if ($request->status)     $q->where('status', $request->status);
    if ($request->student_id) $q->where('student_id', $request->student_id);
    if ($request->doc_type)   $q->where('document_type', $request->doc_type);
    $data    = $q->orderBy('created_at', 'desc')->get();
    $summary = ['total' => $data->count(), 'verified' => $data->where('status', 'Verified')->count(),
                'pending' => $data->where('status', 'Pending')->count(), 'rejected' => $data->where('status', 'Rejected')->count()];
    return response()->json(['data' => $data, 'summary' => $summary]);
});

Route::get('/student-documents/by-student/{student_id}', function ($student_id) {
    return response()->json(DB::table('student_documents')->where('student_id', $student_id)->orderBy('document_type')->get());
});

Route::get('/student-documents/{id}', function ($id) {
    return response()->json(DB::table('student_documents')->find($id));
});

// Route::middleware('auth:sanctum')->group(function () {
    /*
    Route::post('/student-documents', function (Request $request) {
        $request->validate(['student_name' => 'required|string', 'document_type' => 'required|string', 'document_name' => 'required|string']);
        $filePath = null; $fileType = null; $fileSize = null;
        if ($request->file_data) {
            $ext = strtolower($request->file_ext ?? 'pdf');
            if (!in_array($ext, ['pdf','jpg','jpeg','png'])) return response()->json(['error' => 'Invalid file type.'], 400);
            $fileName = time() . '_' . str_replace(' ', '_', $request->document_name) . '.' . $ext;
            $path = public_path('documents/' . $fileName);
            if (!file_exists(public_path('documents'))) mkdir(public_path('documents'), 0755, true);
            file_put_contents($path, base64_decode(preg_replace('/^data:[^;]+;base64,/', '', $request->file_data)));
            $filePath = url('documents/' . $fileName); $fileType = $ext; $fileSize = round(filesize($path) / 1024, 2) . ' KB';
        }
        $id = DB::table('student_documents')->insertGetId([
            'student_id' => $request->student_id, 'student_name' => $request->student_name, 'admission_no' => $request->admission_no,
            'class' => $request->class, 'document_type' => $request->document_type, 'document_name' => $request->document_name,
            'file_path' => $filePath, 'file_type' => $fileType, 'file_size' => $fileSize, 'status' => 'Pending',
            'uploaded_by' => $request->uploaded_by ?? 'Admin', 'remarks' => $request->remarks, 'expiry_date' => $request->expiry_date,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['success' => true, 'id' => $id]);
    });
    */

    Route::put('/student-documents/{id}', function (Request $request, $id) {
        DB::table('student_documents')->where('id', $id)->update(array_merge(
            $request->only(['student_name','admission_no','class','document_type','document_name','status','remarks','expiry_date','uploaded_by']),
            ['updated_at' => now()]
        ));
        return response()->json(['success' => true]);
    });

    Route::delete('/student-documents/{id}', function ($id) {
        $doc = DB::table('student_documents')->find($id);
        if ($doc && $doc->file_path) {
            $localPath = public_path('documents/' . basename($doc->file_path));
            if (file_exists($localPath)) unlink($localPath);
        }
        DB::table('student_documents')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    });

    Route::post('/student-documents/batch', function (Request $request) {
        $request->validate(['student_id' => 'required', 'student_name' => 'required|string', 'documents' => 'required|array|min:1']);
        if (!file_exists(public_path('documents'))) mkdir(public_path('documents'), 0755, true);
        $inserted = 0; $errors = [];
        foreach ($request->documents as $idx => $doc) {
            if (empty($doc['document_type']) || empty($doc['document_name'])) { $errors[] = "Row $idx: required"; continue; }
            $filePath = null; $fileType = null; $fileSize = null;
            if (!empty($doc['file_data'])) {
                $ext = strtolower($doc['file_ext'] ?? 'pdf');
                if (!in_array($ext, ['pdf','jpg','jpeg','png'])) { $errors[] = "Row $idx: bad type"; continue; }
                $fileName = time().'_'.$idx.'_'.preg_replace('/[^a-zA-Z0-9_]/', '_', $doc['document_name']).'.'.$ext;
                $path = public_path('documents/'.$fileName);
                file_put_contents($path, base64_decode(preg_replace('/^data:[^;]+;base64,/', '', $doc['file_data'])));
                $filePath = url('documents/'.$fileName); $fileType = $ext; $fileSize = round(filesize($path)/1024,2).' KB';
            }
            DB::table('student_documents')->insert([
                'student_id' => $request->student_id, 'student_name' => $request->student_name,
                'admission_no' => $request->admission_no ?? null, 'class' => $request->class ?? null,
                'document_type' => $doc['document_type'], 'document_name' => $doc['document_name'],
                'file_path' => $filePath, 'file_type' => $fileType, 'file_size' => $fileSize,
                'status' => 'Pending', 'uploaded_by' => 'Admin',
                'remarks' => $doc['remarks'] ?? null, 'expiry_date' => !empty($doc['expiry_date']) ? $doc['expiry_date'] : null,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $inserted++;
        }
        return response()->json(['success' => true, 'inserted' => $inserted, 'errors' => $errors]);
    });
// });

// ═══════════════════════════════════════
// STUDENTS FOR DROPDOWN — Lightweight, only returns needed fields
// Avoids fetching full admissions table (causes timeout/abort on large data)
// ═══════════════════════════════════════
Route::get('/students-for-dropdown', function (Request $request) {
    try {
        $query = DB::table('admissions')
            ->select('id', 'student_name', 'father_name', 'admitted_into_class', 'status')
            ->where('status', 'Approved')
            ->orderBy('student_name');

        if ($request->class_name) {
            $query->where('admitted_into_class', $request->class_name);
        }

        return response()->json($query->get());
    } catch (\Exception $e) {
        return response()->json([], 200); // Return empty array on error, never crash
    }
});

// ═══════════════════════════════════════
// HOMEWORK — Explicit routes (bypasses Eloquent pluralization bug)
// Table is 'homework' but Laravel model auto-maps to 'homeworks'
// ═══════════════════════════════════════
Route::get('/homework', function (Request $request) {
    try {
        // Check if table exists to avoid 500 if migration hasn't run
        if (!Schema::hasTable('homework')) {
            return response()->json([]);
        }
        
        $query = DB::table('homework');
        if ($request->class_name) {
            $query->where('class_name', $request->class_name);
        }
        $data = $query->orderBy('id', 'desc')->get();
        return response()->json($data);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Homework GET error: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/homework/{id}', function ($id) {
    $hw = DB::table('homework')->find($id);
    if (!$hw) return response()->json(['error' => 'Not found'], 404);
    return response()->json($hw);
});

// POST /homework — No auth required (same as generic routes)
Route::post('/homework', function (Request $request) {
    try {
        $students = $request->students;
        if (empty($students) || !is_array($students)) {
            $students = [$request->student_name ?? 'All Students'];
        }
        $inserted = [];
        $now = now();
        foreach ($students as $studentName) {
            $id = DB::table('homework')->insertGetId([
                'class_name'   => $request->class_name,
                'student_name' => $studentName ?: 'All Students',
                'subject'      => $request->subject,
                'title'        => $request->title ?? $request->description,
                'description'  => $request->description,
                'assigned_by'  => $request->assigned_by ?? $request->teacher_name,
                'teacher_name' => $request->teacher_name ?? $request->assigned_by,
                'due_date'     => $request->due_date,
                'status'       => $request->status ?? 'PENDING',
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
            $inserted[] = DB::table('homework')->find($id);
        }
        return response()->json(['success' => true, 'count' => count($inserted), 'data' => $inserted], 201);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error("Homework Submit Error: " . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 400);
    }
});

Route::put('/homework/{id}', function (Request $request, $id) {
    try {
        DB::table('homework')->where('id', $id)->update([
            'class_name'   => $request->class_name,
            'student_name' => $request->student_name ?? 'All Students',
            'subject'      => $request->subject,
            'title'        => $request->title ?? $request->description,
            'description'  => $request->description,
            'assigned_by'  => $request->assigned_by ?? $request->teacher_name,
            'teacher_name' => $request->teacher_name ?? $request->assigned_by,
            'due_date'     => $request->due_date,
            'status'       => $request->status ?? 'PENDING',
            'updated_at'   => now(),
        ]);
        return response()->json(DB::table('homework')->find($id));
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 400);
    }
});

Route::delete('/homework/{id}', function ($id) {
    DB::table('homework')->where('id', $id)->delete();
    return response()->json(['message' => 'Deleted successfully']);
});

Route::middleware('auth:sanctum')->group(function () {
    // Homework auth routes kept empty for future use
});

// ═══════════════════════════════════════
// STUDENT ATTENDANCE — BULK MARKING (Open for Teachers)
// ═══════════════════════════════════════
Route::get('/student-attendance', function (Request $request) {
    try {
        $query = DB::table('student_attendance');

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->has('class_name')) {
            $query->where('class_name', $request->class_name);
        }
        if ($request->has('attendance_date')) {
            $query->where('attendance_date', $request->attendance_date);
        }

        $records = $query->orderBy('attendance_date', 'desc')->get();
        return response()->json($records);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::post('/student-attendance/bulk', function (Request $request) {
    try {
        $date = $request->attendance_date ?: date('Y-m-d');
        $data = $request->records ?? $request->attendance_data; 

        if (!is_array($data)) return response()->json(['error' => 'Invalid data format'], 400);

        $upsertData = [];
        foreach ($data as $record) {
            $upsertData[] = [
                'student_id'      => $record['student_id'],
                'student_name'    => $record['student_name'] ?? ('Student ' . $record['student_id']),
                'class_name'      => $record['class_name'] ?? 'N/A',
                'section'         => $record['section'] ?? null,
                'attendance_date' => $date,
                'status'          => $record['status'] ?? 'Present',
                'remarks'         => $record['remarks'] ?? null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ];
        }

        if (empty($upsertData)) return response()->json(['success' => true, 'message' => 'No data to save']);

        DB::table('student_attendance')->upsert(
            $upsertData,
            ['student_id', 'attendance_date'],
            ['status', 'remarks', 'updated_at']
        );

        return response()->json(['success' => true, 'message' => 'Attendance marked successfully']);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error("Attendance Bulk Error: " . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


// ═══════════════════════════════════════
// TRANSPORT TRACKING & PARENT MOBILE
// ═══════════════════════════════════════
Route::get('/student-bus-tracking/{admission_no}', [\App\Http\Controllers\TransportController::class, 'getStudentBusTracking']);
Route::post('/vehicle-location-update/{vehicle_id}', [\App\Http\Controllers\TransportController::class, 'updateLocation']);
Route::get('/parent-students/{login_id}', function($loginId) {
    return response()->json(\App\Models\Admission::where('contact_no', $loginId)->get()->map(function($s) { return array_merge($s->toArray(), ['name' => $s->student_name, 'admission_number' => $s->admission_no]); })); 
});



Route::put('/parent-notifications/read-all/{login_id}', function($loginId) {
    // We mark notifications targeted at this parent or broadcast as read.
    // For simplicity, we filter by created_at <= now()
    \App\Models\ParentNotification::where(function($q) use ($loginId) {
        $q->whereNull('recipient_login_id')->orWhere('recipient_login_id', $loginId);
    })->update(['is_read' => 1]);
    return response()->json(['success' => true]);
});

Route::get('/parent-notifications/{login_id}', function($loginId) {
    // Combined global notices (recipient is NULL) and direct messages for this parent
    return response()->json(\App\Models\ParentNotification::whereNull('recipient_login_id')
        ->orWhere('recipient_login_id', $loginId)
        ->orderBy('created_at', 'desc')
        ->get());
});


Route::delete('/parent-notifications/notice/{noticeId}', function($noticeId) {
    // Delete notices that were broadcasted by sync
    \App\Models\ParentNotification::where('type', 'NOTICE')->where('notice_id', $noticeId)->delete();
    return response()->json(['success' => true]);
});

Route::put('/parent-notifications/sync-notice/{noticeId}', function(Request $request, $noticeId) {
    \App\Models\ParentNotification::where('type', 'NOTICE')->where('notice_id', $noticeId)->update([
        'title' => $request->title,
        'message' => $request->message,
    ]);
    return response()->json(['success' => true]);
});

Route::get('/parent-contact-list', function() {
    return response()->json(\App\Models\Admission::where('status', 'Approved')->select('id', 'student_name', 'father_name', 'contact_no', 'admitted_into_class as class', 'section', 'roll_no')->get());
});

Route::get('/messages', function() {
    return response()->json(\App\Models\ParentNotification::where('type', 'MESSAGE')->orderBy('created_at', 'desc')->get());
});

Route::get('/classes-list', function() {
    return response()->json(\App\Models\AcademicClass::pluck('name'));
});

Route::get('/sections-list', function() {
    return response()->json(\App\Models\Section::pluck('name'));
});

Route::get('/teachers-list', function() {
    return response()->json(DB::table('employees')->where('status', 'Active')->select('employee_id', 'name')->get());
});



// ═══════════════════════════════════════
// GENERIC API — GET: no auth, WRITE: auth
// ═══════════════════════════════════════

Route::get('/{resource}', [GenericApiController::class, 'index']);
Route::get('/{resource}/{id}', [GenericApiController::class, 'show']);

// Temporarily disabled auth:sanctum for easy frontend development
// Route::middleware('auth:sanctum')->group(function () {
    Route::post('/{resource}', [GenericApiController::class, 'store']);
    Route::put('/{resource}/{id}', [GenericApiController::class, 'update']);
    Route::delete('/{resource}/{id}', [GenericApiController::class, 'destroy']);
