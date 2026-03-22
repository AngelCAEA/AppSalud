<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo HealthRecord
 * 
 * Representa un registro de salud del paciente que contiene mediciones de:
 * - Glucosa en sangre (mg/dL)
 * - Presión arterial - sistólica y diastólica (mmHg)
 * - Pulso (latidos por minuto)
 * 
 * Cada registro está asociado a:
 * - Un paciente (usuario)
 * - Un contexto de medición (En Ayunas, Después de Comer, Antes de Dormir, etc.)
 * - Una fecha y hora en que se realizó la medición
 * 
 * La tabla almacena mediciones individuales de glucosa y/o presión arterial,
 * permitiendo al paciente un seguimiento detallado de sus niveles de salud.
 * Los registros pueden ser históricos para análisis de tendencias.
 */
class HealthRecord extends Model{
    use HasFactory;

    protected $table = 'health_records';
    
    // Desactivar timestamps ya que la tabla no tiene updated_at
    public $timestamps = false;

    protected $fillable = [
        'patient_id',      // ID del paciente que realizó la medición
        'type',            // Tipo de medición: 'glucose' o 'blood_pressure'
        'glucose_value',   // Valor de glucosa en mg/dL (70-600)
        'systolic',        // Presión sistólica en mmHg (40-300)
        'diastolic',       // Presión diastólica en mmHg (20-200)
        'pulse',           // Pulso/frecuencia cardíaca en lpm (20-200)
        'meal_context',    // Contexto del alimento (deprecated, usar context_id)
        'context_id',      // ID del contexto de medición (En Ayunas, Post-comida, etc.)
        'notes',           // Notas adicionales sobre la medición
        'recorded_at',     // Fecha y hora en que se realizó la medición
    ];

    protected function casts(): array
    {
        return [
            'glucose_value' => 'decimal:2',
            'recorded_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Relación: el registro pertenece a un paciente
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Relación: el registro pertenece a un contexto de medición
     * 
     * El contexto especifica cuándo se realizó la medición:
     * - En Ayunas: medición sin haber comido (glucosa más baja)
     * - Después de Comer: medición 2 horas post-almuerzo (glucosa más alta)
     * - Antes de Dormir: medición antes de acostarse
     * - Aleatorio: medición sin relación a comidas
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function context()
    {
        return $this->belongsTo(MeasurementContext::class, 'context_id');
    }
}
