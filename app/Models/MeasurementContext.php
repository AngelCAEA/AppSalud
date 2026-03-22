<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MeasurementContext extends Model
{
    use HasFactory;

    protected $table = 'measurement_contexts';

    protected $fillable = [
        'slug',
        'display_name',
        'description',
    ];

    /**
     * Relación: un contexto tiene muchos registros de salud
     */
    public function healthRecords()
    {
        return $this->hasMany(HealthRecord::class, 'context_id');
    }
}
