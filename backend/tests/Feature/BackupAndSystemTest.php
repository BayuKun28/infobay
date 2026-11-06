<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupAndSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::first();
    }

    public function test_system_health_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/admin/system/health');
        $response->assertStatus(401);

        $authResponse = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/system/health');
        $authResponse->assertStatus(200)
            ->assertJsonPath('status', 'operational')
            ->assertJsonStructure(['php_version', 'laravel_version', 'database', 'memory_usage_mb', 'disk']);
    }

    public function test_backup_export_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/admin/backup/export');
        $response->assertStatus(401);

        $authResponse = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/backup/export');
        $authResponse->assertStatus(200);
        $this->assertStringContainsString('infobay_backup_', $authResponse->headers->get('content-disposition') ?? '');
    }

    public function test_honeypot_drops_spam_without_storing(): void
    {
        $countBefore = Message::count();

        $response = $this->postJson('/api/v1/messages', [
            'name' => 'Spam Bot',
            'email' => 'spambot@example.com',
            'message' => 'Buy cheap pills online!',
            'website_hp' => 'http://spam-link.ru', // honeypot trap triggered
        ]);

        $response->assertStatus(201);
        $this->assertEquals($countBefore, Message::count(), 'Spam message was incorrectly stored in database.');
    }
}
