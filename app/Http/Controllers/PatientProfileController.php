<?php

namespace App\Http\Controllers;

use App\Models\PatientProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador PatientProfileController
 * 
 * Gestiona las operaciones relacionadas con los perfiles de pacientes
 * incluyendo la obtención de límites personalizados de glucosa y presión
 */
class PatientProfileController extends Controller
{
    /**
     * Obtener el perfil del paciente autenticado
     * 
     * Retorna los límites personalizados de glucosa y presión arterial
     * que el paciente debe mantener según su diagnóstico médico.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCurrentProfile()
    {
        // Obtener el ID del usuario autenticado
        $userId = Auth::id();

        // Buscar el perfil del paciente en la BD
        $profile = PatientProfile::where('user_id', $userId)->first();

        // Si no existe un perfil, retornar 404
        if (!$profile) {
            return response()->json([
                'error' => 'No profile found',
                'message' => 'El usuario no tiene un perfil de paciente configurado',
            ], 404);
        }

        // Retornar el perfil con los límites personalizados
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'glucose_min' => (float) $profile->glucose_min,
                'glucose_max' => (float) $profile->glucose_max,
                'systolic_max' => (int) $profile->systolic_max,
                'diastolic_max' => (int) $profile->diastolic_max,
                'type_diabetes' => $profile->type_diabetes,
            ]
        ], 200);
    }

    /**
     * Obtener o crear un perfil de paciente
     * 
     * Intenta obtener el perfil del usuario autenticado.
     * Si no existe, usa valores por defecto estándar de salud.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrDefaultProfile()
    {
        $userId = Auth::id();
        $profile = PatientProfile::where('user_id', $userId)->first();

        // Valores por defecto si no tiene perfil (rangos recomendados por OMS)
        $defaultProfile = [
            'glucose_min' => 70.0,      // Mínimo recomendado
            'glucose_max' => 140.0,     // Máximo sin diabetes
            'systolic_max' => 130,      // Presión sistólica máxima
            'diastolic_max' => 85,      // Presión diastólica máxima
            'type_diabetes' => null,
        ];

        if ($profile) {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $profile->id,
                    'glucose_min' => (float) $profile->glucose_min,
                    'glucose_max' => (float) $profile->glucose_max,
                    'systolic_max' => (int) $profile->systolic_max,
                    'diastolic_max' => (int) $profile->diastolic_max,
                    'type_diabetes' => $profile->type_diabetes,
                ]
            ], 200);
        }

        // Retornar valores por defecto si no existe perfil
        return response()->json([
            'success' => true,
            'data' => $defaultProfile,
            'isDefault' => true,
        ], 200);
    }
}
