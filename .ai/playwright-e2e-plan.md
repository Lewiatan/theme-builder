# Playwright E2E Test Candidates

This document refines `.ai/theme-builder-test-plan.md` with concrete Playwright scenarios and a suggested suite structure. All tests assume the stack runs via `docker compose up`, Theme Builder at `http://localhost:5173`, and Demo Shop at `http://localhost:5174`.

## Suite Layout

- `e2e/auth.spec.ts` – login and auth edge cases (`@smoke` for happy path).
- `e2e/workspace-editing.spec.ts` – drag/drop, save, reset (`@smoke` core editing).
- `e2e/workspace-unsaved.spec.ts` – unsaved-change protection and confirmations.
- `e2e/workspace-ux.spec.ts` – component library, delete confirmation, empty canvas.
- `e2e/demo-shop-navigation.spec.ts` – demo shop navigation and route loading.
- `e2e/demo-shop-catalog.spec.ts` – catalog filtering and data rendering.
- `e2e/cross-app-layout-theme.spec.ts` – layout/theme consistency between apps.
- `e2e/error-and-security.spec.ts` – error handling, invalid JWT, invalid shop IDs.
- `e2e/accessibility.spec.ts` – basic a11y smoke checks with `@axe-core/playwright`.

## 1. Theme Builder – Core Flows

### 1.1 Login Happy Path (`@smoke`)

- Start on `/login`.
- Paste a valid seeded JWT into `LoginForm` textarea and submit.
- Assert:
  - `localStorage.getItem('jwt_token')` is set.
  - You are redirected to `/`.
  - `WorkspaceView` renders (page selector visible, canvas present).
  - “Unsaved changes” badge is hidden.
  - Save and Reset buttons are disabled.

### 1.2 Basic Edit + Save (`@smoke`)

- Precondition: logged in and on Home page.
- Drag a component from `ComponentLibrarySidebar` onto `Canvas`.
- Assert:
  - A new component node appears on the canvas.
  - “Unsaved changes” badge is visible.
  - Save and Reset buttons become enabled.
- Click Save:
  - Assert success toast (“Page layout saved successfully”).
  - Badge disappears; Save and Reset become disabled.
- Reload the page:
  - Assert the newly added component persists in the layout.

### 1.3 Reset Layout (`@smoke`)

- Precondition: at least one prior saved layout.
- Modify the layout (add, move, or delete a component) to make it dirty.
- Click Reset:
  - Assert reset confirmation dialog appears with correct copy.
  - Choose “Reset”.
- Assert:
  - Layout returns to last saved state.
  - “Unsaved changes” badge disappears.
  - Save and Reset are disabled.

## 2. Theme Builder – Drag/Drop, Delete, and UX

### 2.1 Drag-and-Drop Reorder

- With at least two components on canvas:
  - Drag an existing `CanvasComponent` to a different `DropZone` index.
- Assert:
  - Visual order changes immediately.
  - “Unsaved changes” badge appears.
- Save and reload:
  - Assert the new order is preserved.

### 2.2 Drag From Library Between Components

- With multiple canvas components:
  - Drag a component card from `ComponentLibrarySidebar`.
  - Drop onto a `DropZone` between two existing components.
- Assert:
  - New component is inserted at the correct position.

### 2.3 Invalid Drops

- Start a drag from library and drop outside any drop zone (e.g., background area).
- Assert:
  - No new component appears on canvas.
  - No error toast or visible console error (if checked).

### 2.4 Delete Confirmation

- For a component on canvas:
  - Click its delete control to open delete dialog.
  - Click “Cancel” → component remains, layout unchanged.
  - Click delete again, then confirm “Delete”.
- Assert:
  - Component is removed.
  - “Unsaved changes” badge appears.

### 2.5 Component Library Collapse Persistence

- From default state:
  - Click collapse button on `ComponentLibrarySidebar`.
  - Assert the sidebar collapses and a minimal UI (e.g., arrow button) remains.
- Reload the app:
  - Assert sidebar remains collapsed (state from `localStorage`).
  - Expand again and assert full list of components returns.

## 3. Theme Builder – Unsaved Changes Protection

> These complement but do not replace unit/integration tests on `WorkspaceContext` and `workspaceReducer`.

### 3.1 Page Switch Guard

