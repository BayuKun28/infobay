<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Models\Biodata;
use App\Models\Portfolio;
use App\Models\PortfolioCategory;
use App\Models\Service;
use App\Models\Skill;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Certification;
use App\Models\Testimonial;
use App\Models\Message;
use App\Models\ActivityLog;
use App\Models\SiteVisit;

class CreateBackupSnapshot extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'infobay:backup-snapshot {--retention-days=14 : Days of snapshots to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a complete JSON data snapshot of the Infobay database with 14-day automatic rotation';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting Infobay Database Snapshot...');
        $startTime = microtime(true);

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $now = now();
        $filename = 'snapshot_' . $now->format('Y-m-d_His') . '.json';
        $filepath = $backupDir . DIRECTORY_SEPARATOR . $filename;

        try {
            $data = [
                'metadata' => [
                    'generated_at' => $now->toIso8601String(),
                    'app_env' => config('app.env'),
                    'app_url' => config('app.url'),
                    'server_host' => gethostname(),
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                ],
                'tables' => [
                    'biodatas' => Biodata::all(),
                    'portfolio_categories' => PortfolioCategory::all(),
                    'portfolios' => Portfolio::all(),
                    'services' => Service::all(),
                    'skills' => Skill::all(),
                    'educations' => Education::all(),
                    'experiences' => Experience::all(),
                    'certifications' => Certification::all(),
                    'testimonials' => Testimonial::all(),
                    'messages' => Message::all(),
                    'activity_logs' => ActivityLog::latest()->take(2000)->get(),
                    'site_visits' => SiteVisit::latest()->take(5000)->get(),
                ],
            ];

            $counts = [];
            foreach ($data['tables'] as $table => $collection) {
                $counts[$table] = $collection->count();
            }
            $data['metadata']['counts'] = $counts;

            $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            File::put($filepath, $jsonContent);

            $fileSizeBytes = File::size($filepath);
            $fileSizeKb = round($fileSizeBytes / 1024, 2);

            $duration = round(microtime(true) - $startTime, 2);
            $this->info("Snapshot saved successfully: {$filename} ({$fileSizeKb} KB in {$duration}s)");

            // Output breakdown table
            $headers = ['Tabel Database', 'Jumlah Rekod'];
            $rows = [];
            foreach ($counts as $tbl => $cnt) {
                $rows[] = [$tbl, $cnt];
            }
            $this->table($headers, $rows);

            // Automatic retention rotation (default 14 days)
            $retentionDays = (int) $this->option('retention-days');
            $cutoff = $now->subDays($retentionDays)->getTimestamp();
            $deletedCount = 0;

            $files = File::files($backupDir);
            foreach ($files as $file) {
                if (str_starts_with($file->getFilename(), 'snapshot_') && $file->getExtension() === 'json') {
                    if ($file->getMTime() < $cutoff) {
                        File::delete($file->getRealPath());
                        $deletedCount++;
                        $this->line("Purged obsolete snapshot: {$file->getFilename()} (> {$retentionDays} days)");
                    }
                }
            }

            if ($deletedCount > 0) {
                $this->info("Rotasi snapshot selesai: {$deletedCount} berkas lama dibersihkan.");
            }

            ActivityLog::record('system.backup_snapshot', "Snapshot cadangan database berhasil dibuat: {$filename} ({$fileSizeKb} KB).");

            Log::info("Infobay snapshot created: {$filename} ({$fileSizeKb} KB)");
            return Command::SUCCESS;

        } catch (\Throwable $e) {
            $this->error('Failed to create snapshot: ' . $e->getMessage());
            Log::error('Infobay snapshot failed', ['error' => $e->getMessage()]);
            return Command::FAILURE;
        }
    }
}
