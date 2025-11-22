#!/bin/bash
set -e

echo "🔄 Resetting test database..."

# Rollback all migrations
echo "⏪ Rolling back migrations..."
docker compose exec backend vendor/bin/phinx rollback -e testing -t 0

# Re-run migrations
echo "📦 Re-running migrations..."
docker compose exec backend vendor/bin/phinx migrate -e testing

# Re-seed database
echo "🌱 Re-seeding test database..."
docker compose exec backend vendor/bin/phinx seed:run -e testing

echo "✅ Test database reset complete!"
