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
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('voucher_id')->nullable()->after('id');
            $table->string('student_name')->nullable()->after('student_id');
            $table->string('class_name')->nullable()->after('student_name');
            $table->string('payee_name')->nullable()->after('employee_id');
            $table->string('title')->nullable()->after('voucher_id');
            $table->string('description', 500)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            //
        });
    }
};
