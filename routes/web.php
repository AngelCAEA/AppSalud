<?php

use App\Http\Controllers\DetailsController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MeasurementContextController;
use App\Http\Controllers\HealthRecordsController;
use App\Http\Controllers\PatientProfileController;
use App\Http\Controllers\ConfigurationProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'role:3'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/users', [DashboardController::class, 'getUsers'])->name('DashboardUsers');
    Route::patch('dashboard/users/{user}/status', [DashboardController::class, 'updateUserStatus'])->name('updateUserStatus');
    Route::patch('dashboard/users/{user}/role', [DashboardController::class, 'assignRole'])->name('assignRole');
});

Route::middleware(['auth', 'verified', 'role:1'])->group(function () {
    Route::get('/pacient', function () {
        return Inertia::render('Pacient/pacient');
    })->name('pacient');
});

// Endpoints públicos para obtener contextos
Route::get('/measurement-contexts', [MeasurementContextController::class, 'index'])->name('measurement-contexts.index');

// Endpoints autenticados para registros de salud
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/health-records', [HealthRecordsController::class, 'store'])->name('health-records.store');
    Route::get('/health-records', [HealthRecordsController::class, 'index'])->name('health-records.index');
    Route::get('/health-records/{id}', [HealthRecordsController::class, 'show'])->name('health-records.show');
    Route::delete('/health-records/{id}', [HealthRecordsController::class, 'destroy'])->name('health-records.destroy');
});

// Endpoints autenticados para perfil del paciente
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/patient-profile/current', [PatientProfileController::class, 'getCurrentProfile'])->name('patient-profile.current');
    Route::get('/patient-profile/or-default', [PatientProfileController::class, 'getOrDefaultProfile'])->name('patient-profile.or-default');
});;

Route::middleware(['auth', 'verified', 'role:2'])->group(function () {
    Route::get('/users', [UsersController::class, 'index'])->name('users');
});

Route::middleware(['auth', 'verified', 'role:2'])->group(function () {
    Route::get('/reports', [ReportsController::class, 'index'])->name('reports');
});

Route::middleware(['auth', 'verified','role:3'])->group( function (){
    Route::get('/roles', [RolesController::class, 'index'])->name('roles');
});

Route::middleware(['auth', 'verified'])->group( function (){
    Route::get('/details/{id}', [DetailsController::class, 'index'])->name('details');
});

Route::middleware(['auth', 'verified', 'role:2'])->group( function (){
    Route::get('/configuration/user/{id}', [ConfigurationProfileController::class, 'index'])->name('configuration');
    Route::patch('/configuration/user/{id}', [ConfigurationProfileController::class, 'update'])->name('configuration.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
