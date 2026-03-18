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
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->string('admission_no')->unique()->nullable();
            $table->date('date_of_admission');
            $table->string('admitted_into_class');
            $table->string('student_name');
            $table->string('father_name');
            $table->string('mother_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER']);
            $table->string('blood_group')->nullable();
            $table->string('nationality')->default('INDIAN');
            $table->string('religion')->nullable();
            $table->string('category')->nullable();
            
            // Address Section
            $table->string('village')->nullable();
            $table->string('post_office')->nullable();
            $table->string('police_station')->nullable();
            $table->string('district')->nullable();
            $table->string('state')->nullable();
            $table->string('pin_code')->nullable();
            
            $table->string('contact_no');
            $table->string('aadhaar_no')->nullable();
            
            // Parents details
            $table->string('qualification_father')->nullable();
            $table->string('qualification_mother')->nullable();
            $table->string('occupation_father')->nullable();
            $table->string('occupation_mother')->nullable();
            
            // Guardian details
            $table->string('local_guardian_name')->nullable();
            $table->string('relation_with_student')->nullable();
            $table->string('local_guardian_contact_no')->nullable();
            
            // General
            $table->string('status')->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
