<?php

namespace App\Http\Controllers;

use App\Models\PatientClinician;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\GlucoseService;

class UsersController extends Controller{

    /**
     * Muestra la lista de pacientes asignados al clínico autenticado.
     *
     * Obtiene los pacientes asignados al usuario actual (clínico) desde la tabla patient_clinician,
     * calcula estadísticas como total de pacientes, pacientes en riesgo alto y pacientes sin registros,
     * y prepara los datos para la vista de usuarios con paginación y filtros de búsqueda.
     *
     * @param \Illuminate\Http\Request $request La solicitud HTTP con posibles parámetros de búsqueda.
     * @return \Inertia\Response La respuesta Inertia con los datos para la vista 'users'.
     */
    protected GlucoseService $glucoseService;

    public function __construct(GlucoseService $glucoseService) {

        $this->glucoseService = $glucoseService;
    }

    public function index(Request $request){
        
        if(!Auth::check()) {
            abort(403, 'Usuario no autenticado');
        }
        
        $search = $request->input('search');
        $filter = $request->input('filter', 'all');

        // Obtener IDs de pacientes asignados al clínico actual
        $patientIds = PatientClinician::where('clinician_id', Auth::id())->pluck('patient_id');

        // Obtener pacientes asignados al clínico actual
        $assignedPatientsQuery = User::whereIn('id', $patientIds);

        // Total Pacientes
        $totalPatients = $assignedPatientsQuery->count();

        // Obtener los pacientes asignados para cálculos adicionales
        $assignedPatients = $assignedPatientsQuery->with('patientProfile')->get();

        // Sin Registro: Pacientes sin health_records
        $noRecords = $assignedPatients->filter(function ($patient) {
            return $patient->healthRecords()->count() === 0;
        })->count();

        // Riesgo Alto: Pacientes con registros que indiquen riesgo
        $highRisk = $assignedPatients->filter(function ($patient) {
            $latestRecord = $patient->healthRecords()->latest()->first();
            if (!$latestRecord) return false; // Sin registros, no riesgo

            $profile = $patient->patientProfile;
            if (!$profile) return false; // Si no hay perfil, no evaluar riesgo

            $glucose = $latestRecord->glucose_value ?? null;
            $systolic = $latestRecord->systolic ?? null;
            $diastolic = $latestRecord->diastolic ?? null;

            $glucoseMax = $profile->glucose_max ?? 180; // Valor por defecto si no definido
            $systolicMax = $profile->systolic_max ?? 140;
            $diastolicMax = $profile->diastolic_max ?? 90;

            return ($glucose && $glucose > $glucoseMax) || ($systolic && $systolic > $systolicMax) || ($diastolic && $diastolic > $diastolicMax);
        })->count();

        $users = User::whereIn('id', $patientIds)
            ->with('patientProfile', 'healthRecords')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                      ->orWhereRaw('LOWER(email) LIKE ?', ['%' . strtolower($search) . '%']);
                });
            })
            ->when($filter === 'noRecord', function ($query) {
                $query->whereDoesntHave('healthRecords');
            })
            ->when($filter === 'high' || $filter === 'unstable', function ($query) {
                $query->whereHas('healthRecords');
            })
            ->orderBy('id', 'asc')
            ->paginate(5)
            ->withQueryString() 
            ->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => '',
                'phone' => '',
                'address' => '',
                'municipality' => '',
                'status' => true,
                'riskLevel' => $this->calculateRiskLevel($user),
                'tirPercentage' => $this->glucoseService->calculateTir($user),
                'lastRecord' => $this->getLastRecord($user),
            ]);

        // Filtrar por nivel de riesgo después de calcular
        if ($filter === 'high') {
            $filtered = $users->getCollection()->filter(fn($u) => $u['riskLevel'] === 'high')->values();
            $users->setCollection($filtered);
        } elseif ($filter === 'unstable') {
            $filtered = $users->getCollection()->filter(fn($u) => $u['riskLevel'] === 'low')->values();
            $users->setCollection($filtered);
        }

            return Inertia::render('users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'filter' => $filter,
            ],
            'totalPatients' => $totalPatients,
            'highRisk' => $highRisk,
            'noRecords' => $noRecords,
        ]);
    }

    /**
     * Calcula el nivel de riesgo de un paciente basado en su perfil de salud y el último registro médico.
     *
     * Evalúa si los valores de glucosa y presión arterial están dentro de los rangos personalizados
     * definidos en el perfil del paciente. Si no hay perfil o registros, retorna 'Sin Datos'.
     *
     * @param \App\Models\User $user El usuario/paciente a evaluar.
     * @return string El nivel de riesgo: 'high' si excede límites, 'low' si está en rango, 'Sin Datos' si falta información.
     */
    private function calculateRiskLevel($user){

        $profile = $user->patientProfile;
        if (!$profile) {
            return 'Sin Datos';
        }

        $latestRecord = $user->healthRecords->sortByDesc('created_at')->first();
        if (!$latestRecord) {
            return 'Sin Datos';
        }

        $glucose = $latestRecord->glucose_value;
        $systolic = $latestRecord->systolic;
        $diastolic = $latestRecord->diastolic;

        $glucoseMin = $profile->glucose_min ?? 70;
        $glucoseMax = $profile->glucose_max ?? 180;
        $systolicMax = $profile->systolic_max ?? 140;
        $diastolicMax = $profile->diastolic_max ?? 90;

        if (($glucose && ($glucose < $glucoseMin || $glucose > $glucoseMax)) ||
            ($systolic && $systolic > $systolicMax) ||
            ($diastolic && $diastolic > $diastolicMax)) {
            return 'high';
        }

        return 'low';
    }
    
    /**
     * Obtiene la fecha del último registro de salud del paciente.
     *
     * Busca el registro más reciente en health_records para el paciente dado y devuelve
     * la fecha formateada. Si no hay registros, retorna 'Sin Registro'.
     *
     * @param \App\Models\User $user El usuario/paciente a evaluar.
     * @return string La fecha del último registro o 'Sin Registro' si no hay datos.
     */
    private function getLastRecord($user) {

        $latestRecord = $user->healthRecords->where('type','glucose')->sortByDesc('created_at')->first();
        if (!$latestRecord) {
            return ['value' => null, 'date' => null];
        }
        
        return [
            'value' => $latestRecord->glucose_value . ' mg/dL',
            'date'  => $latestRecord->created_at->format('Y-m-d H:i'),
        ];
    }

    /**
     * Retorna la distribución de pacientes asignados por nivel de glucosa y presión arterial.
     * Diseñado para poblar las gráficas de distribución del panel clínico.
     *
     * Glucosa (último registro de tipo 'glucose' por paciente):
     *   - Estable: dentro del rango personalizado [glucose_min, glucose_max] del perfil
     *   - Medio:   entre glucose_max y glucose_max × 1.25 (25% sobre el límite superior)
     *   - Alto:    por encima de glucose_max × 1.25 o por debajo de glucose_min
     *
     * Presión Arterial (último registro de tipo 'blood_pressure' por paciente):
     *   - Normal (<130/85): sistólica ≤ 130 y diastólica ≤ 85
     *   - Alerta:           sistólica 131–140 o diastólica 86–90
     *   - Alto (>140/90):   sistólica > 140 o diastólica > 90
     *
     * Solo se contabilizan pacientes que cuentan con al menos un registro del tipo correspondiente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDistribution(Request $request): \Illuminate\Http\JsonResponse
    {
        if (!Auth::check()) {
            abort(403, 'Usuario no autenticado');
        }

        $patientIds = PatientClinician::where('clinician_id', Auth::id())->pluck('patient_id');
        $patients   = User::whereIn('id', $patientIds)->with('patientProfile', 'healthRecords')->get();

        $glucose  = ['stable' => 0, 'medium' => 0, 'high' => 0];
        $pressure = ['normal' => 0, 'alert'  => 0, 'high' => 0];

        foreach ($patients as $patient) {
            $this->classifyGlucose($patient, $glucose);
            $this->classifyPressure($patient, $pressure);
        }

        return response()->json([
            'glucose'  => $glucose  + ['total' => array_sum($glucose)],
            'pressure' => $pressure + ['total' => array_sum($pressure)],
        ]);
    }

    /**
     * Clasifica el nivel de glucosa de un paciente y acumula el conteo en $glucose.
     * Usa el último registro de tipo 'glucose'. Si no existe registro, el paciente no se contabiliza.
     *
     * Umbrales (con fallback si el paciente no tiene perfil):
     *   - glucose_min: 70 mg/dL por defecto
     *   - glucose_max: 180 mg/dL por defecto
     *   - Umbral de nivel medio: glucose_max × 1.25 (25% sobre el límite superior)
     *
     * Para ajustar los rangos, modificar glucose_min y glucose_max en el perfil del paciente
     * o cambiar el multiplicador del umbral medio (actualmente 1.25).
     *
     * @param  \App\Models\User  $user
     * @param  array             &$glucose  Acumuladores: ['stable', 'medium', 'high']
     */
    private function classifyGlucose(User $user, array &$glucose): void
    {
        $record = $user->healthRecords
            ->where('type', 'glucose')
            ->sortByDesc('recorded_at')
            ->first();

        if (!$record || $record->glucose_value === null) {
            return;
        }

        $profile    = $user->patientProfile;
        $glucoseMin = (float) ($profile->glucose_min ?? 70);
        $glucoseMax = (float) ($profile->glucose_max ?? 180);
        $mediumCap  = $glucoseMax * 1.25;

        $value = (float) $record->glucose_value;

        if ($value >= $glucoseMin && $value <= $glucoseMax) {
            $glucose['stable']++;
        } elseif ($value > $glucoseMax && $value <= $mediumCap) {
            $glucose['medium']++;
        } else {
            $glucose['high']++;
        }
    }

    /**
     * Clasifica el nivel de presión arterial de un paciente y acumula el conteo en $pressure.
     * Usa el último registro de tipo 'blood_pressure'. Si no existe registro, el paciente no se contabiliza.
     *
     * Criterios clínicos (basados en umbrales estándar de hipertensión):
     *   - Normal:  sistólica ≤ 130 Y diastólica ≤ 85
     *   - Alerta:  sistólica 131–140 O diastólica 86–90
     *   - Alto:    sistólica > 140 O diastólica > 90
     *
     * Para ajustar los umbrales, modificar los valores literales 130, 85, 140, 90
     * o recibirlos del perfil del paciente (systolic_max, diastolic_max).
     *
     * @param  \App\Models\User  $user
     * @param  array             &$pressure  Acumuladores: ['normal', 'alert', 'high']
     */
    private function classifyPressure(User $user, array &$pressure): void
    {
        $record = $user->healthRecords
            ->where('type', 'blood_pressure')
            ->sortByDesc('recorded_at')
            ->first();

        if (!$record || ($record->systolic === null && $record->diastolic === null)) {
            return;
        }

        $systolic  = (int) ($record->systolic  ?? 0);
        $diastolic = (int) ($record->diastolic ?? 0);

        if ($systolic > 140 || $diastolic > 90) {
            $pressure['high']++;
        } elseif ($systolic > 130 || $diastolic > 85) {
            $pressure['alert']++;
        } else {
            $pressure['normal']++;
        }
    }
}
