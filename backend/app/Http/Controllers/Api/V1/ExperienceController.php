<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    /**
     * Get list of experiences (Public & Admin).
     */
    public function index(): JsonResponse
    {
        $experiences = Experience::orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $experiences->count(),
            'data' => $experiences,
        ]);
    }

    /**
     * Get single experience item (Admin & Public).
     */
    public function show(int $id): JsonResponse
    {
        $experience = Experience::find($id);

        if (!$experience) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengalaman kerja tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $experience,
        ]);
    }

    /**
     * Store new experience (Admin Protected).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:5000',
        ]);

        $experience = Experience::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengalaman kerja berhasil ditambahkan.',
            'data' => $experience,
        ], 201);
    }

    /**
     * Update experience (Admin Protected).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $experience = Experience::find($id);

        if (!$experience) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengalaman kerja tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:5000',
        ]);

        $experience->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengalaman kerja berhasil diperbarui.',
            'data' => $experience,
        ]);
    }

    /**
     * Delete experience (Admin Protected).
     */
    public function destroy(int $id): JsonResponse
    {
        $experience = Experience::find($id);

        if (!$experience) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengalaman kerja tidak ditemukan.',
            ], 404);
        }

        $experience->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengalaman kerja berhasil dihapus.',
        ]);
    }
}
