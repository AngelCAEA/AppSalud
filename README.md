Laravel 11 Herd 
Descargar Laravel herd con lo servicios
https://herd.laravel.com

* Docker

Este proyecto contiene una aplicación Laravel configurada para ejecutarse en contenedores Docker.

* Características

Laravel con PHP 8.4
Nginx como servidor web
Postgreqsl 16 como base de datos
Redis para cache y sesiones
Entorno de desarrollo optimizado
React para las vistas 

* Prerrequisitos

Docker
Docker Compose
Git

1. Construir y ejecutar los contenedores en la terminal VSCODE 

    docker-compose up --build -d

2. Configurar Laravel dentro del contenedor

    2.1.  Ejecuta dentro del contenedor de la app:

        docker exec -it tourcorridas-app bash
    
    2.2. Dentro del contenedor:

        php artisan key:generate
        php artisan migrate
        php artisan storage:link
        php artisan optimizexs

        npm install
        npm run dev (ejecutar en desarrollo)
        npm run build (compilar al terminar de desarrollar)

3. Verifica que los contenedores estén activos

    docker ps

4. Acceder a la aplicación

    Laravel (PHP) → http://localhost (si usas Herd, puedes desactivarlo para evitar conflicto)
    Vite (frontend hot reload) → http://localhost:5173
    PostgreSQL → localhost:5432 (usuario: laravel, password: appsalud)
    
    NOTA: Si aparece una pantalla negra el entrar al link dentro del contenedor escribir lo siguiente:
            docker exec -it tourcorridas-nginx curl http://localhost


Comandos útiles 

Acción	                        Comando
Levantar contenedores	        docker compose up -d
Detenerlos	                    docker compose down
Ver logs	                    docker compose logs -f
Entrar al contenedor PHP	    docker exec -it tourcorridas-app bash
Reiniciar solo la base	        docker compose restart db

* Localmente

Base de datos postgresql 

1. Descargar e instalar postgresql (MAC)

    brew install postgresql

2. Configurar el PATH después de instalar 

    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"

3. Iniciar el servicio
    
    brew services start postgresql

3. Crea la base de datos y el usuario

    createdb appsalud
    createuser laravel

    # Acceder a PostgreSQL
    psql postgres

    # Dentro de psql, configurar la contraseña:
    ALTER USER laravel WITH PASSWORD 'laravel';
    GRANT ALL PRIVILEGES ON DATABASE appsalud TO laravel;

4. Ejecutar las migraciones
    
    # Ejecutar todas las migraciones
    php artisan migrate

    # Ver el estado de las migraciones
    php artisan migrate:status
    
# Acceder a PostgreSQL
psql -h 127.0.0.1 -U laravel -d appsalud