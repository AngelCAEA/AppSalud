# 📐 ARQUITECTURA DE AppSalud

Documento que describe la arquitectura del sistema, flujos de datos y relaciones entre componentes.

## Tabla de Contenidos

1. [Diagrama General](#diagrama-general)
2. [Capas de la Aplicación](#capas-de-la-aplicación)
3. [Flujo de Autenticación y Roles](#flujo-de-autenticación-y-roles)
4. [Relaciones de Modelos](#relaciones-de-modelos)
5. [Flujos de Negocio](#flujos-de-negocio)
6. [Infraestructura](#infraestructura)

---

## Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Cliente)                      │
│          Paciente/Médico/Admin → React 19 + TypeScript       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  INERTIA.JS (Bridge)                          │
│  Conecta React ↔ Laravel sin necesidad de API REST           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Routing    │ │  Middleware  │ │ Validation   │
│ routes/web   │ │   (Auth)     │ │  (FormReq)   │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  Controllers (Lógica HTTP)                    │
│  DashboardController, UsersController, ReportsController...  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Services   │ │    Models    │ │  Databases   │
│ GlucoseServ. │ │    (ORM)     │ │ PostgreSQL   │
│ GetChartData │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   health_    │ │ patient_     │ │  clinical_   │
│   records    │ │  profiles    │ │   notes      │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Capas de la Aplicación

### 1️⃣ Capa de Presentación (Frontend)

**Ubicación:** `resources/js/`

**Componentes:**
- **Pages** - Componentes de página (corresponden a rutas)
  - `Pacient/pacient.tsx` - Dashboard del paciente
  - `users.tsx` - Panel médico
  - `reports.tsx` - Reportes
  - `dashboard.tsx` - Admin

- **Components** - Componentes reutilizables
  - `app-sidebar.tsx` - Navegación
  - Componentes Radix UI (Dialog, Select, etc.)

**Tecnologías:**
- React 19 - Componentes UI
- TypeScript - Tipado estático
- Tailwind CSS - Estilos
- Inertia.js - Comunicación con backend

**Responsabilidad:**
- Renderizar interfaz de usuario
- Capturar entrada de usuario
- Mostrar datos del servidor
- Hacer requests al backend

---

### 2️⃣ Capa de Routing y Middleware

**Ubicación:** `routes/` y `app/Http/Middleware/`

**Routes:**
```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pacient', [...])->name('pacient');
});

Route::middleware(['auth', 'verified', 'role:2'])->group(function () {
    Route::get('/users', [UsersController::class, 'index'])->name('users');
});
```

**Middleware:**
- `auth` - Usuario autenticado
- `verified` - Email verificado
- `role:X` - Validar rol de usuario
- `HandleInertiaRequests` - Pasar datos a React

**Responsabilidad:**
- Definir rutas disponibles
- Proteger rutas por autenticación y roles
- Pasar datos compartidos a frontend

---

### 3️⃣ Capa de Controladores

**Ubicación:** `app/Http/Controllers/`

**Estructura típica:**
```php
class UsersController extends Controller {
    public function index(Request $request) {
        // 1. Validar entrada
        $search = $request->input('search');
        
        // 2. Obtener datos
        $users = User::where(...)->get();
        
        // 3. Procesar lógica de negocio
        $stats = $this->calculateStats($users);
        
        // 4. Retornar vista Inertia
        return Inertia::render('users', [
            'users' => $users,
            'stats' => $stats,
        ]);
    }
}
```

**Controladores principales:**
- `DashboardController` - Admin dashboard
- `UsersController` - Panel médico y pacientes
- `ReportsController` - Reportes
- `HealthRecordsController` - CRUD de mediciones
- `ConfigurationProfileController` - Configurar perfiles

**Responsabilidad:**
- Recibir requests HTTP
- Validar entrada
- Llamar a servicios/modelos
- Retornar respuestas (vistas o JSON)

---

### 4️⃣ Capa de Servicios y Lógica de Negocio

**Ubicación:** `app/Services/`

**Ejemplo - GlucoseService:**
```php
class GlucoseService {
    public function calculateTir(User $user): int {
        // Lógica para calcular Tiempo en Rango
        $records = HealthRecord::where('patient_id', $user->id)
            ->where('glucose_value', '!=', null)
            ->where('recorded_at', '>=', now()->subDays(30))
            ->get();
        
        $inRange = $records->filter(fn($r) => 
            $r->glucose_value >= $min && $r->glucose_value <= $max
        )->count();
        
        return round(($inRange / $records->count()) * 100);
    }
}
```

**Servicios existentes:**
- `GlucoseService` - Cálculos de glucosa y TiR
- `GetChartData` - Preparación de datos para gráficas

**Responsabilidad:**
- Encapsular lógica reutilizable
- Separar lógica de negocio de controladores
- Facilitar testing

---

### 5️⃣ Capa de Modelos (ORM)

**Ubicación:** `app/Models/`

**Estructura típica:**
```php
class HealthRecord extends Model {
    protected $table = 'health_records';
    
    protected $fillable = [
        'patient_id', 'type', 'glucose_value',
        'systolic', 'diastolic', 'pulse',
        'context_id', 'recorded_at'
    ];
    
    // Relaciones
    public function patient() {
        return $this->belongsTo(User::class, 'patient_id');
    }
    
    public function context() {
        return $this->belongsTo(MeasurementContext::class, 'context_id');
    }
}
```

**Modelos principales:**
- `User` - Usuarios (Paciente, Médico, Admin)
- `Role` - Roles del sistema
- `HealthRecord` - Mediciones médicas
- `PatientProfile` - Perfil de salud personalizado
- `PatientClinician` - Relación Paciente-Médico
- `ClinicalNote` - Notas médicas

**Responsabilidad:**
- Mapear tablas BD a objetos PHP
- Definir relaciones
- Validaciones
- Scopes para queries comunes

---

### 6️⃣ Capa de Base de Datos

**Ubicación:** `database/migrations/`

**Migraciones principales:**
```php
// Crear tabla users
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->unsignedBigInteger('role_id');
    $table->boolean('status')->default(true);
    $table->timestamps();
});

// Crear tabla health_records
Schema::create('health_records', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('patient_id');
    $table->enum('type', ['glucose', 'blood_pressure']);
    $table->decimal('glucose_value', 6, 2)->nullable();
    $table->integer('systolic')->nullable();
    $table->integer('diastolic')->nullable();
    $table->integer('pulse')->nullable();
    $table->unsignedBigInteger('context_id')->nullable();
    $table->timestamp('recorded_at');
    $table->timestamps();
});
```

**Base de datos:**
- PostgreSQL 16
- Tablas normalizadas
- Índices en columnas frecuentes
- Relaciones con Foreign Keys

**Responsabilidad:**
- Persistencia de datos
- Integridad referencial
- Performance mediante índices

---

## Flujo de Autenticación y Roles

```
┌──────────────────────────────────────────┐
│   Usuario Accede a http://localhost      │
└──────────────────────────┬───────────────┘
                           │
                    ¿Sesión válida?
                    │
        ┌───────────┴───────────┐
        │ NO                    │ SÍ
        ↓                       ↓
┌──────────────────┐    ┌──────────────────┐
│ Redirige a       │    │ Middleware       │
│ /login           │    │ 'auth'           │
└──────────────────┘    └────────┬─────────┘
                                 │
                        ¿Email verificado?
                        │
                ┌───────┴────────┐
                │ NO             │ SÍ
                ↓                ↓
        ┌─────────────────┐   ┌──────────────┐
        │ Redirige a      │   │ Middleware   │
        │ /verify-email   │   │ 'verified'   │
        └─────────────────┘   └────────┬─────┘
                                       │
                              ¿Tiene permiso (rol)?
                              │
                        ┌─────┴─────┐
                        │ NO        │ SÍ
                        ↓           ↓
                    ┌────────┐  ┌─────────────────┐
                    │ 403    │  │ Renderiza Página│
                    │ Forbid │  │ Inertia + React │
                    └────────┘  └─────────────────┘
```

### Ejemplo: Médico Accede a /users

```
1. Usuario con role_id=2 accede a /users
   ↓
2. Middleware 'auth' verifica: ¿está autenticado?
   ↓ SÍ
3. Middleware 'verified' verifica: ¿email verificado?
   ↓ SÍ
4. Middleware 'role:2' verifica: ¿role_id === 2?
   ↓ SÍ
5. UsersController@index se ejecuta
   ↓
6. Obtiene pacientes asignados (relación patient_clinician)
   ↓
7. Retorna Inertia::render('users', [...])
   ↓
8. React renderiza página con datos
```

---

## Relaciones de Modelos

### Diagrama ER (Modelo Entidad-Relación)

```
┌─────────────┐              ┌─────────────┐
│   Role      │              │   User      │
├─────────────┤        1  ┌──┼─────────────┤
│ id (PK)     │────────────│  │ id (PK)     │
│ name        │           │  │ name        │
│ estatus     │           │  │ email       │
└─────────────┘           │  │ password    │
                          │  │ role_id (FK)│
                          └─→│ status      │
                             └─────────────┘
                                  │
                    ┌─────────────┬┴──────────────┐
                    │             │               │
                    ↓             ↓               ↓
              ┌──────────┐  ┌──────────┐  ┌──────────────┐
              │ Patient  │  │ Clinician│  │  Clinical    │
              │ Profile  │  │Relat.    │  │  Note        │
              ├──────────┤  ├──────────┤  ├──────────────┤
              │ id (PK)  │  │ id       │  │ id (PK)      │
              │ user_id  │  │ patient_ │  │ patient_id   │
              │ glucose_ │  │ id (FK)  │  │ clinician_id │
              │ min/max  │  │ clinici_ │  │ content      │
              │ systolic │  │ an_id(FK)   │ is_urgent    │
              │ diastolic│  └──────────┘  └──────────────┘
              └──────────┘

              ┌─────────────────────┐
              │  HealthRecord       │
              ├─────────────────────┤
              │ id (PK)             │
              │ patient_id (FK)     │
              │ type                │
              │ glucose_value       │
              │ systolic/diastolic  │
              │ pulse               │
              │ context_id (FK)     │
              │ recorded_at         │
              └─────────────────────┘
                       │
                       │
              ┌────────↓────────┐
              │ MeasurementCtx  │
              ├─────────────────┤
              │ id (PK)         │
              │ name            │
              │ (En Ayunas,     │
              │  Post-comida,   │
              │  Aleatorio)     │
              └─────────────────┘
```

### Relaciones SQL

**User → Role (1 a N)**
```php
$user->role()  // belongsTo
$role->users() // hasMany
```

**User → PatientProfile (1 a 1)**
```php
$user->patientProfile()     // hasOne
$profile->user()            // belongsTo
```

**User → HealthRecord (1 a N, como paciente)**
```php
$user->healthRecords()      // hasMany (patient_id)
$record->patient()          // belongsTo
```

**User ↔ User (N a N, vía patient_clinician)**
```php
$patient->clinicians()      // belongsToMany (médicos asignados)
$clinician->patients()      // belongsToMany (pacientes asignados)
```

**User → ClinicalNote (1 a N)**
```php
$user->clinicalNotesAsPatient()  // hasMany (patient_id)
$user->clinicalNotesAsClinic()   // hasMany (clinician_id)
$note->patient()                 // belongsTo
$note->clinician()               // belongsTo
```

**HealthRecord → MeasurementContext (N a 1)**
```php
$record->context()          // belongsTo
$context->healthRecords()   // hasMany
```

---

## Flujos de Negocio

### 1️⃣ Flujo: Paciente Registra Medición

```
USUARIO
  │ Accede a /pacient
  ↓
FRONTEND (React)
  │ Muestra RegisterModal
  │ Usuario ingresa: glucosa=120, contexto="Post-comida"
  │ Click en "Guardar"
  ↓
INERTIA (Bridge)
  │ POST /health-records (Form data)
  ↓
MIDDLEWARE
  │ 'auth' ✓, 'verified' ✓
  ↓
HEALTHRECORDSCONTROLLER::store()
  │ Validar input:
  │   - glucose_value entre 40-400 ✓
  │   - type en ['glucose', 'blood_pressure'] ✓
  │   - context_id existe en BD ✓
  │ patient_id = Auth::id()
  ↓
MODELO (HealthRecord)
  │ HealthRecord::create([...])
  │ Guarda en BD
  ↓
BASE DE DATOS
  │ INSERT INTO health_records VALUES (...)
  │ recorded_at = NOW()
  ↓
RESPUESTA JSON
  │ {success: true, data: {id: 123, glucose_value: 120, ...}}
  ↓
FRONTEND (React)
  │ Cierra modal
  │ Actualiza lista de registros
  │ Muestra toast "Guardado exitosamente"
```

### 2️⃣ Flujo: Médico Ve Pacientes Asignados

```
USUARIO (Doctor)
  │ Accede a /users
  ↓
MIDDLEWARE
  │ Valida: auth ✓, verified ✓, role:2 ✓
  ↓
USERSCONTROLLER::index()
  │
  │ 1. Obtener pacientes asignados:
  │    SELECT * FROM patient_clinician WHERE clinician_id = 5
  │    Retorna: pacientes_ids = [10, 15, 20]
  │
  │ 2. Obtener datos de pacientes:
  │    SELECT * FROM users WHERE id IN (10, 15, 20)
  │    SELECT * FROM patient_profiles WHERE user_id IN (10, 15, 20)
  │
  │ 3. Por cada paciente, calcular:
  │    - Último registro de glucosa
  │    - Comparar vs perfil → determinar RIESGO (Alto/Bajo)
  │    - Calcular TiR (últimos 30 días)
  │
  │ 4. Paginar (5 por página)
  ↓
INERTIA::render('users', [
  'users' => [...],  // con riesgo, TiR, etc.
  'totalPatients' => 3,
  'highRisk' => 1,
  'noRecords' => 0,
])
  ↓
FRONTEND (React)
  │ Renderiza tabla con pacientes
  │ Muestra KPIs: Total=3, Riesgo Alto=1
  │ Usuario puede:
  │   - Filtrar por riesgo
  │   - Clickear paciente → /details/{id}
  │   - Ver gráfica de distribución
```

### 3️⃣ Flujo: Admin Asigna Rol

```
ADMIN
  │ Accede a /dashboard
  │ Ve tabla de usuarios
  │ Selecciona usuario "Juan" (rol 1=Paciente)
  │ Cambia a rol 2 (Médico)
  │ Click "Guardar"
  ↓
FRONTEND
  │ PATCH /dashboard/users/{user_id}/role
  │ Body: {role_id: 2}
  ↓
DASHBOARDCONTROLLER::assignRole()
  │ Validar: role_id existe en BD ✓
  │ $user = User::find($id)
  │ $user->update(['role_id' => 2])
  ↓
BASE DE DATOS
  │ UPDATE users SET role_id = 2 WHERE id = {id}
  ↓
RESPUESTA
  │ {success: true, message: "Rol asignado"}
  ↓
FRONTEND
  │ Actualiza tabla
  │ Muestra toast "Rol actualizado"
  │ Próxima vez que Juan inicie sesión, verá opciones de Médico
```

---

## Infraestructura

### Contenedores Docker

```
┌─────────────────────────────────────────┐
│       Docker Compose (Orquestación)      │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────┐  ┌────────────┐         │
│  │   Nginx    │  │   Laravel  │         │
│  │ (puerto    │  │   (puerto  │         │
│  │  80/443)   │  │   9000)    │         │
│  └────────────┘  └────────────┘         │
│        ↓               ↓                 │
│  ┌──────────────────────────┐          │
│  │   PostgreSQL (puerto     │          │
│  │   5432)                  │          │
│  └──────────────────────────┘          │
│                                         │
│  ┌──────────────────────────┐          │
│  │   Redis (puerto 6379)    │          │
│  └──────────────────────────┘          │
│                                         │
│  ┌──────────────────────────┐          │
│  │  Mailhog (puerto 1025)   │          │
│  └──────────────────────────┘          │
│                                         │
└─────────────────────────────────────────┘
```

### Flujo en Producción (Render)

```
Usuario
  │ https://appsalud.onrender.com
  ↓
Render CDN
  │ Distribución de assets
  ↓
Web Server (Render)
  │ PHP 8.2 + Laravel 12
  ↓
PostgreSQL (Render Database)
  │ Base de datos persistente
  ↓
Redis (Opcional, para caché)
```

---

## Patrones de Arquitectura

### MVC (Model-View-Controller)
- **Model** - `app/Models` (Eloquent ORM)
- **View** - `resources/js` (React components)
- **Controller** - `app/Http/Controllers`

### Service Layer
- Servicios en `app/Services/`
- Encapsulan lógica reutilizable
- Ejemplo: `GlucoseService::calculateTir()`

### Repository Pattern (Implícito)
- Modelos actúan como repositories
- `HealthRecord::where(...)->get()`

### Dependency Injection
```php
class UsersController extends Controller {
    public function __construct(GlucoseService $glucoseService) {
        $this->glucoseService = $glucoseService;
    }
}
```

---

**Última actualización:** 13 de Septiembre, 2026
