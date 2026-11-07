<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'client_name',
        'project_year',
        'category',
        'image',
        'gallery',
        'link',
        'description',
        'tech_stack',
        'github_url',
        'project_role',
        'metrics',
        'highlights',
        'is_featured',
        'is_published',
        'order_index',
    ];

    protected $casts = [
        'gallery' => 'array',
        'tech_stack' => 'array',
        'metrics' => 'array',
        'highlights' => 'array',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'order_index' => 'integer',
    ];
}
