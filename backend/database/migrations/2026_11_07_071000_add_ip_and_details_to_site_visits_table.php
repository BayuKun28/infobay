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
        Schema::table('site_visits', function (Blueprint $table) {
            $table->string('ip_address', 45)->nullable()->after('device_type')->index();
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->string('browser', 50)->nullable()->after('user_agent');
            $table->string('platform', 50)->nullable()->after('browser');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_visits', function (Blueprint $table) {
            $table->dropIndex(['ip_address']);
            $table->dropColumn(['ip_address', 'user_agent', 'browser', 'platform']);
        });
    }
};
