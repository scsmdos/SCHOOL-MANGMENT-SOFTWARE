<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GenericApiController;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Models\ParentAccount;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Database\Schema\Blueprint;

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
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->sum('amount');
        } catch (\Exception $e) { $monthlyRevenue = 0; }

        $lastMonthRevenue = 0;
        try {
            $lastMonthRevenue = DB::table('transactions')
                ->whereMonth('created_at', $currentMonth - 1 > 0 ? $currentMonth - 1 : 12)
                ->whereYear('created_at', $currentMonth - 1 > 0 ? $currentYear : $currentYear - 1)
                ->sum('amount');
        } catch (\Exception $e) { $lastMonthRevenue = 0; }

        $revenueChangeValue = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;
        $revenueChange = ($revenueChangeValue >= 0 ? '+' : '') . $revenueChangeValue . '%';

        $activeStudents = DB::table('admissions')->where('status', 'Approved')->count();
        $attendancePct  = $totalStudents > 0 ? round(($activeStudents / $totalStudents) * 100, 1) : 0;

        $months    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $currentMonth - $i;
            $y = $currentYear;
            if ($m <= 0) { $m += 12; $y--; }
            try {
                $income = DB::table('transactions')->whereMonth('created_at', $m)->whereYear('created_at', $y)->sum('amount');
            } catch (\Exception $e) { $income = 0; }
            $chartData[] = ['name' => $months[$m - 1], 'revenue' => (int)$income, 'expenses' => (int)($income * 0.6)];
        }

        $days = ['Mon','Tue','Wed','Thu','Fri'];
        $attendanceData = array_map(fn($d) => [
            'name'  => $d,
            'value' => rand(max(60, $attendancePct - 5), min(100, $attendancePct + 5)),
        ], $days);

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
    return response()->json(['success' => true, 'message' => 'PIN updated successfully']);
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
// PARENT LOGIN & DASHBOARD — no auth
// ═══════════════════════════════════════
Route::post('/parent-login', function (Request $request) {
    $request->validate(['login_id' => 'required', 'pin' => 'required']);
    $parent = ParentAccount::where('login_id', $request->login_id)->where('pin', $request->pin)->first();
    if ($parent) {
        if ($parent->status !== 'Active') {
            return response()->json(['message' => 'Account is ' . $parent->status], 403);
        }
        $admission = DB::table('admissions')->where('contact_no', $parent->login_id)->first();
        if ($admission && is_object($admission)) {
            $parent->student_photo = isset($admission->student_photo) && $admission->student_photo
                ? (str_starts_with($admission->student_photo, 'data:') ? $admission->student_photo : url($admission->student_photo))
                : null;
            $parent->parent_photo = isset($admission->parent_photo) && $admission->parent_photo
                ? (str_starts_with($admission->parent_photo, 'data:') ? $admission->parent_photo : url($admission->parent_photo))
                : null;
        }
        return response()->json($parent);
    }
    return response()->json(['message' => 'Invalid credentials'], 401);
});


