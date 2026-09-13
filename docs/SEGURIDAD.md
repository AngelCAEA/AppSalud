# 🔒 SEGURIDAD - 30 Problemas y Soluciones

Reporte de auditoría de seguridad, rendimiento y calidad de código identificados en AppSalud.

## 📊 Resumen de Problemas

| Severidad | Cantidad | Tiempo Total |
|-----------|----------|--------------|
| 🔴 CRÍTICA | 9 | ~5 horas |
| 🟡 MEDIA | 15 | ~6.5 horas |
| 🟢 BAJA | 7 | ~3.5 horas |
| **TOTAL** | **31** | **~15 horas** |

---

## 🔴 VULNERABILIDADES CRÍTICAS (Hacer AHORA)

### #1 Authorization Bypass en ConfigurationProfileController

**Archivo:** `app/Http/Controllers/ConfigurationProfileController.php` (línea 10-45)  
**Prioridad:** CRÍTICA  
**Effort:** 30 minutos  

**Problema:**
```php
public function update(Request $request, $id) {
    $user = User::find($id);
    if ($user->patientProfile) {
        $user->patientProfile->update($validated);  // ❌ SIN VALIDAR ACCESO
    }
}
```

Un médico puede modificar el perfil de **cualquier paciente**, no solo los asignados a él.

**Impacto:** Violación de privacidad médica. Médico A puede sabotear datos de Médico B.

**Solución:**
```php
public function update(Request $request, $id) {
    $clinicianId = Auth::id();
    
    // ✓ VERIFICAR QUE EL PACIENTE ESTÉ ASIGNADO AL MÉDICO
    $isAssigned = PatientClinician::where('clinician_id', $clinicianId)
        ->where('patient_id', $id)
        ->exists();
    
    if (!$isAssigned) {
        return redirect()->back()->withErrors(
            ['error' => 'No tienes acceso a este paciente']
        );
    }
    
    $user = User::find($id);
    if ($user->patientProfile) {
        $user->patientProfile->update($validated);
    }
}
```

---

### #2 Type Juggling en RoleMiddleware

**Archivo:** `app/Http/Middleware/RoleMiddleware.php` (línea 16-28)  
**Prioridad:** CRÍTICA  
**Effort:** 20 minutos  

**Problema:**
```php
$roleId = (string) $user->role_id;  // ❌ CONVIERTE A STRING
if ($roleId === '3') {              // ❌ COMPARACIÓN DÉBIL
    return $next($request);
}
if (in_array($roleId, $roles, true)) {  // ❌ ARRAY INCONSISTENTE
    return $next($request);
}
```

Type juggling en PHP puede permitir bypasses.

**Solución:**
```php
$roleId = (int) $user->role_id;  // ✓ MANTENER COMO INT

// Admin siempre tiene acceso
if ($roleId === 3) {
    return $next($request);
}

if (empty($roles)) {
    return $next($request);
}

// ✓ CONVERTIR ESPERADOS A INT PARA COMPARACIÓN CONSISTENTE
$rolesInt = array_map(fn($role) => (int) $role, $roles);

if (in_array($roleId, $rolesInt, true)) {
    return $next($request);
}
```

---

### #3 Divulgación de Errores Internos

**Archivo:** `app/Http/Controllers/HealthRecordsController.php` (línea 65-69)  
**Prioridad:** CRÍTICA  
**Effort:** 15 minutos  

**Problema:**
```php
} catch (\Exception $e) {
    return response()->json([
        'message' => 'Error: ' . $e->getMessage()  // ❌ EXPONE DETALLES
    ], 500);
}
```

**Solución:**
```php
} catch (\Exception $e) {
    // ✓ LOG PARA ADMINISTRADORES
    Log::error('Health record creation failed', [
        'user_id' => Auth::id(),
        'exception' => $e
    ]);
    
    // ✓ MENSAJE GENÉRICO AL CLIENTE
    return response()->json([
        'success' => false,
        'message' => 'Error al procesar la solicitud'
    ], 500);
}
```

---

### #4 Sin Rate Limiting en Endpoints de Salud

**Archivo:** `routes/web.php` (línea 36-41)  
**Prioridad:** CRÍTICA  
**Effort:** 30 minutos  

**Problema:**
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/health-records', [...])  // ❌ SIN THROTTLE
});
```

Un atacante puede spam 1000s de registros en segundos.

**Solución:**
```php
Route::middleware(['auth', 'verified', 'throttle:60,1'])->group(function () {
    Route::post('/health-records', [...])  // ✓ 60 requests por minuto
});

// O crear middleware personalizado
'health-records-limit' => \App\Http\Middleware\ThrottleHealthRecords::class,
```

---

### #5 Timezone Handling Inconsistente

**Archivos:** `HealthRecordsController`, `ReportsController`, `GlucoseService`  
**Prioridad:** CRÍTICA  
**Effort:** 1 hora  

**Problema:**
```php
// HealthRecordsController
'recorded_at' => now()  // ❌ SIN TIMEZONE

