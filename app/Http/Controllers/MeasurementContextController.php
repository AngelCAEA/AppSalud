<?php

namespace App\Http\Controllers;

use App\Models\MeasurementContext;
use Illuminate\Http\Request;

class MeasurementContextController extends Controller
{
    /**
     * Obtener todos los contextos de medición
     * retorna un array de objetos con id, slug, display_name y description
     */
    public function index(){

        return MeasurementContext::all();
    }

    /**
     * Obtener un contexto específico
     */
    public function show($id)
    {
        return MeasurementContext::findOrFail($id);
    }
}
