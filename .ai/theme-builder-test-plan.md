# Test Plan – E-Commerce Theme Builder Monorepo

## 1. Test Strategy Overview

- **Scope:** Entire monorepo:
  - Theme Builder SPA (`theme-builder/`)
  - Demo Shop (React Router 7 SSR, `demo-shop/`)
  - Symfony REST API backend (`backend/`)
  - Shared component library (`shared/components`)
- **Tech stack:** React 19 + TypeScript + Vite + Tailwind + dnd-kit on the frontends; Symfony 7.3 + PHP 8.3 + PostgreSQL 16 on the backend; Phinx for migrations.
- **Primary objectives:**
  - Validate that non-technical users can build and modify shop layouts via drag-and-drop without data loss.
  - Ensure strong separation between **unsaved state** and **persisted state** for page layouts and theme settings.
  - Maintain a stable, predictable user experience for critical flows (login, editing, saving, navigation, preview).
  - Provide an isolated, reproducible database environment for automated tests.
  - Integrate tests tightly into CI/CD so regressions are caught early.
- **Quality attributes:**
  - Reliability of drag-and-drop interactions and persistence.
  - Usability of core flows in both Theme Builder and Demo Shop.
  - Performance of editor interactions for typical page sizes.
  - Security at the client level (JWT handling, safe API usage).
- **Testing pyramid:**
  - **Unit tests (~60–65%)** – Vitest (frontends), PHPUnit (backend).
  - **Integration tests (~25–30%)** – component composition, contexts, React Router loaders, backend HTTP/API integration.
  - **End-to-end tests (~10–15%)** – Playwright for critical cross-application journeys.

## 2. Per-Module Unit Testing Strategy

### 2.1 Shared Component Library (`shared/components`)

- Component render logic for each shared UI component and variant.
- Props contracts and Zod/TypeScript schemas for component configuration.
- `meta.ts` and `types.ts` mappings (IDs, categories, default props).
- Defensive behavior for missing/partial configuration so both apps degrade gracefully.

### 2.2 Theme Builder (`theme-builder/` React SPA)

- **UI components:**
  - Presentational components (e.g., `TopNavigationBar`, buttons, canvas primitives, draggable cards) render correctly based on props and state.
  - Shared components from `@shared/components` render correctly within the editor shell.
- **State management:**
  - `workspaceReducer` and `WorkspaceContext`:
    - Separate dirty flags for **page layout** vs **theme settings**.
    - Correct reset behavior on successful save/reset.
    - Correct handling of default layouts for Home/Catalog/Product/Contact.
- **Custom hooks:**
  - `useDragAndDrop` – drag state, drop targets, keyboard interactions, edge cases with multiple components, drops on empty canvas, bounds checking.
- **Auth utilities:**
  - JWT decoding and data extraction (`lib/auth.ts`) including token expiry and error handling.
- **API clients:**
  - Functions in `lib/api/pages.ts` and related modules construct correct URLs, methods, headers, payloads, and normalize errors consistently.

### 2.3 Demo Shop (`demo-shop/` React SSR)

- Route and layout components for home, catalog, product detail, contact.
- React Router v7 loaders/actions:
  - Correct construction of backend requests (shop, pages, theme, demo products/categories).
  - Mapping API responses into props for shared components.
- Local UI state (filters, sorting, pagination) and derived selectors.
- Integration with `@shared/components` ensuring correct props and theme application.

### 2.4 Backend (`backend/` Symfony API)

- Domain entities and value objects in `backend/src/Model`:
  - Enforce invariants (e.g., non-negative money, valid email, allowed page types, shop ownership).
- Services in `backend/src/Service`:
  - Page layout persistence, theme settings updates, authentication workflows, and business rules.
- Repository interfaces and implementations in `backend/src/Repository`:
  - Complex queries unit-tested with mocked Doctrine connections; simpler CRUD primarily covered by integration tests.
- Request/response models in `backend/src/Request` and mapping logic to entities/DTOs.
- Event listeners/subscribers and data transformers/mappers.
- Lightweight controller-level unit tests focusing on status codes and JSON structure with business logic mocked.

## 3. Integration & End-to-End Testing

### 3.1 Frontend Integration Testing

- **Workspace interactions:**
  - `WorkspaceView`, `Canvas`, `ComponentLibrarySidebar`, `ThemeSettingsSidebar`, `TopNavigationBar` working together.
  - Full drag-and-drop flows within a `DndContext` provider.
