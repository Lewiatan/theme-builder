#!/bin/bash
set -e

# Skip composer install in CI - dependencies will be installed manually with cache
if [ -z "$SKIP_COMPOSER_INSTALL" ]; then
    # Install composer dependencies if composer.json exists
    if [ -f composer.json ]; then
        echo "Installing Composer dependencies..."
        composer install --no-interaction
    fi
else
    echo "Skipping composer install (SKIP_COMPOSER_INSTALL is set)"
fi

# Create var directories if they don't exist
mkdir -p var/cache var/log
chmod -R 775 var

# Execute the main command (php-fpm)
exec "$@"
