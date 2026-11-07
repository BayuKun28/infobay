<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    /**
     * Get paginated activity logs (Admin Protected).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(5, min(100, $perPage));

        $query = ActivityLog::with('user:id,name,email')->orderBy('created_at', 'desc');

        if ($request->has('search') && !empty($request->search)) {
            $s = trim($request->search);
            $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($s, $like) {
                $q->where('action', $like, "%{$s}%")
                  ->orWhere('description', $like, "%{$s}%");
            });
        }

        $logs = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Export all activity logs as CSV download (Admin Protected).
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $filename = 'audit_trail_logs_' . date('Ymd_His') . '.csv';

        $query = ActivityLog::with('user:id,name,email')->orderBy('created_at', 'desc');

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($handle, [
                'ID',
                'Waktu Kejadian',
                'Pengguna',
                'Aksi / Modul',
                'Deskripsi Aktivitas',
                'Alamat IP',
                'User Agent',
            ]);

            $query->chunk(500, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->id,
                        $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : '',
                        $row->user ? "{$row->user->name} ({$row->user->email})" : 'Sistem / Anonim',
                        $row->action,
                        $row->description,
                        $row->ip_address ?: '',
                        $row->user_agent ?: '',
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
