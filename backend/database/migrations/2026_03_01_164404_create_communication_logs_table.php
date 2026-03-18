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
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->string('log_id')->nullable();
            $table->string('type'); // SMS, Email, App Push, WhatsApp
            $table->string('recipient_group')->nullable();
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->string('date')->nullable();
            $table->integer('sent_count')->default(0);
            $table->integer('delivered')->default(0);
            $table->string('status')->default('Completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
    }
};
