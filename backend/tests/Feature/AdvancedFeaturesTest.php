<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Message;
use App\Models\SiteVisit;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdvancedFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::first();
    }

    public function test_change_password_endpoint(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')->putJson('/api/v1/auth/change-password', [
            'current_password' => '193328',
            'new_password' => 'NewSecurePassword123!',
            'new_password_confirmation' => 'NewSecurePassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->admin->refresh();
        $this->assertTrue(Hash::check('NewSecurePassword123!', $this->admin->password));
    }

    public function test_messages_bulk_action(): void
    {
        $m1 = Message::create(['name' => 'User 1', 'email' => 'u1@test.com', 'message' => 'msg 1', 'is_read' => false]);
        $m2 = Message::create(['name' => 'User 2', 'email' => 'u2@test.com', 'message' => 'msg 2', 'is_read' => false]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/messages/bulk-action', [
            'action' => 'mark_read',
            'ids' => [$m1->id, $m2->id],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertTrue($m1->fresh()->is_read);
        $this->assertTrue($m2->fresh()->is_read);
    }

    public function test_activity_logs_and_analytics_endpoints(): void
    {
        // 1. Record visit with IP and User Agent
        $visitRes = $this->withServerVariables([
            'REMOTE_ADDR' => '203.0.113.195',
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        ])->postJson('/api/v1/analytics/visit', [
            'page' => '/#portfolio',
            'referer' => 'https://github.com',
        ]);
        $visitRes->assertStatus(200);

        // 2. Fetch analytics summary
        $analyticsRes = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/analytics/summary');
        $analyticsRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['data' => ['today_visits', 'today_unique_ips', 'total_visits', 'total_unique_ips', 'trend', 'devices', 'browsers', 'platforms']]);

        // 3. Fetch visitor logs
        $visitorsRes = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/analytics/visitors?search=203.0.113.195');
        $visitorsRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total', 1);

        $visitId = $visitorsRes->json('data.data.0.id');
        $this->assertNotNull($visitId);

        // 4. Delete visitor log
        $delRes = $this->actingAs($this->admin, 'sanctum')->deleteJson('/api/v1/admin/analytics/visitors/' . $visitId);
        $delRes->assertStatus(200);

        // 5. Fetch activity logs
        ActivityLog::record('test.action', 'This is a test audit action');
        $logsRes = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/activity-logs');
        $logsRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['data', 'meta']);
    }
}
