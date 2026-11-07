<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteVisit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Record privacy-first anonymous site visit (Public).
     */
    public function recordVisit(Request $request): JsonResponse
    {
        $page = substr($request->input('page', '/'), 0, 255);
        $referer = substr($request->input('referer', $request->header('referer') ?? ''), 0, 500);

        // Simple device detection from User-Agent
        $ua = strtolower($request->userAgent() ?? '');
        $device = 'desktop';
        if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
            $device = 'tablet';
        } elseif (str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')) {
            $device = 'mobile';
        }

        // Salted hash for privacy compliance (GDPR/Personal Data friendly)
        $ipHash = hash('sha256', $request->ip() . date('Y-m-d') . config('app.key'));

        SiteVisit::create([
            'page' => $page,
            'referer' => !empty($referer) ? $referer : null,
            'device_type' => $device,
            'ip_hash' => $ipHash,
            'visit_date' => now()->toDateString(),
            'created_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kunjungan berhasil dicatat.',
        ]);
    }

    /**
     * Get analytics summary for admin dashboard (Admin Protected).
     */
    public function summary(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $sevenDaysAgo = now()->subDays(6)->toDateString();

        $todayVisits = SiteVisit::where('visit_date', $today)->count();
        $totalVisits = SiteVisit::count();

        // Last 7 days trend
        $sevenDaysRaw = SiteVisit::where('visit_date', '>=', $sevenDaysAgo)
            ->select('visit_date', DB::raw('count(*) as total'))
            ->groupBy('visit_date')
            ->orderBy('visit_date', 'asc')
            ->pluck('total', 'visit_date')
            ->toArray();

        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = now()->subDays($i)->toDateString();
            $trend[] = [
                'date' => $d,
                'label' => date('d M', strtotime($d)),
                'visits' => (int) ($sevenDaysRaw[$d] ?? 0),
            ];
        }

        // Device breakdown
        $devices = SiteVisit::select('device_type', DB::raw('count(*) as count'))
            ->groupBy('device_type')
            ->pluck('count', 'device_type')
            ->toArray();

        // Top referrers
        $topReferrers = SiteVisit::whereNotNull('referer')
            ->select('referer', DB::raw('count(*) as count'))
            ->groupBy('referer')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'today_visits' => $todayVisits,
                'total_visits' => $totalVisits,
                'trend' => $trend,
                'devices' => [
                    'desktop' => (int) ($devices['desktop'] ?? 0),
                    'mobile' => (int) ($devices['mobile'] ?? 0),
                    'tablet' => (int) ($devices['tablet'] ?? 0),
                ],
                'top_referrers' => $topReferrers,
            ],
        ]);
    }
}
