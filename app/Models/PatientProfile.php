<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo PatientProfile
 * 
 * Define el perfil de salud personalizado de cada paciente, estableciendo:
 * - Rangos meta de glucosa en sangre (mínimo y máximo recomendado)
 * - Límites máximos de presión arterial (sistólica y diastólica)
 * - Tipo de diabetes diagnosticada (si aplica)
 * 
 * Esta información es crítica para:
 * - Evaluar si las mediciones del paciente están dentro de rangos sanos
 * - Mostrar alertas cuando los valores salen de los límites establecidos
 * - Personalizar el seguimiento según el tipo de diabetes
 * - Facilitar la comparación con rangos universales de salud
 * 
 * Cada paciente (usuario) tiene un único perfil que contiene sus objetivos
 * personalizados de salud basados en diagnóstico médico y condiciones específicas.
 */
class PatientProfile extends Model
{
    use HasFactory;

    protected $table = 'patient_profiles';

    protected $fillable = [
        'user_id',           // ID del usuario/paciente al que pertenece este perfil
        'glucose_min',       // Límite mínimo de glucosa recomendado en mg/dL (típicamente 70-100)
        'glucose_max',       // Límite máximo de glucosa recomendado en mg/dL (típicamente 140-180)
        'systolic_max',      // Límite máximo de presión sistólica en mmHg (típicamente 130-140)
        'diastolic_max',     // Límite máximo de presión diastólica en mmHg (típicamente 80-90)
        'type_diabetes',     // Tipo de diabetes del paciente (Tipo 1, Tipo 2, Gestacional, etc.)
    ];

    protected function casts(): array
    {
        return [
            'glucose_min' => 'decimal:2',
            'glucose_max' => 'decimal:2',
        ];
    }

    /**
     * Relación: el perfil pertenece a un usuario (paciente)
     * 
     * Cada perfil está vinculado a un único paciente y contiene
     * sus objetivos personalizados de salud establecidos por su médico.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
