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
        Schema::table('timetables', function (Blueprint $table) {
            $table->string('subject_name')->nullable();
            $table->string('teacher_name')->nullable();
            $table->string('class_name')->nullable();
            $table->string('type')->nullable(); // Theory, Practical, etc
            $table->string('room')->nullable();
            
            // Make existing IDs nullable if they aren't, to allow simpler saves 
            $table->unsignedBigInteger('academic_class_id')->nullable()->change();
            $table->unsignedBigInteger('subject_id')->nullable()->change();
            $table->unsignedBigInteger('employee_id')->nullable()->change();
            $table->time('start_time')->nullable()->change();
            $table->time('end_time')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timetables', function (Blueprint $table) {
            //
        });
    }
};
