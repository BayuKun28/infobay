<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Get list of portfolios (Public). Supports ?category= filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Portfolio::query();

        if ($request->has('category') && !empty($request->category) && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        $portfolios = $query->orderBy('id', 'asc')->get();

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
        ]);

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
        ]);

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
