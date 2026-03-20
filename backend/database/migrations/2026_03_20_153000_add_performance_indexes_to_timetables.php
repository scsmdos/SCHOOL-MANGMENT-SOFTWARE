<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('timetables', function (Blueprint $table) {
            // Add indexes for columns used in WHERE and ORDER BY clauses
            $table->index('class_name');
            $table->index('subject_name');
            $table->index('day');
            $table->index('period');
            $table->index(['class_name', 'day', 'period']); // Composite index for grid fetches
        });
    }

    public function down(): void
    {
        Schema::table('timetables', function (Blueprint $table) {
            $table->dropIndex(['class_name']);
            $table->dropIndex(['subject_name']);
            $table->dropIndex(['day']);
            $table->dropIndex(['period']);
            $table->dropIndex(['class_name', 'day', 'period']);
        });
    }
};
