<?php

namespace Tests\Feature;

use App\Models\Biodata;
use App\Models\Education;
use App\Models\Experience;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EducationExperienceApiTest extends TestCase
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
            'password' => '193328',
        ]);

        return $loginRes->json('data.token');
    }

    public function test_public_can_get_educations_and_experiences(): void
    {
        $eduRes = $this->getJson('/api/v1/educations');
        $eduRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'count', 'data']);

        $expRes = $this->getJson('/api/v1/experiences');
        $expRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'count', 'data']);
    }

    public function test_unauthenticated_cannot_crud_educations_or_experiences(): void
    {
        $this->postJson('/api/v1/admin/educations', ['title' => 'Test Uni'])->assertStatus(401);
        $this->putJson('/api/v1/admin/educations/1', ['title' => 'Test Uni'])->assertStatus(401);
        $this->deleteJson('/api/v1/admin/educations/1')->assertStatus(401);

        $this->postJson('/api/v1/admin/experiences', ['title' => 'Test Inc'])->assertStatus(401);
        $this->putJson('/api/v1/admin/experiences/1', ['title' => 'Test Inc'])->assertStatus(401);
        $this->deleteJson('/api/v1/admin/experiences/1')->assertStatus(401);
    }

    public function test_admin_can_crud_education_with_field_and_badge(): void
    {
        $token = $this->getAdminToken();

        // 1. Create Education
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/educations', [
                'title' => 'Universitas Indonesia',
                'field' => 'Teknik Informatika & Ilmu Komputer',
                'period' => '2019 — 2023',
                'badge' => 'S1 Sarjana Komputer',
                'description' => 'Fokus pada rekayasa perangkat lunak dan arsitektur sistem terdistribusi.',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Universitas Indonesia')
            ->assertJsonPath('data.field', 'Teknik Informatika & Ilmu Komputer')
            ->assertJsonPath('data.badge', 'S1 Sarjana Komputer');

        $eduId = $createRes->json('data.id');

        // 2. Read single
        $showRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/admin/educations/{$eduId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.title', 'Universitas Indonesia')
            ->assertJsonPath('data.field', 'Teknik Informatika & Ilmu Komputer');

        // 3. Update Education
        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/educations/{$eduId}", [
                'title' => 'Universitas Gadjah Mada',
                'field' => 'Magister Ilmu Komputer',
                'period' => '2023 — 2025',
                'badge' => 'S2 Cumlaude',
                'description' => 'Riset kecerdasan buatan dan optimasi model LLM.',
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.title', 'Universitas Gadjah Mada')
            ->assertJsonPath('data.badge', 'S2 Cumlaude');

        // 4. Delete Education
        $deleteRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/admin/educations/{$eduId}");

        $deleteRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('educations', ['id' => $eduId]);
    }

    public function test_admin_can_crud_experience_with_role_and_badge(): void
    {
        $token = $this->getAdminToken();

        // 1. Create Experience
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/experiences', [
                'title' => 'Tech Corp Indonesia',
                'role' => 'Senior Backend Engineer',
                'period' => '2022 — Sekarang',
                'badge' => 'Full-time Remote',
                'description' => 'Membangun API gateway performa tinggi dan mengelola PostgreSQL cluster.',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Tech Corp Indonesia')
            ->assertJsonPath('data.role', 'Senior Backend Engineer')
            ->assertJsonPath('data.badge', 'Full-time Remote');

        $expId = $createRes->json('data.id');

        // 2. Read single
        $showRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/admin/experiences/{$expId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.title', 'Tech Corp Indonesia')
            ->assertJsonPath('data.role', 'Senior Backend Engineer');

        // 3. Update Experience
        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/experiences/{$expId}", [
                'title' => 'Tech Corp Global',
                'role' => 'Lead Solutions Architect',
                'period' => '2022 — Sekarang',
                'badge' => 'Principal',
                'description' => 'Merancang arsitektur multi-agen AI dan infrastruktur cloud homelab.',
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.title', 'Tech Corp Global')
            ->assertJsonPath('data.role', 'Lead Solutions Architect')
            ->assertJsonPath('data.badge', 'Principal');

        // 4. Delete Experience
        $deleteRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/admin/experiences/{$expId}");

        $deleteRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('experiences', ['id' => $expId]);
    }

    public function test_admin_can_update_biodata_with_tech_stack(): void
    {
        $token = $this->getAdminToken();

        $techStackData = [
            ['name' => 'Laravel 13', 'category' => 'Backend', 'level' => 'Advanced'],
            ['name' => 'ReactJS & Vite', 'category' => 'Frontend', 'level' => 'Advanced'],
            ['name' => 'PostgreSQL 17', 'category' => 'Database', 'level' => 'Proficient'],
            ['name' => 'Docker & Linux', 'category' => 'DevOps', 'level' => 'Advanced'],
        ];

        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/admin/biodata', [
                'name' => 'Bayu Prastyo',
                'title' => 'Lead Fullstack Developer',
                'email' => 'bayukundev@gmail.com',
                'tech_stack' => $techStackData,
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.tech_stack.0.name', 'Laravel 13');

        // Public index also delivers tech_stack
        $publicRes = $this->getJson('/api/v1/biodata');
        $publicRes->assertStatus(200)
            ->assertJsonPath('data.tech_stack.0.name', 'Laravel 13')
            ->assertJsonCount(4, 'data.tech_stack');
    }

    public function test_validation_errors_on_empty_title(): void
    {
        $token = $this->getAdminToken();

        $eduRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/educations', []);
        $eduRes->assertStatus(422)->assertJsonValidationErrors(['title']);

        $expRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/experiences', []);
        $expRes->assertStatus(422)->assertJsonValidationErrors(['title']);
    }
}
