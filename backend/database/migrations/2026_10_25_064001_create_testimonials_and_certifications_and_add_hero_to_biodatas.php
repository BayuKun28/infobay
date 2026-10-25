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
        // 1. Add Hero, CV & Marquee columns to biodatas
        Schema::table('biodatas', function (Blueprint $table) {
            $table->string('hero_headline')->nullable();
            $table->text('hero_subheadline')->nullable();
            $table->string('role_badge')->nullable();
            $table->string('experience_years_text')->nullable();
            $table->string('projects_completed_text')->nullable();
            $table->string('cv_file_url')->nullable();
            $table->json('marquee_items')->nullable();
        });

        // 2. Create testimonials table
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('client_title')->nullable();
            $table->string('company')->nullable();
            $table->string('avatar')->nullable();
            $table->text('content');
            $table->integer('rating')->default(5);
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Create certifications table
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('issuer');
            $table->string('issue_date')->nullable();
            $table->string('expiration_date')->nullable();
            $table->string('credential_id')->nullable();
            $table->string('credential_url')->nullable();
            $table->string('badge_image')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certifications');
        Schema::dropIfExists('testimonials');

        Schema::table('biodatas', function (Blueprint $table) {
            $table->dropColumn([
                'hero_headline',
                'hero_subheadline',
                'role_badge',
                'experience_years_text',
                'projects_completed_text',
                'cv_file_url',
                'marquee_items',
            ]);
        });
    }
};
