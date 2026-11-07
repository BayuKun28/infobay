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
            $table->string('city', 100)->nullable()->after('platform');
            $table->string('country', 100)->nullable()->after('city');
            $table->string('country_code', 10)->nullable()->after('country');
            $table->string('event_type', 50)->default('page_view')->after('country_code')->index();
            $table->json('event_data')->nullable()->after('event_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_visits', function (Blueprint $table) {
            $table->dropIndex(['event_type']);
            $table->dropColumn(['city', 'country', 'country_code', 'event_type', 'event_data']);
        });
    }
};
