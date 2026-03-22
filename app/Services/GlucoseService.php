<?php

namespace App\Services;

class GlucoseService {

     /**
      * Calcula el porcentaje de tiempo en rango (TIR) para un paciente.
      *
      * El TIR se calcula como el porcentaje de registros de glucosa que están dentro del rango definido
      * por el perfil del paciente (glucose_min y glucose_max) en los últimos 30 días.
      * Si no hay registros de glucosa o el perfil no está definido, se retorna 0.
      * @param \App\Models\User $user El usuario/paciente para el cual se calcula el TIR.
      * @return int El porcentaje de tiempo en rango (TIR) para el paciente.
      */
     
    public function calculateTir($user): int {

        $profile = $user->patientProfile;

        if (!$profile) return 0;

        $records = $user->healthRecords
            ->where('glucose_value', '!=', null)
            ->where('recorded_at', '>=', now()->subDays(30));

        $total = $records->count();

        if ($total == 0) return 0;

        $min = $profile->glucose_min ?? 70;
        $max = $profile->glucose_max ?? 180;

        $inRange = $records->filter(function ($record) use ($min, $max) {
            return $record->glucose_value >= $min && $record->glucose_value <= $max;
        })->count();

        return round(($inRange / $total) * 100);
    }
}