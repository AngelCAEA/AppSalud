<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PatientClinician extends Model
{
    use HasFactory;

    protected $table = 'patient_clinician';

    protected $fillable = [
        'patient_id',
        'clinician_id',
    ];

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
        ];
    }

    /**
     * Relación: el paciente
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Relación: el clínico asignado
     */
    public function clinician()
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }
}
