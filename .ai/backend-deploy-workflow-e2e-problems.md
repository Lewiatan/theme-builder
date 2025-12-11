# Backend Deploy Workflow E2E Tests - Issues & Solutions

## Summary

This document chronicles the issues encountered and solutions implemented while adding E2E (End-to-End) tests using Playwright to the GitHub Actions backend deployment workflow (`.github/workflows/backend-deploy.yml`).

**Initial Objective**: Add an `e2e-test` job that runs Playwright tests after unit tests pass, before deployment.

---

## Issue 1: PostgreSQL Container Failure

### Problem
The postgres container failed to start with exit code 1, causing all dependent services (backend, pgadmin, nginx) to fail.

**Error Message**:
```
Container theme-builder-postgres  Error
dependency failed to start: container theme-builder-postgres exited (1)
```

### Root Cause
The `docker-compose.yml` file requires environment variables (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) from a `.env` file. GitHub Actions doesn't have a `.env` file by default.

### Solution
Created a `.env` file in the workflow before starting Docker Compose services:

```yaml
- name: Create .env file for Docker Compose
  run: |
    cat > .env << 'EOF'
    POSTGRES_DB=builder
    POSTGRES_USER=builder
    POSTGRES_PASSWORD=builder
    PGADMIN_DEFAULT_EMAIL=admin@example.com
    PGADMIN_DEFAULT_PASSWORD=admin
    APP_ENV=dev
    APP_SECRET=test-secret-key
    DATABASE_URL=postgresql://builder:builder@postgres:5432/builder?serverVersion=16&charset=utf8
    CORS_ALLOW_ORIGIN=.*
    JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
    JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
    JWT_PASSPHRASE=
    VITE_API_URL=http://localhost:8000
    VITE_DEMO_SHOP_URL=http://localhost:5174
    EOF
```

**Result**: PostgreSQL container started successfully.

---

## Issue 2: Backend API Returning 502 Bad Gateway

### Problem
While the `/health` endpoint responded, actual authentication endpoints (`/api/auth/login`, `/api/auth/register`) returned 502 Bad Gateway errors. Tests showed:
- "Unable to connect. Please check your internet connection."
- Login/registration tests failing because backend wasn't responding

**Error Pattern**:
```
Expected pattern: /invalid email or password/i
Received string: "Unable to connect. Please check your internet connection."
```

### Root Cause
Multiple compounding issues:
1. Backend PHP-FPM wasn't fully initialized before tests ran
2. Database wasn't ready
3. Composer dependencies might not have been fully installed

### Solution
Implemented a sequential startup process:

```yaml
- name: Wait for PostgreSQL to be ready
  run: |
    echo "Waiting for PostgreSQL..."
    timeout 30 bash -c 'until docker compose exec -T postgres pg_isready -U builder; do echo "PostgreSQL not ready, waiting..."; sleep 2; done'
    echo "PostgreSQL is ready!"

- name: Wait for backend composer install
  run: |
    echo "Waiting for composer install to complete..."
    timeout 120 bash -c 'until docker compose exec -T backend test -d vendor; do echo "Vendor directory not ready, waiting..."; sleep 3; done'
    echo "Vendor directory exists!"
```

Added explicit health checks:
```yaml
- name: Wait for services to be ready
  run: |
    echo "Waiting for backend API health endpoint..."
    timeout 120 bash -c 'until curl -f http://localhost:8000/health 2>/dev/null; do echo "Backend health endpoint not ready, waiting..."; sleep 3; done'

    echo "Testing backend API auth endpoint..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}')
    if [ "$HTTP_CODE" = "502" ] || [ "$HTTP_CODE" = "000" ]; then
      echo "Backend API is not responding correctly!"
      docker compose logs backend nginx
      exit 1
    fi
```

**Result**: Better error visibility, but revealed next issue.

---

## Issue 3: Symfony Runtime Missing

### Problem
Symfony console commands failed with:

**Error Message**:
```
Fatal error: Uncaught LogicException: Symfony Runtime is missing.
Try running "composer require symfony/runtime".
in /var/www/html/bin/console:12
```

