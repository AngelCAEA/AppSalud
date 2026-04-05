<?php

namespace App\Http\Controllers;

use App\Models\HealthRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HealthRecordsController extends Controller
{
    /**
     * Obtener todos los registros de salud del usuario autenticado
     */
    public function index()
    {
        $userId = Auth::id();
        return HealthRecord::where('patient_id', $userId)
            ->with('context')
            ->orderBy('recorded_at', 'desc')
            ->get();
    }

    /**
     * Guardar un nuevo registro de salud (glucosa, presión o ambos)
     */
    public function store(Request $request){
        try {
            $validated = $request->validate([
                'type' => 'required|in:glucose,blood_pressure',
                'glucose_value' => 'nullable|numeric|min:20|max:600',
                'systolic' => 'nullable|numeric|min:40|max:300',
                'diastolic' => 'nullable|numeric|min:20|max:200',
                'pulse' => 'nullable|numeric|min:20|max:200',
                'context_id' => 'nullable|numeric|exists:measurement_contexts,id',
            ]);

            $patientId = Auth::id();

            // Convertir valores a tipos correctos
            $glucoseValue = isset($validated['glucose_value']) && $validated['glucose_value'] !== null ? (float) $validated['glucose_value'] : null;
            $systolicValue = isset($validated['systolic']) && $validated['systolic'] !== null ? (int) $validated['systolic'] : null;
            $diastolicValue = isset($validated['diastolic']) && $validated['diastolic'] !== null ? (int) $validated['diastolic'] : null;
            $pulseValue = isset($validated['pulse']) && $validated['pulse'] !== null ? (int) $validated['pulse'] : null;
            $contextId = isset($validated['context_id']) && $validated['context_id'] !== null ? (int) $validated['context_id'] : null;

            $healthRecord = HealthRecord::create([
                'patient_id' => $patientId,
                'type' => $validated['type'],
                'glucose_value' => $glucoseValue,
                'systolic' => $systolicValue,
                'diastolic' => $diastolicValue,
                'pulse' => $pulseValue,
                'context_id' => $contextId,
                'recorded_at' => now(),
            ]);

            // Refrescar para obtener los valores generados por la BD (created_at)
            $healthRecord->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Registro de salud guardado exitosamente',
                'data' => $healthRecord,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar el registro: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un registro específico
     */
    public function show($id)
    {
        $healthRecord = HealthRecord::findOrFail($id);
        
        // Verificar que el registro pertenece al usuario autenticado
        if ($healthRecord->patient_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return $healthRecord->load('context');
    }

    /**
     * Eliminar un registro de salud
     */
    public function destroy($id)
    {
        $healthRecord = HealthRecord::findOrFail($id);
        
        // Verificar que el registro pertenece al usuario autenticado
        if ($healthRecord->patient_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $healthRecord->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registro eliminado exitosamente'
        ]);
    }
}