- Make unsaved changes on Home (add or move a component).
- Use page dropdown in `TopNavigationBar` to switch to Catalog.
- Assert:
  - Unsaved-changes dialog appears with appropriate text.
  - “Cancel” keeps you on Home, layout unchanged and still dirty.
  - Re-try and choose “Discard Changes”:
    - You navigate to Catalog.
    - Dirty flag clears (no “Unsaved changes” badge; Save/Reset disabled).

### 3.2 Demo / Logout Guards (Future When Implemented)

- With unsaved changes:
  - Click Demo button.
  - Assert unsaved-changes dialog shows; “Stay” keeps you on workspace; “Leave” opens Demo shop and discards changes.
- With unsaved changes:
  - Trigger logout (when UI exists).
  - Assert same dialog and correct “stay/leave” behavior.

## 4. Demo Shop – Navigation and Rendering

### 4.1 Open Demo From Builder

- In Theme Builder workspace:
  - Click “Demo” button in `TopNavigationBar`.
- Assert:
  - A new tab opens at `http://localhost:5174/shop/{shopIdFromJWT}`.
  - No error boundary is shown.
  - `DynamicComponentRenderer` renders at least one hero/section from seeded layout.

### 4.2 Cross-Page Navigation

- Starting from `/shop/{id}`:
  - Use the shop layout navigation (header/footer links) to go to catalog and contact routes.
- Assert each route:
  - Loads without error.
  - Renders meaningful content (e.g., product list, contact form or section).

## 5. Demo Shop – Catalog Behavior

### 5.1 Category Filtering

- On `/shop/{id}/catalog`:
  - Click a category pill from `CategoryPillsContainer`.
- Assert:
  - URL search params update to reflect category.
  - `ProductListGridContainer` updates to match filtered category.
  - The route does not fully reload (consistent with `shouldRevalidate` logic).

### 5.2 Empty-State Messaging

- Using seeded data or a dedicated category:
  - Select a category with no products.
- Assert:
  - Grid shows an appropriate “no products” message instead of being blank.
- Clear filter:
  - Full product grid returns.

## 6. Cross-App Layout and Theme Consistency

### 6.1 Layout Propagation (Current)

- In Theme Builder Home page:
  - Add a structurally obvious component (e.g., a hero or banner).
  - Save layout.
- Open Demo Shop home for the same `shopId`:
  - Assert the added component (or equivalent shared component) appears in the shop layout (DOM structure or text).

### 6.2 Theme Consistency (Future Theme Settings)

- Once `ThemeSettingsSidebar` settings are connected end-to-end:
  - Change primary color and font in Theme Settings.
  - Save theme settings.
- Assert:
  - Workspace CSS variables (e.g., `--color-primary`) update.
  - Primary UI accents and typography change accordingly.
- Open Demo Shop home:
  - Assert the same colors and fonts apply to shared components.

## 7. Error and Security-Flavored Flows

### 7.1 Invalid / Missing JWT

- With no token:
  - Navigate to `/`.
  - Assert redirect to `/login`.
- With a malformed or expired token in `localStorage`:
  - Load `/`.
  - Assert workspace fails gracefully:
    - Either redirects to login or shows “Not Authenticated” view with “Go to Login” button (per `WorkspaceView` behavior).

### 7.2 Backend 4xx/5xx for Pages

- Under controlled conditions (test backend or seeded failure):
  - Cause `/api/pages` or `/api/pages/{type}` to return a 400/500.
- Assert:
  - A user-friendly error message appears (error view in `WorkspaceView` or toast).
  - No raw stack traces or internal details are shown.

### 7.3 Demo Shop Invalid IDs

- Visit `/shop/not-a-uuid`:
  - Assert 400 error boundary message (“Invalid Shop ID”) and descriptive copy.
- Visit `/shop/{nonexistentUuid}`:
  - Assert 404 error boundary message (“Shop not found” / equivalent).
  - “Go Back” navigates back; “Try Again” reloads current route.

## 8. Accessibility and UX Sanity Checks

- Use `@axe-core/playwright` on:
  - `/login`
  - Theme Builder workspace (Home page)
  - Demo Shop home (`/shop/{id}`)
- Assert:
  - No critical a11y violations for role/label issues on main flows.
  - Basic keyboard navigation works for primary actions (login submit, page select, Save/Reset, Demo).

