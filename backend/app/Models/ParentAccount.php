<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class ParentAccount extends Authenticatable
{
    use HasFactory, HasApiTokens;
    protected $guarded = [];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute()
    {
        $admission = \App\Models\Admission::where('contact_no', $this->login_id)->first();
        if ($admission && !empty($admission->parent_photo)) {
            return $admission->parent_photo;
        }
        return null;
    }
}
