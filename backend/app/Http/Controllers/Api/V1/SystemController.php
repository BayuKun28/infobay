<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class SystemController extends Controller
{
    /**
     * Clear application cache, routes, views, config (Admin protected).
     */
    public function clearCache(): JsonResponse
    {
        try {
            Artisan::call('optimize:clear');
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');

            return response()->json([
                'status' => 'success',
                'message' => 'Cache aplikasi berhasil dibersihkan dan dioptimasi.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membersihkan cache: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get system operational status & environment metrics (Admin protected).
     */
    public function getSystemHealth(): JsonResponse
    {
        $dbStatus = 'connected';
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbStatus = 'disconnected';
        }

        $diskTotal = disk_total_space(base_path());
        $diskFree = disk_free_space(base_path());
        $diskUsed = $diskTotal - $diskFree;
        $diskPercent = $diskTotal > 0 ? round(($diskUsed / $diskTotal) * 100, 1) : 0;

        return response()->json([
            'status' => 'operational',
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database' => [
                'type' => 'PostgreSQL 17',
                'status' => $dbStatus,
            ],
            'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'disk' => [
                'percent' => $diskPercent,
                'free_gb' => round($diskFree / (1024 * 1024 * 1024), 2),
                'total_gb' => round($diskTotal / (1024 * 1024 * 1024), 2),
            ],
            'server_time' => now()->toIso8601String(),
        ]);
    }
}
