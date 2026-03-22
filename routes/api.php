<?php

use App\Http\Controllers\MeasurementContextController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/measurement-contexts', [MeasurementContextController::class, 'index']);
Route::get('/measurement-contexts/{id}', [MeasurementContextController::class, 'show']);
