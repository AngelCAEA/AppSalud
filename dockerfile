FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Dependencias PHP
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Dependencias JS y compilar (incluye SSR)
RUN npm install && npm run build

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD php artisan key:generate --force && \
    php artisan config:clear && \
    php artisan cache:clear && \
    php artisan migrate --force && \
    php artisan inertia:start-ssr & \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
