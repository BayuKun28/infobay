<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioController extends Controller
{
    /**
     * Get list of portfolios (Public). Supports ?category= filter.
     * Ordered by order_index ASC, then id ASC.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Portfolio::query();

        // Public visibility: only published items, unless admin explicitly requests drafts
        if (!$request->user('sanctum') && !$request->has('include_drafts')) {
            $query->where('is_published', true);
        } elseif ($request->has('is_published')) {
            $isPub = filter_var($request->query('is_published'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isPub !== null) {
                $query->where('is_published', $isPub);
            }
        }

        if ($request->has('category') && !empty($request->category) && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        $portfolios = $query->orderBy('order_index', 'asc')->orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $portfolios->count(),
            'data' => $portfolios,
        ]);
    }

    /**
     * Get single portfolio detail (Public).
     */
    public function show(int $id): JsonResponse
    {
        $portfolio = Portfolio::find($id);

        if (!$portfolio) {
            return response()->json([
                'status' => 'error',
                'message' => 'Portofolio tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $portfolio,
        ]);
    }

    /**
     * Dedicated image upload endpoint with auto WebP compression pipeline (Admin protected).
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
        ]);

        $file = $request->file('image');
        $mime = $file->getMimeType();
        $filename = 'img_' . time() . '_' . Str::random(8) . '.webp';
        $fullDir = storage_path('app/public/portfolios');

        if (!file_exists($fullDir)) {
            mkdir($fullDir, 0755, true);
        }

        $fullPath = $fullDir . '/' . $filename;
        $converted = false;

        // Auto WebP compression pipeline for JPEG / PNG images (reduces file size by 70-80%)
        if (function_exists('imagewebp') && in_array($mime, ['image/jpeg', 'image/png', 'image/jpg'])) {
            $img = null;
            if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
                $img = @imagecreatefromjpeg($file->getRealPath());
            } elseif ($mime === 'image/png') {
                $img = @imagecreatefrompng($file->getRealPath());
                if ($img) {
                    imagepalettetotruecolor($img);
                    imagealphablending($img, true);
                    imagesavealpha($img, true);
                }
            }

            if ($img) {
                $converted = imagewebp($img, $fullPath, 80);
                imagedestroy($img);
            }
        }

        if ($converted) {
            $path = 'portfolios/' . $filename;
        } else {
            // Fallback for SVG, GIF or if GD is unavailable
            $path = $file->store('portfolios', 'public');
        }

        $url = '/storage/' . $path;

        return response()->json([
            'status' => 'success',
            'message' => 'Gambar berhasil diunggah' . ($converted ? ' dan dikonversi ke WebP otomatis.' : '.'),
            'url' => $url,
            'path' => $path,
            'is_webp' => $converted,
        ]);
    }

    /**
     * List all media assets in portfolios storage (Admin protected).
     */
    public function listMedia(Request $request): JsonResponse
    {
        $dir = storage_path('app/public/portfolios');
        $media = [];

        if (file_exists($dir)) {
            $files = scandir($dir);
            foreach ($files as $f) {
                if ($f === '.' || $f === '..' || str_starts_with($f, '.')) continue;
                $filepath = $dir . '/' . $f;
                if (is_file($filepath)) {
                    $media[] = [
                        'filename' => $f,
                        'url' => '/storage/portfolios/' . $f,
                        'size_kb' => round(filesize($filepath) / 1024, 1),
                        'modified_at' => date('Y-m-d H:i:s', filemtime($filepath)),
                    ];
                }
            }
        }

        // Sort descending by modified date
        usort($media, fn($a, $b) => strcmp($b['modified_at'], $a['modified_at']));

        return response()->json([
            'status' => 'success',
            'data' => $media,
        ]);
    }

    /**
     * Delete media asset from storage (Admin protected).
     */
    public function deleteMedia(string $filename): JsonResponse
    {
        $safeName = basename($filename);
        $filepath = storage_path('app/public/portfolios/' . $safeName);

        if (file_exists($filepath)) {
            unlink($filepath);
            return response()->json([
                'status' => 'success',
                'message' => 'Berkas media berhasil dihapus permanen.',
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Berkas media tidak ditemukan.',
        ], 404);
    }

    /**
     * Store new portfolio (Admin protected).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client_name' => 'nullable|string|max:255',
            'project_year' => 'nullable|string|max:50',
            'category' => 'required|string|max:100',
            'image' => 'nullable',
            'image_file' => 'nullable|image|max:10240',
            'gallery' => 'nullable',
            'link' => 'nullable|string',
            'description' => 'nullable|string',
            'tech_stack' => 'nullable',
            'github_url' => 'nullable|string',
            'project_role' => 'nullable|string|max:255',
            'metrics' => 'nullable',
            'highlights' => 'nullable',
            'is_featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
        ]);

        // Normalize gallery (support array or JSON string)
        if (isset($validated['gallery'])) {
            if (is_string($validated['gallery'])) {
                $decoded = json_decode($validated['gallery'], true);
                $validated['gallery'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['gallery'])) {
                $validated['gallery'] = [];
            }
        }

        // Normalize highlights (support array, JSON string, or comma/newline-separated string)
        if (isset($validated['highlights'])) {
            if (is_string($validated['highlights'])) {
                $decoded = json_decode($validated['highlights'], true);
                $validated['highlights'] = is_array($decoded)
                    ? $decoded
                    : array_values(array_filter(array_map('trim', preg_split('/[\r\n,]+/', $validated['highlights']))));
            } elseif (!is_array($validated['highlights'])) {
                $validated['highlights'] = [];
            }
        }

        // Normalize metrics (support array, JSON string, or newline-separated string)
        if (isset($validated['metrics'])) {
            if (is_string($validated['metrics'])) {
                $decoded = json_decode($validated['metrics'], true);
                $validated['metrics'] = is_array($decoded)
                    ? $decoded
                    : array_values(array_filter(array_map('trim', explode("\n", $validated['metrics']))));
            } elseif (!is_array($validated['metrics'])) {
                $validated['metrics'] = [];
            }
        }

        // Normalize tech_stack (support array, JSON string, or comma-separated string)
        if (isset($validated['tech_stack'])) {
            if (is_string($validated['tech_stack'])) {
                $decoded = json_decode($validated['tech_stack'], true);
                $validated['tech_stack'] = is_array($decoded)
                    ? $decoded
                    : array_values(array_filter(array_map('trim', explode(',', $validated['tech_stack']))));
            } elseif (!is_array($validated['tech_stack'])) {
                $validated['tech_stack'] = [];
            }
        }

        // Auto-assign order_index if not provided
        if (!isset($validated['order_index'])) {
            $maxOrder = Portfolio::max('order_index') ?? 0;
            $validated['order_index'] = $maxOrder + 1;
        }

        // Handle uploaded image file
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('portfolios', 'public');
            $validated['image'] = '/storage/' . $path;
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('portfolios', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $portfolio = Portfolio::create($validated);

        ActivityLog::record('portfolio.create', "Portofolio '{$portfolio->title}' berhasil ditambahkan.");

        return response()->json([
            'status' => 'success',
            'message' => 'Item portofolio berhasil ditambahkan.',
            'data' => $portfolio,
        ], 201);
    }

    /**
     * Update existing portfolio (Admin protected).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $portfolio = Portfolio::find($id);

        if (!$portfolio) {
            return response()->json([
                'status' => 'error',
                'message' => 'Portofolio tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'client_name' => 'nullable|string|max:255',
            'project_year' => 'nullable|string|max:50',
            'category' => 'sometimes|required|string|max:100',
            'image' => 'nullable',
            'image_file' => 'nullable|image|max:10240',
            'gallery' => 'nullable',
            'link' => 'nullable|string',
            'description' => 'nullable|string',
            'tech_stack' => 'nullable',
            'github_url' => 'nullable|string',
            'project_role' => 'nullable|string|max:255',
            'metrics' => 'nullable',
            'highlights' => 'nullable',
            'is_featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
        ]);

        // Normalize gallery (support array or JSON string)
        if (isset($validated['gallery'])) {
            if (is_string($validated['gallery'])) {
                $decoded = json_decode($validated['gallery'], true);
                $validated['gallery'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['gallery'])) {
                $validated['gallery'] = [];
            }
        }

        // Normalize highlights (support array, JSON string, or comma/newline-separated string)
        if (isset($validated['highlights'])) {
            if (is_string($validated['highlights'])) {
                $decoded = json_decode($validated['highlights'], true);
                $validated['highlights'] = is_array($decoded)
                    ? $decoded
                    : array_values(array_filter(array_map('trim', preg_split('/[\r\n,]+/', $validated['highlights']))));
            } elseif (!is_array($validated['highlights'])) {
                $validated['highlights'] = [];
            }
        }

        // Normalize metrics (support array, JSON string, or newline-separated string)
        if (isset($validated['metrics'])) {
            if (is_string($validated['metrics'])) {
                $decoded = json_decode($validated['metrics'], true);
                $validated['metrics'] = is_array($decoded)
                    ? $decoded
                    : array_values(array_filter(array_map('trim', explode("\n", $validated['metrics']))));
            } elseif (!is_array($validated['metrics'])) {
                $validated['metrics'] = [];
            }
        }

        // Normalize tech_stack (support array, JSON string, or comma-separated string)
        if (isset($validated['tech_stack'])) {
            if (is_string($validated['tech_stack'])) {
                $decoded = json_decode($validated['tech_stack'], true);
                $validated['tech_stack'] = is_array($decoded)
                    ? $decoded
                    : array_values(array_filter(array_map('trim', explode(',', $validated['tech_stack']))));
            } elseif (!is_array($validated['tech_stack'])) {
                $validated['tech_stack'] = [];
            }
        }

        // Handle uploaded image file
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('portfolios', 'public');
            $validated['image'] = '/storage/' . $path;
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('portfolios', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $portfolio->update($validated);

        ActivityLog::record('portfolio.update', "Portofolio '{$portfolio->title}' (ID: {$portfolio->id}) diperbarui.");

        return response()->json([
            'status' => 'success',
            'message' => 'Portofolio berhasil diperbarui.',
            'data' => $portfolio,
        ]);
    }

    /**
     * Batch reorder portfolios (Admin protected).
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:portfolios,id',
            'items.*.order_index' => 'required|integer',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                Portfolio::where('id', $item['id'])->update(['order_index' => $item['order_index']]);
            }
        });

        ActivityLog::record('portfolio.reorder', 'Urutan tampil portofolio diperbarui.');

        return response()->json([
            'status' => 'success',
            'message' => 'Urutan portofolio berhasil diperbarui.',
        ]);
    }

    /**
     * Delete portfolio (Admin protected).
     */
    public function destroy(int $id): JsonResponse
    {
        $portfolio = Portfolio::find($id);

        if (!$portfolio) {
            return response()->json([
                'status' => 'error',
                'message' => 'Portofolio tidak ditemukan.',
            ], 404);
        }

        $title = $portfolio->title;
        $portfolio->delete();

        ActivityLog::record('portfolio.delete', "Portofolio '{$title}' (ID: {$id}) berhasil dihapus.");

        return response()->json([
            'status' => 'success',
            'message' => 'Portofolio berhasil dihapus.',
        ]);
    }
}
