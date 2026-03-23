FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar primero solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copiar todo el proyecto
COPY . .

# Compilar assets DENTRO del contenedor
RUN npm run build

RUN composer run-script post-autoload-dump 2>/dev/null || true

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8000

CMD ["/usr/local/bin/start.sh"]