<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

class RolesController extends Controller{

     public function index(){
        
        $roles = [
            [ 
                'id' => 1,
                'name' => 'Administrador',
                'description' => 'Tiene acceso total al sistema: gestionar usuarios, tours, reservas y reportes'
                
            ],
            [
                'id' => 2,
                'name' => 'Guia Turistico',
                'description' => 'Asigna y gestiona recorridos, puede ver horarios, grupos y rutas'
            ],
            [
                'id' => 3,
                'name' => 'Operador',
                'description' => 'Gestiona la logística de los tours: transporte, entradas, alojamiento'
            ]
        ];
        return Inertia::render('roles', [
            'roles' => $roles
        ]);
     }
}