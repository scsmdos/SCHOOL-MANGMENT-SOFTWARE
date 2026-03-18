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
        Schema::create('student_attendance', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->string('student_name');
            $table->string('class_name');
            $table->string('section')->nullable();
            $table->date('attendance_date');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Excused', 'Half Day'])->default('Present');
            $table->string('remarks')->nullable();
            $table->timestamps();

            // Unique constraint to prevent duplicate attendance for a student on the same day
            $table->unique(['student_id', 'attendance_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_attendance');
    }
};
