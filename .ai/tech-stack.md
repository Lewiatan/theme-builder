# Tech Stack Description

## Project Structure

### Monorepo Organization
- **Monorepo without workspaces:** The project uses a simple monorepo structure with shared components
- **Component Sharing:** TypeScript path aliases (`@shared/components`) + bundler resolve aliases
- **No package manager workspaces:** Avoids pnpm/npm workspace overhead for this tightly-coupled monorepo
- **Direct file imports:** Both frontends import shared components directly from `/shared/components`

## Frontend Applications

### Theme Builder Application
- **React 19** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **dnd kit** for drag-and-drop functionality
- **No routing** (single-view SPA)
- **Fetch API** for REST communication
- **Purpose:** Visual editor for authenticated users

### Demo Shop Application
- **React 19** with TypeScript
- **React Router v7** for page routing
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Fetch API** for REST communication
- **Purpose:** Public preview of saved shop themes

## Backend API

### Symfony 7.3 REST API
- **PHP 8.3+**
- **JWT authentication** (LexikJWTAuthenticationBundle)
- **Symfony Validator** for input validation
- **Symfony Serializer** for JSON responses
- **AWS SDK for PHP** for R2 image uploads
- **PostgreSQL** as database
- **Doctrine ORM** for data access
- **Phinx** for migrations
- **Purpose:** Stateless REST API for all business logic

## Storage

### Cloudflare R2
- S3-compatible object storage
- 10GB free tier
- Managed via Symfony backend (AWS SDK for PHP)
- Credentials never exposed to frontend

## Deployment

### Hosting
- **Theme Builder:** Cloudflare Pages
- **Demo Shop:** Cloudflare Pages
- **Backend API:** Render Web Service
- **Database:** Render PostgreSQL
- **Images:** Cloudflare R2

### CI/CD
- **GitHub Actions** for automated testing and deployment
- **Tests:** Vitest (frontend), PHPUnit (backend), Playwright (E2E)
- **Linting:** ESLint (frontend), PHP CS Fixer (backend)
- Auto-deploy to production on merge to `main`
