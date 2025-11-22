#!/bin/bash
set -e

# Install composer dependencies if composer.json exists
if [ -f composer.json ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction
fi

# Create var directories if they don't exist
mkdir -p var/cache var/log
chmod -R 775 var

# Execute the main command (php-fpm)
exec "$@"
