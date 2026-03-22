<?php

namespace App\Services;

class GetChartData {
    
     /**
      * Obtiene los datos de glucosa, presión sistólica y diastólica para un paciente en un rango de tiempo específico.
      *
      * Este método recupera los registros de salud del paciente en los últimos 7 o 30 días, agrupa los datos por día o semana,
      * y calcula el promedio de glucosa, presión sistólica y diastólica para cada grupo. Los datos se formatean para su uso en gráficos.
      *
      * @param \App\Models\User $user El usuario/paciente para el cual se obtienen los datos.
      * @param int $days El número de días para el rango de tiempo (7 o 30).
      * @return array Un arreglo de datos agrupados por día o semana con promedios de glucosa, presión sistólica y diastólica.
      */
    public function getChartData($user, int $days = 30): array {
        $records = $user->healthRecords()
            ->where('recorded_at', '>=', now()->subDays($days))
            ->orderBy('recorded_at', 'asc')
        ->get();

        if ($days === 7) {
            // Agrupar por día
            $grouped = $records->groupBy(function ($record) {
                return $record->recorded_at->format('Y-m-d');
            });

            return $grouped->map(function ($group, $date) {
                return [
                    'day'       => \Carbon\Carbon::parse($date)->format('d/m'),
                    'glucose'   => round($group->avg('glucose_value')),
                    'systolic'  => round($group->avg('systolic')),
                    'diastolic' => round($group->avg('diastolic')),
                ];
            })->values()->toArray();
        }

        // 30 días — agrupar por semana
        $grouped = $records->groupBy(function ($record) {
            return 'Sem ' . $record->recorded_at->weekOfMonth;
        });

        return $grouped->map(function ($group, $week) {
            return [
                'day'       => $week,
                'glucose'   => round($group->avg('glucose_value')),
                'systolic'  => round($group->avg('systolic')),
                'diastolic' => round($group->avg('diastolic')),
            ];
        })->values()->toArray();
    }
}