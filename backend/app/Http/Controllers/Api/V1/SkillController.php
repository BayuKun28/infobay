<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index(): JsonResponse
    {
        $skills = Skill::orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $skills,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'percentage' => 'required|integer|min:0|max:100',
        ]);

        $skill = Skill::create($validated);

        ActivityLog::record('skill.create', "Keahlian '{$skill->name}' ({$skill->percentage}%) berhasil ditambahkan.");

        return response()->json([
            'status' => 'success',
            'message' => 'Skill berhasil ditambahkan.',
            'data' => $skill,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $skill = Skill::find($id);

        if (!$skill) {
            return response()->json([
                'status' => 'error',
                'message' => 'Skill tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'percentage' => 'sometimes|required|integer|min:0|max:100',
        ]);

        $skill->update($validated);

        ActivityLog::record('skill.update', "Keahlian '{$skill->name}' (ID: {$skill->id}) diperbarui.");

        return response()->json([
            'status' => 'success',
            'message' => 'Skill berhasil diperbarui.',
            'data' => $skill,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $skill = Skill::find($id);

        if (!$skill) {
            return response()->json([
                'status' => 'error',
                'message' => 'Skill tidak ditemukan.',
            ], 404);
        }

        $name = $skill->name;
        $skill->delete();

        ActivityLog::record('skill.delete', "Keahlian '{$name}' (ID: {$id}) berhasil dihapus.");

        return response()->json([
            'status' => 'success',
            'message' => 'Skill berhasil dihapus.',
        ]);
    }
}
