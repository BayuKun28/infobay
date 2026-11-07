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
        // 1. Add is_published to portfolios table
        Schema::table('portfolios', function (Blueprint $table) {
            $table->boolean('is_published')->default(true)->after('is_featured');
        });

        // 2. Add SEO & Announcement fields to biodatas table
        Schema::table('biodatas', function (Blueprint $table) {
            $table->string('og_image')->nullable()->after('avatar');
            $table->text('meta_description')->nullable()->after('about');
            $table->json('announcement_bar')->nullable()->after('terminal_widget');
        });

        // 3. Create activity_logs table for Admin Audit Trail
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action', 100);
            $table->text('description');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        // 4. Create site_visits table for Privacy-First Lightweight Analytics
        Schema::create('site_visits', function (Blueprint $table) {
            $table->id();
            $table->string('page', 255)->default('/');
            $table->string('referer', 500)->nullable();
            $table->string('device_type', 50)->nullable();
            $table->string('ip_hash', 64)->nullable()->index();
            $table->date('visit_date')->index();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_visits');
        Schema::dropIfExists('activity_logs');

        Schema::table('biodatas', function (Blueprint $table) {
            $table->dropColumn(['og_image', 'meta_description', 'announcement_bar']);
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropColumn(['is_published']);
        });
    }
};