- **Auth + initial data loading:**
  - Login → token storage → initial shop/pages/theme loaded from API and rendered.
- **Unsaved changes protection:**
  - Navigation between pages, demo preview, logout, theme sidebar interactions while dirty.
- **API integration using mocked fetch:**
  - Page save/reset and theme settings save flows with success, validation error, and network error states.
- **Demo Shop integration with shared components:**
  - Route loaders calling backend endpoints and composing shared components for each view.
  - Theme tokens propagated correctly into shared components so Demo Shop appearance matches Theme Builder.

### 3.2 Backend Integration (Symfony Functional Tests)

- Controller + service + repository + database interactions using Symfony test kernel and dedicated test database.
- Auth flows (register, login), shop retrieval/update, page layout CRUD, theme settings update, and public shop endpoints.
- Validation behavior (DTO constraints, error payload formats) and HTTP status codes.

### 3.3 End-to-End (E2E) Testing with Playwright

- **Primary journeys:**
  - Authentication (success and invalid credentials).
  - Page editing:
    - Load default Home layout, drag a component from library onto canvas, modify content, save, reload to confirm persistence.
  - Theme settings:
    - Change primary color and font, save, verify visual changes in editor and Demo Shop preview.
  - Unsaved changes protection:
    - Edit without saving, attempt to switch page / open Demo Shop / logout; verify dialogs and both “stay”/“leave” behaviors.
  - Reset behavior:
    - Modify layout, click Reset, confirm dialog, restore last saved layout.
  - Demo Shop integration:
    - From Theme Builder, open Demo Shop and verify layout/theme match the last persisted state.
- **Negative & security-flavored flows:**
  - Expired/invalid JWT → forced logout or clear error and redirect.
  - Backend 400/500 responses surfaced as user-friendly messages without leaking internals.

## 4. Testing Tools and Frameworks

- **Unit & integration:**
  - `Vitest` – test runner and assertions for React.
  - `@testing-library/react` – component and DOM-focused tests.
  - `@testing-library/user-event` – realistic user interactions.
  - `msw` (Mock Service Worker) – API mocking in frontend tests.
  - `PHPUnit` – backend unit and integration tests.
  - Symfony test utilities (`KernelTestCase`, `WebTestCase`) – HTTP-level backend tests.
- **End-to-end:**
  - `Playwright` (Chromium, desktop profile) – E2E with Page Object Model, tracing, screenshots, and optional video.
- **Static analysis & linting:**
  - `ESLint` (with TypeScript + React hooks rules).
  - `typescript-eslint` recommended settings.
  - `PHPStan` / `Psalm` and `PHP CS Fixer` for backend.
- **Accessibility (recommended):**
  - `@axe-core/playwright` or `jest-axe` on key views.

## 5. Test Environment & Database Strategy

### 5.1 Local Development Environment

- Run the stack via `docker compose up` (backend API + Postgres + frontends in containers).
- **Theme Builder** dev server exposed on `http://localhost:5173` (via Docker).
- `.env` / Vite environment variables (notably `VITE_API_URL`) point to the backend container.
- Use Phinx seeders to provide deterministic baseline data (test users, shops, 4 default pages, theme settings, demo products/categories).

### 5.2 Dedicated Test Database (Non-Production)

- Use a **separate PostgreSQL database** for tests (e.g., `theme_builder_test`) that is never shared with dev/prod.
- Configure a Phinx `testing` environment in `backend/phinx.php` pointing to this database.
- Provide `backend/.env.test` with:
  - `APP_ENV=test`
  - `DATABASE_URL` pointing at the test database (typically via Docker service name).
- For PHPUnit:
  - Boot Symfony kernel in `test` env so Doctrine uses the test DB.
  - Optionally wrap tests in transactions or clean tables between tests.
- For Playwright & other E2E tests:
  - Point backend to the same test DB.
  - Reset or reseed between suites to avoid cross-test pollution.

### 5.3 CI/CD Workflow for Databases

- CI runs `docker compose up -d` to start the environment.
- A dedicated test script:
  - Ensures the test DB schema is wiped/clean.
  - Runs all migrations and seeders.
  - Executes all PHPUnit tests and Playwright suites.
