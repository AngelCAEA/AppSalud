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

            return Inertia::render('users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
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

        $latestRecord = $user->healthRecords->sortByDesc('recorded_at')->first();
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

        $latestRecord = $user->healthRecords->where('type','glucose')->sortByDesc('recorded_at')->first();
        if (!$latestRecord) {
            return ['value' => null, 'date' => null];
        }
        
        return [
            'value' => $latestRecord->glucose_value . ' mg/dL',
            'date'  => $latestRecord->recorded_at->format('Y-m-d H:i'),
        ];
    }
}
