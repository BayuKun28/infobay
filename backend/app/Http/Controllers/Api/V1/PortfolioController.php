<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Get list of portfolios (Public). Supports ?category= filter.
     * Ordered by order_index ASC, then id ASC.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Portfolio::query();

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
     * Dedicated image upload endpoint (Admin protected).
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
        ]);

        $path = $request->file('image')->store('portfolios', 'public');
        $url = '/storage/' . $path;

        return response()->json([
            'status' => 'success',
            'message' => 'Gambar berhasil diunggah.',
            'url' => $url,
            'path' => $path,
        ]);
    }

    /**
     * Store new portfolio (Admin protected).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'image' => 'nullable',
            'image_file' => 'nullable|image|max:10240',
            'link' => 'nullable|string',
            'description' => 'nullable|string',
            'tech_stack' => 'nullable',
            'github_url' => 'nullable|string',
            'project_role' => 'nullable|string|max:255',
            'metrics' => 'nullable|array',
            'is_featured' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
        ]);

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
            'category' => 'sometimes|required|string|max:100',
            'image' => 'nullable',
            'image_file' => 'nullable|image|max:10240',
            'link' => 'nullable|string',
            'description' => 'nullable|string',
            'tech_stack' => 'nullable',
            'github_url' => 'nullable|string',
            'project_role' => 'nullable|string|max:255',
            'metrics' => 'nullable|array',
            'is_featured' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
        ]);

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

        $portfolio->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Portofolio berhasil dihapus.',
        ]);
    }
}
