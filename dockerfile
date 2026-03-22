# Imagen base oficial de PHP con extensiones comunes
FROM php:8.4-fpm

# Instalar dependencias del sistema y extensiones de PHP
# Dependencias
RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git curl nodejs npm \
    && docker-php-ext-install pdo pdo_pgsql

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Copiar los archivos del proyecto
COPY . .

# Instalar dependencias de Laravel
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Configurar permisos para storage y cache
RUN chown -R www-data:www-data storage bootstrap/cache

# Exponer el puerto de PHP-FPM
EXPOSE 9000

#CMD ["php-fpm"]

# Comando para que Render detecte HTTP
CMD php artisan serve --host=0.0.0.0 --port=$PORT
