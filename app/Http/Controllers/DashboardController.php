<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Obtener todos los usuarios con sus roles
     */
    public function getUsers()
    {
        $users = User::with('role')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->format('Y-m-d'),
                'status' => $user->status,
                'role_id' => $user->role_id,
                'role_name' => $user->role?->name,
            ];
        });

        return response()->json([
            'users' => $users,
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    /**
     * Actualizar el estado del usuario
     */
    public function updateUserStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required|boolean',
        ]);
        try {
            $user->update(['status' => $validated['status']]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Error al actualizar el usuario ' . $e->getMessage()], 500);
        }

        return response()->json(['status' => true, 'message' => 'Usuario actualizado'], 200);
    }

    /**
     * Asignar rol al usuario
     */
    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:role,id',
        ]);
        try {
            $user->update(['role_id' => $validated['role_id']]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Error al asignar rol ' . $e->getMessage()], 500);
        }

        return response()->json(['status' => true, 'message' => 'Rol asignado correctamente'], 200);
    }

    /**
     * Dashboard index
     */
    public function index() {

        return Inertia::render('dashboard');
    }
}
