<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
            'academic-calendar'
        ];

        if (!in_array($resource, $allowedResources)) {
            \Illuminate\Support\Facades\Log::warning("Unauthorized generic resource access attempt: {$resource}");
            return null;
        }

        $modelName = Str::studly(Str::singular($resource));
        $modelClass = "\\App\\Models\\{$modelName}";

        if (class_exists($modelClass)) {
            return new $modelClass;
        }

        return null;
    }

    public function index($resource)
    {
        $model = $this->getModel($resource);

        if (!$model) {
            return response()->json(['error' => 'Resource not found or not allowed'], 404);
        }

        try {
            // Use limit to prevent Out Of Memory crashes on very large tables
            $items = $model::orderBy('id', 'desc')->limit(1500)->get();
            return response()->json($this->transformData($items));
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

            // ── AUTO-CREATE PARENT ACCOUNT FOR NEW ADMISSIONS ──
            if ($resource === 'admissions') {
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
                                'pin'          => (string)rand(1000, 9999), 
                                'status'       => 'Active',
                                'last_login'   => 'Never Logged In',
                            ]);
                            \Illuminate\Support\Facades\Log::info("Auto-created parent account for: {$login_id}");
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
