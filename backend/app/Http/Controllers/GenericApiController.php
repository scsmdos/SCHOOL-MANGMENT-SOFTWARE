<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;

class GenericApiController extends Controller
{
    private function transformData($data)
    {
        if ($data instanceof \Illuminate\Support\Collection) {
            return $data->map(fn($item) => $this->transformData($item));
        }

        if (is_object($data)) {
            $data = $data->toArray();
        }

        if (is_array($data)) {
            foreach ($data as $key => $value) {
                if (is_string($value) && str_starts_with($value, '/storage/')) {
                    // Convert relative storage path to public proxy URL
                    $path = str_replace('/storage/', '', $value);
                    $data[$key] = url('/api/storage-proxy/' . $path);
                }
                elseif (is_array($value) || is_object($value)) {
                    $data[$key] = $this->transformData($value);
                }
            }
        }

        return $data;
    }

    private function getModel($resource)
    {
        // Security Whitelist: Only allow specific resources to be accessed generically
        $allowedResources = [
            'admissions', 'employees', 'transactions', 'notices', 'timetables',
            'exams', 'exam-results', 'salary-structures', 'salary-payments',
            'student-documents', 'academic-classes', 'sections', 'subjects', 'expenses', 'fees',
            'academic-events', 'academic-subjects', 'academic-syllabi',
            'transport-routes', 'transport-vehicles', 'transport-drivers',
            'communication-messages', 'communication-logs', 'parent-accounts',
            'library-issuances', 'library-books', 'library-digital-assets', 'homework', 'student-attendance',
            'academic-calendar', 'parent-events', 'student-leaves'
        ];

        if (!in_array($resource, $allowedResources)) {
            \Illuminate\Support\Facades\Log::warning("Unauthorized generic resource access attempt: {$resource}");
            return null;
        }

        $modelName = Str::studly(Str::singular($resource));
        
        // Manual mapping for certain pluralization edge cases
        if ($resource === 'student-leaves') {
            $modelName = 'StudentLeave';
        }

        $modelClass = "\\App\\Models\\{$modelName}";

        if (class_exists($modelClass)) {
            return new $modelClass;
        }

        return null;
    }

