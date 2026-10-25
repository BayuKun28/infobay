<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'client_title',
        'company',
        'avatar',
        'content',
        'rating',
        'order_index',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'integer',
        'order_index' => 'integer',
        'is_active' => 'boolean',
    ];
}
