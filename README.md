# 🏥 AppSalud - Sistema de Monitoreo de Salud

Sistema integral de telemedicina para monitoreo de glucosa y presión arterial, conectando pacientes con médicos y administradores en una plataforma segura y escalable.

## 📋 Contenido Rápido

- Descripción del proyecto
- Stack tecnológico (Laravel 12 + React 19)
- Estructura de carpetas
- Roles y permisos (Paciente, Médico, Admin)
- Instalación local con Docker
- Despliegue en Render
- Documentación completa

## Descripción del Proyecto

**AppSalud** es una aplicación web moderna para monitoreo remoto de pacientes con enfermedades crónicas (diabetes e hipertensión).

### Funcionalidades Principales

**Para Pacientes:**
- Dashboard con últimas mediciones
- Registro de glucosa, presión arterial y pulso
- Histórico completo con filtros
- Análisis de tendencias
- Perfil de salud personalizado

**Para Médicos:**
- Panel de pacientes asignados
- Clasificación automática por riesgo
- Cálculo de TiR (Tiempo en Rango)
- Reportes detallados
- Configuración de rangos personalizados

**Para Administradores:**
- Gestión de usuarios
- Asignación de roles
- Auditoría de cambios
- Monitoreo global

## Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Base de Datos | PostgreSQL 16 |
| Frontend | React 19, TypeScript |
| Adaptador | Inertia.js 2.1 |
| Estilos | Tailwind CSS 4 |
| Componentes UI | Radix UI |
| Gráficas | Recharts |
| Bundler | Vite 7 |
| DevOps | Docker, Render |

## Estructura de Carpetas

```
AppSalud/
├── app/                    # Backend Laravel
│   ├── Http/Controllers/   # Controladores
│   ├── Models/             # Modelos BD
│   ├── Services/           # Servicios
│   └── Http/Middleware/    # Middlewares
├── database/               # Migraciones y seeders
├── resources/js/           # Frontend React
│   ├── pages/              # Páginas
│   └── components/         # Componentes
├── routes/                 # Rutas
├── config/                 # Configuración
├── docker-compose.yml      # Orquestación
├── vite.config.ts          # Configuración Vite
└── README.md               # Este archivo
```

## Roles y Permisos

### 👤 Paciente (Rol 1)
- Ruta: `/pacient`
- Ver dashboard personal
- Registrar mediciones
- Ver histórico propio

### 👨‍⚕️ Médico (Rol 2)
- Rutas: `/users`, `/reports`, `/configuration`
- Ver pacientes asignados
- Generar reportes
- Configurar perfiles de pacientes

### 🔑 Administrador (Rol 3)
- Rutas: `/dashboard`, `/roles`
- Gestionar usuarios
- Asignar roles
- Ver auditoría

## Instalación Local

### Requisitos
- Docker & Docker Compose
- Git

### Pasos Rápidos

```bash
# Clonar
git clone https://github.com/AngelCAEA/AppSalud.git
cd AppSalud

# Configurar
cp .env.example .env

# Instalar dependencias
docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html \
  laravelsail/php82-composer:latest composer install --ignore-platform-reqs

# Generar clave
./vendor/bin/sail artisan key:generate

# Levantar
docker-compose up -d

# Migraciones
docker-compose exec app php artisan migrate:fresh --seed

# Assets
docker-compose exec app npm install
docker-compose exec app npm run dev
```

Acceder a: http://localhost:8000

### Credenciales de Prueba

```
PACIENTE: paciente@example.com / password
MÉDICO: doctor@example.com / password
ADMIN: admin@example.com / password
```

## Despliegue en Render

### 1. Preparar Repositorio
```bash
git push origin main
```

### 2. Crear en Render
- Conectar GitHub
- Seleccionar repositorio
- Runtime: Docker

### 3. Agregar Base de Datos
- PostgreSQL en Render
- Copiar credenciales

### 4. Variables de Entorno
```
APP_KEY=base64:...
DB_HOST=generado.render.com
DB_PASSWORD=generado
```

### 5. Migraciones
```bash
php artisan migrate --force
```

## Comandos Útiles

```bash
# Logs en tiempo real
docker-compose logs -f app

# Terminal del contenedor
docker-compose exec app bash

# Migraciones
docker-compose exec app php artisan migrate

# Tests
docker-compose exec app php artisan test

# Detener
docker-compose down
```

## Documentación Completa

Para información más detallada:

- **[📐 docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md)**
  - Diagrama de arquitectura
  - Flujo de datos
  - Relaciones entre modelos
  - Explicación de cada capa

- **[🔒 docs/SEGURIDAD.md](./docs/SEGURIDAD.md)**
  - 30 problemas de seguridad identificados
  - Soluciones detalladas
  - Prioridades (Alta/Media/Baja)
  - Ejemplos de código

- **[🚀 docs/MEJORAS_FUTURAS.md](./docs/MEJORAS_FUTURAS.md)**
  - Plan de acción de 3 días
  - Optimizaciones de rendimiento
  - Features por implementar

## Configuración Importante

### Timezone
```env
APP_TIMEZONE=America/Mexico_City
```

### Base de Datos
```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_DATABASE=appsalud
```

### Mail (Desarrollo)
```env
MAIL_DRIVER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
```

## Contacto

- GitHub: https://github.com/AngelCAEA/AppSalud
- Issues: [Reportar bugs](https://github.com/AngelCAEA/AppSalud/issues)

---

**Versión:** 1.0.0 | **Última actualización:** 13 de Septiembre, 2026
