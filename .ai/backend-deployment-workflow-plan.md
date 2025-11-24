# CI/CD Deployment Plan for Backend

## Phase 1: VPS Server Setup

**1.1 Create Directory Structure**
```bash
/var/www/your-domain.com/
├── src/
├── config/
├── vendor/
├── public/          # Nginx document root
└── .env            # Production environment variables
```

**1.2 Configure Nginx Virtual Host**
- Create `/etc/nginx/sites-available/your-domain.com`
- Configure PHP-FPM proxy for Symfony
- Point document root to `/var/www/your-domain.com/public`
- Enable IPv4 and IPv6 listening
- Create symlink to sites-enabled

**1.3 Set Permissions**
```bash
# Application owned by deploy user, readable by www-data
chown -R deploy-user:www-data /var/www/your-domain.com/
chmod -R 755 /var/www/your-domain.com/
chmod -R 775 /var/www/your-domain.com/var/  # Cache/logs writable
```

**1.4 Install Required Tools**
- Composer (globally)
- Git
- Verify PHP 8.3 extensions: pdo_pgsql, intl, xml, zip, curl

**1.5 Setup Environment Variables**
- Create `.env` file with DATABASE_URL, APP_SECRET, APP_ENV=prod
- Configure external PostgreSQL connection string

---

## Phase 2: GitHub Repository Configuration

**2.1 Generate SSH Key Pair**
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f github_deploy_key
# Add public key to VPS: ~/.ssh/authorized_keys
```

**2.2 Configure GitHub Secrets** (Settings → Secrets and variables → Actions)
- `VPS_SSH_PRIVATE_KEY` - Private key content
- `VPS_HOST` - Server IP or domain
- `VPS_USERNAME` - SSH user (e.g., deploy-user)
- `VPS_DEPLOY_PATH` - `/var/www/your-domain.com`
- `DATABASE_URL` - PostgreSQL connection string
- `APP_SECRET` - Symfony secret key

---

## Phase 3: GitHub Actions Workflow

**3.1 Create `.github/workflows/backend-deploy.yml`**

```yaml
name: Deploy Backend to VPS

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP 8.3
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo_pgsql, intl, xml

      - name: Install dependencies
        working-directory: backend
        run: composer install --no-dev --optimize-autoloader

      - name: Run PHPStan
        working-directory: backend
        run: vendor/bin/phpstan analyse

      - name: Run PHPUnit
        working-directory: backend
        run: vendor/bin/phpunit

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.VPS_SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy files via rsync
        run: |
          rsync -avz --delete \
            --exclude='.git' \
            --exclude='var/cache' \
            --exclude='var/log' \
            --exclude='vendor' \
            --exclude='.env.local' \
            -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no" \
            backend/ ${{ secrets.VPS_USERNAME }}@${{ secrets.VPS_HOST }}:${{ secrets.VPS_DEPLOY_PATH }}/

      - name: Post-deployment tasks
        run: |
          ssh -i ~/.ssh/deploy_key ${{ secrets.VPS_USERNAME }}@${{ secrets.VPS_HOST }} << 'ENDSSH'
            cd ${{ secrets.VPS_DEPLOY_PATH }}
            composer install --no-dev --optimize-autoloader
            vendor/bin/phinx migrate -e production
            php bin/console cache:clear --env=prod
            php bin/console cache:warmup --env=prod
            chmod -R 775 var/
          ENDSSH
```

---

## Phase 4: Phinx Configuration

**4.1 Update `backend/phinx.php`**
- Ensure production environment reads from `DATABASE_URL` env variable
- Configure migrations path correctly

---

## Phase 5: Initial Deployment Checklist

1. ✅ SSH key added to VPS authorized_keys
2. ✅ All GitHub secrets configured
3. ✅ Nginx virtual host configured and tested (IPv4 and IPv6)
4. ✅ `.env` file created on VPS with production values
5. ✅ Database accessible from VPS (test connection)
6. ✅ Directory permissions set correctly
7. ✅ First deployment: push to main branch
8. ✅ Verify deployment in GitHub Actions logs
9. ✅ Test API endpoint: `curl http://your-domain.com/api/health`

---

## Phase 6: Post-Deployment Verification

- Check GitHub Actions workflow completion
- SSH to VPS and verify files updated
- Check Symfony logs: `tail -f var/log/prod.log`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Test API endpoints
- Verify database migrations applied
