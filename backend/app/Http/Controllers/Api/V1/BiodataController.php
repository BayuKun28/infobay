<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Biodata;
use App\Models\ActivityLog;
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
        $response['specialization'] = $biodata->specialization ?? 'Web Application & API Systems';
        $response['work_status'] = $biodata->work_status ?? 'Open for Remote & Hybrid Roles';
        $response['aliases'] = $biodata->aliases ?? ['baydev', 'bayukun', 'masbay (Mas Bay)', 'BayuKun28'];
        $response['engineering_principles'] = $biodata->engineering_principles ?? [
            ['title' => 'Architecture First', 'desc' => 'Desain database relasional kokoh, query terindeks, dan skema bersih.'],
            ['title' => 'Authentic UX', 'desc' => 'Menghadirkan antarmuka otentik, responsif, dan bebas dari template generik.'],
            ['title' => 'Rock-Solid Security', 'desc' => 'Proteksi autentikasi, CORS presisi, sanitasi input, dan audit berkelanjutan.'],
        ];
        $response['terminal_widget'] = $biodata->terminal_widget ?? [
            'user_host' => 'baydev@workstation:~$',
            'lines' => [
                'git checkout -b feature/high-performance',
                'composer check & npm test',
                'All 15+ production systems operational',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $response,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    /**
     * Update biodata profile (Admin protected).
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'title' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
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
            'specialization' => 'nullable|string|max:255',
            'work_status' => 'nullable|string|max:255',
            'aliases' => 'nullable',
            'engineering_principles' => 'nullable',
            'terminal_widget' => 'nullable',
        ]);

        $biodata = Biodata::first();
        if (!$biodata) {
            $biodata = new Biodata([
                'name' => $validated['name'] ?? 'Bayu Samudra',
                'title' => $validated['title'] ?? 'Full Stack Developer',
                'email' => $validated['email'] ?? 'bayu@example.com',
            ]);
        }

        // Handle avatar upload if provided
        if ($request->hasFile('avatar_file')) {
            $path = $request->file('avatar_file')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        // Handle dynamic social_links (can be array or JSON string from FormData)
        if (array_key_exists('social_links', $validated)) {
            if (is_string($validated['social_links'])) {
                $decoded = json_decode($validated['social_links'], true);
                $validated['social_links'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['social_links'])) {
                $validated['social_links'] = [];
            }
        }

        // Handle dynamic tech_stack (can be array or JSON string from FormData)
        if (array_key_exists('tech_stack', $validated)) {
            if (is_string($validated['tech_stack'])) {
                $decoded = json_decode($validated['tech_stack'], true);
                $validated['tech_stack'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['tech_stack'])) {
                $validated['tech_stack'] = [];
            }
        }

        // Handle CV upload if provided in update
        if ($request->hasFile('cv_file')) {
            $path = $request->file('cv_file')->store('resumes', 'public');
            $validated['cv_file_url'] = '/storage/' . $path;
        }

        // Handle dynamic marquee_items (can be array or JSON string from FormData)
        if (array_key_exists('marquee_items', $validated)) {
            if (is_string($validated['marquee_items'])) {
                $decoded = json_decode($validated['marquee_items'], true);
                $validated['marquee_items'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['marquee_items'])) {
                $validated['marquee_items'] = [];
            }
        }

        // Handle dynamic aliases (can be array or JSON string from FormData)
        if (array_key_exists('aliases', $validated)) {
            if (is_string($validated['aliases'])) {
                $decoded = json_decode($validated['aliases'], true);
                $validated['aliases'] = is_array($decoded)
                    ? $decoded
                    : array_values(array_filter(array_map('trim', explode(',', $validated['aliases']))));
            } elseif (!is_array($validated['aliases'])) {
                $validated['aliases'] = [];
            }
        }

        // Handle dynamic engineering_principles (can be array or JSON string from FormData)
        if (array_key_exists('engineering_principles', $validated)) {
            if (is_string($validated['engineering_principles'])) {
                $decoded = json_decode($validated['engineering_principles'], true);
                $validated['engineering_principles'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['engineering_principles'])) {
                $validated['engineering_principles'] = [];
            }
        }

        // Handle dynamic terminal_widget (can be array or JSON string from FormData)
        if (array_key_exists('terminal_widget', $validated)) {
            if (is_string($validated['terminal_widget'])) {
                $decoded = json_decode($validated['terminal_widget'], true);
                $validated['terminal_widget'] = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($validated['terminal_widget'])) {
                $validated['terminal_widget'] = [];
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
        $response['specialization'] = $biodata->specialization ?? 'Web Application & API Systems';
        $response['work_status'] = $biodata->work_status ?? 'Open for Remote & Hybrid Roles';
        $response['aliases'] = $biodata->aliases ?? ['baydev', 'bayukun', 'masbay (Mas Bay)', 'BayuKun28'];
        $response['engineering_principles'] = $biodata->engineering_principles ?? [
            ['title' => 'Architecture First', 'desc' => 'Desain database relasional kokoh, query terindeks, dan skema bersih.'],
            ['title' => 'Authentic UX', 'desc' => 'Menghadirkan antarmuka otentik, responsif, dan bebas dari template generik.'],
            ['title' => 'Rock-Solid Security', 'desc' => 'Proteksi autentikasi, CORS presisi, sanitasi input, dan audit berkelanjutan.'],
        ];
        $response['terminal_widget'] = $biodata->terminal_widget ?? [
            'user_host' => 'baydev@workstation:~$',
            'lines' => [
                'git checkout -b feature/high-performance',
                'composer check & npm test',
                'All 15+ production systems operational',
            ],
        ];

        ActivityLog::record('biodata.update', "Profil pengembang '{$biodata->name}' ({$biodata->title}) berhasil diperbarui.");

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

        ActivityLog::record('biodata.upload_cv', "Berkas resume CV baru berhasil diunggah: {$url}.");

        return response()->json([
            'status' => 'success',
            'message' => 'File CV berhasil diunggah.',
            'cv_file_url' => $url,
        ]);
    }
}
