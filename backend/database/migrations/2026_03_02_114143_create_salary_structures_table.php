<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->nullable();
            $table->string('employee_name');
            $table->string('designation');
            $table->string('department')->nullable();
            $table->decimal('basic_salary', 10, 2)->default(0);
            $table->decimal('hra', 10, 2)->default(0);          // House Rent Allowance
            $table->decimal('da', 10, 2)->default(0);           // Dearness Allowance
            $table->decimal('ta', 10, 2)->default(0);           // Travel Allowance
            $table->decimal('medical_allowance', 10, 2)->default(0);
            $table->decimal('other_allowance', 10, 2)->default(0);
            $table->decimal('pf_deduction', 10, 2)->default(0); // Provident Fund
            $table->decimal('tds_deduction', 10, 2)->default(0);// TDS
            $table->decimal('other_deduction', 10, 2)->default(0);
            $table->decimal('gross_salary', 10, 2)->default(0); // Auto-calculated
            $table->decimal('net_salary', 10, 2)->default(0);   // Auto-calculated
            $table->string('payment_mode')->default('Bank Transfer'); // Cash/Bank/Cheque
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('status')->default('Active');  // Active/On Hold
            $table->date('effective_from')->nullable();
            $table->timestamps();
        });

        // Salary payroll/payment records
        Schema::create('salary_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('salary_structure_id');
            $table->string('employee_id')->nullable();
            $table->string('employee_name');
            $table->string('month');   // March 2026
            $table->integer('year');
            $table->decimal('paid_amount', 10, 2);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('bonus', 10, 2)->default(0);
            $table->string('payment_mode')->default('Bank Transfer');
            $table->date('payment_date');
            $table->string('status')->default('Paid'); // Paid/Pending/Partial
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('salary_payments');
        Schema::dropIfExists('salary_structures');
    }
};
