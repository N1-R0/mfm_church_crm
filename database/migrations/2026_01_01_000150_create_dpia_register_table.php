<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('dpia_register')) {
            return;
        }

        Schema::create('dpia_register', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('owner')->nullable();
            $table->string('status')->default('draft');
            $table->text('summary')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dpia_register');
    }
};
