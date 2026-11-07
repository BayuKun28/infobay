<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteVisit extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'page',
        'referer',
        'device_type',
        'ip_hash',
        'visit_date',
        'created_at',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'created_at' => 'datetime',
    ];
}
