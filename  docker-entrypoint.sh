#!/bin/bash
set -e

# Generar APP_KEY si no existe
php artisan key:generate --force

# Limpiar cachés
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Migraciones
php artisan migrate --force

# Seeders (si necesitas datos de prueba)
php artisan db:seed --force

# Permisos
chmod -R 775 storage bootstrap/cache

# Arrancar Apache
apache2-foreground