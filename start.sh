#!/bin/bash
set -e

echo "==> Creando .env desde variables de entorno..."
cat > /var/www/html/.env << EOF
APP_NAME=AppSalud
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY:-}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}
ASSET_URL=${ASSET_URL:-${APP_URL}}

TRUSTED_PROXIES=*
TRUSTED_HOSTS=*

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

SESSION_DRIVER=${SESSION_DRIVER:-database}
SESSION_DOMAIN=${SESSION_DOMAIN:-}
SESSION_SECURE_COOKIE=true
SESSION_LIFETIME=120
SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-}

CACHE_STORE=${CACHE_STORE:-file}
CACHE_DRIVER=${CACHE_DRIVER:-file}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}

VITE_APP_URL=${APP_URL}
EOF

echo "==> Generando APP_KEY..."
php artisan key:generate --force

echo "==> Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "==> Corriendo migraciones..."
php artisan migrate --force || true

echo "==> Iniciando SSR..."
php artisan inertia:start-ssr &

echo "==> Iniciando servidor..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}