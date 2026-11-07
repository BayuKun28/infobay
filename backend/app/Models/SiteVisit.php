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
        'ip_address',
        'user_agent',
        'browser',
        'platform',
        'city',
        'country',
        'country_code',
        'event_type',
        'event_data',
        'ip_hash',
        'visit_date',
        'created_at',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'created_at' => 'datetime',
        'event_data' => 'array',
    ];
}
