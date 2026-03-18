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
        Schema::table('exams', function (Blueprint $table) {
            if (!Schema::hasColumn('exams', 'exam_id')) {
                $table->string('exam_id')->unique()->nullable()->after('id');
            }
            if (!Schema::hasColumn('exams', 'exam_name')) {
                $table->string('exam_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('exams', 'subject')) {
                $table->string('subject')->nullable()->after('exam_name');
            }
            if (!Schema::hasColumn('exams', 'class')) {
                $table->string('class')->nullable()->after('subject');
            }
            if (!Schema::hasColumn('exams', 'exam_date')) {
                $table->date('exam_date')->nullable()->after('class');
            }
            if (!Schema::hasColumn('exams', 'duration')) {
                $table->string('duration')->nullable()->after('exam_date');
            }
            if (!Schema::hasColumn('exams', 'total_marks')) {
                $table->integer('total_marks')->default(100)->after('duration');
            }
            if (!Schema::hasColumn('exams', 'exam_type')) {
                $table->string('exam_type')->default('UNIT TEST')->after('total_marks');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['exam_id', 'exam_name', 'subject', 'class', 'exam_date', 'duration', 'total_marks', 'exam_type']);
        });
    }
};
