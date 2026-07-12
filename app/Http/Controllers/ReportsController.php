<?php

namespace App\Http\Controllers;

use App\Models\PatientClinician;
use App\Models\PatientProfile;
use App\Models\HealthRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller{

    public function index(Request $request){    
        return Inertia::render('reports');
    }

    /**
     * Obtener lista simple de pacientes asignados al clínico autenticado
     * para el selector/dropdown en el frontend
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPatientsList(Request $request)
    {
        $clinicianId = Auth::id();
        
        $patients = PatientClinician::where('clinician_id', $clinicianId)
            ->with('patient')
            ->get()
            ->map(function ($patientClinician) {
                $patient = $patientClinician->patient;
                return [
                    'id' => $patient->id,
                    'name' => $patient->name,
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $patients->values(),
        ]);
    }

    /**
     * Retorna el historial completo de registros de salud (glucosa y presión arterial)
     * de los pacientes asignados al clínico autenticado.
     *
     * Parámetros opcionales:
     *   - patientId: limita los resultados a un paciente específico asignado al clínico
     *   - dateFrom / dateTo (YYYY-MM-DD): filtra los registros dentro del rango de fechas
     *
     * Cada fila del resultado corresponde a un registro individual de health_records.
     * Si no hay filtro de fechas y no se especifica paciente, devuelve todos los registros.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAssignedPatients(Request $request)
    {
        $clinicianId       = Auth::id();
        $selectedPatientId = $request->query('patientId');
        $dateFrom          = $request->query('dateFrom');
        $dateTo            = $request->query('dateTo');

        // Obtener IDs de pacientes asignados al clínico
        $patientIds = PatientClinician::where('clinician_id', $clinicianId)
            ->pluck('patient_id')
            ->toArray();

        // Si se especifica un paciente, verificar que esté asignado y filtrar
        if ($selectedPatientId) {
            if (!in_array((int) $selectedPatientId, $patientIds)) {
                return response()->json(['success' => false, 'message' => 'Paciente no asignado'], 403);
            }
            $patientIds = [(int) $selectedPatientId];
        }

        if (empty($patientIds)) {
            return response()->json(['success' => true, 'data' => []]);
        }

        // Construir query de registros individuales
        $query = HealthRecord::whereIn('patient_id', $patientIds)
            ->with('patient')
            ->orderBy('recorded_at', 'desc');

        // Aplicar filtro por rango de fechas si se recibe
        if ($dateFrom && $dateTo) {
            $fromDate = Carbon::createFromFormat('Y-m-d', $dateFrom, 'America/Mexico_City')->startOfDay();
            $toDate   = Carbon::createFromFormat('Y-m-d', $dateTo,   'America/Mexico_City')->endOfDay();
            $query->whereBetween('recorded_at', [$fromDate, $toDate]);
        }

        $records = $query->get()->map(function ($record) {
            $recordedAt = Carbon::parse($record->recorded_at)->setTimezone('America/Mexico_City');

            return [
                'id'        => $record->id,
                'patientId' => $record->patient_id,
                'name'      => $record->patient->name,
                'type'      => $record->type,
                'date'      => $recordedAt->format('Y-m-d H:i'),
                // Glucosa: solo presente en registros de tipo 'glucose'
                'glucose'   => $record->glucose_value,
                // Presión arterial: solo presente en registros de tipo 'blood_pressure'
                'systolic'  => $record->systolic,
                'diastolic' => $record->diastolic,
                // Estado clínico del registro basado en el perfil del paciente
                'status'    => $this->getMeasurementStatus($record),
            ];
        });

        return response()->json(['success' => true, 'data' => $records->values()]);
    }

    /**
     * Calcular el nivel de riesgo basado en los últimos registros
     * usando los rangos personalizados del perfil del paciente
     */
    private function calculateRiskLevel($patientId)
    {
        $lastRecord = HealthRecord::where('patient_id', $patientId)
            ->orderBy('recorded_at', 'desc')
            ->first();
        
        if (!$lastRecord) {
            return 'Sin datos';
        }
        
        // Obtener el perfil del paciente con sus rangos personalizados
        $profile = PatientProfile::where('user_id', $patientId)->first();
        
        // Valores por defecto si no existe perfil
        $glucoseMin = $profile?->glucose_min ?? 70;
        $glucoseMax = $profile?->glucose_max ?? 180;
        $systolicMax = $profile?->systolic_max ?? 140;
        $diastolicMax = $profile?->diastolic_max ?? 90;
        
        $riskLevel = 'Estable';
        
        // Evaluar glucosa según el perfil del paciente
        if ($lastRecord->glucose_value !== null) {
            if ($lastRecord->glucose_value > $glucoseMax * 1.4 || $lastRecord->glucose_value < $glucoseMin - 10) {
                $riskLevel = 'Riesgo Alto';
            } elseif ($lastRecord->glucose_value > $glucoseMax || $lastRecord->glucose_value < $glucoseMin) {
                $riskLevel = 'Inestable';
            }
        }
        
        // Evaluar presión arterial según el perfil del paciente
        if ($lastRecord->systolic !== null && $lastRecord->diastolic !== null) {
            if ($lastRecord->systolic > $systolicMax * 1.2 || $lastRecord->diastolic > $diastolicMax * 1.1) {
                $riskLevel = 'Riesgo Alto';
            } elseif ($lastRecord->systolic > $systolicMax || $lastRecord->diastolic > $diastolicMax) {
                $riskLevel = 'Inestable';
            }
        }
        
        return $riskLevel;
    }

    /**
     * Obtener resumen estadístico de los pacientes asignados al doctor/enfermero autenticado
     * 
     * Puede filtrar por un paciente específico mediante el parámetro 'patientId'
     * Si patientId está especificado, devuelve estadísticas de solo ese paciente
     */
    public function getSummary(Request $request)
    {
        $clinicianId = Auth::id();
        $selectedPatientId = $request->query('patientId'); // Obtener el paciente seleccionado si existe
        
        // Obtener fechas de filtro
        $dateFrom = $request->query('dateFrom');
        $dateTo = $request->query('dateTo');
        
        // Obtener todos los pacientes asignados al clínico
        $query = PatientClinician::where('clinician_id', $clinicianId)
            ->pluck('patient_id')
            ->toArray();
        
        // Si se especifica un patientId, verificar que el paciente esté asignado y filtrar
        if ($selectedPatientId) {
            if (!in_array($selectedPatientId, $query)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente no asignado',
                ], 403);
            }
            $query = [$selectedPatientId];
        }
        
        $patientIds = $query;
        
        if (empty($patientIds)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'totalPatients' => 0,
                    'highRisk' => 0,
                    'unstable' => 0,
                    'stable' => 0,
                    'noRecord' => 0,
                    'avgTIR' => 0,
                ],
            ]);
        }
        
        // Obtener los pacientes con sus últimos registros
        $patients = PatientClinician::where('clinician_id', $clinicianId)
            ->whereIn('patient_id', $patientIds)
            ->with('patient')
            ->get()
            ->map(function ($patientClinician) use ($dateFrom, $dateTo) {
                $patient = $patientClinician->patient;
                
                // Obtener el último registro de salud del paciente
                $lastRecord = HealthRecord::where('patient_id', $patient->id)
                    ->orderBy('recorded_at', 'desc')
                    ->first();
                
                // Aplicar filtros de fecha si existen
                if ($lastRecord && $dateFrom && $dateTo) {
                    $recordDate = Carbon::parse($lastRecord->recorded_at)->setTimezone('America/Mexico_City')->startOfDay();
                    $fromDate = Carbon::createFromFormat('Y-m-d', $dateFrom, 'America/Mexico_City')->startOfDay();
                    $toDate = Carbon::createFromFormat('Y-m-d', $dateTo, 'America/Mexico_City')->endOfDay();
                    
                    if ($recordDate < $fromDate || $recordDate > $toDate) {
                        return null; // Excluir si está fuera del rango
                    }
                }
                
                // Calcular días sin registro
                $daysWithoutRecord = 0;
                if ($lastRecord) {
                    $recordDate = Carbon::parse($lastRecord->recorded_at)->setTimezone('America/Mexico_City');
                    $nowMexico = now('America/Mexico_City');
                    $daysWithoutRecord = (int) $nowMexico->diffInDays($recordDate);
                }
                
                // Determinar nivel de riesgo
                $riskLevel = $this->calculateRiskLevel($patient->id);
                
                // Calcular TIR
                $tir = $this->calculateTIR($patient->id);
                
                return [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'tir' => $tir,
                    'riskLevel' => $riskLevel,
                    'daysWithoutRecord' => $daysWithoutRecord,
                ];
            })
            ->filter(fn($patient) => $patient !== null)
            ->values();
        
        // Calcular estadísticas
        $totalPatients = $patients->count();
        $highRisk = $patients->filter(fn($p) => $p['riskLevel'] === 'Riesgo Alto')->count();
        $unstable = $patients->filter(fn($p) => $p['riskLevel'] === 'Inestable')->count();
        $stable = $patients->filter(fn($p) => $p['riskLevel'] === 'Estable')->count();
        $noRecord = $patients->filter(fn($p) => $p['daysWithoutRecord'] > 0)->count();
        $avgTIR = $totalPatients > 0 
            ? round($patients->sum('tir') / $totalPatients, 1)
            : 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'totalPatients' => $totalPatients,
                'highRisk' => $highRisk,
                'unstable' => $unstable,
                'stable' => $stable,
                'noRecord' => $noRecord,
                'avgTIR' => $avgTIR,
            ],
        ]);
    }

    /**
     * Obtener todos los registros de salud (mediciones) de los pacientes
     * asignados al doctor/enfermero autenticado, con filtrado por fechas
     * 
     * Puede filtrar por un paciente específico mediante el parámetro 'patientId'
     * Si patientId está especificado, devuelve solo mediciones de ese paciente
     */
    public function getMeasurements(Request $request)
    {
        $clinicianId = Auth::id();
        $selectedPatientId = $request->query('patientId'); // Obtener el paciente seleccionado si existe
        
        // Obtener fechas de filtro
        $dateFrom = $request->query('dateFrom');
        $dateTo = $request->query('dateTo');
        
        // Obtener IDs de pacientes asignados al clínico
        $query = PatientClinician::where('clinician_id', $clinicianId)
            ->pluck('patient_id')
            ->toArray();
        
        // Si se especifica un patientId, verificar que esté asignado y filtrar
        if ($selectedPatientId) {
            if (!in_array($selectedPatientId, $query)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente no asignado',
                ], 403);
            }
            $query = [$selectedPatientId];
        }
        
        $patientIds = $query;
        
        if (empty($patientIds)) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }
        
        // Obtener los registros de salud de los pacientes asignados
        $query = HealthRecord::whereIn('patient_id', $patientIds)
            ->with('patient')
            ->orderBy('recorded_at', 'desc');
        
        // Aplicar filtros de fecha si existen - convertir a zona horaria Mexico
        if ($dateFrom) {
            // Convertir la fecha a inicio del día en zona horaria Mexico
            $fromDate = Carbon::createFromFormat('Y-m-d', $dateFrom, 'America/Mexico_City')->startOfDay();
            $query->where('recorded_at', '>=', $fromDate);
        }
        if ($dateTo) {
            // Convertir la fecha a fin del día en zona horaria Mexico
            $toDate = Carbon::createFromFormat('Y-m-d', $dateTo, 'America/Mexico_City')->endOfDay();
            $query->where('recorded_at', '<=', $toDate);
        }
        
        $measurements = $query->get()->map(function ($record) {
            // Determinar el tipo de medición
            $types = [];
            if ($record->glucose_value !== null) {
                $types[] = 'Glucosa';
            }
            if ($record->systolic !== null && $record->diastolic !== null) {
                $types[] = 'Presión Arterial';
            }
            
            $measurementType = !empty($types) ? implode(' / ', $types) : 'Desconocido';
            
            // Preparar el valor para mostrar
            $value = '';
            if ($record->glucose_value !== null && $record->systolic !== null && $record->diastolic !== null) {
                $value = "{$record->glucose_value} / {$record->systolic}/{$record->diastolic}";
            } elseif ($record->glucose_value !== null) {
                $value = "{$record->glucose_value}";
            } elseif ($record->systolic !== null && $record->diastolic !== null) {
                $value = "{$record->systolic}/{$record->diastolic}";
            }
            
            // Determinar la unidad
            $unit = '';
            if ($record->glucose_value !== null && $record->systolic !== null) {
                $unit = 'mg/dL / mmHg';
            } elseif ($record->glucose_value !== null) {
                $unit = 'mg/dL';
            } elseif ($record->systolic !== null) {
                $unit = 'mmHg';
            }
            
            // Determinar el estado basado en el perfil del paciente
            $status = $this->getMeasurementStatus($record);
            
            $recordedAt = Carbon::parse($record->recorded_at)->setTimezone('America/Mexico_City');
            
            return [
                'id' => $record->id,
                'patientName' => $record->patient->name,
                'patientId' => $record->patient_id,
                'date' => $recordedAt->format('Y-m-d'),
                'time' => $recordedAt->format('H:i'),
                'type' => $measurementType,
                'value' => $value,
                'unit' => $unit,
                'glucose' => $record->glucose_value,
                'systolic' => $record->systolic,
                'diastolic' => $record->diastolic,
                'pulse' => $record->pulse,
                'status' => $status,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $measurements->values(),
        ]);
    }

    /**
     * Determinar el estado de una medición basado en el perfil del paciente
     */
    private function getMeasurementStatus($record)
    {
        // Obtener el perfil del paciente
        $profile = PatientProfile::where('user_id', $record->patient_id)->first();
        
        // Valores por defecto
        $glucoseMin = $profile?->glucose_min ?? 70;
        $glucoseMax = $profile?->glucose_max ?? 180;
        $systolicMax = $profile?->systolic_max ?? 140;
        $diastolicMax = $profile?->diastolic_max ?? 90;
        
        $status = 'Normal';
        
        // Evaluar glucosa
        if ($record->glucose_value !== null) {
            if ($record->glucose_value > $glucoseMax * 1.4 || $record->glucose_value < $glucoseMin - 10) {
                $status = 'Crítico';
            } elseif ($record->glucose_value > $glucoseMax || $record->glucose_value < $glucoseMin) {
                $status = 'Elevado';
            }
        }
        
        // Evaluar presión arterial
        if ($record->systolic !== null && $record->diastolic !== null) {
            if ($record->systolic > $systolicMax * 1.2 || $record->diastolic > $diastolicMax * 1.1) {
                if ($status !== 'Crítico') {
                    $status = 'Crítico';
                }
            } elseif ($record->systolic > $systolicMax || $record->diastolic > $diastolicMax) {
                if ($status === 'Normal') {
                    $status = 'Elevado';
                }
            }
        }
        
        return $status;
    }

    /**
     * Calcular TIR (Time in Range) - porcentaje de tiempo dentro del rango objetivo
     * usando los rangos personalizados del perfil del paciente
     */
    private function calculateTIR($patientId)
    {
        $records = HealthRecord::where('patient_id', $patientId)
            ->where('glucose_value', '!=', null)
            ->orderBy('recorded_at', 'desc')
            ->limit(30)
            ->get();
        
        if ($records->isEmpty()) {
            return 0;
        }
        
        // Obtener el perfil del paciente con sus rangos personalizados
        $profile = PatientProfile::where('user_id', $patientId)->first();
        
        // Valores por defecto si no existe perfil
        $glucoseMin = $profile?->glucose_min ?? 70;
        $glucoseMax = $profile?->glucose_max ?? 180;
        
        $inRange = $records->filter(function ($record) use ($glucoseMin, $glucoseMax) {
            // Rango objetivo: según el perfil del paciente
            return $record->glucose_value >= $glucoseMin && $record->glucose_value <= $glucoseMax;
        })->count();
        
        return round(($inRange / $records->count()) * 100);
    }
}