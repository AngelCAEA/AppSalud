#!/bin/bash
set -e

# Generar APP_KEY si no existe
php artisan key:generate --force

# Limpiar y cachear configuración
php artisan config:clear
php artisan cache:clear

# Correr migraciones (opcional, quita si no quieres auto-migrar)
php artisan migrate --force

# Arrancar Apache en foreground
apache2-foreground