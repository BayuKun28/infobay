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
            $table->json('highlights')->nullable()->after('metrics');
        });

        Schema::table('biodatas', function (Blueprint $table) {
            $table->string('specialization', 255)->nullable()->after('location');
            $table->string('work_status', 255)->nullable()->after('specialization');
            $table->json('aliases')->nullable()->after('work_status');
            $table->json('engineering_principles')->nullable()->after('aliases');
            $table->json('terminal_widget')->nullable()->after('engineering_principles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropColumn(['highlights']);
        });

        Schema::table('biodatas', function (Blueprint $table) {
            $table->dropColumn([
                'specialization',
                'work_status',
                'aliases',
                'engineering_principles',
                'terminal_widget',
            ]);
        });
    }
};
