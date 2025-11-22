# Demo Shop – Unit Test Plan (Vitest)

This document outlines a high‑ROI unit test plan for the `demo-shop/` module, ordered by implementation priority.

---

## Phase 1 – Core data & validation (completed)

---

## Phase 2 – Hooks (async state + URL coupling)

**Goal:** Ensure hooks correctly orchestrate async flows, URL parameters, and loading/error state.

### 6. `app/hooks/useCategories.test.tsx`

- **Target:** `useCategories`
- **Why:** Centralizes category fetching; multiple components rely on its loading/error semantics.
- **Scenarios:**
  - Successful fetch: categories populated, `isLoading` toggles `true → false`, `error` is `null`.
  - Failing fetch: `error` set, `categories` empty, `isLoading` toggles correctly.
  - `refetch` re-runs the fetch logic after failure or success.

---

## Phase 3 – Dynamic component system

**Goal:** Protect the dynamic rendering pipeline that turns layout JSON into React components.

### 7. `app/components/DynamicComponentRenderer.test.tsx`

- **Target:** `DynamicComponentRenderer`, `renderComponent`, `validateComponentProps`
- **Why:** High-leverage: merges runtime defaults, validates via Zod schemas, and handles invalid/unknown components.
- **Setup:** `vi.mock('../../component-registry.config')` to expose a small fake `componentRegistry`, `schemaRegistry`, and `isValidComponentType`.
- **Scenarios:**
  - `layout.layout.components` missing or not an array → renders “No Content Configured” destructive alert.
  - Unknown `type` in configuration → renders “Configuration Error” alert with helpful message.
  - Valid type but schema validation fails → renders “Invalid Component Configuration” alert; in `NODE_ENV='development'`, shows error message in `<pre>`.
  - Valid type and valid props:
    - Default runtime props merged with stored props (e.g., for `CategoryPills` / `ProductListGrid`).
    - Underlying component receives fully validated props (assert via a mocked component that records props).

---

## Phase 4 – Routes / loaders / error mapping

**Goal:** Verify URL validation, SSR data loading behavior, and user-facing error responses.

### 8. `app/routes/shop.$shopId.catalog.test.tsx`

- **Targets:** `loader`, `shouldRevalidate`, `meta`
- **Why:** Catalog is core UX; behavior relies heavily on loader + search-param optimizations.
- **Loader scenarios (tested as a plain async function with mocked `fetch` and `isValidUuid`):**
  - Missing or invalid `shopId` → throws `Response` with status 400.
  - API returns 404 → throws `Response` with status 404 (“Catalog page not found”).
  - API returns 500 or other non-OK status → throws `Response` with status 500 (“Failed to load catalog page”).
  - Successful 200 with valid JSON → returns `ShopPageLoaderData` (`shopId`, `page`, empty `theme` object).
- **`shouldRevalidate` scenarios:**
  - `currentUrl.pathname === nextUrl.pathname` but search changes → returns `false` (no revalidate on filter changes).
  - Pathname changes → returns `defaultShouldRevalidate`.
- **`meta` scenarios:**
  - `data` undefined → returns “Catalog Not Found” title + not-found description.
  - `data` defined → returns static “Product Catalog” title + description.

### 9. `app/routes/shop.$shopId.test.tsx`

- **Targets:** `loader`, `ErrorBoundary`
- **Why:** Home page is the default entry; loader and error mapping determine first impressions.
- **Loader scenarios:**
  - Same pattern as catalog: invalid UUID, 404 (“Shop not found”), generic 500, success returning `ShopPageLoaderData` with `page` and `theme: {}`.
- **ErrorBoundary scenarios:**
  - Given 400/404/500 `RouteErrorResponse`, renders appropriate title & description text.
  - Given non-route `Error`, renders “Unexpected Error” and, in dev, includes stack trace.

### 10. `app/routes/shop.$shopId.contact.test.tsx`