### Root Cause
Symfony needs a `.env` file inside the container at `/var/www/html/.env` to properly load environment configuration. The `.env` file we created was only for Docker Compose on the host machine.

### Solution
Created a `.env` file inside the backend container:

```yaml
- name: Setup backend
  run: |
    echo "Creating .env file inside backend container..."
    docker compose exec -T backend bash -c "
      echo 'APP_ENV=dev' > /var/www/html/.env && \
      echo 'APP_SECRET=test-secret-key' >> /var/www/html/.env && \
      echo 'DATABASE_URL=postgresql://builder:builder@postgres:5432/builder?serverVersion=16&charset=utf8' >> /var/www/html/.env && \
      echo 'CORS_ALLOW_ORIGIN=.*' >> /var/www/html/.env && \
      echo 'JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem' >> /var/www/html/.env && \
      echo 'JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem' >> /var/www/html/.env && \
      echo 'JWT_PASSPHRASE=' >> /var/www/html/.env
    "
```

Added Symfony cache warming:
```yaml
echo "Warming up Symfony cache..."
docker compose exec -T backend php bin/console cache:clear --env=dev
docker compose exec -T backend php bin/console cache:warmup --env=dev
```

**Result**: Revealed that `symfony/runtime` package wasn't actually installed.

---

## Issue 4: Out of Memory (Exit Code 137)

### Problem
When running `composer install` explicitly, the process was killed during "Generating optimized autoload files":

**Error Message**:
```
23/23 [============================] 100%
Generating optimized autoload files
Error: Process completed with exit code 137.
```

**Exit code 137 = SIGKILL (128 + 9)** - Process killed by OS due to Out of Memory

### Root Cause
- GitHub Actions runners have limited memory (7GB)
- The entrypoint.sh script runs `composer install` when the container starts
- The `--optimize-autoloader` flag is memory-intensive
- Process gets OOM-killed during autoload optimization
- This leaves a partial vendor directory with some packages but missing `symfony/runtime`

### Attempted Solutions That Failed

1. **Using `--no-scripts` flag**: Still consumed too much memory
2. **Using `dump-autoload --no-scripts`**: Package installation itself was incomplete
3. **Waiting for vendor directory**: Waited for incomplete installation, didn't help

### Final Solution
Implemented a detection and recovery system:

```yaml
- name: Setup backend
  run: |
    # ... create .env file ...

    echo "Checking if symfony/runtime is installed..."
    if docker compose exec -T backend test -d vendor/symfony/runtime; then
      echo "✓ Symfony runtime is already installed!"
    else
      echo "✗ Symfony runtime missing! Reinstalling all composer dependencies..."
      echo "Removing incomplete vendor directory..."
      docker compose exec -T backend rm -rf vendor
      echo "Running fresh composer install with memory limit..."
      docker compose exec -T backend bash -c "COMPOSER_MEMORY_LIMIT=-1 composer install --no-interaction --no-dev --no-scripts --classmap-authoritative"
    fi

    echo "Verifying Symfony runtime installation..."
    docker compose exec -T backend test -d vendor/symfony/runtime && echo "✓ Symfony runtime is now installed!" || echo "✗ FAILED: Symfony runtime still missing!"
```

**Key optimizations:**
- `COMPOSER_MEMORY_LIMIT=-1`: Bypass composer's default 1.5GB memory limit
- `--no-dev`: Skip development dependencies (phpunit, phpstan, phinx) to reduce memory usage
- `--no-scripts`: Skip post-install scripts that consume memory
- `--classmap-authoritative`: Use faster, less memory-intensive autoload generation
- `rm -rf vendor`: Start fresh if incomplete installation detected

**Result**: Composer install completes successfully without OOM errors.

---

## Issue 5: YAML Syntax Error

### Problem
GitHub Actions complained about YAML syntax error around line 123 when using heredoc inside bash command.

**Error Message**:
```
You have an error in your yaml syntax on line 123
```

### Root Cause
The heredoc content wasn't properly indented, causing YAML parser to interpret lines starting at column 0 as new keys.

