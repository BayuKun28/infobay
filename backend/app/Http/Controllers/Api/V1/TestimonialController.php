<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    /**
     * Get active testimonials (Public).
     */
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::where('is_active', true)
            ->orderBy('order_index', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'count' => $testimonials->count(),
            'data' => $testimonials,
        ]);
    }

    /**
     * Get all testimonials with filters & pagination (Admin).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Testimonial::query();

        if ($request->has('is_active')) {
            $isActive = filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isActive !== null) {
                $query->where('is_active', $isActive);
            }
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->query('search')) . '%';
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $like) {
                $q->where('client_name', $like, $search)
                  ->orWhere('client_title', $like, $search)
                  ->orWhere('company', $like, $search)
                  ->orWhere('content', $like, $search);
            });
        }

        $query->orderBy('order_index', 'asc')->orderBy('id', 'desc');

        if ($request->has('per_page')) {
            $perPage = max(1, min(100, (int) $request->query('per_page', 10)));
            $paginated = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ],
            ]);
        }

        $testimonials = $query->get();

        return response()->json([
            'status' => 'success',
            'count' => $testimonials->count(),
            'data' => $testimonials,
        ]);
    }

    /**
     * Get single testimonial detail.
     */
    public function show(int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return response()->json([
                'status' => 'error',
                'message' => 'Testimoni tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $testimonial,
        ]);
    }

    /**
     * Store new testimonial (Admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_title' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'avatar' => 'nullable|string',
            'avatar_file' => 'nullable|image|max:10240',
            'content' => 'required|string|max:5000',
            'rating' => 'nullable|integer|min:1|max:5',
            'order_index' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('avatar_file')) {
            $path = $request->file('avatar_file')->store('testimonials', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        if (!isset($validated['rating'])) {
            $validated['rating'] = 5;
        }

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $testimonial = Testimonial::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Testimoni berhasil ditambahkan.',
            'data' => $testimonial,
        ], 201);
    }

    /**
     * Update testimonial (Admin).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return response()->json([
                'status' => 'error',
                'message' => 'Testimoni tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_title' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'avatar' => 'nullable|string',
            'avatar_file' => 'nullable|image|max:10240',
            'content' => 'required|string|max:5000',
            'rating' => 'nullable|integer|min:1|max:5',
            'order_index' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('avatar_file')) {
            $path = $request->file('avatar_file')->store('testimonials', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $testimonial->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Testimoni berhasil diperbarui.',
            'data' => $testimonial,
        ]);
    }

    /**
     * Toggle active state (Admin).
     */
    public function toggleActive(int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return response()->json([
                'status' => 'error',
                'message' => 'Testimoni tidak ditemukan.',
            ], 404);
        }

        $testimonial->is_active = !$testimonial->is_active;
        $testimonial->save();

        return response()->json([
            'status' => 'success',
            'message' => $testimonial->is_active ? 'Testimoni diaktifkan.' : 'Testimoni dinonaktifkan.',
            'data' => $testimonial,
        ]);
    }

    /**
     * Delete testimonial (Admin).
     */
    public function destroy(int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return response()->json([
                'status' => 'error',
                'message' => 'Testimoni tidak ditemukan.',
            ], 404);
        }

        $testimonial->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Testimoni berhasil dihapus.',
        ]);
    }
}
