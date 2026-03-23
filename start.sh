#!/bin/bash
set -e

echo "==> Generando APP_KEY..."
php artisan key:generate --force

echo "==> Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "==> Corriendo migraciones..."
php artisan migrate --force

echo "==> Iniciando SSR..."
php artisan inertia:start-ssr &

echo "==> Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}