<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'youth_church')) {
                $table->string('youth_church')->nullable()->after('status');
            }
            if (! Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('remember_token');
            }
            if (! Schema::hasColumn('users', 'privacy_notice_version')) {
                $table->string('privacy_notice_version')->nullable()->after('last_login_at');
            }
            if (! Schema::hasColumn('users', 'privacy_acknowledged_at')) {
                $table->timestamp('privacy_acknowledged_at')->nullable()->after('privacy_notice_version');
            }
            if (! Schema::hasColumn('users', 'terms_version')) {
                $table->string('terms_version')->nullable()->after('privacy_acknowledged_at');
            }
            if (! Schema::hasColumn('users', 'terms_accepted_at')) {
                $table->timestamp('terms_accepted_at')->nullable()->after('terms_version');
            }
        });

        Schema::table('members', function (Blueprint $table) {
            if (! Schema::hasColumn('members', 'youth_church')) {
                $table->string('youth_church')->nullable()->after('role');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'youth_church',
                'last_login_at',
                'privacy_notice_version',
                'privacy_acknowledged_at',
                'terms_version',
                'terms_accepted_at',
            ]);
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('youth_church');
        });
    }
};
