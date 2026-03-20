<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParentEvent extends Model
{
    protected $fillable = ['event_id', 'title', 'date', 'end_date', 'type', 'description', 'target_class'];
}
