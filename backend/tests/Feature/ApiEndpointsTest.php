<?php

namespace Tests\Feature;

use App\Models\Biodata;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Portfolio;
use App\Models\Service;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed with standard data
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_biodata_endpoint(): void
    {
        $response = $this->getJson('/api/v1/biodata');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'name',
                    'title',
                    'email',
                    'socials' => ['github', 'facebook', 'twitter', 'instagram'],
                ],
            ]);
    }

    public function test_public_portfolios_endpoint(): void
    {
        $response = $this->getJson('/api/v1/portfolios');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'count',
                'data',
            ]);
    }

    public function test_public_services_endpoint(): void
    {
        $response = $this->getJson('/api/v1/services');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_public_skills_endpoint(): void
    {
        $response = $this->getJson('/api/v1/skills');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_public_educations_endpoint(): void
    {
        $response = $this->getJson('/api/v1/educations');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_public_experiences_endpoint(): void
    {
        $response = $this->getJson('/api/v1/experiences');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_admin_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@baydev.my.id',
            'password' => 'AdminBaydev2026!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                    'token_type',
                ],
            ]);
    }

    public function test_admin_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@baydev.my.id',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('status', 'error');
    }

    public function test_admin_crud_portfolio_with_sanctum_token(): void
    {
        // 1. Login to get token
        $loginRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@baydev.my.id',
            'password' => 'AdminBaydev2026!',
        ]);
        $token = $loginRes->json('data.token');

        // 2. Create portfolio
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/portfolios', [
                'title' => 'Test Project Automated',
                'category' => 'Web Development',
                'description' => 'Automated test description',
                'link' => 'https://baydev.my.id',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('status', 'success');
        $newId = $createRes->json('data.id');

        // 3. Update portfolio
        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/portfolios/{$newId}", [
                'title' => 'Test Project Automated Updated',
            ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.title', 'Test Project Automated Updated');

        // 4. Delete portfolio
        $deleteRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/admin/portfolios/{$newId}");
        $deleteRes->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_unauthenticated_access_to_admin_route_is_blocked(): void
    {
        $response = $this->postJson('/api/v1/admin/portfolios', [
            'title' => 'Unauthorized Post',
            'category' => 'Web Development',
        ]);

        $response->assertStatus(401);
    }
}
