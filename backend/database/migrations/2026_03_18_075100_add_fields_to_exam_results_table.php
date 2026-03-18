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
        Schema::table('exam_results', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_results', 'result_id')) {
                $table->string('result_id')->unique()->nullable()->after('id');
            }
            if (!Schema::hasColumn('exam_results', 'class')) {
                $table->string('class')->nullable()->after('student_name');
            }
            if (!Schema::hasColumn('exam_results', 'subject')) {
                $table->string('subject')->nullable()->after('class');
            }
            if (!Schema::hasColumn('exam_results', 'total_marks')) {
                $table->integer('total_marks')->default(100)->after('marks_obtained');
            }
            if (!Schema::hasColumn('exam_results', 'percentage')) {
                $table->float('percentage')->default(0)->after('total_marks');
            }
            if (!Schema::hasColumn('exam_results', 'status')) {
                $table->string('status')->default('PASS')->after('percentage');
            }
            // Allow exam_id and student_id to be nullable if we're storing names instead of FKs for now
            $table->unsignedBigInteger('exam_id')->nullable()->change();
            $table->unsignedBigInteger('student_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_results', function (Blueprint $table) {
            $table->dropColumn(['result_id', 'class', 'subject', 'total_marks', 'percentage', 'status']);
        });
    }
};