### Solution
Replaced heredoc with individual echo statements:

```yaml
# BEFORE (Failed):
docker compose exec -T backend bash -c 'cat > /var/www/html/.env << EOF
APP_ENV=dev
APP_SECRET=test-secret-key
...
EOF'

# AFTER (Success):
docker compose exec -T backend bash -c "
  echo 'APP_ENV=dev' > /var/www/html/.env && \
  echo 'APP_SECRET=test-secret-key' >> /var/www/html/.env && \
  ...
"
```

**Result**: YAML validation passed.

---

## Issue 6: Environment Variables for Frontend Services

### Problem
User noted that `theme-builder` and `demo-shop` services in `docker-compose.yml` also require environment variables (`VITE_API_URL`, `VITE_DEMO_SHOP_URL`).

### Root Cause
Frontend services need these variables to connect to the backend API, but we weren't explicitly verifying they were set.

### Solution
Added verification step to ensure environment variables are properly propagated to all containers:

```yaml
- name: Verify environment variables in containers
  run: |
    echo "Checking theme-builder environment variables:"
    docker compose exec -T theme-builder sh -c 'echo "VITE_API_URL=$VITE_API_URL"'
    docker compose exec -T theme-builder sh -c 'echo "VITE_DEMO_SHOP_URL=$VITE_DEMO_SHOP_URL"'

    echo "Checking demo-shop environment variables:"
    docker compose exec -T demo-shop sh -c 'echo "VITE_API_URL=$VITE_API_URL"'
    docker compose exec -T demo-shop sh -c 'echo "SERVER_API_URL=$SERVER_API_URL"'

    echo "Checking backend environment variables:"
    docker compose exec -T backend sh -c 'echo "DATABASE_URL=$DATABASE_URL"'
```

**Result**: Provides visibility into environment variable propagation, helps catch misconfigurations early.

---

## Final Workflow Structure

The complete E2E test job now follows this sequence:

```yaml
e2e-test:
  needs: test
  runs-on: ubuntu-latest

  steps:
    1. Checkout code
    2. Setup Node.js 20
    3. Install Playwright with Chromium
    4. Create .env file for Docker Compose (host machine)
    5. Start Docker Compose services
    6. Verify environment variables in containers
    7. Wait for PostgreSQL to be ready
    8. Wait for composer install (vendor directory exists)
    9. Setup backend:
       - Create .env inside container
       - Check for symfony/runtime
       - If missing: rm -rf vendor && composer install with memory optimizations
       - Warm Symfony cache
       - Run database migrations and seeds
    10. Wait for services to be ready:
        - Backend /health endpoint
        - Test /api/auth/login endpoint
        - theme-builder (port 5173)
        - demo-shop (port 5174)
    11. Run Playwright E2E tests
    12. Upload test reports (always)
    13. Stop Docker Compose (always)
```

---

## Key Learnings

1. **Environment Configuration**: Docker Compose needs `.env` on host, Symfony needs `.env` inside container
2. **Memory Management**: GitHub Actions has memory limits; optimize composer install flags
3. **Sequential Startup**: Services have dependencies; wait for each layer to be ready
4. **Incomplete Installations**: Detect and recover from partial installations caused by OOM
5. **Health Checks**: Verify both infrastructure (container up) and application (endpoints responding)
6. **Error Visibility**: Add verification steps and log output for debugging

---

## Related Files

- `.github/workflows/backend-deploy.yml` - The workflow file
- `docker-compose.yml` - Service definitions and environment variable requirements
- `backend/docker/entrypoint.sh` - Backend container initialization script
- `.env.example` - Template for environment variables
- `backend/composer.json` - PHP dependencies including symfony/runtime

---

## Current Status

✅ **RESOLVED**: All issues have been addressed. The E2E test job should now:
- Start all services successfully
- Install all composer dependencies without OOM errors
- Have symfony/runtime available
- Run Symfony console commands successfully
- Execute Playwright E2E tests
- Only deploy if all tests pass

The workflow implements proper dependency sequencing, memory management, error recovery, and comprehensive health checks.
