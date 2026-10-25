<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BiodataController;
use App\Http\Controllers\Api\V1\CertificationController;
use App\Http\Controllers\Api\V1\EducationController;
use App\Http\Controllers\Api\V1\ExperienceController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\PortfolioController;
use App\Http\Controllers\Api\V1\SeoController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SkillController;
use App\Http\Controllers\Api\V1\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // =========================================================================
    // Public Endpoints
    // =========================================================================
    Route::get('/biodata', [BiodataController::class, 'index']);
    Route::get('/portfolios', [PortfolioController::class, 'index']);
    Route::get('/portfolios/{id}', [PortfolioController::class, 'show']);
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
    Route::post('/messages', [MessageController::class, 'store']);

    // SEO & Crawler Endpoints
    Route::get('/seo-meta', [SeoController::class, 'seoMeta']);
    Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
    Route::get('/robots.txt', [SeoController::class, 'robots']);

    // Auth
    Route::post('/auth/login', [AuthController::class, 'login']);

    // =========================================================================
    // Protected Admin Endpoints (Requires Sanctum Token)
    // =========================================================================
    Route::middleware('auth:sanctum')->group(function () {
        // Auth management
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        // Admin CRUD
        Route::prefix('admin')->group(function () {
            // Account / Profile
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            // Media Upload
            Route::post('/upload', [PortfolioController::class, 'uploadImage']);

            // Biodata
            Route::put('/biodata', [BiodataController::class, 'update']);
            Route::post('/biodata/cv', [BiodataController::class, 'uploadCv']);

            // Portfolios
            Route::post('/portfolios', [PortfolioController::class, 'store']);
            Route::put('/portfolios/{id}', [PortfolioController::class, 'update']);
            Route::delete('/portfolios/{id}', [PortfolioController::class, 'destroy']);

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