    public function index(Request $request, $resource)
    {
        $model = $this->getModel($resource);

        if (!$model) {
            return response()->json(['error' => 'Resource not found or not allowed'], 404);
        }

        try {
            $query = $model::orderBy('id', 'desc');

            // --- Server-side Searching ---
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $columns = Schema::getColumnListing($model->getTable());
                $query->where(function($q) use ($columns, $search) {
                    foreach ($columns as $column) {
                        $q->orWhere($column, 'like', '%' . $search . '%');
                    }
                });
            }

            // --- Server-side Filtering per Field ---
            foreach ($request->all() as $key => $value) {
                if (in_array($key, ['page', 'per_page', 'search', 'order_by', 'order_dir'])) continue;
                if (Schema::hasColumn($model->getTable(), $key) && !empty($value) && $value !== 'All') {
                    $query->where($key, $value);
                }
            }

            // --- Pagination ---
            if ($request->has('page') || $request->has('per_page')) {
                $perPage = $request->get('per_page', 15);
                $items = $query->paginate($perPage);
                // Transform data within the paginator
                $items->getCollection()->transform(fn($item) => $this->transformData($item));
            } else {
                // If no pagination requested, limit to 1500 for safety but return as standard array
                $items = $query->limit(1500)->get();
                $items = $this->transformData($items);
            }

            return response()->json($items);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Generic API Fetch Error [{$resource}]: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($resource, $id)
    {
        $model = $this->getModel($resource);

        if (!$model) {
            return response()->json(['error' => 'Resource not found'], 404);
        }

        $item = $model::find($id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        return response()->json($this->transformData($item));
    }

    public function store(Request $request, $resource)
    {
        $model = $this->getModel($resource);

        if (!$model) {
            return response()->json(['error' => 'Resource not found'], 404);
        }

        \Illuminate\Support\Facades\Log::info('Store Request Payload keys:', array_keys($request->all()));

        $data = $request->except(['_method']);

        foreach ($request->allFiles() as $key => $file) {
            $ext = strtolower($file->getClientOriginalExtension());
            if (in_array($ext, ['php', 'exe', 'bat', 'sh', 'js', 'html', 'htm', 'py'])) {
                return response()->json(['error' => 'Malicious file type blocked'], 400);
            }

            $path = $file->store($resource, 'public');
            $data[$key] = '/storage/' . $path;

            // Auto calculate size for any uploaded file if not explicitly provided
            if (!isset($data['size']) && \Illuminate\Support\Facades\Schema::hasColumn($model->getTable(), 'size')) {
                $bytes = $file->getSize();
                $units = ['B', 'KB', 'MB', 'GB', 'TB'];
                $i = $bytes > 0 ? floor(log($bytes, 1024)) : 0;
                $data['size'] = round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
            }
        }

        try {
            // ── Auto-generate required ID fields that have no DB default ──
            $idFieldMap = [
                'employees'         => ['field' => 'employee_id',  'prefix' => 'EMP-'],
                'academic-classes'  => ['field' => 'class_id',     'prefix' => 'CLS-'],
                'academic-subjects' => ['field' => 'sub_code',     'prefix' => 'SUB-'],
                'academic-syllabi'  => ['field' => 'plan_id',      'prefix' => 'SYL-'],
                'academic-events'   => ['field' => 'event_id',     'prefix' => 'EVT-'],
                'academic-calendar' => ['field' => 'event_id',     'prefix' => 'CAL-'],
                'transport-routes'  => ['field' => 'route_id',     'prefix' => 'RTE-'],
                'transport-vehicles'=> ['field' => 'vehicle_id',   'prefix' => 'VEH-'],
                'transport-drivers' => ['field' => 'driver_id',    'prefix' => 'DRV-'],
                'exams'             => ['field' => 'exam_id',      'prefix' => 'EX-'],
                'exam-results'      => ['field' => 'result_id',    'prefix' => 'RS-'],
                'library-books'     => ['field' => 'book_id',      'prefix' => 'BK-'],
                'library-issuances' => ['field' => 'issue_id',     'prefix' => 'ISS-'],
                'library-digital-assets' => ['field' => 'asset_id', 'prefix' => 'RES-'],
                'parent-events'     => ['field' => 'event_id',     'prefix' => 'PE-'],
            ];

            if (isset($idFieldMap[$resource])) {
                $cfg   = $idFieldMap[$resource];
                $field = $cfg['field'];
                $prefix = $cfg['prefix'];
                $table  = $model->getTable();

                if (empty($data[$field]) && Schema::hasColumn($table, $field)) {
                    // Get highest existing numeric suffix
                    $last = DB::table($table)
                        ->where($field, 'like', $prefix . '%')
                        ->orderByRaw("CAST(SUBSTRING($field, " . (strlen($prefix) + 1) . ") AS UNSIGNED) DESC")
                        ->value($field);

                    $nextNum = $last
                        ? (intval(substr($last, strlen($prefix))) + 1)
                        : 1;

                    $data[$field] = $prefix . str_pad($nextNum, 3, '0', STR_PAD_LEFT);
                }
            }

            $item = $model::create($data);

            // ── AUTO-CREATE PARENT ACCOUNT WHEN ADMISSION IS APPROVED ──
            if ($resource === 'admissions' && isset($item->status) && $item->status === 'Approved') {
                try {
                    $login_id = $item->contact_no;
                    if ($login_id) {
                        $exists = \App\Models\ParentAccount::where('login_id', $login_id)->exists();
                        if (!$exists) {
                            \App\Models\ParentAccount::create([
                                'parent_id'    => 'P' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                                'parent_name'  => $item->father_name ?: ($item->mother_name ?: 'Parent'),
                                'relation'     => $item->father_name ? 'Father' : 'Mother',
                                'student_name' => trim(($item->student_name ?? 'Student') . ' (' . ($item->admitted_into_class ?? 'N/A') . ')'),
                                'login_id'     => $login_id,
                                'pin'          => ($tempPin = (string)rand(1000, 9999)), 
                                'status'       => 'Active',
                                'last_login'   => 'Never Logged In',
                            ]);
                            \Illuminate\Support\Facades\Log::info("Auto-created parent account for: {$login_id}");

                            // ── SEND WELCOME EMAIL ──
                            if (!empty($item->parent_email)) {
                                $pin = $tempPin ?? (string)rand(1000, 9999);
                                try {
                                    $html = "
                                    <div style='font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                                        <div style='text-align: center; margin-bottom: 20px;'>
                                            <img src='https://littleseeds.org.in/logo.png' alt='School Logo' style='height: 60px;' />
                                        </div>
                                        <h2 style='color: #0ea5e9; text-align: center;'>Welcome to Little Seeds School!</h2>
                                        <p>Dear Parent,</p>
                                        <p>Congratulations! Your child <strong>{$item->student_name}</strong>'s admission has been approved successfully.</p>
                                        <p>You can now access the <strong>Parent Mobile App</strong> to track your child's progress, attendance, and fees.</p>
                                        <div style='background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                                            <p style='margin: 0;'><strong>Your Login Credentials:</strong></p>
                                            <p style='margin: 5px 0;'>User ID: <span style='color: #0369a1; font-weight: bold;'>$login_id</span></p>
                                            <p style='margin: 5px 0;'>Initial PIN: <span style='color: #0369a1; font-weight: bold;'>$pin</span></p>
                                        </div>
                                        <p>For security reasons, please change your PIN after first login.</p>
                                        <p style='font-size: 12px; color: #666; margin-top: 30px; border-t: 1px solid #eee; padding-top: 10px;'>
                                            Best Regards,<br/><strong>Little Seeds School Administration</strong><br/>
                                            Contact: info@littleseeds.org.in
                                        </p>
                                    </div>";

                                    Mail::send([], [], function($message) use ($item, $html) {
                                        $message->to($item->parent_email)
                                                ->subject('Welcome to Little Seeds School - Parent App Credentials')
                                                ->from(config('mail.from.address'), config('mail.from.name'))
                                                ->html($html);
                                    });
                                    \Illuminate\Support\Facades\Log::info("Welcome email sent to: {$item->parent_email}");
                                } catch (\Exception $eEmail) {
                                    \Illuminate\Support\Facades\Log::error("Failed to send welcome email: " . $eEmail->getMessage());
                                }
                            }
                        }
                    }
                } catch (\Exception $exParent) {
                    \Illuminate\Support\Facades\Log::error('Auto-parent creation failed: ' . $exParent->getMessage());
                }
            }

            return response()->json($item, 201);
        }
        catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Create error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }


    public function update(Request $request, $resource, $id)
    {
        $model = $this->getModel($resource);

        if (!$model) {
            return response()->json(['error' => 'Resource not found'], 404);
        }

        $item = $model::find($id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        try {
            $data = $request->except(['_method']);

            foreach ($request->allFiles() as $key => $file) {
                $ext = strtolower($file->getClientOriginalExtension());
                if (in_array($ext, ['php', 'exe', 'bat', 'sh', 'js', 'html', 'htm', 'py'])) {
                    return response()->json(['error' => 'Malicious file type blocked'], 400);
                }

                // If the user uploads a new file, we replace the old path
                $path = $file->store($resource, 'public');
                $data[$key] = '/storage/' . $path;

                // Auto calculate size for any uploaded file if not explicitly provided
                if (!isset($data['size']) && \Illuminate\Support\Facades\Schema::hasColumn($model->getTable(), 'size')) {
                    $bytes = $file->getSize();
                    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
                    $i = $bytes > 0 ? floor(log($bytes, 1024)) : 0;
                    $data['size'] = round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
                }
            }

            $item->update($data);

            // ── AUTO-CREATE PARENT ACCOUNT WHEN ADMISSION IS APPROVED ──
            if ($resource === 'admissions' && isset($item->status) && $item->status === 'Approved') {
                try {
                    $login_id = $item->contact_no;
                    if ($login_id) {
                        $exists = \App\Models\ParentAccount::where('login_id', $login_id)->exists();
                        if (!$exists) {
                            \App\Models\ParentAccount::create([
                                'parent_id'    => 'P' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                                'parent_name'  => $item->father_name ?: ($item->mother_name ?: 'Parent'),
                                'relation'     => $item->father_name ? 'Father' : 'Mother',
                                'student_name' => trim(($item->student_name ?? 'Student') . ' (' . ($item->admitted_into_class ?? 'N/A') . ')'),
                                'login_id'     => $login_id,
                                'pin'          => ($tempPin = (string)rand(1000, 9999)), 
                                'status'       => 'Active',
                                'last_login'   => 'Never Logged In',
                            ]);
                            \Illuminate\Support\Facades\Log::info("Auto-created parent account upon approval: {$login_id}");

                            // ── SEND WELCOME EMAIL ──
                            if (!empty($item->parent_email)) {
                                $pin = $tempPin ?? (string)rand(1000, 9999);
                                try {
                                    $html = "
                                    <div style='font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                                        <div style='text-align: center; margin-bottom: 20px;'>
                                            <img src='https://littleseeds.org.in/logo.png' alt='School Logo' style='height: 60px;' />
                                        </div>
                                        <h2 style='color: #0ea5e9; text-align: center;'>Welcome to Little Seeds School!</h2>
                                        <p>Dear Parent,</p>
                                        <p>Congratulations! Your child <strong>{$item->student_name}</strong>'s admission has been approved successfully.</p>
                                        <p>You can now access the <strong>Parent Mobile App</strong> to track your child's progress, attendance, and fees.</p>
                                        <div style='background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                                            <p style='margin: 0;'><strong>Your Login Credentials:</strong></p>
                                            <p style='margin: 5px 0;'>User ID: <span style='color: #0369a1; font-weight: bold;'>$login_id</span></p>
                                            <p style='margin: 5px 0;'>Initial PIN: <span style='color: #0369a1; font-weight: bold;'>$pin</span></p>
                                        </div>
                                        <p>For security reasons, please change your PIN after first login.</p>
                                        <p style='font-size: 12px; color: #666; margin-top: 30px; border-t: 1px solid #eee; padding-top: 10px;'>
                                            Best Regards,<br/><strong>Little Seeds School Administration</strong><br/>
                                            Contact: info@littleseeds.org.in
                                        </p>
                                    </div>";

                                    Mail::send([], [], function($message) use ($item, $html) {
                                        $message->to($item->parent_email)
                                                ->subject('Welcome to Little Seeds School - Parent App Credentials')
                                                ->from(config('mail.from.address'), config('mail.from.name'))
                                                ->html($html);
                                    });
                                    \Illuminate\Support\Facades\Log::info("Welcome email sent upon approval to: {$item->parent_email}");
                                } catch (\Exception $eEmail) {
                                    \Illuminate\Support\Facades\Log::error("Failed to send welcome email upon approval: " . $eEmail->getMessage());
                                }
                            }
                        }
                    }
                } catch (\Exception $exParent) {
                    \Illuminate\Support\Facades\Log::error('Auto-parent creation failed upon approval: ' . $exParent->getMessage());
                }
            }

            return response()->json($item);
        }
        catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($resource, $id)
    {
        $model = $this->getModel($resource);

        if (!$model) {
            return response()->json(['error' => 'Resource not found'], 404);
        }

        $item = $model::find($id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