// ReportsController
$fromDate = Carbon::createFromFormat('Y-m-d', $dateFrom, 'America/Mexico_City')  // ✓

// GlucoseService
->where('recorded_at', '>=', now()->subDays(30))  // ❌ SIN TIMEZONE
```

**Solución:**
```php
// En config/app.php
'timezone' => 'America/Mexico_City',

// Siempre usar:
'recorded_at' => now('America/Mexico_City')

// Queries:
$thirtyDaysAgo = now('America/Mexico_City')->subDays(30);
$records = HealthRecord::where('recorded_at', '>=', $thirtyDaysAgo)->get();
```

---

### #6 Exposición de Datos Sensibles en Inertia Props

**Archivo:** `app/Http/Middleware/HandleInertiaRequests.php` (línea 46-56)  
**Prioridad:** CRÍTICA  
**Effort:** 15 minutos  

**Problema:**
```php
'auth' => [
    'user' => [
        ...
        'email_verified_at',  // ❌ INFORMACIÓN DE AUTH
        'two_factor_secret',  // ❌ CRÍTICA
    ]
]
```

**Solución:**
```php
'auth' => [
    'user' => $request->user() ? [
        'id' => $request->user()->id,
        'name' => $request->user()->name,
        'email' => $request->user()->email,
        'role_id' => (int) $request->user()->role_id,
        'status' => $request->user()->status,
        // ✓ SOLO INFORMACIÓN PÚBLICA
    ] : null,
]
```

---

### #7 Validación Débil de Pacientes en ReportsController

**Archivo:** `app/Http/Controllers/ReportsController.php` (línea 74, 192)  
**Prioridad:** CRÍTICA  
**Effort:** 45 minutos  

**Problema:**
```php
// LÍNEA 74: Con casting
if (!in_array((int) $selectedPatientId, $patientIds)) { ... }

// LÍNEA 192: Sin casting ❌
if (!in_array($selectedPatientId, $query)) { ... }
```

**Solución:**
```php
// Crear función helper
private function validatePatientAccess($patientId) {
    $patientIds = PatientClinician::where('clinician_id', Auth::id())
        ->pluck('patient_id')
        ->map(fn($id) => (int) $id)
        ->toArray();
    
    if (!in_array((int) $patientId, $patientIds, true)) {
        abort(403, 'Paciente no asignado');
    }
}

// Usar en todos los métodos
public function getMeasurements(Request $request) {
    $this->validatePatientAccess($request->query('patientId'));
    // ...
}
```

---

### #8 Scheduler Sin Error Handling

**Archivo:** `routes/console.php` (línea 12-13)  
**Prioridad:** CRÍTICA  
**Effort:** 30 minutos  

**Problema:**
```php
Schedule::call(function () {
    DB::select('SELECT 1');  // ❌ SIN TRY-CATCH
})->everyMinute();
```

Si la BD falla, no hay alerta y el heartbeat de Supabase muere silenciosamente.

**Solución:**
```php
Schedule::call(function () {
    try {
        DB::select('SELECT 1');
        Log::info('Database heartbeat successful');
    } catch (\Exception $e) {
        Log::error('Database heartbeat failed', ['error' => $e->getMessage()]);
        // Notificar administrador (email, Slack, etc.)
        // Mail::to(config('app.admin_email'))->send(new HeartbeatFailed());
    }
})->everyMinute();
```

---

### #9 Scheduler Sin Supervisor/Restart

**Archivo:** `start.sh` (línea 51)  
**Prioridad:** CRÍTICA  
**Effort:** 1 hora  

**Problema:**
```bash
php artisan schedule:work &  # ❌ BACKGROUND, SIN RESTART SI MUERE
```

Si el proceso muere (segfault, memory, etc.), no se reinicia.

**Solución:**
```bash
# Opción 1: Usar Supervisor (recomendado)
# /etc/supervisor/conf.d/scheduler.conf
[program:app-scheduler]
process_name=%(program_name)s_%(process_num)02d
command=php artisan schedule:work
autostart=true
autorestart=true
numprocs=1

# Opción 2: En Docker Compose
# services:
#   scheduler:
#     image: app
#     command: php artisan schedule:work
#     restart: always

# Opción 3: En Render (Deploy Hook)
# before-restart: php artisan schedule:work --daemon &
```

---

## 🟡 PROBLEMAS MEDIA PRIORIDAD

### #10 Problema N+1 en UsersController::index

**Archivo:** `app/Http/Controllers/UsersController.php` (línea 76-105)  
**Prioridad:** MEDIA  
**Effort:** 1.5 horas  

**Problema:**
```php
->through(fn($user) => [
    'riskLevel' => $this->calculateRiskLevel($user),  // ❌ QUERY POR USUARIO
    'tirPercentage' => $this->glucoseService->calculateTir($user),
    'lastRecord' => $this->getLastRecord($user),
])