- **Targets:** `loader`, `meta`, `ErrorBoundary`
- **Why:** Mirrors catalog but with contact-specific endpoint; good candidate to keep behavior consistent.
- **Loader scenarios:**
  - Invalid UUID → 400 Response.
  - 404 from API → 404 Response with “Contact page not found”.
  - 500+ → 500 Response with “Failed to load contact page data”.
  - Success → returns `ShopPageLoaderData` with `page` and empty `theme`.
- **`meta` scenarios:**
  - `data` undefined → “Page Not Found” meta.
  - `data` defined → title includes `Contact Us - Shop ${data.shopId}` and generic contact description.
- **ErrorBoundary scenarios:**
  - Status-specific messaging for 400 / 404 / 500 as per implementation.
  - Non-route error path matches the generic “Unexpected Error” UI.

### 11. `app/root.test.tsx`

- **Target:** `ErrorBoundary` at root
- **Why:** Global fallback; a subtle bug here could break the whole app’s error experience.
- **Scenarios:**
  - 404 `RouteErrorResponse` → “404” heading with not-found description.
  - Non-404 `RouteErrorResponse` → generic “Error” heading with status text.
  - Plain `Error` in dev mode → “Oops!” heading with message and stack rendered inside `<pre>`.

---

## Phase 5 – Containers (wiring & URL behavior)

**Goal:** Confirm that container components correctly map hooks and URL state into shared presentational components.

### 12. `app/containers/CategoryPillsContainer.test.tsx`

- **Targets:** `CategoryPillsContainer`
- **Why:** Bridges `useCategories` state with URL search params and shared UI; bugs here silently break filtering UX.
- **Setup:** Mock `useCategories` and either:
  - Use a test router with initial URL (MemoryRouter + `useSearchParams`), or
  - Mock `useSearchParams` directly with a controlled `[URLSearchParams, setSearchParams]` pair.
- **Scenarios:**
  - When `useCategories` returns data, `CategoryPills` receives correct `categories`, `selectedCategoryId`, `isLoading`, and `error`.
  - Initial URL with no `category` param → `selectedCategoryId` is `null`.
  - Initial URL with `?category=2` → `selectedCategoryId` is `2`.
  - Invoking `onCategorySelect(null)` removes the `category` param from the URL.
  - Invoking `onCategorySelect(3)` sets `category=3` in the URL (and uses `replace: true`).

### 13. `app/containers/ProductListGridContainer.test.tsx`

- **Targets:** `ProductListGridContainer`
- **Why:** Wires `useProducts` into `ProductListGrid`, including retry behavior and layout options.
- **Setup:** Mock `useProducts` and `ProductListGrid` to capture props.
- **Scenarios:**
  - Default `productsPerRow` is `3` when prop is omitted.
  - Custom `productsPerRow` is passed through when provided.
  - `products`, `isLoading`, `error`, and `refetch` from the hook are forwarded as `products`, `isLoading`, `error`, and `onRetry`.

---

## Optional / Low Priority

### 14. `app/lib/utils.test.ts`

- **Target:** `cn`
- **Why:** Very small function; tests are mostly for coverage padding. Implement only if you need to raise coverage thresholds further.
- **Scenarios:**
  - Combines multiple string class names.
  - Handles falsy values (`null`, `undefined`, `false`) correctly.
  - Confirms `tailwind-merge` deduplication behavior for simple cases.

---

## Implementation Notes

- **Test runner:** Use `npm test` / `vitest` in the `demo-shop` directory.
- **Environment:** `vitest.config.ts` is already configured for `jsdom`, React, and `tsconfig` paths.
- **Network mocking:** Prefer MSW (`app/test/mocks`) for route-level tests; use `vi.spyOn(global, 'fetch')` for ultra-focused unit tests where MSW is unnecessary.
- **Order of implementation:** Follow phase order (1 → 5). Each phase increases confidence while keeping per-test complexity manageable.