- At the end of the pipeline, `docker compose down -v` cleans containers and volumes to keep runs stateless.

## 6. Test Data Management

- **Static test users:**
  - Example: `test-editor@example.com / Test123!` with a dedicated shop, created via Phinx seeders.
- **Deterministic layouts & themes:**
  - Default Home/Catalog/Product/Contact layouts and base theme must be predictable for assertions in both apps.
- **Scoped data per test:**
  - Create temporary pages/layouts via API in test setup when needed and clean them afterward (test DB only).
- **Sensitive data:**
  - Never use real emails or credentials.
  - Avoid logging tokens or secrets in test output or CI logs.

## 7. Automation Strategy & CI/CD Integration

- **Unit & integration tests:**
  - Run on every push and pull request for `theme-builder/`, `demo-shop/`, and `backend/`.
  - Use coverage thresholds (e.g., functions/lines ≥ 70–80% for `theme-builder/src`, `demo-shop/src`, and core backend domain code).
  - Enforce linting and type-checking (`npm run lint`, `npm run typecheck`, PHP static analysis) alongside tests.
- **E2E tests:**
  - Run a **smoke subset** (core flows) on every pull request.
  - Run the **full E2E suite** on merges to `main` and nightly.
  - Store Playwright traces, screenshots, and videos for failures as CI artifacts.
- **GitHub Actions & scripts:**
  - Root-level workflows use `npm ci` and `docker compose` for reproducible environments.
  - `package.json` / `composer.json` provide per-module scripts (`npm test`, `composer test`) and a root script orchestrating all checks.
- **Branch policies:**
  - PRs must pass unit/integration tests, lint, typecheck, and minimal E2E before merging.
  - Critical regressions must be covered by new tests before closing issues.

## 8. Risk Assessment and Mitigation

### 8.1 Key Risks

- **Inconsistent test environments** causing flaky results.
- **State management bugs** leading to loss of work or incorrect dirty-state detection.
- **Drag-and-drop regressions** affecting component placement and usability.
- **Unsaved changes protection failures** causing accidental data loss.
- **Desynchronization** between backend and frontend representation of layouts/theme settings.
- **API contract drift** not reflected in frontend tests.

### 8.2 Mitigation Strategies

- Containerize all dependencies and test DBs via `docker compose`; keep configuration in version control.
- Increase unit coverage on `WorkspaceContext`, `workspaceReducer`, and `useDragAndDrop`.
- Add integration tests for:
  - Page and theme save/reset flows.
  - Navigation with unsaved changes (all permutations).
- Add contract tests against API:
  - JSON schemas or TypeScript interfaces for responses validated in tests.
- Keep `msw` mocks in sync with backend types and schemas.
- Add E2E regression scenarios for every critical bug.

## 9. Timeline and Milestones

- **Week 1:**
  - Set up Vitest, React Testing Library, and Playwright in frontends.
  - Add foundational unit tests for utilities, hooks, and UI primitives.
  - Integrate unit tests, lint, and typecheck into CI.
- **Week 2:**
  - Implement integration tests for:
    - Workspace layout modifications, save/reset.
    - Theme settings sidebar behavior.
    - Unsaved changes protection.
  - Add Playwright smoke tests for login and basic edit/save.
- **Week 3:**
  - Expand Playwright to cover unsaved changes dialogs, reset flows, and Demo Shop navigation.
  - Introduce accessibility checks for main views.
  - Define and enforce coverage thresholds.
- **Week 4 and onward:**
  - Treat test coverage as part of “definition of done”.
  - Add regression tests for each bug fix.
  - Periodically refactor tests (Page Objects, shared fixtures) for maintainability.

## 10. Success Criteria

- **Functional:**
  - All critical user journeys across Theme Builder, Demo Shop, backend, and shared components pass automated tests.
  - No known critical bugs in drag-and-drop, save/reset, or unsaved changes handling.
- **Coverage & quality:**
  - Target **≥80%** combined unit + integration coverage across modules; minimum thresholds enforced in CI.
  - Consistent E2E pass rate of **>98%** on main.
- **Stability:**
  - E2E suite is low-flakiness with predictable run times.
  - CI pipelines pass reliably; failures are actionable with good diagnostics.
- **Process:**
  - Every new feature/change includes appropriate tests.
  - Regression bugs produce new or improved tests to prevent recurrence.
