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
     * Parse client browser name from user agent string.
     */
    private function parseBrowser(string $ua): string
    {
        $uaLower = strtolower($ua);
        if (str_contains($uaLower, 'edg/') || str_contains($uaLower, 'edge/')) {
            return 'Microsoft Edge';
        } elseif (str_contains($uaLower, 'opr/') || str_contains($uaLower, 'opera')) {
            return 'Opera';
        } elseif (str_contains($uaLower, 'samsungbrowser')) {
            return 'Samsung Internet';
        } elseif (str_contains($uaLower, 'chrome/') || str_contains($uaLower, 'crios/')) {
            return 'Google Chrome';
        } elseif (str_contains($uaLower, 'firefox/') || str_contains($uaLower, 'fxios/')) {
            return 'Mozilla Firefox';
        } elseif (str_contains($uaLower, 'safari/') && !str_contains($uaLower, 'chrome/')) {
            return 'Apple Safari';
        } elseif (str_contains($uaLower, 'curl/') || str_contains($uaLower, 'wget/') || str_contains($uaLower, 'python') || str_contains($uaLower, 'bot')) {
            return 'Bot / Crawler';
        }
        return 'Other';
    }

    /**
     * Parse client platform/OS from user agent string.
     */
    private function parsePlatform(string $ua): string
    {
        $uaLower = strtolower($ua);
        if (str_contains($uaLower, 'windows nt 10.0')) {
            return 'Windows 10/11';
        } elseif (str_contains($uaLower, 'windows')) {
            return 'Windows';
        } elseif (str_contains($uaLower, 'android')) {
            return 'Android';
        } elseif (str_contains($uaLower, 'iphone')) {
            return 'iOS (iPhone)';
        } elseif (str_contains($uaLower, 'ipad')) {
            return 'iOS (iPad)';
        } elseif (str_contains($uaLower, 'macintosh') || str_contains($uaLower, 'mac os x')) {
            return 'macOS';
        } elseif (str_contains($uaLower, 'linux')) {
            return 'Linux';
        } elseif (str_contains($uaLower, 'cros')) {
            return 'Chrome OS';
        }
        return 'Unknown';
    }

    /**
     * Extract real client IP considering Cloudflare, reverse proxies, and Nginx.
     */
    private function getClientIp(Request $request): string
    {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
        ];

        foreach ($headers as $header) {
            $value = $request->server($header);
            if (!empty($value)) {
                $ips = explode(',', $value);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return $request->ip() ?: '127.0.0.1';
    }

    /**
     * Record site visit (Public).
     */
    public function recordVisit(Request $request): JsonResponse
    {
        $page = substr($request->input('page', '/'), 0, 255);
        $referer = substr($request->input('referer', $request->header('referer') ?? ''), 0, 500);
        $rawUa = $request->userAgent() ?? '';
        $uaLower = strtolower($rawUa);

        // Device detection
        $device = 'desktop';
        if (str_contains($uaLower, 'tablet') || str_contains($uaLower, 'ipad')) {
            $device = 'tablet';
        } elseif (str_contains($uaLower, 'mobile') || str_contains($uaLower, 'android') || str_contains($uaLower, 'iphone')) {
            $device = 'mobile';
        }

        $ip = $this->getClientIp($request);
        $browser = $this->parseBrowser($rawUa);
        $platform = $this->parsePlatform($rawUa);
        $ipHash = hash('sha256', $ip . date('Y-m-d') . config('app.key'));

        SiteVisit::create([
            'page' => $page,
            'referer' => !empty($referer) ? $referer : null,
            'device_type' => $device,
            'ip_address' => $ip,
            'user_agent' => substr($rawUa, 0, 1000),
            'browser' => $browser,
            'platform' => $platform,
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
        $todayUniqueIps = SiteVisit::where('visit_date', $today)
            ->whereNotNull('ip_address')
            ->distinct('ip_address')
            ->count('ip_address');

        $totalVisits = SiteVisit::count();
        $totalUniqueIps = SiteVisit::whereNotNull('ip_address')
            ->distinct('ip_address')
            ->count('ip_address');

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

        // Browser breakdown
        $browsers = SiteVisit::whereNotNull('browser')
            ->select('browser', DB::raw('count(*) as count'))
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Platform/OS breakdown
        $platforms = SiteVisit::whereNotNull('platform')
            ->select('platform', DB::raw('count(*) as count'))
            ->groupBy('platform')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Top pages
        $topPages = SiteVisit::select('page', DB::raw('count(*) as count'))
            ->groupBy('page')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

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
                'today_unique_ips' => $todayUniqueIps,
                'total_visits' => $totalVisits,
                'total_unique_ips' => $totalUniqueIps,
                'trend' => $trend,
                'devices' => [
                    'desktop' => (int) ($devices['desktop'] ?? 0),
                    'mobile' => (int) ($devices['mobile'] ?? 0),
                    'tablet' => (int) ($devices['tablet'] ?? 0),
                ],
                'browsers' => $browsers,
                'platforms' => $platforms,
                'top_pages' => $topPages,
                'top_referrers' => $topReferrers,
            ],
        ]);
    }

    /**
     * Get paginated visitor logs with search and filters (Admin Protected).
     */
    public function visitors(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage <= 0 || $perPage > 100) {
            $perPage = 15;
        }

        $query = SiteVisit::query();

        // Filter by device
        $device = $request->input('device');
        if (!empty($device) && in_array($device, ['desktop', 'mobile', 'tablet'], true)) {
            $query->where('device_type', $device);
        }

        // Filter by date range
        $dateRange = $request->input('date_range');
        if ($dateRange === 'today') {
            $query->where('visit_date', now()->toDateString());
        } elseif ($dateRange === 'yesterday') {
            $query->where('visit_date', now()->subDay()->toDateString());
        } elseif ($dateRange === '7days') {
            $query->where('visit_date', '>=', now()->subDays(6)->toDateString());
        } elseif ($dateRange === '30days') {
            $query->where('visit_date', '>=', now()->subDays(29)->toDateString());
        }

        // Search by IP, page, browser, platform, or referer
        $search = trim($request->input('search', ''));
        if (!empty($search)) {
            $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $term = "%{$search}%";
                $q->where('ip_address', $like, $term)
                  ->orWhere('page', $like, $term)
                  ->orWhere('browser', $like, $term)
                  ->orWhere('platform', $like, $term)
                  ->orWhere('referer', $like, $term)
                  ->orWhere('user_agent', $like, $term);
            });
        }

        // Ordering
        $orderBy = $request->input('order_by', 'created_at');
        $orderDir = strtolower($request->input('order_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        if (in_array($orderBy, ['created_at', 'visit_date', 'ip_address', 'page', 'device_type', 'browser', 'platform'], true)) {
            $query->orderBy($orderBy, $orderDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $visitors = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $visitors,
        ]);
    }

    /**
     * Delete a single visitor record (Admin Protected).
     */
    public function destroyVisitor($id): JsonResponse
    {
        $visit = SiteVisit::find($id);
        if (!$visit) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data kunjungan tidak ditemukan.',
            ], 404);
        }

        $visit->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Log kunjungan berhasil dihapus.',
        ]);
    }

    /**
     * Clear all visitor logs older than specified days or reset logs (Admin Protected).
     */
    public function clearVisitors(Request $request): JsonResponse
    {
        $days = (int) $request->input('older_than_days', 30);
        if ($days <= 0) {
            SiteVisit::truncate();
            $message = 'Seluruh log kunjungan berhasil dibersihkan.';
        } else {
            $cutoff = now()->subDays($days)->toDateString();
            $deleted = SiteVisit::where('visit_date', '<', $cutoff)->delete();
            $message = "Log kunjungan lebih dari {$days} hari berhasil dibersihkan ({$deleted} log dihapus).";
        }

        return response()->json([
            'status' => 'success',
            'message' => $message,
        ]);
    }
}
