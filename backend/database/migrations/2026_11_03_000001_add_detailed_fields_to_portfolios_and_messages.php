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
        Schema::table('portfolios', function (Blueprint $table) {
            $table->json('tech_stack')->nullable()->after('description');
            $table->string('github_url')->nullable()->after('tech_stack');
            $table->string('project_role')->nullable()->after('github_url');
            $table->json('metrics')->nullable()->after('project_role');
            $table->boolean('is_featured')->default(false)->after('metrics');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->string('project_type', 100)->nullable()->after('subject');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropColumn(['tech_stack', 'github_url', 'project_role', 'metrics', 'is_featured']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['project_type']);
        });
    }
};
