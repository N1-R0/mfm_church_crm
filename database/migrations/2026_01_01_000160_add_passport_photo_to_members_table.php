<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (! Schema::hasColumn('members', 'photo_url')) {
                $table->string('photo_url')->nullable()->after('role');
            }
            if (! Schema::hasColumn('members', 'passport_photo')) {
                $table->string('passport_photo')->nullable()->after('photo_url');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'photo_url')) {
                $table->string('photo_url')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'passport_photo')) {
                $table->dropColumn('passport_photo');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'photo_url')) {
                $table->dropColumn('photo_url');
            }
        });
    }
};
