import { execSync } from 'child_process';

/**
 * Global setup for Playwright tests
 * Ensures test database is properly seeded before running tests
 *
 * In CI: Database setup is already done by the workflow, so this is skipped
 * Locally: Runs migrations and seeds via Docker Compose
 */
async function globalSetup() {
  // Skip database setup in CI - it's already handled by the workflow
  if (process.env.CI) {
    console.log('🔧 CI environment detected - skipping database setup (already done by workflow)');
    return;
  }

  console.log('🔧 Running global test setup...');

  try {
    // Run migrations on test database
    console.log('📦 Running migrations on test database...');
    execSync(
      'docker compose exec -T backend vendor/bin/phinx migrate -e testing',
      { stdio: 'inherit' }
    );

    // Seed test database
    console.log('🌱 Seeding test database...');
    execSync(
      'docker compose exec -T backend vendor/bin/phinx seed:run -e testing',
      { stdio: 'inherit' }
    );

    console.log('✅ Global test setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

export default globalSetup;
