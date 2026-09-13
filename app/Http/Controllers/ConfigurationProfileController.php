<?php

namespace App\Http\Controllers;

use App\Models\PatientClinician;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConfigurationProfileController extends Controller
{
    /**
     * Mostrar configuración del perfil del paciente
     */
    public function index($id)
    {
        $user = User::with(['patientProfile'])->find($id);

        if (!$user) {
            return redirect()->back()->withErrors(['error' => 'Usuario no encontrado']);
        }

        // Verificar que el médico autenticado tiene acceso a este paciente
        $this->validatePatientAccess((int) $id);

        return Inertia::render('ConfigurationProfile', [
            'user' => $user,
        ]);
    }

    /**
     * Actualizar configuración del perfil del paciente
     */
    public function update(Request $request, $id)
    {
        $user = User::with(['patientProfile'])->find($id);

        if (!$user) {
            return redirect()->back()->withErrors(['error' => 'Usuario no encontrado']);
        }

        // Verificar que el médico autenticado tiene acceso a este paciente
        $this->validatePatientAccess((int) $id);

        // Validación con rangos realistas
        $validated = $request->validate([
            'glucose_min' => 'required|numeric|min:40|max:250',
            'glucose_max' => 'required|numeric|min:50|max:300',
            'systolic_max' => 'required|numeric|min:80|max:200',
            'diastolic_max' => 'required|numeric|min:50|max:130',
            'type_diabetes' => 'required|in:Tipo 1,Tipo 2,Gestacional',
        ]);

        // Validación cruzada: glucose_min debe ser menor que glucose_max
        if ($validated['glucose_min'] >= $validated['glucose_max']) {
            return redirect()->back()->withErrors([
                'glucose_min' => 'La glucosa mínima debe ser menor que la máxima',
            ]);
        }

        if ($user->patientProfile) {
            $user->patientProfile->update($validated);
        } else {
            PatientProfile::create(array_merge(['user_id' => $id], $validated));
        }

        return redirect()->back()->with('success', 'Perfil actualizado correctamente');
    }

    /**
     * Validar que el médico autenticado tiene acceso al paciente
     */
    private function validatePatientAccess(int $patientId): void
    {
        $clinicianId = Auth::id();

        $isAssigned = PatientClinician::where('clinician_id', $clinicianId)
            ->where('patient_id', $patientId)
            ->exists();

        if (!$isAssigned) {
            abort(403, 'No tienes acceso a este paciente');
        }
    }
}