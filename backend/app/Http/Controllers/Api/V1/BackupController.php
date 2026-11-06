<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Biodata;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Message;
use App\Models\Portfolio;
use App\Models\PortfolioCategory;
use App\Models\Service;
use App\Models\Skill;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    /**
     * Export all data tables as JSON bundle (Admin protected).
     */
    public function export(): StreamedResponse|JsonResponse
    {
        $payload = [
            'app' => 'infobay',
            'version' => '2.0.0',
            'exported_at' => now()->toIso8601String(),
            'data' => [
                'biodata' => Biodata::first(),
                'portfolio_categories' => PortfolioCategory::orderBy('order_index')->get(),
                'portfolios' => Portfolio::orderBy('order_index')->get(),
                'services' => Service::orderBy('id')->get(),
                'skills' => Skill::orderBy('id')->get(),
                'experiences' => Experience::orderBy('id')->get(),
                'educations' => Education::orderBy('id')->get(),
                'certifications' => Certification::orderBy('id')->get(),
                'testimonials' => Testimonial::orderBy('id')->get(),
                'messages' => Message::orderBy('id', 'desc')->get(),
            ],
        ];

        $jsonString = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $filename = 'infobay_backup_' . date('Ymd_His') . '.json';

        return response()->streamDownload(function () use ($jsonString) {
            echo $jsonString;
        }, $filename, [
            'Content-Type' => 'application/json',
            'Cache-Control' => 'no-cache, private',
        ]);
    }

    /**
     * Restore/Import data bundle from JSON file (Admin protected).
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'backup_file' => 'nullable|file|mimes:json,txt|max:20480',
            'backup_json' => 'nullable|string',
        ]);

        $content = '';
        if ($request->hasFile('backup_file')) {
            $content = file_get_contents($request->file('backup_file')->getRealPath());
        } elseif ($request->filled('backup_json')) {
            $content = $request->input('backup_json');
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Berkas backup JSON tidak ditemukan dalam permintaan.',
            ], 422);
        }

        $decoded = json_decode($content, true);
        if (!$decoded || !isset($decoded['data']) || !is_array($decoded['data'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Format file backup tidak valid. Harus berupa JSON dengan objek data.',
            ], 422);
        }

        $data = $decoded['data'];

        try {
            DB::transaction(function () use ($data) {
                // Restore Biodata
                if (isset($data['biodata']) && is_array($data['biodata'])) {
                    $bioFields = collect($data['biodata'])->except(['id', 'created_at', 'updated_at'])->toArray();
                    $bio = Biodata::first();
                    if ($bio) {
                        $bio->update($bioFields);
                    } else {
                        Biodata::create($bioFields);
                    }
                }

                // Restore Portfolio Categories
                if (isset($data['portfolio_categories']) && is_array($data['portfolio_categories'])) {
                    foreach ($data['portfolio_categories'] as $cat) {
                        if (!empty($cat['name'])) {
                            PortfolioCategory::updateOrCreate(
                                ['name' => $cat['name']],
                                collect($cat)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }

                // Restore Portfolios
                if (isset($data['portfolios']) && is_array($data['portfolios'])) {
                    foreach ($data['portfolios'] as $port) {
                        if (!empty($port['title'])) {
                            Portfolio::updateOrCreate(
                                ['title' => $port['title']],
                                collect($port)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }

                // Restore Services
                if (isset($data['services']) && is_array($data['services'])) {
                    foreach ($data['services'] as $srv) {
                        if (!empty($srv['title'])) {
                            Service::updateOrCreate(
                                ['title' => $srv['title']],
                                collect($srv)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }

                // Restore Skills
                if (isset($data['skills']) && is_array($data['skills'])) {
                    foreach ($data['skills'] as $skl) {
                        if (!empty($skl['name'])) {
                            Skill::updateOrCreate(
                                ['name' => $skl['name']],
                                collect($skl)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }

                // Restore Experiences
                if (isset($data['experiences']) && is_array($data['experiences'])) {
                    foreach ($data['experiences'] as $exp) {
                        if (!empty($exp['title'])) {
                            Experience::updateOrCreate(
                                ['title' => $exp['title']],
                                collect($exp)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }

                // Restore Educations
                if (isset($data['educations']) && is_array($data['educations'])) {
                    foreach ($data['educations'] as $edu) {
                        if (!empty($edu['title'])) {
                            Education::updateOrCreate(
                                ['title' => $edu['title']],
                                collect($edu)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }

                // Restore Certifications
                if (isset($data['certifications']) && is_array($data['certifications'])) {
                    foreach ($data['certifications'] as $cert) {
                        if (!empty($cert['name'])) {
                            Certification::updateOrCreate(
                                ['name' => $cert['name']],
                                collect($cert)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }

                // Restore Testimonials
                if (isset($data['testimonials']) && is_array($data['testimonials'])) {
                    foreach ($data['testimonials'] as $testi) {
                        if (!empty($testi['name'])) {
                            Testimonial::updateOrCreate(
                                ['name' => $testi['name']],
                                collect($testi)->except(['id', 'created_at', 'updated_at'])->toArray()
                            );
                        }
                    }
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Data berhasil dipulihkan dari file backup.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memulihkan data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
