# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with code in this repository.

## Project Overview

E-commerce Theme Builder is an MVP application that enables non-technical shop owners to create and customize their online store appearance through a visual drag-and-drop interface. The project consists of three main components in a monorepo structure:

1. **theme-builder** - The main editor application (React + Vite)
2. **demo-shop** - Preview/demo store (React Router 7 + SSR)
3. **backend** - API server (Symfony 7.3 + PHP 8.3)

This application serves as both a **10xDevs certification project** (demonstrating proficiency in AI-Assisted Development techniques) and the foundational element for a future **E-commerce SaaS** platform.

## AI Assistant Guidelines

When providing code assistance:

- Favor elegant, maintainable solutions over verbose code. Assume understanding of language idioms and design patterns.
- Highlight potential performance implications and optimization opportunities in suggested code.
- Frame solutions within broader architectural contexts and suggest design alternatives when appropriate.
- Focus comments on 'why' not 'what' - assume code readability through well-named functions and variables.
- Proactively address edge cases, race conditions, and security considerations without being prompted.
- When debugging, provide targeted diagnostic approaches rather than shotgun solutions.
- Suggest comprehensive testing strategies rather than just example tests, including considerations for mocking, test organization, and coverage.

## Development Environment

### Starting the Development Environment

```bash
# Start all services with Docker Compose
docker compose up

# Services will be available at:
# - Theme Builder: http://localhost:5173
# - Demo Shop: http://localhost:5174
# - Backend API: http://localhost:8000
# - pgAdmin: http://localhost:5050
# - PostgreSQL: localhost:5432
```

### Individual Service Commands

**Theme Builder:**

```bash
cd theme-builder
npm install
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

**Demo Shop:**

```bash
cd demo-shop
npm install
npm run dev        # Start dev server with React Router
npm run build      # Build for production
npm run start      # Serve production build
npm run typecheck  # Run TypeScript type checking and generate React Router types
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- PostgreSQL credentials (POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD)
- pgAdmin credentials
- Backend settings (APP_ENV, APP_SECRET, DATABASE_URL)
- Frontend API URL (VITE_API_URL)
- Demo Shop URL (VITE_DEMO_SHOP_URL) - URL where the demo shop is accessible

### Docker Compose Services

All services are orchestrated via `docker-compose.yml`:

- **postgres**: PostgreSQL 16 database with healthcheck
- **pgadmin**: Database management UI
- **backend**: Symfony PHP-FPM application
- **nginx**: Web server for backend API
- **theme-builder**: React + Vite dev server (Node 20)
- **demo-shop**: React Router + Vite dev server (Node 20)

Volumes persist data for postgres, pgadmin, and node_modules.

## Architecture & Key Concepts

### Monorepo Structure

The repository follows a monorepo pattern with three independent applications:

