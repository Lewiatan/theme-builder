#!/bin/bash
set -e

# This script runs when the postgres container is first initialized
# It creates the test database alongside the main database

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create test database if it doesn't exist
    SELECT 'CREATE DATABASE builder_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'builder_test')\gexec
EOSQL

echo "✅ Test database 'builder_test' created"
