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
        Schema::table('experiences', function (Blueprint $table) {
            $table->string('role')->nullable();
            $table->string('badge')->nullable();
        });

        Schema::table('educations', function (Blueprint $table) {
            $table->string('field')->nullable();
            $table->string('badge')->nullable();
        });

        Schema::table('biodatas', function (Blueprint $table) {
            $table->json('tech_stack')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn(['role', 'badge']);
        });

        Schema::table('educations', function (Blueprint $table) {
            $table->dropColumn(['field', 'badge']);
        });

        Schema::table('biodatas', function (Blueprint $table) {
            $table->dropColumn('tech_stack');
        });
    }
};
