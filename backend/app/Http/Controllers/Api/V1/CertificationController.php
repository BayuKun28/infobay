<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificationController extends Controller
{
    /**
     * Get active certifications (Public).
     */
    public function index(): JsonResponse
    {
        $certifications = Certification::where('is_active', true)
            ->orderBy('order_index', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'count' => $certifications->count(),
            'data' => $certifications,
        ]);
    }

    /**
     * Get all certifications with filters & pagination (Admin).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Certification::query();

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
                $q->where('title', $like, $search)
                  ->orWhere('issuer', $like, $search)
                  ->orWhere('credential_id', $like, $search);
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

        $certifications = $query->get();

        return response()->json([
            'status' => 'success',
            'count' => $certifications->count(),
            'data' => $certifications,
        ]);
    }

    /**
     * Get single certification detail.
     */
    public function show(int $id): JsonResponse
    {
        $certification = Certification::find($id);

        if (!$certification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sertifikasi tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $certification,
        ]);
    }

    /**
     * Store new certification (Admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'issuer' => 'required|string|max:255',
            'issue_date' => 'nullable|string|max:100',
            'expiration_date' => 'nullable|string|max:100',
            'credential_id' => 'nullable|string|max:255',
            'credential_url' => 'nullable|string|max:500',
            'badge_image' => 'nullable|string|max:500',
            'badge_file' => 'nullable|image|max:10240',
            'order_index' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('badge_file')) {
            $path = $request->file('badge_file')->store('certifications', 'public');
            $validated['badge_image'] = '/storage/' . $path;
        }

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $certification = Certification::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Sertifikasi berhasil ditambahkan.',
            'data' => $certification,
        ], 201);
    }

    /**
     * Update certification (Admin).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $certification = Certification::find($id);

        if (!$certification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sertifikasi tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'issuer' => 'required|string|max:255',
            'issue_date' => 'nullable|string|max:100',
            'expiration_date' => 'nullable|string|max:100',
            'credential_id' => 'nullable|string|max:255',
            'credential_url' => 'nullable|string|max:500',
            'badge_image' => 'nullable|string|max:500',
            'badge_file' => 'nullable|image|max:10240',
            'order_index' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('badge_file')) {
            $path = $request->file('badge_file')->store('certifications', 'public');
            $validated['badge_image'] = '/storage/' . $path;
        }

        $certification->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Sertifikasi berhasil diperbarui.',
            'data' => $certification,
        ]);
    }

    /**
     * Toggle active state (Admin).
     */
    public function toggleActive(int $id): JsonResponse
    {
        $certification = Certification::find($id);

        if (!$certification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sertifikasi tidak ditemukan.',
            ], 404);
        }

        $certification->is_active = !$certification->is_active;
        $certification->save();

        return response()->json([
            'status' => 'success',
            'message' => $certification->is_active ? 'Sertifikasi diaktifkan.' : 'Sertifikasi dinonaktifkan.',
            'data' => $certification,
        ]);
    }

    /**
     * Delete certification (Admin).
     */
    public function destroy(int $id): JsonResponse
    {
        $certification = Certification::find($id);

        if (!$certification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sertifikasi tidak ditemukan.',
            ], 404);
        }

        $certification->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Sertifikasi berhasil dihapus.',
        ]);
    }
}
