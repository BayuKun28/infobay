<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'image',
        'link',
        'description',
        'tech_stack',
        'github_url',
        'project_role',
        'metrics',
        'is_featured',
        'order_index',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'metrics' => 'array',
        'is_featured' => 'boolean',
        'order_index' => 'integer',
    ];
}
