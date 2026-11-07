<?php

use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BackupController;
use App\Http\Controllers\Api\V1\BiodataController;
use App\Http\Controllers\Api\V1\CertificationController;
use App\Http\Controllers\Api\V1\EducationController;
use App\Http\Controllers\Api\V1\ExperienceController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\PortfolioCategoryController;
use App\Http\Controllers\Api\V1\PortfolioController;
use App\Http\Controllers\Api\V1\SeoController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SkillController;
use App\Http\Controllers\Api\V1\SystemController;
use App\Http\Controllers\Api\V1\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // =========================================================================
    // Public Endpoints
    // =========================================================================
    Route::get('/biodata', [BiodataController::class, 'index']);
    Route::get('/portfolios', [PortfolioController::class, 'index']);
    Route::get('/portfolios/{id}', [PortfolioController::class, 'show']);
    Route::get('/portfolio-categories', [PortfolioCategoryController::class, 'index']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/skills', [SkillController::class, 'index']);
    Route::get('/educations', [EducationController::class, 'index']);
    Route::get('/educations/{id}', [EducationController::class, 'show']);
    Route::get('/experiences', [ExperienceController::class, 'index']);
    Route::get('/experiences/{id}', [ExperienceController::class, 'show']);
    Route::get('/testimonials', [TestimonialController::class, 'index']);
    Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
    Route::get('/certifications', [CertificationController::class, 'index']);
    Route::get('/certifications/{id}', [CertificationController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store'])->middleware('throttle:6,1');

    // Privacy-First Anonymous Visitor Analytics Endpoint
    Route::post('/analytics/visit', [AnalyticsController::class, 'recordVisit'])->middleware('throttle:30,1');

    // Health & Homelab Node Status Endpoint (HABIBIE PLAN-20261103-01)
    Route::get('/health', function () {
        return response()->json([
            'status' => 'operational',
            'node' => 'bay-homelab-cluster',
            'server_primary' => 'Primary Node (Host Utama)',
            'server_standby' => 'Standby Mirror (HA Replica)',
            'os' => 'Debian GNU/Linux 12 (bookworm)',
            'environment' => 'Self-Hosted Dual-Server Homelab',
            'php_version' => PHP_VERSION,
            'timestamp' => time(),
        ])->header('Cache-Control', 'public, max-age=30');
    });

    // SEO & Crawler Endpoints
    Route::get('/seo-meta', [SeoController::class, 'seoMeta']);
    Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
    Route::get('/robots.txt', [SeoController::class, 'robots']);

    // Auth (Brute-force protected)
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    // =========================================================================
    // Protected Admin Endpoints (Requires Sanctum Token)
    // =========================================================================
    Route::middleware('auth:sanctum')->group(function () {
        // Auth management
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::post('/auth/revoke-other-tokens', [AuthController::class, 'revokeOtherTokens']);

        // Admin CRUD
        Route::prefix('admin')->group(function () {
            // Account / Profile
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            // Media Upload & Asset Explorer
            Route::post('/upload', [PortfolioController::class, 'uploadImage']);
            Route::get('/media', [PortfolioController::class, 'listMedia']);
            Route::post('/media/upload', [PortfolioController::class, 'uploadMedia']);
            Route::delete('/media/{filename}', [PortfolioController::class, 'deleteMedia']);

            // System Maintenance & Health
            Route::post('/system/clear-cache', [SystemController::class, 'clearCache']);
            Route::get('/system/health', [SystemController::class, 'getSystemHealth']);

            // Activity Log (Audit Trail)
            Route::get('/activity-logs', [ActivityLogController::class, 'index']);

            // Analytics Summary
            Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);

            // Data Governance: Backup & Restore
            Route::get('/backup/export', [BackupController::class, 'export']);
            Route::post('/backup/import', [BackupController::class, 'import']);

            // Biodata
            Route::put('/biodata', [BiodataController::class, 'update']);
            Route::post('/biodata/cv', [BiodataController::class, 'uploadCv']);

            // Portfolios
            Route::post('/portfolios', [PortfolioController::class, 'store']);
            Route::post('/portfolios/reorder', [PortfolioController::class, 'reorder']);
            Route::post('/portfolios/{id}/move-order', [PortfolioController::class, 'moveOrder']);
            Route::put('/portfolios/{id}', [PortfolioController::class, 'update']);
            Route::delete('/portfolios/{id}', [PortfolioController::class, 'destroy']);

            // Portfolio Categories
            Route::post('/portfolio-categories', [PortfolioCategoryController::class, 'store']);
            Route::put('/portfolio-categories/{id}', [PortfolioCategoryController::class, 'update']);
            Route::delete('/portfolio-categories/{id}', [PortfolioCategoryController::class, 'destroy']);

            // Services
            Route::post('/services', [ServiceController::class, 'store']);
            Route::put('/services/{id}', [ServiceController::class, 'update']);
            Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

            // Skills
            Route::post('/skills', [SkillController::class, 'store']);
            Route::put('/skills/{id}', [SkillController::class, 'update']);
            Route::delete('/skills/{id}', [SkillController::class, 'destroy']);

            // Messages / Inbox
            Route::get('/messages', [MessageController::class, 'index']);
            Route::post('/messages/bulk-action', [MessageController::class, 'bulkAction']);
            Route::get('/messages/{id}', [MessageController::class, 'show']);
            Route::put('/messages/{id}/read', [MessageController::class, 'toggleRead']);
            Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

            // Educations
            Route::get('/educations', [EducationController::class, 'index']);
            Route::get('/educations/{id}', [EducationController::class, 'show']);
            Route::post('/educations', [EducationController::class, 'store']);
            Route::put('/educations/{id}', [EducationController::class, 'update']);
            Route::delete('/educations/{id}', [EducationController::class, 'destroy']);

            // Experiences
            Route::get('/experiences', [ExperienceController::class, 'index']);
            Route::get('/experiences/{id}', [ExperienceController::class, 'show']);
            Route::post('/experiences', [ExperienceController::class, 'store']);
            Route::put('/experiences/{id}', [ExperienceController::class, 'update']);
            Route::delete('/experiences/{id}', [ExperienceController::class, 'destroy']);

            // Testimonials
            Route::get('/testimonials', [TestimonialController::class, 'adminIndex']);
            Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
            Route::post('/testimonials', [TestimonialController::class, 'store']);
            Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
            Route::put('/testimonials/{id}/toggle-active', [TestimonialController::class, 'toggleActive']);
            Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

            // Certifications
            Route::get('/certifications', [CertificationController::class, 'adminIndex']);
            Route::get('/certifications/{id}', [CertificationController::class, 'show']);
            Route::post('/certifications', [CertificationController::class, 'store']);
            Route::put('/certifications/{id}', [CertificationController::class, 'update']);
            Route::put('/certifications/{id}/toggle-active', [CertificationController::class, 'toggleActive']);
            Route::delete('/certifications/{id}', [CertificationController::class, 'destroy']);
        });
    });
});
