<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Table for class-based logins (Teacher uses this to log in and mark student attendance)
        if (!Schema::hasTable('class_accounts')) {
            Schema::create('class_accounts', function (Blueprint $table) {
                $table->id();
                $table->string('class_name')->nullable();
                $table->string('login_id')->unique();
                $table->string('pin'); // 4-digit or text pin
                $table->string('status')->default('Active');
                $table->timestamps();
            });
        }

        // 2. Table for teacher self-attendance (Check-in/Check-out)
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
                $table->longText('photo_in')->nullable(); // Base64 photo string
                $table->longText('photo_out')->nullable(); // Base64 photo string
                $table->string('status')->default('Present'); // Present, On-Duty, Half-Day
                $table->text('remarks')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('class_accounts');
        Schema::dropIfExists('employee_attendance');
    }
};
