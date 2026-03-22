<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClinicalNote extends Model
{
    use HasFactory;

    protected $table = 'clinical_notes';

    protected $fillable = [
        'patient_id',
        'clinician_id',
        'content',
        'is_urgent',
    ];

    protected function casts(): array
    {
        return [
            'is_urgent' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Relación: la nota pertenece a un paciente
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Relación: la nota fue creada por un clínico
     */
    public function clinician()
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }
}
