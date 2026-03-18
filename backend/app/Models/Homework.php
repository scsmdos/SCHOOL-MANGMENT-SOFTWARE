<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Homework extends Model
{
    use HasFactory;

    // Table is 'homework' (singular) — Laravel would auto-pluralize to 'homeworks' without this
    protected $table = 'homework';

    protected $fillable = ['class_name', 'student_name', 'subject', 'title', 'description', 'due_date'];
}
