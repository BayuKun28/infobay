<?php

namespace Tests\Feature;

use App\Models\Biodata;
use App\Models\Certification;
use App\Models\Testimonial;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HeroTestimonialCertificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function getAdminToken(): string
    {
        $loginRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@baydev.my.id',
            'password' => 'AdminBaydev2026!',
        ]);

        return $loginRes->json('data.token');
    }

    public function test_public_can_get_biodata_with_hero_cv_and_marquee(): void
    {
        $response = $this->getJson('/api/v1/biodata');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'hero_headline',
                    'hero_subheadline',
                    'role_badge',
                    'experience_years_text',
                    'projects_completed_text',
                    'marquee_items',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.marquee_items'));
    }

    public function test_admin_can_update_hero_fields_and_marquee(): void
    {
        $token = $this->getAdminToken();

        $updateData = [
            'name' => 'Bayu Prastyo',
            'title' => 'Chief Technology Architect',
            'email' => 'bayukundev@gmail.com',
            'hero_headline' => 'Enterprise System Architect & AI Engineer',
            'hero_subheadline' => 'Mengembangkan platform berdaya komputasi tinggi dan otomasi multi-agen.',
            'role_badge' => 'Open for High-Impact Projects',
            'experience_years_text' => '8+ Tahun Pengalaman',
            'projects_completed_text' => '50+ Proyek Selesai',
            'marquee_items' => ['LARAVEL 13', 'POSTGRESQL 17', 'REACT 18', 'KAFKA', 'DOCKER'],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/admin/biodata', $updateData);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.hero_headline', 'Enterprise System Architect & AI Engineer')
            ->assertJsonPath('data.role_badge', 'Open for High-Impact Projects')
            ->assertJsonCount(5, 'data.marquee_items');
    }

    public function test_admin_can_upload_cv_pdf(): void
    {
        Storage::fake('public');
        $token = $this->getAdminToken();

        // 1. Upload valid PDF
        $file = UploadedFile::fake()->create('bayu_prastyo_cv.pdf', 300, 'application/pdf');

        $uploadRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/biodata/cv', [
                'cv_file' => $file,
            ]);

        $uploadRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'message', 'cv_file_url']);

        $cvUrl = $uploadRes->json('cv_file_url');
        $this->assertStringContainsString('resumes', $cvUrl);

        // Verify stored in biodata
        $bio = Biodata::first();
        $this->assertEquals($cvUrl, $bio->cv_file_url);

        // 2. Reject non-PDF file
        $invalidFile = UploadedFile::fake()->create('malicious.exe', 100, 'application/x-msdownload');
        $failRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/biodata/cv', [
                'cv_file' => $invalidFile,
            ]);

        $failRes->assertStatus(422)
            ->assertJsonValidationErrors(['cv_file']);
    }

    public function test_public_can_get_active_testimonials_and_certifications(): void
    {
        // Public testimonials
        $testRes = $this->getJson('/api/v1/testimonials');
        $testRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(3, 'data');

        // Public certifications
        $certRes = $this->getJson('/api/v1/certifications');
        $certRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(3, 'data');
    }

    public function test_unauthenticated_cannot_access_admin_testimonials_or_certifications(): void
    {
        $this->getJson('/api/v1/admin/testimonials')->assertStatus(401);
        $this->postJson('/api/v1/admin/testimonials', ['client_name' => 'Test'])->assertStatus(401);
        $this->deleteJson('/api/v1/admin/testimonials/1')->assertStatus(401);

        $this->getJson('/api/v1/admin/certifications')->assertStatus(401);
        $this->postJson('/api/v1/admin/certifications', ['title' => 'Test'])->assertStatus(401);
        $this->deleteJson('/api/v1/admin/certifications/1')->assertStatus(401);
    }

    public function test_admin_can_crud_and_toggle_testimonial(): void
    {
        $token = $this->getAdminToken();

        // 1. Create Testimonial
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/testimonials', [
                'client_name' => 'Budi Santoso',
                'client_title' => 'VP of Engineering',
                'company' => 'Fintech Indo Global',
                'content' => 'Layanan dan pengerjaan backend sangat memuaskan, minim bug dan performa tinggi.',
                'rating' => 5,
                'order_index' => 4,
                'is_active' => true,
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.client_name', 'Budi Santoso');

        $testId = $createRes->json('data.id');

        // 2. Read single
        $showRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/admin/testimonials/{$testId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.client_name', 'Budi Santoso');

        // 3. Update Testimonial
        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/testimonials/{$testId}", [
                'client_name' => 'Budi Santoso, M.Kom',
                'client_title' => 'VP of Engineering',
                'company' => 'Fintech Indo Global Group',
                'content' => 'Review telah diperbarui dengan testimoni komprehensif.',
                'rating' => 5,
                'order_index' => 4,
                'is_active' => true,
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.client_name', 'Budi Santoso, M.Kom');

        // 4. Toggle active state
        $toggleRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/testimonials/{$testId}/toggle-active");
        $toggleRes->assertStatus(200)
            ->assertJsonPath('data.is_active', false);

        // 5. Delete Testimonial
        $delRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/admin/testimonials/{$testId}");
        $delRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('testimonials', ['id' => $testId]);
    }

    public function test_admin_can_crud_and_toggle_certification(): void
    {
        $token = $this->getAdminToken();

        // 1. Create Certification
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/certifications', [
                'title' => 'AWS Certified Solutions Architect',
                'issuer' => 'Amazon Web Services',
                'issue_date' => '2024',
                'expiration_date' => '2027',
                'credential_id' => 'AWS-SAA-2024-998',
                'credential_url' => 'https://aws.amazon.com/verification',
                'order_index' => 4,
                'is_active' => true,
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'AWS Certified Solutions Architect');

        $certId = $createRes->json('data.id');

        // 2. Read single
        $showRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/admin/certifications/{$certId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.title', 'AWS Certified Solutions Architect');

        // 3. Update Certification
        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/certifications/{$certId}", [
                'title' => 'AWS Certified Solutions Architect - Professional',
                'issuer' => 'Amazon Web Services',
                'issue_date' => '2024',
                'expiration_date' => '2027',
                'credential_id' => 'AWS-SAP-2024-999',
                'order_index' => 4,
                'is_active' => true,
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.title', 'AWS Certified Solutions Architect - Professional');

        // 4. Toggle active state
        $toggleRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/certifications/{$certId}/toggle-active");
        $toggleRes->assertStatus(200)
            ->assertJsonPath('data.is_active', false);

        // 5. Delete Certification
        $delRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/admin/certifications/{$certId}");
        $delRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('certifications', ['id' => $certId]);
    }
}
