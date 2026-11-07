<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Education;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EducationController extends Controller
{
    /**
     * Get list of educations (Public & Admin).
     */
    public function index(): JsonResponse
    {
        $educations = Education::orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $educations->count(),
            'data' => $educations,
        ]);
    }

    /**
     * Get single education item (Admin & Public).
     */
    public function show(int $id): JsonResponse
    {
        $education = Education::find($id);

        if (!$education) {
            return response()->json([
                'status' => 'error',
                'message' => 'Riwayat pendidikan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $education,
        ]);
    }

    /**
     * Store new education (Admin Protected).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'field' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:5000',
        ]);

        $education = Education::create($validated);

        ActivityLog::record('education.create', "Pendidikan '{$education->title}' ({$education->period}) berhasil ditambahkan.");

        return response()->json([
            'status' => 'success',
            'message' => 'Riwayat pendidikan berhasil ditambahkan.',
            'data' => $education,
        ], 201);
    }

    /**
     * Update education (Admin Protected).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $education = Education::find($id);

        if (!$education) {
            return response()->json([
                'status' => 'error',
                'message' => 'Riwayat pendidikan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'field' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:5000',
        ]);

        $education->update($validated);

        ActivityLog::record('education.update', "Pendidikan '{$education->title}' (ID: {$education->id}) diperbarui.");

        return response()->json([
            'status' => 'success',
            'message' => 'Riwayat pendidikan berhasil diperbarui.',
            'data' => $education,
        ]);
    }

    /**
     * Delete education (Admin Protected).
     */
    public function destroy(int $id): JsonResponse
    {
        $education = Education::find($id);

        if (!$education) {
            return response()->json([
                'status' => 'error',
                'message' => 'Riwayat pendidikan tidak ditemukan.',
            ], 404);
        }

        $title = $education->title;
        $education->delete();

        ActivityLog::record('education.delete', "Pendidikan '{$title}' (ID: {$id}) berhasil dihapus.");

        return response()->json([
            'status' => 'success',
            'message' => 'Riwayat pendidikan berhasil dihapus.',
        ]);
    }
}
