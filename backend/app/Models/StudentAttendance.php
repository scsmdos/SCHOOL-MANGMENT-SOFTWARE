<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAttendance extends Model
{
    use HasFactory;

    protected $table = 'student_attendance';

    protected $fillable = [
        'student_id',
        'student_name',
        'class_name',
        'section',
        'attendance_date',
        'status',
        'remarks'
    ];

    public function student()
    {
        return $this->belongsTo(Admission::class, 'student_id');
    }
}
