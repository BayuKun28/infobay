<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PortfolioCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PortfolioCategoryController extends Controller
{
    /**
     * Get all portfolio categories (Public).
     */
    public function index(): JsonResponse
    {
        $categories = PortfolioCategory::withCount('portfolios')
            ->orderBy('order_index', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'count' => $categories->count(),
            'data' => $categories,
        ]);
    }

    /**
     * Store a new category (Admin protected).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:portfolio_categories,name',
            'order_index' => 'nullable|integer',
        ]);

        $maxOrder = PortfolioCategory::max('order_index') ?? 0;

        $category = PortfolioCategory::create([
            'name' => trim($validated['name']),
            'slug' => Str::slug($validated['name']),
            'order_index' => $validated['order_index'] ?? ($maxOrder + 1),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori portofolio berhasil ditambahkan.',
            'data' => $category,
        ], 201);
    }

    /**
     * Update an existing category (Admin protected).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = PortfolioCategory::find($id);

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:portfolio_categories,name,' . $id,
            'order_index' => 'nullable|integer',
        ]);

        $oldName = $category->name;
        $newName = trim($validated['name']);

        $category->update([
            'name' => $newName,
            'slug' => Str::slug($newName),
            'order_index' => $validated['order_index'] ?? $category->order_index,
        ]);

        // If category name changed, update portfolios referencing the old name
        if ($oldName !== $newName) {
            \App\Models\Portfolio::where('category', $oldName)->update(['category' => $newName]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori portofolio berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    /**
     * Delete a category (Admin protected).
     */
    public function destroy(int $id): JsonResponse
    {
        $category = PortfolioCategory::find($id);

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $inUseCount = \App\Models\Portfolio::where('category', $category->name)->count();
        if ($inUseCount > 0) {
            return response()->json([
                'status' => 'error',
                'message' => "Kategori '{$category->name}' tidak dapat dihapus karena masih digunakan oleh {$inUseCount} item portofolio.",
            ], 422);
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori portofolio berhasil dihapus.',
        ]);
    }
}
