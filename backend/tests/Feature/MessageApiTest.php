<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageApiTest extends TestCase
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

    public function test_public_can_submit_contact_message(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'subject' => 'Kolaborasi Project Web',
            'message' => 'Halo Mas Bayu, saya tertarik untuk mengajak kolaborasi pembuatan sistem informasi desa.',
        ];

        $response = $this->postJson('/api/v1/messages', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', 'Budi Santoso')
            ->assertJsonPath('data.email', 'budi@example.com')
            ->assertJsonPath('data.is_read', false);

        $this->assertDatabaseHas('messages', [
            'email' => 'budi@example.com',
            'subject' => 'Kolaborasi Project Web',
            'is_read' => false,
        ]);
    }

    public function test_public_contact_submission_validation(): void
    {
        // Test empty fields
        $response = $this->postJson('/api/v1/messages', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message']);

        // Test invalid email
        $responseInvalidEmail = $this->postJson('/api/v1/messages', [
            'name' => 'Test User',
            'email' => 'not-an-email',
            'message' => 'Test message',
        ]);
        $responseInvalidEmail->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_unauthenticated_cannot_access_admin_messages(): void
    {
        $response = $this->getJson('/api/v1/admin/messages');
        $response->assertStatus(401);
    }

    public function test_admin_can_list_messages_with_pagination_and_unread_count(): void
    {
        // Buat dummy messages
        Message::create([
            'name' => 'User One',
            'email' => 'one@example.com',
            'message' => 'First message content',
            'is_read' => false,
        ]);
        Message::create([
            'name' => 'User Two',
            'email' => 'two@example.com',
            'message' => 'Second message content',
            'is_read' => true,
        ]);

        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/messages?per_page=10');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('total_count', 2)
            ->assertJsonStructure([
                'status',
                'unread_count',
                'total_count',
                'data',
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'unread_count',
                ],
            ]);
    }

    public function test_admin_can_filter_messages_by_status_and_search(): void
    {
        Message::create([
            'name' => 'Ahmad Dahlan',
            'email' => 'ahmad@example.com',
            'subject' => 'Pertanyaan Integrasi API',
            'message' => 'Bagaimana cara integrasi REST API infobay?',
            'is_read' => false,
        ]);
        Message::create([
            'name' => 'Siti Nurhaliza',
            'email' => 'siti@example.com',
            'subject' => 'Undangan Workshop',
            'message' => 'Kami mengundang Anda sebagai pemateri web modern.',
            'is_read' => true,
        ]);

        $token = $this->getAdminToken();

        // Filter unread
        $unreadRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/messages?status=unread');
        $unreadRes->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Ahmad Dahlan');

        // Filter search
        $searchRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/messages?search=Workshop');
        $searchRes->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Siti Nurhaliza');
    }

    public function test_admin_can_view_single_message(): void
    {
        $msg = Message::create([
            'name' => 'Joko Widodo',
            'email' => 'joko@example.com',
            'subject' => 'Diskusi Proyek',
            'message' => 'Kerja nyata untuk negeri.',
            'is_read' => false,
        ]);

        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/admin/messages/{$msg->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $msg->id)
            ->assertJsonPath('data.name', 'Joko Widodo');
    }

    public function test_admin_can_toggle_message_read_status(): void
    {
        $msg = Message::create([
            'name' => 'Prabowo Subianto',
            'email' => 'prabowo@example.com',
            'message' => 'Semangat berjuang untuk kemajuan frontend dan backend.',
            'is_read' => false,
        ]);

        $token = $this->getAdminToken();

        // 1. Mark as read
        $toggleRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/messages/{$msg->id}/read", [
                'is_read' => true,
            ]);

        $toggleRes->assertStatus(200)
            ->assertJsonPath('data.is_read', true)
            ->assertJsonPath('unread_count', 0);

        // 2. Toggle back to unread
        $toggleRes2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/messages/{$msg->id}/read", [
                'is_read' => false,
            ]);

        $toggleRes2->assertStatus(200)
            ->assertJsonPath('data.is_read', false)
            ->assertJsonPath('unread_count', 1);
    }

    public function test_admin_can_delete_message(): void
    {
        $msg = Message::create([
            'name' => 'Spam Bot',
            'email' => 'spam@test.com',
            'message' => 'Spam message to be deleted',
            'is_read' => false,
        ]);

        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/admin/messages/{$msg->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('messages', [
            'id' => $msg->id,
        ]);
    }
}
