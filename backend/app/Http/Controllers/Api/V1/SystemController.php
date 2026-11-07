<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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

            ActivityLog::record('system.clear_cache', 'Membersihkan dan mengoptimasi cache sistem, konfigurasi, rute, dan view.');

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
     * Trigger on-demand database JSON snapshot (Admin protected).
     */
    public function createSnapshot(Request $request): JsonResponse
    {
        try {
            $exitCode = Artisan::call('infobay:backup-snapshot');

            if ($exitCode !== 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal membuat snapshot database via Artisan.',
                ], 500);
            }

            // Find the latest snapshot in storage_path('app/backups')
            $backupDir = storage_path('app/backups');
            $files = File::files($backupDir);
            $latestFile = null;
            $latestTime = 0;

            foreach ($files as $file) {
                if (str_starts_with($file->getFilename(), 'snapshot_') && $file->getExtension() === 'json') {
                    if ($file->getMTime() > $latestTime) {
                        $latestTime = $file->getMTime();
                        $latestFile = $file;
                    }
                }
            }

            if (!$latestFile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Berkas snapshot tidak ditemukan setelah pembuatan.',
                ], 500);
            }

            $filename = $latestFile->getFilename();
            $fileSizeKb = round(File::size($latestFile->getRealPath()) / 1024, 2);

            ActivityLog::record('system.create_snapshot', "Snapshot cadangan database berhasil dibuat: {$filename} ({$fileSizeKb} KB).");

            return response()->json([
                'status' => 'success',
                'message' => "Snapshot cadangan database berhasil dibuat ({$filename}, {$fileSizeKb} KB).",
                'data' => [
                    'filename' => $filename,
                    'size_kb' => $fileSizeKb,
                    'created_at' => date('Y-m-d H:i:s', $latestTime),
                    'download_url' => "/api/v1/admin/system/snapshot/download/{$filename}",
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kesalahan saat membuat snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download specific snapshot file safely (Admin protected).
     */
    public function downloadSnapshot($filename): BinaryFileResponse|JsonResponse
    {
        // Sanitize filename to prevent directory traversal
        if (!preg_match('/^snapshot_[A-Za-z0-9_\-]+\.json$/', $filename)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nama berkas tidak valid atau tidak diizinkan.',
            ], 400);
        }

        $filePath = storage_path('app/backups' . DIRECTORY_SEPARATOR . $filename);
        if (!File::exists($filePath)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Berkas snapshot tidak ditemukan.',
            ], 404);
        }

        ActivityLog::record('system.download_snapshot', "Mengunduh berkas snapshot cadangan: {$filename}");

        return response()->download($filePath, $filename, [
            'Content-Type' => 'application/json',
        ]);
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