- **theme-builder/**: Simple React + Vite app for the visual editor interface
- **demo-shop/**: React Router 7 SSR application for rendering the themed store
- **backend/**: Symfony 7.3 API with Doctrine ORM

Each application has its own dependencies managed separately. Docker Compose orchestrates all services with shared networking.

**Shared Component Library:**

- **Location:** `/shared/components` directory at repository root
- **Import Strategy:** TypeScript path aliases (`@shared/components`) configured in each frontend app
- **Bundler Integration:** Vite (theme-builder) and React Router (demo-shop) use resolve aliases to map the TypeScript paths
- **No Workspace Overhead:** Direct file imports without pnpm/npm workspace configuration
- **Component Contract:** All shared components follow standardized structure with `.tsx`, `types.ts`, `meta.ts`, and `.module.css` files
- **Type Safety:** Dual validation with TypeScript interfaces for static analysis and Zod schemas for runtime validation

### Clean Architecture Principles

- Strictly separate code into layers: entities, use cases, interfaces, and frameworks
- Ensure dependencies point inward, with inner layers having no knowledge of outer layers
- Implement domain entities that encapsulate business rules without framework dependencies
- Use interfaces (ports) and implementations (adapters) to isolate external dependencies
- Create use cases that orchestrate entity interactions for specific business operations
- Implement mappers to transform data between layers to maintain separation of concerns

### Data Flow

The original architecture planned:

- User authentication via JWT with LexikJWTAuthenticationBundle
- Image storage via Cloudflare R2
- Edge functions via Cloudflare Workers
- Backend handles API requests via Symfony controllers
- PostgreSQL stores application data via Doctrine ORM
- Frontend apps communicate with backend via `VITE_API_URL` environment variable

## Coding Standards

### General Practices

**Documentation:**

- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md
- Kepp CLAUDE.md in sync with new capabilities

**Static Analysis:**

- Configure project-specific rules in eslint.config.js to enforce consistent coding standards
- Use shareable configs like eslint-config-airbnb or eslint-config-standard as a foundation
- Configure integration with Prettier to avoid rule conflicts for code formatting
- Use the --fix flag in CI/CD pipelines to automatically correct fixable issues
- Implement staged linting with husky and lint-staged to prevent committing non-compliant code

### Testing Standards

#### Playwright (E2E Testing)

- Initialize configuration only with Chromium/Desktop Chrome browser
- Use browser contexts for isolating test environments
- Implement the Page Object Model for maintainable tests
- Use locators for resilient element selection
- Leverage API testing for backend validation
- Implement visual comparison with expect(page).toHaveScreenshot()
- Use the codegen tool for test recording
- Leverage trace viewer for debugging test failures
- Implement test hooks for setup and teardown
- Use expect assertions with specific matchers
- Leverage parallel execution for faster test runs

### Version Control

#### Git

- Use conventional commits to create meaningful commit messages
- Use feature branches with descriptive names
- Write meaningful commit messages that explain why changes were made, not just what
- Keep commits focused on single logical changes to facilitate code review and bisection
- Use interactive rebase to clean up history before merging feature branches
- Leverage git hooks to enforce code quality checks before commits and pushes

### DevOps

#### GitHub Actions

- Check if `package.json` exists in project root and summarize key scripts
- Check if `.nvmrc` exists in project root
- Check if `.env.example` exists in project root to identify key `env:` variables
- Always use terminal command: `git branch -a | cat` to verify whether we use `main` or `master` branch
- Always use `env:` variables and secrets attached to jobs instead of global workflows
- Always use `npm ci` for Node-based dependency setup
- Extract common steps into composite actions in separate files
- For each public action always verify the most up-to-date version (use only major version)

## Key Features & Scope

### MVP Features

- Drag-and-drop interface for managing components
- 13 predefined components with variants
- User authentication and isolated data
- 4 default pages (Home, Catalog, Product, Contact)
- Global theme customization (colors, fonts)
- Separate save mechanisms for layouts and theme settings
- Unsaved changes protection
- Demo store preview with mock data
- Fully responsive design

### Explicitly Excluded from MVP

- Forgot password functionality
- Global media library
- Global Header/Footer components
- Undo/Redo
- Auto-saving
- Custom component creation
- Viewport switcher in editor
- Real product database integration
- Server-Side Rendering (SSR) for main app
- Template versioning

## Database

- **Type**: PostgreSQL 16
- **Migration Tool**: Phinx (NOT Doctrine)
- **ORM**: Doctrine ORM for data access
- **Connection**: Managed via Docker Compose networking (`theme-builder-network`)
- **Admin UI**: pgAdmin available at http://localhost:5050

## Common Gotchas

1. **Node Modules in Docker**: Each frontend service uses Docker volumes for node_modules to avoid platform compatibility issues
2. **Phinx Location**: Migrations tool is Phinx (robmorgan/phinx), not Doctrine migrations
3. **Port Confusion**: Demo shop runs on 5174 (not 5173) to avoid conflicts
4. **Backend Entrypoint**: The entrypoint.sh automatically runs `composer install` on container start
5. **Docker Files Organization**: Docker-related files are in `backend/docker/` directory (nginx.conf, entrypoint.sh)

- Use "docker compose" instead of "docker-compose"
- Run all project commands like `comoposer`, `npm` via container