// 5 usuarios × 3 queries = 15+ queries adicionales
```

**Solución:**
```php
$users = User::whereIn('id', $patientIds)
    ->with([
        'patientProfile',
        'healthRecords' => fn($q) => $q->latest('recorded_at')->limit(1)
    ])
    ->paginate(5)
    ->through(fn($user) => [
        'id' => $user->id,
        'riskLevel' => $this->calculateFromData($user),  // ✓ Datos ya cargados
        'tirPercentage' => $this->glucoseService->calculateTir($user),
        'lastRecord' => $user->healthRecords->first(),
    ]);
```

---

### #11 Queries Repetidas en ReportsController::getSummary

**Archivo:** `app/Http/Controllers/ReportsController.php` (línea 218-264)  
**Prioridad:** MEDIA  
**Effort:** 2 horas  

**Problema:**
```php
->map(function ($patientClinician) {
    $lastRecord = HealthRecord::where('patient_id', $patient->id)
        ->orderBy('recorded_at', 'desc')
        ->first();  // ❌ QUERY POR PACIENTE
    
    $riskLevel = $this->calculateRiskLevel($patient->id);  // ❌ OTRA QUERY
    $tir = $this->calculateTIR($patient->id);  // ❌ OTRA QUERY
})

// 100 pacientes = 400+ queries
```

**Solución:**
```php
$patients = PatientClinician::where('clinician_id', Auth::id())
    ->with([
        'patient.patientProfile',
        'patient.healthRecords' => fn($q) => $q->latest('recorded_at')
    ])
    ->get()
    ->map(function ($pc) {
        $lastRecord = $pc->patient->healthRecords->first();
        return [
            'id' => $pc->patient->id,
            'riskLevel' => $this->calculateFromData($lastRecord, $pc->patient->patientProfile),
        ];
    });
```

---

### #12 Validación Incompleta en ConfigurationProfileController

**Archivo:** `app/Http/Controllers/ConfigurationProfileController.php` (línea 30-36)  
**Prioridad:** MEDIA  
**Effort:** 45 minutos  

**Problema:**
```php
$validated = $request->validate([
    'glucose_min' => 'required|numeric|min:0',      // ❌ MIN 0?
    'glucose_max' => 'required|numeric|min:0',      // ❌ SIN MAX
    'systolic_max' => 'required|numeric|min:0',     // ❌ PRESIÓN IRREAL
    'diastolic_max' => 'required|numeric|min:0',
    'type_diabetes' => 'required|string',  // ❌ SIN ENUM
]);
```

**Solución:**
```php
$validated = $request->validate([
    'glucose_min' => 'required|numeric|min:40|max:250',    // Realista
    'glucose_max' => 'required|numeric|min:50|max:300',
    'systolic_max' => 'required|numeric|min:80|max:200',   // Clínico
    'diastolic_max' => 'required|numeric|min:50|max:130',
    'type_diabetes' => 'required|in:Tipo 1,Tipo 2,Gestacional',
]);

// Validación cruzada
$validator->after(function ($validator) use ($validated) {
    if ($validated['glucose_min'] >= $validated['glucose_max']) {
        $validator->errors()->add('glucose', 'Min debe ser menor que Max');
    }
});
```

---

### #13-15 [Otros problemas MEDIA omitidos por brevedad]

### #13 Sin Validación de Límites en HealthRecordsController
### #14 Sin Pagination en ReportsController
### #15 Formato Inconsistente de Respuestas JSON

*Ver archivo completo para detalles...*

---

## 🟢 PROBLEMAS BAJA PRIORIDAD

### #26 Métodos Privados Duplicados

**Archivo:** ReportsController + GlucoseService  
**Prioridad:** BAJA  
**Effort:** 30 minutos  

**Problema:**
```php
// ReportsController
private function calculateTIR($patientId) { ... }

// GlucoseService
public function calculateTir($user) { ... }  // ❌ DUPLICADO
```

**Solución:** Usar GlucoseService en lugar de método privado.

---

### #27 Sin Type Hints

**Archivo:** DashboardController  
**Prioridad:** BAJA  
**Effort:** 15 minutos  

**Problema:**
```php
public function getUsers() {  // ❌ SIN TIPO DE RETORNO
public function updateUserStatus(Request $request, User $user) {  // ❌
```

**Solución:**
```php
public function getUsers(): JsonResponse
public function updateUserStatus(Request $request, User $user): JsonResponse
```

---

## 📋 Próximos Pasos (3 días)

### Día 1: Críticas de Seguridad (3-4 horas)
- [ ] Fix #1 - Authorization bypass
- [ ] Fix #2 - Type juggling
- [ ] Fix #3 - Error disclosure
- [ ] Fix #4 - Rate limiting
- [ ] Fix #5 - Timezone consistency

### Día 2: Más Seguridad + Autorización (2.5 horas)
- [ ] Fix #6 - Expose data
- [ ] Fix #7 - Weak validation
- [ ] Fix #8 - Scheduler error
- [ ] Fix #9 - Scheduler restart

### Día 3: Rendimiento (2 horas)
- [ ] Fix #10 - N+1 queries
- [ ] Fix #11 - Repeated queries
- [ ] Agregar índices BD

---

**Última actualización:** 13 de Septiembre, 2026

