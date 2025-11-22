#!/bin/bash
set -e

echo "🔧 Setting up test database..."

# Run Phinx migrations on test environment
echo "📦 Running migrations on test database..."
docker compose exec backend vendor/bin/phinx migrate -e testing

# Run Phinx seeders on test environment
echo "🌱 Seeding test database..."
docker compose exec backend vendor/bin/phinx seed:run -e testing

echo "✅ Test database setup complete!"
echo "   Database: builder_test"
echo "   Test user: demo@example.com"
echo "   Password: test123"
