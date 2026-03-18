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
        Schema::create('communication_messages', function (Blueprint $table) {
            $table->id();
            $table->string('notice_id')->nullable();
            $table->string('title');
            $table->string('audience')->nullable();
            $table->string('active_from')->nullable();
            $table->string('active_till')->nullable();
            $table->text('content')->nullable();
            $table->string('published_by')->nullable();
            $table->string('status')->default('Active');
            $table->boolean('has_attachment')->default(false);
            $table->string('attachment_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_messages');
    }
};
