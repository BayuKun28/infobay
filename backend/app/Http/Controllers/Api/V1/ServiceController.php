<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Service::orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $services,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $service = Service::create($validated);

        ActivityLog::record('service.create', "Layanan '{$service->title}' berhasil ditambahkan.");

        return response()->json([
            'status' => 'success',
            'message' => 'Layanan berhasil ditambahkan.',
            'data' => $service,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'status' => 'error',
                'message' => 'Layanan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $service->update($validated);

        ActivityLog::record('service.update', "Layanan '{$service->title}' (ID: {$service->id}) diperbarui.");

        return response()->json([
            'status' => 'success',
            'message' => 'Layanan berhasil diperbarui.',
            'data' => $service,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'status' => 'error',
                'message' => 'Layanan tidak ditemukan.',
            ], 404);
        }

        $title = $service->title;
        $service->delete();

        ActivityLog::record('service.delete', "Layanan '{$title}' (ID: {$id}) berhasil dihapus.");

        return response()->json([
            'status' => 'success',
            'message' => 'Layanan berhasil dihapus.',
        ]);
    }
}
