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
        Schema::create('library_books', function (Blueprint $table) {
            $table->id();
            $table->string('book_id')->unique();
            $table->string('title');
            $table->string('author');
            $table->string('category');
            $table->integer('copies')->default(1);
            $table->integer('available_copies')->default(1);
            $table->string('location')->nullable();
            $table->string('cover_color')->default('bg-blue-500');
            $table->timestamps();
        });

        Schema::create('library_issuances', function (Blueprint $table) {
            $table->id();
            $table->string('issue_id')->unique();
            $table->string('book_id'); // Link to book_id string
            $table->string('issued_to_id')->nullable(); // Can be student_id or employee_id
            $table->string('issued_to_name');
            $table->string('user_type')->default('Student'); // Student, Teacher
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->string('status')->default('Issued'); // Issued, Returned, Overdue
            $table->timestamps();
        });

        Schema::create('library_digital_assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_id')->unique();
            $table->string('title');
            $table->string('author')->nullable();
            $table->string('category')->nullable();
            $table->string('format')->default('PDF');
            $table->string('size')->nullable();
            $table->integer('downloads')->default(0);
            $table->string('link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_books');
        Schema::dropIfExists('library_issuances');
        Schema::dropIfExists('library_digital_assets');
    }
};
