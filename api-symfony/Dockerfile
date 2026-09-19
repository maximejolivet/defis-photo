FROM php:8.4-cli-alpine

RUN apk add --no-cache \
        libpng-dev libjpeg-turbo-dev freetype-dev imagemagick-dev libzip-dev icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd zip intl \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install imagick \
    && docker-php-ext-enable imagick \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-interaction --prefer-dist
COPY . .
RUN composer dump-autoload --optimize

EXPOSE 8002
CMD ["php", "-S", "0.0.0.0:8002", "-t", "public"]
