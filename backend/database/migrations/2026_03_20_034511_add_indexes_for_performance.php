<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            if (Schema::hasColumn('admissions', 'contact_no')) $table->index('contact_no');
            if (Schema::hasColumn('admissions', 'student_name')) $table->index('student_name');
            if (Schema::hasColumn('admissions', 'admitted_into_class')) $table->index('admitted_into_class');
            if (Schema::hasColumn('admissions', 'status')) $table->index('status');
        });

        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'contact_number')) $table->index('contact_number');
            if (Schema::hasColumn('employees', 'employee_id')) $table->index('employee_id');
            if (Schema::hasColumn('employees', 'status')) $table->index('status');
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'student_id')) $table->index('student_id');
            if (Schema::hasColumn('transactions', 'date')) $table->index('date');
            if (Schema::hasColumn('transactions', 'status')) $table->index('status');
            if (Schema::hasColumn('transactions', 'category')) $table->index('category');
        });

        Schema::table('homework', function (Blueprint $table) {
            if (Schema::hasColumn('homework', 'class_name')) $table->index('class_name');
            if (Schema::hasColumn('homework', 'due_date')) $table->index('due_date');
        });

        Schema::table('student_attendance', function (Blueprint $table) {
            if (Schema::hasColumn('student_attendance', 'student_id')) $table->index('student_id');
            if (Schema::hasColumn('student_attendance', 'attendance_date')) $table->index('attendance_date');
        });

        Schema::table('teacher_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('teacher_accounts', 'login_id')) $table->index('login_id');
            if (Schema::hasColumn('teacher_accounts', 'employee_id')) $table->index('employee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            $table->dropIndex(['contact_no']);
            $table->dropIndex(['student_name']);
            $table->dropIndex(['admitted_into_class']);
            $table->dropIndex(['status']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['contact_number']);
            $table->dropIndex(['employee_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
            $table->dropIndex(['date']);
            $table->dropIndex(['status']);
            $table->dropIndex(['category']);
        });

        Schema::table('homework', function (Blueprint $table) {
            $table->dropIndex(['class_name']);
            $table->dropIndex(['due_date']);
        });

        Schema::table('student_attendance', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
            $table->dropIndex(['attendance_date']);
        });

        Schema::table('teacher_accounts', function (Blueprint $table) {
            $table->dropIndex(['login_id']);
            $table->dropIndex(['employee_id']);
        });
    }
};
