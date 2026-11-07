<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Submit contact message (Public).
     */
    public function store(Request $request): JsonResponse
    {
        // Honeypot anti-spam check: bots fill hidden trap fields automatically
        if (!empty($request->input('website_hp')) || !empty($request->input('honeypot'))) {
            return response()->json([
                'status' => 'success',
                'message' => 'Pesan berhasil dikirim. Terima kasih telah menghubungi kami!',
            ], 201);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'project_type' => 'nullable|string|max:100',
            'message' => 'required|string|max:5000',
        ]);

        // Sanitasi input teks
        $sanitizedName = trim(strip_tags($validated['name']));
        $sanitizedEmail = trim(filter_var($validated['email'], FILTER_SANITIZE_EMAIL));
        $sanitizedSubject = isset($validated['subject']) ? trim(strip_tags($validated['subject'])) : null;
        $sanitizedProjectType = isset($validated['project_type']) ? trim(strip_tags($validated['project_type'])) : null;
        $sanitizedMessage = trim(strip_tags($validated['message']));

        $message = Message::create([
            'name' => $sanitizedName,
            'email' => $sanitizedEmail,
            'subject' => $sanitizedSubject,
            'project_type' => $sanitizedProjectType,
            'message' => $sanitizedMessage,
            'is_read' => false,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent() ? substr($request->userAgent(), 0, 500) : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan berhasil dikirim. Terima kasih telah menghubungi kami!',
            'data' => $message,
        ], 201);
    }

    /**
     * Get list of contact messages with filters and pagination (Admin Protected).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Message::query();

        // Filter status baca (is_read / status)
        if ($request->has('is_read')) {
            $isRead = filter_var($request->query('is_read'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isRead !== null) {
                $query->where('is_read', $isRead);
            }
        } elseif ($request->has('status')) {
            $status = strtolower($request->query('status'));
            if ($status === 'unread') {
                $query->where('is_read', false);
            } elseif ($status === 'read') {
                $query->where('is_read', true);
            }
        }

        // Search (name, email, subject, message)
        if ($request->filled('search')) {
            $search = '%' . trim($request->query('search')) . '%';
            $likeOperator = $query->getConnection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOperator) {
                $q->where('name', $likeOperator, $search)
                  ->orWhere('email', $likeOperator, $search)
                  ->orWhere('subject', $likeOperator, $search)
                  ->orWhere('message', $likeOperator, $search);
            });
        }

        $unreadCount = Message::where('is_read', false)->count();
        $totalCount = Message::count();

        $perPage = max(1, min(100, (int) $request->query('per_page', 10)));
        $messages = $query->orderBy('created_at', 'desc')->orderBy('id', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'unread_count' => $unreadCount,
            'total_count' => $totalCount,
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    /**
     * Get single message detail (Admin Protected).
     */
    public function show(int $id): JsonResponse
    {
        $message = Message::find($id);

        if (!$message) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $message,
        ]);
    }

    /**
     * Mark message as read / toggle read status (Admin Protected).
     */
    public function toggleRead(Request $request, int $id): JsonResponse
    {
        $message = Message::find($id);

        if (!$message) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesan tidak ditemukan.',
            ], 404);
        }

        if ($request->has('is_read')) {
            $message->is_read = filter_var($request->input('is_read'), FILTER_VALIDATE_BOOLEAN);
        } else {
            $message->is_read = !$message->is_read;
        }

        $message->save();

        $unreadCount = Message::where('is_read', false)->count();

        return response()->json([
            'status' => 'success',
            'message' => $message->is_read ? 'Pesan ditandai sudah dibaca.' : 'Pesan ditandai belum dibaca.',
            'unread_count' => $unreadCount,
            'data' => $message,
        ]);
    }

    /**
     * Delete message (Admin Protected).
     */
    public function destroy(int $id): JsonResponse
    {
        $message = Message::find($id);

        if (!$message) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesan tidak ditemukan.',
            ], 404);
        }

        $message->delete();

        $unreadCount = Message::where('is_read', false)->count();

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan berhasil dihapus.',
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Bulk actions on messages (Admin Protected).
     * Actions: mark_read, mark_unread, delete
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|string|in:mark_read,mark_unread,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ]);

        $count = count($validated['ids']);

        if ($validated['action'] === 'mark_read') {
            Message::whereIn('id', $validated['ids'])->update(['is_read' => true]);
            ActivityLog::record('messages.bulk_read', "Menandai {$count} pesan sebagai sudah dibaca.");
            $msg = "{$count} pesan berhasil ditandai sudah dibaca.";
        } elseif ($validated['action'] === 'mark_unread') {
            Message::whereIn('id', $validated['ids'])->update(['is_read' => false]);
            ActivityLog::record('messages.bulk_unread', "Menandai {$count} pesan sebagai belum dibaca.");
            $msg = "{$count} pesan berhasil ditandai belum dibaca.";
        } elseif ($validated['action'] === 'delete') {
            Message::whereIn('id', $validated['ids'])->delete();
            ActivityLog::record('messages.bulk_delete', "Menghapus {$count} pesan masuk sekaligus.");
            $msg = "{$count} pesan berhasil dihapus.";
        }

        $unreadCount = Message::where('is_read', false)->count();

        return response()->json([
            'status' => 'success',
            'message' => $msg,
            'unread_count' => $unreadCount,
        ]);
    }
}
