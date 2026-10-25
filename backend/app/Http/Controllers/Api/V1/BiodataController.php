<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Biodata;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BiodataController extends Controller
{
    /**
     * Get the public biodata profile.
     */
    public function index(): JsonResponse
    {
        $biodata = Biodata::first();

        if (!$biodata) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data biodata belum tersedia.',
            ], 404);
        }

        $response = $biodata->toArray();
        $response['socials'] = [
            'github' => $biodata->github,
            'facebook' => $biodata->facebook,
            'twitter' => $biodata->twitter,
            'instagram' => $biodata->instagram,
        ];
        $response['social_links'] = $biodata->social_links ?? [];
        $response['tech_stack'] = $biodata->tech_stack ?? [];
        $response['marquee_items'] = $biodata->marquee_items ?? [];

        return response()->json([
            'status' => 'success',
            'data' => $response,
        ]);
    }

    /**
     * Update biodata profile (Admin protected).
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'avatar' => 'nullable|string',
            'avatar_file' => 'nullable|image|max:10240',
            'about' => 'nullable|string',
            'github' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'twitter' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'social_links' => 'nullable',
            'tech_stack' => 'nullable',
            'hero_headline' => 'nullable|string|max:255',
            'hero_subheadline' => 'nullable|string|max:5000',
            'role_badge' => 'nullable|string|max:255',
            'experience_years_text' => 'nullable|string|max:100',
            'projects_completed_text' => 'nullable|string|max:100',
            'cv_file_url' => 'nullable|string|max:500',
            'cv_file' => 'nullable|file|mimes:pdf|max:10240',
            'marquee_items' => 'nullable',
        ]);

        $biodata = Biodata::first();
        if (!$biodata) {
            $biodata = new Biodata();
        }

        // Handle avatar upload if provided
        if ($request->hasFile('avatar_file')) {
            $path = $request->file('avatar_file')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        // Handle dynamic social_links (can be array or JSON string from FormData)
        if (isset($validated['social_links'])) {
            if (is_string($validated['social_links'])) {
                $decoded = json_decode($validated['social_links'], true);
                $validated['social_links'] = is_array($decoded) ? $decoded : [];
            }
        }

        // Handle dynamic tech_stack (can be array or JSON string from FormData)
        if (isset($validated['tech_stack'])) {
            if (is_string($validated['tech_stack'])) {
                $decoded = json_decode($validated['tech_stack'], true);
                $validated['tech_stack'] = is_array($decoded) ? $decoded : [];
            }
        }

        // Handle CV upload if provided in update
        if ($request->hasFile('cv_file')) {
            $path = $request->file('cv_file')->store('resumes', 'public');
            $validated['cv_file_url'] = '/storage/' . $path;
        }

        // Handle dynamic marquee_items (can be array or JSON string from FormData)
        if (isset($validated['marquee_items'])) {
            if (is_string($validated['marquee_items'])) {
                $decoded = json_decode($validated['marquee_items'], true);
                $validated['marquee_items'] = is_array($decoded) ? $decoded : [];
            }
        }

        $biodata->fill($validated);
        $biodata->save();

        $response = $biodata->toArray();
        $response['socials'] = [
            'github' => $biodata->github,
            'facebook' => $biodata->facebook,
            'twitter' => $biodata->twitter,
            'instagram' => $biodata->instagram,
        ];
        $response['social_links'] = $biodata->social_links ?? [];
        $response['tech_stack'] = $biodata->tech_stack ?? [];
        $response['marquee_items'] = $biodata->marquee_items ?? [];

        return response()->json([
            'status' => 'success',
            'message' => 'Biodata profil berhasil diperbarui.',
            'data' => $response,
        ]);
    }

    /**
     * Dedicated CV upload endpoint (Admin protected).
     */
    public function uploadCv(Request $request): JsonResponse
    {
        $request->validate([
            'cv_file' => 'required|file|mimes:pdf|max:10240',
        ]);

        $path = $request->file('cv_file')->store('resumes', 'public');
        $url = '/storage/' . $path;

        $biodata = Biodata::first();
        if ($biodata) {
            $biodata->cv_file_url = $url;
            $biodata->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'File CV berhasil diunggah.',
            'cv_file_url' => $url,
        ]);
    }
}