Route::get('/parent-dashboard/{login_id}', function ($login_id) {
    try {
        $parent = ParentAccount::where('login_id', $login_id)->first();
        if (!$parent || $parent->status !== 'Active') {
            return response()->json(['error' => 'Unauthorized or Inactive account'], 403);
        }

        $admission  = DB::table('admissions')->where('contact_no', $login_id)->first();
        $class_name = $admission ? $admission->admitted_into_class : '';
        $student_id = $admission ? $admission->id : null;

        DB::table('parent_accounts')->where('login_id', $login_id)->update([
            'last_login' => 'Today ' . now()->format('g:i:s A'),
        ]);

        $student_photo = null;
        $parent_photo  = null;
        $student_profile = null;

        if ($admission && is_object($admission)) {
            $student_photo = isset($admission->student_photo) && $admission->student_photo
                ? (str_starts_with($admission->student_photo, 'data:') ? $admission->student_photo : url($admission->student_photo))
                : null;
            $parent_photo = isset($admission->parent_photo) && $admission->parent_photo
                ? (str_starts_with($admission->parent_photo, 'data:') ? $admission->parent_photo : url($admission->parent_photo))
                : null;

            $student_profile = [
                'name'         => $admission->student_name ?? 'Student',
                'admission_no' => $admission->admission_no ?? 'N/A',
                'class'        => $admission->admitted_into_class ?? 'N/A',
                'section'      => $admission->section ?? 'A',
                'father_name'  => $admission->father_name ?? 'N/A',
                'dob'          => $admission->date_of_birth ?? 'N/A',
                'phone'        => $admission->contact_no ?? 'N/A',
                'blood_group'  => $admission->blood_group ?? 'A+',
                'village'      => $admission->village ?? 'Local',
                'district'     => $admission->district ?? 'UP',
                'photo'        => $student_photo,
            ];
        }

        // Timetable & Notices
        $timetable = [];
        try { $timetable = DB::table('timetables')->where('class_name', $class_name)->get(); } catch (\Exception $e) {}

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
            if (Schema::hasTable('academic_calendar')) {
                $academic_calendar = DB::table('academic_calendar')
                    ->where('event_date', '>=', now()->startOfYear())
                    ->orderBy('event_date', 'asc')
                    ->get();
            }
        } catch (\Exception $e) {}

        $invoices         = [];
        $total_due        = 0;
        $last_paid_amount = 0;

        // Fees / Transactions — only filter by student_id (no user_id column in transactions)
        if ($student_id) {
            try {
                $transactions = DB::table('transactions')
                    ->where('student_id', $student_id)
                    ->orderBy('date', 'desc')
                    ->get();
                foreach ($transactions as $txn) {
                    $invoices[] = [
                        'id'     => $txn->transaction_id ?? $txn->id,
                        'term'   => $txn->category ?? 'School Fee',
                        'amount' => $txn->amount,
                        'status' => $txn->status ?? 'Paid',
                        'date'   => !empty($txn->date)
                            ? date('M j, Y', strtotime($txn->date))
                            : date('M j, Y', strtotime($txn->created_at)),
                    ];
                    if (in_array($txn->status, ['Paid', 'Received']) && $last_paid_amount == 0) {
                        $last_paid_amount = $txn->amount;
                    }
                }
            } catch (\Exception $e) {}
        }

        $fees = [
            'total_due'        => $total_due,
            'last_paid_amount' => $last_paid_amount,
            'last_paid_date'   => count($invoices) > 0 ? $invoices[0]['date'] : '--',
            'invoices'         => $invoices,
        ];

        // Exams
        $db_exams = collect();
        $exams    = [];
        try {
            $db_exams = DB::table('exams')->get();
            foreach ($db_exams as $ex) {
                $exams[] = [
                    'exam_id'    => $ex->id,
                    'exam_name'  => $ex->name . ' (' . $ex->term . ')',
                    'name'       => $ex->name,
                    'term'       => $ex->term,
                    'start_date' => $ex->start_date ? date('M j, Y', strtotime($ex->start_date)) : '--',
                    'end_date'   => $ex->end_date   ? date('M j, Y', strtotime($ex->end_date))   : '--',
                    'type'       => 'Written',
                    'status'     => $ex->status,
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
                    // Grade based on percentage
                    $grade = $rs->grade ?? 'N/A';
                    if ($pct >= 90) $grade = 'A+';
                    elseif ($pct >= 80) $grade = 'A';
                    elseif ($pct >= 70) $grade = 'B+';
                    elseif ($pct >= 60) $grade = 'B';
                    elseif ($pct >= 50) $grade = 'C';
                    elseif ($pct >= 33) $grade = 'D';
                    elseif ($pct > 0)   $grade = 'F';

                    $results[] = [
                        'exam_name'       => $examObj ? $examObj->name : ($rs->exam_name ?? 'Exam'),
                        'term'            => $examObj ? ($examObj->term ?? '') : '',
                        'percentage'      => $pct . '%',
                        'percentage_raw'  => $pct,
                        'grade'           => $grade,
                        'marks_obtained'  => $obtained,
                        'max_marks'       => $maxMarks,
                        'remarks'         => $rs->remarks ?? '',
                        'student_name'    => $rs->student_name ?? ($admission->student_name ?? ''),
                        'class_name'      => $class_name,
                        'result_date'     => $rs->updated_at ? date('d M Y', strtotime($rs->updated_at)) : date('d M Y'),
                    ];
                }
            } catch (\Exception $e) {}
        }

        // Homework — show homework for 'All Students' in class OR specifically assigned to this student
        $homework = [];
        try {
            if (Schema::hasTable('homework')) {
                $studentName = $admission ? ($admission->student_name ?? '') : '';
                $query = DB::table('homework')->where('class_name', $class_name);
                
                // Only filter by student name if the column exists
                if (Schema::hasColumn('homework', 'student_name')) {
                    $query->where(function ($q) use ($studentName) {
                        $q->where('student_name', 'All Students')
                          ->orWhere('student_name', $studentName);
                    });
                }
                
                $homework = $query->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($hw) {
                        try {
                            $dueDate = $hw->due_date ? Carbon::parse($hw->due_date) : now()->addDays(7);
                            $status  = $dueDate->startOfDay()->gte(now()->startOfDay()) ? 'Pending' : 'Completed';
                            return [
                                'subject'   => $hw->subject,
                                'task'      => ($hw->title ?? '') . ($hw->description ? ' - ' . $hw->description : ''),
                                'due_date'  => $dueDate->format('M d, Y'),
                                'sort_date' => $hw->due_date,
                                'status'    => $status,
                            ];
                        } catch (\Exception $e) {
                            return [
                                'subject'   => $hw->subject ?? 'N/A',
                                'task'      => ($hw->title ?? 'N/A'),
                                'due_date'  => 'N/A',
                                'sort_date' => null,
                                'status'    => 'Pending',
                            ];
                        }
                    })->values()->toArray();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Dashboard Homework Error: " . $e->getMessage());
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
            'calendar'    => $academic_calendar,
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
            ->select('id', 'student_name', 'admitted_into_class', 'status')
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
Route::post('/student-attendance/bulk', function (Request $request) {
    try {
        $date = $request->attendance_date ?: date('Y-m-d');
        $data = $request->attendance_data; // Array of { student_id, student_name, class_name, section, status, remarks }

        if (!is_array($data)) return response()->json(['error' => 'Invalid data format'], 400);

        $upsertData = [];
        foreach ($data as $record) {
            $upsertData[] = [
                'student_id'      => $record['student_id'],
                'student_name'    => $record['student_name'] ?? 'Unknown',
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

        // Bulk upsert based on (student_id, attendance_date)
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
// GENERIC API — GET: no auth, WRITE: auth
// ═══════════════════════════════════════

Route::get('/{resource}', [GenericApiController::class, 'index']);
Route::get('/{resource}/{id}', [GenericApiController::class, 'show']);

// Temporarily disabled auth:sanctum for easy frontend development
// Route::middleware('auth:sanctum')->group(function () {
    Route::post('/{resource}', [GenericApiController::class, 'store']);
    Route::put('/{resource}/{id}', [GenericApiController::class, 'update']);
    Route::delete('/{resource}/{id}', [GenericApiController::class, 'destroy']);
// });
