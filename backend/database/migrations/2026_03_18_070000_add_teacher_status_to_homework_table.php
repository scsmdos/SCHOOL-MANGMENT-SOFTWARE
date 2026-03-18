<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homework', function (Blueprint $table) {
            if (!Schema::hasColumn('homework', 'assigned_by')) {
                $table->string('assigned_by')->nullable()->after('due_date');
            }
            if (!Schema::hasColumn('homework', 'teacher_name')) {
                $table->string('teacher_name')->nullable()->after('assigned_by');
            }
            if (!Schema::hasColumn('homework', 'status')) {
                $table->string('status')->default('PENDING')->after('teacher_name');
            }
            if (!Schema::hasColumn('homework', 'student_name')) {
                $table->string('student_name')->default('All Students')->after('class_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('homework', function (Blueprint $table) {
            $table->dropColumn(['assigned_by', 'teacher_name', 'status']);
            // student_name kept since it was added by a previous migration
        });
    }
};
