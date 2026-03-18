<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id')->nullable();
            $table->string('student_name');
            $table->string('admission_no')->nullable();
            $table->string('class')->nullable();
            $table->string('document_type');  // Birth Certificate, Aadhaar, Transfer Certificate, etc.
            $table->string('document_name');
            $table->string('file_path')->nullable(); // stored file path
            $table->string('file_type')->nullable(); // pdf, jpg, png
            $table->string('file_size')->nullable(); // in KB
            $table->string('status')->default('Pending'); // Pending, Verified, Rejected
            $table->string('uploaded_by')->default('Admin');
            $table->text('remarks')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('student_documents');
    }
};
