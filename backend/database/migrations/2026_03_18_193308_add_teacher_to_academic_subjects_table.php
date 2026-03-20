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
        Schema::table('academic_subjects', function (Blueprint $table) {
            $table->dropColumn('credits');
            $table->string('teacher')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_subjects', function (Blueprint $table) {
            $table->integer('credits')->default(0);
            $table->dropColumn('teacher');
        });
    }
};
