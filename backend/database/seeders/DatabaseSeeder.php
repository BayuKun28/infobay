<?php

namespace Database\Seeders;

use App\Models\Biodata;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Portfolio;
use App\Models\Service;
use App\Models\Skill;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Default Admin Users
        User::firstOrCreate(
            ['email' => 'admin@baydev.my.id'],
            [
                'name' => 'Bayu Prastyo (Admin)',
                'password' => Hash::make('AdminBaydev2026!'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'bayukundev@gmail.com'],
            [
                'name' => 'Bayu Prastyo',
                'password' => Hash::make('AdminBaydev2026!'),
            ]
        );

        // 2. Read profile_seed_data.json
        $jsonPath = base_path('../profile_seed_data.json');
        if (!File::exists($jsonPath)) {
            $jsonPath = '/home/bay/infobay/profile_seed_data.json';
        }

        if (!File::exists($jsonPath)) {
            $this->command->error("File profile_seed_data.json not found at: {$jsonPath}");
            return;
        }

        $rawData = File::get($jsonPath);
        $data = json_decode($rawData, true);

        if (!$data) {
            $this->command->error("Failed to decode profile_seed_data.json");
            return;
        }

        // 3. Seed Biodata
        if (isset($data['biodata'])) {
            $bio = $data['biodata'];
            Biodata::truncate();
            Biodata::create([
                'name' => $bio['name'] ?? 'Bayu Prastyo',
                'title' => $bio['title'] ?? 'Developer',
                'email' => $bio['email'] ?? 'bayukundev@gmail.com',
                'phone' => $bio['phone'] ?? null,
                'location' => $bio['location'] ?? null,
                'avatar' => $bio['avatar'] ?? null,
                'about' => $bio['about'] ?? null,
                'github' => $bio['socials']['github'] ?? null,
                'facebook' => $bio['socials']['facebook'] ?? null,
                'twitter' => $bio['socials']['twitter'] ?? null,
                'instagram' => $bio['socials']['instagram'] ?? null,
                'hero_headline' => 'Full-Stack Web Developer & Solutions Architect',
                'hero_subheadline' => 'Merancang dan membangun aplikasi web tangguh, scalable, berkinerja tinggi dengan Laravel, PostgreSQL, React, dan arsitektur modern.',
                'role_badge' => 'Available for Projects',
                'experience_years_text' => '7+ Tahun',
                'projects_completed_text' => '30+ Proyek',
                'marquee_items' => ['LARAVEL 13', 'POSTGRESQL 17', 'REACTJS VITE', 'TAILWIND CSS', 'MATERIAL UI', 'DOCKER HOMELAB', 'REST API ARCHITECTURE', 'LINUX DEBIAN', 'SYSTEM AUTOMATION'],
            ]);
        }

        // 4. Seed Services
        if (!empty($data['services'])) {
            Service::truncate();
            foreach ($data['services'] as $item) {
                Service::create([
                    'title' => $item['title'],
                    'description' => $item['description'] ?? null,
                    'icon' => $item['icon'] ?? null,
                ]);
            }
        }

        // 5. Seed Skills
        if (!empty($data['skills'])) {
            Skill::truncate();
            foreach ($data['skills'] as $item) {
                Skill::create([
                    'name' => $item['name'],
                    'percentage' => (int) ($item['percentage'] ?? 0),
                ]);
            }
        }

        // 6. Seed Education
        if (!empty($data['education'])) {
            Education::truncate();
            foreach ($data['education'] as $item) {
                Education::create([
                    'title' => $item['title'],
                    'period' => $item['period'] ?? null,
                    'description' => $item['description'] ?? null,
                ]);
            }
        }

        // 7. Seed Experience
        if (!empty($data['experience'])) {
            Experience::truncate();
            foreach ($data['experience'] as $item) {
                Experience::create([
                    'title' => $item['title'],
                    'period' => $item['period'] ?? null,
                    'description' => $item['description'] ?? null,
                ]);
            }
        }

        // 8. Seed Portfolios
        if (!empty($data['portfolios'])) {
            Portfolio::truncate();
            foreach ($data['portfolios'] as $item) {
                Portfolio::create([
                    'title' => $item['title'],
                    'category' => $item['category'] ?? 'Web Development',
                    'image' => $item['image'] ?? null,
                    'link' => $item['link'] ?? null,
                    'description' => $item['description'] ?? null,
                ]);
            }
        }

        // 9. Seed Testimonials
        Testimonial::truncate();
        Testimonial::create([
            'client_name' => 'Hendra Wijaya',
            'client_title' => 'Project Director',
            'company' => 'PT Global Intermedia Nusantara',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            'content' => 'Bayu memiliki pemahaman teknis backend dan frontend yang sangat solid. Proyek portal pemerintahan dan sistem GIS diselesaikan dengan efisien, rapi, dan berkinerja tinggi.',
            'rating' => 5,
            'order_index' => 1,
            'is_active' => true,
        ]);
        Testimonial::create([
            'client_name' => 'Siti Rahmawati',
            'client_title' => 'Product Owner',
            'company' => 'Jamkrida Jawa Timur',
            'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
            'content' => 'Kerja sama luar biasa dalam pembangunan sistem penjaminan online. Sistem stabil, aman, dan integrasi database berjalan tanpa kendala.',
            'rating' => 5,
            'order_index' => 2,
            'is_active' => true,
        ]);
        Testimonial::create([
            'client_name' => 'Ketut Ardana',
            'client_title' => 'IT Consultant',
            'company' => 'Jamkrida Bali',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            'content' => 'Responsif, komunikatif, dan sangat cepat mengatasi tantangan integrasi API kompleks. Sangat direkomendasikan untuk pengembangan sistem skala enterprise.',
            'rating' => 5,
            'order_index' => 3,
            'is_active' => true,
        ]);

        // 10. Seed Certifications
        Certification::truncate();
        Certification::create([
            'title' => 'Laravel Certified Developer',
            'issuer' => 'Laravel LLC',
            'issue_date' => '2023',
            'expiration_date' => 'Lifetime',
            'credential_id' => 'LARA-CERT-8849',
            'credential_url' => 'https://laravel.com',
            'badge_image' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
            'order_index' => 1,
            'is_active' => true,
        ]);
        Certification::create([
            'title' => 'PostgreSQL Database Specialist',
            'issuer' => 'PostgreSQL Professional Community',
            'issue_date' => '2022',
            'expiration_date' => 'Lifetime',
            'credential_id' => 'PG-DBA-2022-771',
            'credential_url' => 'https://www.postgresql.org',
            'badge_image' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
            'order_index' => 2,
            'is_active' => true,
        ]);
        Certification::create([
            'title' => 'React Frontend Developer Specialist',
            'issuer' => 'Meta / Coursera',
            'issue_date' => '2023',
            'expiration_date' => 'Lifetime',
            'credential_id' => 'META-FRONT-9921',
            'credential_url' => 'https://www.coursera.org',
            'badge_image' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
            'order_index' => 3,
            'is_active' => true,
        ]);

        $this->command->info("Database seeded successfully with authentic baydev profile data!");
    }
}
