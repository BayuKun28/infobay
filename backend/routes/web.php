<?php

use App\Http\Controllers\Api\V1\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('/robots.txt', [SeoController::class, 'robots']);

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'infobay'),
        'version' => '1.0.0',
        'status' => 'online',
        'api' => '/api/v1',
    ]);
});
