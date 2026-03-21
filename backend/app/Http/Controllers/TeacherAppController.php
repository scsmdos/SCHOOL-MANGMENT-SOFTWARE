<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Admission;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;

class TeacherAppController extends Controller
{
    // 1. CLASS LOGIN (FOR STUDENT ATTENDANCE)
    public function classLogin(Request $request)
    {
        try {
            $request->validate([
                'login_id' => 'required',
                'pin'      => 'required',
            ]);

            $account = DB::table('class_accounts')
                ->where('login_id', $request->login_id)
                ->where('pin', $request->pin)
                ->where('status', 'Active')
                ->first();

            if (!$account) {
                return response()->json(['error' => 'Invalid Login ID or PIN'], 401);
            }

            return response()->json([
                'success'    => true,
                'class_name' => $account->class_name,
                'token'      => bin2hex(random_bytes(20)), // Simple session token
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Backend Error: ' . $e->getMessage()], 500);
        }
    }

    // 2. TEACHER LOGIN (FOR PERSONAL ATTENDANCE)
    public function teacherLogin(Request $request)
    {
        try {
            $request->validate([
                'login_id' => 'required',
                'pin'      => 'required',
            ]);

            $account = DB::table('teacher_accounts')
                ->where('login_id', $request->login_id)
                ->where('pin', $request->pin)
                ->where('status', 'Active')
                ->first();

            if (!$account) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $employee = Employee::where('employee_id', $account->employee_id)->first();

            return response()->json([
                'success'     => true,
                'employee_id' => $account->employee_id,
                'name'        => $account->name,
                'designation' => $employee?->designation ?? 'Teacher',
                'token'       => bin2hex(random_bytes(20)),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Backend Error: ' . $e->getMessage()], 500);
        }
    }

    // 3. FETCH STUDENTS FOR CLASS
    public function getStudents($class_name)
    {
        try {
            // Case-insensitive match and support both Approved/Admitted
            $students = Admission::where(function($q) use ($class_name) {
                $q->where('admitted_into_class', $class_name)
                  ->orWhere('admitted_into_class', strtoupper($class_name))
                  ->orWhere('admitted_into_class', strtolower($class_name));
            })
            ->whereIn('status', ['Approved', 'Admitted', 'Handled'])
            ->orderBy('student_name', 'asc')
            ->get(['id', 'student_name', 'admission_no', 'roll_no', 'gender', 'student_photo as photo']);

            $students = $students->map(function($student) {
                if ($student->photo && str_starts_with($student->photo, '/storage/')) {
                    $student->photo = url('/api/storage-proxy/' . str_replace('/storage/', '', $student->photo));
                }
                return $student;
            });

            return response()->json($students);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 4. MARK TEACHER SELF-ATTENDANCE
    public function markTeacherAttendance(Request $request)
    {
        try {
            $request->validate([
                'employee_id' => 'required',
                'lat'         => 'required',
                'lng'         => 'required',
                'photo'       => 'nullable', // Base64
                'type'        => 'required|in:IN,OUT',
            ]);

            $date = date('Y-m-d');
            $now  = date('H:i:s');

            $existing = DB::table('employee_attendance')
                ->where('employee_id', $request->employee_id)
                ->where('date', $date)
                ->first();

            if ($request->type === 'IN') {
                if ($existing && $existing->check_in_time) {
                    return response()->json(['error' => 'Check-in already marked for today'], 400);
                }

                $inserted = DB::table('employee_attendance')->updateOrInsert(
                    ['employee_id' => $request->employee_id, 'date' => $date],
                    [
                        'name'          => $request->name,
                        'check_in_time' => $now,
                        'lat_in'        => $request->lat,
                        'lng_in'        => $request->lng,
                        'photo_in'      => $request->photo,
                        'status'        => 'Present',
                        'updated_at'    => now(),
                        'created_at'    => now(),
                    ]
                );
            } else {
                if (!$existing || !$existing->check_in_time) {
                    return response()->json(['error' => 'Please check-in first'], 400);
                }
                
                DB::table('employee_attendance')
                    ->where('employee_id', $request->employee_id)
                    ->where('date', $date)
                    ->update([
                        'check_out_time' => $now,
                        'lat_out'        => $request->lat,
                        'lng_out'        => $request->lng,
                        'photo_out'      => $request->photo,
                        'updated_at'     => now(),
                    ]);
            }

            return response()->json(['success' => true, 'time' => $now]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 5. BULK STUDENT ATTENDANCE (FROM TEACHER APP OR ADMIN)
    public function studentBulkAttendance(Request $request) 
    {
        try {
            $records = $request->input('records', []);
            \Log::info('Bulk Attendance Request:', ['records_count' => count($records), 'payload' => $records]);
            if (!is_array($records)) return response()->json(['error' => 'Invalid data'], 400);

            foreach ($records as $r) {
                $studentId = $r['student_id'] ?? $r['admission_no'] ?? null;
                $date      = $r['attendance_date'] ?? $r['date'] ?? date('Y-m-d');

                if (!$studentId) continue;

                $statusRaw = $r['status'] ?? 'Present';
                $statusMap = [
                    'present'  => 'Present',
                    'absent'   => 'Absent',
                    'half-day' => 'Half Day',
                    'Half-day' => 'Half Day',
                    'half day' => 'Half Day',
                    'H'        => 'Half Day'
                ];
                $status = $statusMap[$statusRaw] ?? (ucfirst(strtolower($statusRaw)) === 'Half-day' ? 'Half Day' : ucfirst(strtolower($statusRaw)));
                if (!in_array($status, ['Present', 'Absent', 'Late', 'Excused', 'Half Day'])) {
                    $status = 'Present'; // Fallback to avoid 500
                }

                DB::table('student_attendance')->updateOrInsert(
                    ['student_id' => $studentId, 'attendance_date' => $date],
                    [
                        'student_name'    => $r['student_name'] ?? null,
                        'class_name'      => $r['class_name'] ?? $r['class'] ?? null,
                        'section'         => $r['section'] ?? 'A',
                        'status'          => $status,
                        'remarks'         => $r['remarks'] ?? null,
                        'updated_at'      => now(),
                        'created_at'      => now(),
                    ]
                );
            }

            return response()->json(['success' => true, 'message' => 'Attendance successfully synchronized']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Bulk Insert Failed: ' . $e->getMessage()], 500);
        }
    }

    // 5.1 GET TEACHER PERSONAL HISTORY
    public function getTeacherHistory($employee_id)
    {
        return response()->json(DB::table('employee_attendance')->where('employee_id', $employee_id)->orderBy('date', 'desc')->get());
    }

    // 5.2 GET CLASS ATTENDANCE HISTORY (DAY-WISE TOTALS)
    public function getClassHistory($class_name)
    {
        $history = DB::table('student_attendance')
            ->where('class_name', $class_name)
            ->select('attendance_date', 
                     DB::raw('count(*) as total'), 
                     DB::raw('SUM(CASE WHEN status="Present" THEN 1 ELSE 0 END) as present'),
                     DB::raw('SUM(CASE WHEN status="Absent" THEN 1 ELSE 0 END) as absent'))
            ->groupBy('attendance_date')
            ->orderBy('attendance_date', 'desc')
            ->get();
            
        return response()->json($history);
    }

    // 6. PARENT SIDE: FETCH ATTENDANCE BY ADMISSION NO
    public function getStudentAttendance($admission_no)
    {
        try {
            // Find student by admission_no to get internal student_id if needed,
            // but for now we assume student_id matches admission_no in some contexts 
            // or we just query by student_id directly if it was passed.
            // Let's support both.
            $records = DB::table('student_attendance')
                ->where('student_id', $admission_no)
                ->orderBy('attendance_date', 'desc')
                ->get();

            return response()->json($records);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ═══════════════════════════════════════
    // ADMIN CRUD FOR CLASS ACCOUNTS
    // ═══════════════════════════════════════
    public function getClassAccounts() {
        return response()->json(DB::table('class_accounts')->orderBy('class_name', 'asc')->get());
    }

    public function createClassAccount(Request $request) {
        $data = $request->validate([
            'class_name' => 'required',
            'login_id'   => 'required|unique:class_accounts',
            'pin'        => 'required',
        ]);
        DB::table('class_accounts')->insert(array_merge($data, ['created_at' => now(), 'updated_at' => now()]));
        return response()->json(['success' => true]);
    }

    public function deleteClassAccount($id) {
        DB::table('class_accounts')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ═══════════════════════════════════════
    // ADMIN CRUD FOR TEACHER ACCOUNTS
    // ═══════════════════════════════════════
    public function getTeacherAccounts() {
        return response()->json(DB::table('teacher_accounts')->orderBy('name', 'asc')->get());
    }

    public function createTeacherAccount(Request $request) {
        $data = $request->validate([
            'name'        => 'required',
            'login_id'    => 'required|unique:teacher_accounts',
            'pin'         => 'required',
            'employee_id' => 'required',
        ]);
        DB::table('teacher_accounts')->insert(array_merge($data, ['created_at' => now(), 'updated_at' => now()]));
        return response()->json(['success' => true]);
    }

    public function deleteTeacherAccount($id) {
        DB::table('teacher_accounts')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ═══════════════════════════════════════
    // ATTENDANCE LOGS FOR ADMIN
    // ═══════════════════════════════════════
    public function getAttendanceLogs() {
        return response()->json(DB::table('employee_attendance')->orderBy('date', 'desc')->orderBy('check_in_time', 'desc')->get());
    }
}
