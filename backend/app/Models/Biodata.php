<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Biodata extends Model
{
    use HasFactory;

    protected $table = 'biodatas';

    protected $fillable = [
        'name',
        'title',
        'email',
        'phone',
        'location',
        'avatar',
        'about',
        'github',
        'facebook',
        'twitter',
        'instagram',
        'social_links',
        'tech_stack',
        'hero_headline',
        'hero_subheadline',
        'role_badge',
        'experience_years_text',
        'projects_completed_text',
        'cv_file_url',
        'marquee_items',
    ];

    protected $casts = [
        'social_links' => 'array',
        'tech_stack' => 'array',
        'marquee_items' => 'array',
    ];
}
