# Implementation Plan: Demo Shop General Data Layer

## 1. Overview

The Demo Shop General Data Layer is responsible for fetching and managing shop-wide information that applies across all pages of the published e-commerce store. This includes the shop's basic information (name) and global theme settings (colors, fonts) that are applied consistently throughout the entire application. The data is fetched once when the application initializes and made available to all routes and components via React Context.

**Purpose:**
- Fetch shop metadata and theme settings from the backend API
- Provide global access to shop data throughout the application
- Apply theme settings as CSS custom properties for consistent styling
- Handle loading states and errors gracefully at the application level

**Key Characteristics:**
- Single source of truth for shop data accessed by all pages
- Fetched once on application bootstrap, not per-route
- Theme settings applied globally via CSS variables
- Error handling that affects entire application (404 means shop doesn't exist)

## 2. Data Flow Architecture

### Application Bootstrap Flow

```
App Entry Point (root.tsx or main.tsx)
    ↓
Root Route Loader (fetches shop data by shopId)
    ↓
ShopDataContext.Provider (wraps entire app)
    ↓
All Child Routes & Components (access via useShopData hook)
```

### Data Access Pattern

```
Component needs shop name or theme
    ↓
useShopData() hook
    ↓
Returns: { shop, theme, isLoading, error }
    ↓
Component renders with shop data
```

## 3. Component Structure

```
Root Route (app/root.tsx)
├── ShopDataProvider (context provider)
│   ├── Outlet (React Router outlet for all routes)
│   │   ├── Home Route
│   │   ├── Catalog Route
│   │   ├── Product Route
│   │   └── Contact Route
│   └── ErrorBoundary (shop not found errors)
└── ThemeApplicator (applies CSS variables)
```

## 4. Component Details

### ShopDataProvider

- **Component description:** Context provider that manages shop data state and makes it available to all child components. Receives shop data from root loader and exposes it via React Context API.

- **Main elements:**
  - `ShopDataContext` React context with shop data, loading state, and error state
  - Context provider wrapping `<Outlet />` to provide data to all routes
  - No visual rendering (pure data provider)

- **Handled events:**
  - None (data provider only)

- **Validation conditions:**
  - Validates shop data exists before providing to context
  - Ensures theme settings have required structure
  - Handles missing or incomplete data gracefully

- **Types:**
  - `ShopData` (DTO from API)
  - `ThemeSettings` (DTO from API)
  - `ShopDataContextValue` (context value type)

- **Props:**
  - `initialData: ShopData` - Shop data from root loader
  - `children: React.ReactNode` - Child components (typically `<Outlet />`)

### useShopData Hook

- **Hook description:** Custom React hook that provides access to shop data from context. Returns shop information, theme settings, loading state, and error state. Must be used within ShopDataProvider.

- **Return value:**
  ```typescript
  {
    shop: ShopData | null;
    theme: ThemeSettings | null;
    isLoading: boolean;
    error: Error | null;
  }
  ```

- **Usage example:**
  ```typescript
  const { shop, theme, isLoading, error } = useShopData();
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <h1>{shop.name}</h1>;
  ```

- **Validation conditions:**
  - Throws error if used outside ShopDataProvider
  - Returns loading state during initial fetch
  - Returns error state if shop fetch failed

### ThemeApplicator

- **Component description:** Utility component that applies theme settings as CSS custom properties to the document root. Runs as side effect when theme data changes. Uses `useEffect` to inject CSS variables.

- **Main elements:**
  - `useEffect` hook that sets CSS custom properties on `:root`
  - Maps theme colors to CSS variables (`--color-primary`, `--color-secondary`, etc.)
  - Maps theme fonts to CSS variables (`--font-heading`, `--font-body`)
  - No visual rendering (side effect only)

- **Handled events:**
  - None (side effect component)

- **Validation conditions:**
  - Only applies theme if valid theme settings exist
  - Falls back to default CSS values if theme is null
  - Validates color format (hex)
  - Validates font names are non-empty strings

- **Types:**
  - `ThemeSettings` (from context)

- **Props:**
  - None (reads from `useShopData()` hook)

### Root Loader

- **Loader description:** React Router loader function defined at the root route level. Fetches shop data by `shopId` parameter before rendering any routes. Provides data to ShopDataProvider via `useLoaderData()`.

- **Loader signature:**
  ```typescript
  export async function loader({ params }: LoaderFunctionArgs): Promise<ShopData>
  ```

- **Responsibilities:**
  - Extract `shopId` from route params
  - Validate `shopId` format (UUID)
  - Fetch shop data from `/api/public/shops/{shopId}`
  - Handle HTTP errors (404, 500)
  - Return shop data or throw Response for error boundary

- **Error handling:**
  - 400 Bad Request: Invalid `shopId` format
  - 404 Not Found: Shop does not exist
  - 500 Server Error: Backend failure
  - Network Error: API unreachable

## 5. Types

### ShopData (DTO from API)

Complete shop information returned from `/api/public/shops/{shopId}` endpoint.

```typescript
interface ShopData {
  id: string;
  name: string;
  theme_settings: ThemeSettings;
}
```

**Field breakdown:**
- `id: string` - UUID of the shop (matches `shopId` route param)
- `name: string` - Shop name displayed in header/footer or title
- `theme_settings: ThemeSettings` - Global theme configuration object

**Source:** Backend API response from `/api/public/shops/{shopId}`

### ThemeSettings (DTO from API)

Global theme configuration applied across all pages and components.

```typescript
interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    surface?: string;
    text: string;
    textLight?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}
```

**Field breakdown:**
- `colors.primary: string` - Primary brand color (hex format, e.g., `#3B82F6`)
- `colors.secondary: string` - Secondary accent color (hex format)
- `colors.accent: string` (optional) - Additional accent color (hex format)
- `colors.background: string` - Default page background color (hex format)
- `colors.surface: string` (optional) - Surface/card background color (hex format)
- `colors.text: string` - Default text color (hex format)
- `colors.textLight: string` (optional) - Lighter text color for secondary content (hex format)
- `fonts.heading: string` - Font family for headings (e.g., `"Inter"`, `"Playfair Display"`)
- `fonts.body: string` - Font family for body text (e.g., `"Inter"`)

**Usage:** Mapped to CSS custom properties for consistent theming

### ShopDataContextValue (Context Type)

Shape of the data provided by ShopDataContext.

```typescript
interface ShopDataContextValue {
  shop: ShopData | null;
  theme: ThemeSettings | null;
  isLoading: boolean;
  error: Error | null;
}
```

**Field breakdown:**
- `shop: ShopData | null` - Shop information, null during loading or on error
- `theme: ThemeSettings | null` - Theme settings, null during loading or on error
- `isLoading: boolean` - True while shop data is being fetched
- `error: Error | null` - Error object if fetch failed, null otherwise

**Usage:** Returned by `useShopData()` hook to consuming components

### CSS Custom Properties Mapping

Theme settings are mapped to CSS custom properties:

```typescript
type CSSCustomProperties = {
  '--color-primary': string;        // from theme.colors.primary
  '--color-secondary': string;      // from theme.colors.secondary
  '--color-accent': string;         // from theme.colors.accent
  '--color-background': string;     // from theme.colors.background
  '--color-surface': string;        // from theme.colors.surface
  '--color-text': string;           // from theme.colors.text
  '--color-text-light': string;     // from theme.colors.textLight
  '--font-heading': string;         // from theme.fonts.heading
  '--font-body': string;            // from theme.fonts.body
};
```

**Application:** Set on `document.documentElement.style` for global access

## 6. State Management

### React Router Loader-Based Approach

The shop data is fetched at the root route level using React Router's loader pattern. This ensures data is available before any child routes render.

**Root Loader Implementation:**
```typescript
// app/root.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { shopId } = params;

  // Validate shopId format
  if (!isValidUuid(shopId)) {
    throw new Response("Invalid shop ID", { status: 400 });
  }

  // Fetch shop data
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/public/shops/${shopId}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Response("Shop not found", { status: 404 });
    }
    throw new Response("Failed to load shop", { status: 500 });
  }

  const shopData: ShopData = await response.json();
  return shopData;
}
```

**Data Availability:**
- Fetched before root component renders
- Available via `useLoaderData<typeof loader>()` in root component
- Passed to ShopDataProvider as `initialData` prop
- Distributed to all child routes via context

### Context-Based Distribution

Once loaded, shop data is provided via React Context to avoid prop drilling.

**Context Implementation:**
```typescript
// app/contexts/ShopDataContext.tsx
const ShopDataContext = createContext<ShopDataContextValue | undefined>(undefined);

export function ShopDataProvider({
  initialData,
  children
}: {
  initialData: ShopData;
  children: React.ReactNode;
}) {
  const [shop] = useState<ShopData | null>(initialData);
  const [theme] = useState<ThemeSettings | null>(initialData.theme_settings);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  const value = { shop, theme, isLoading, error };

  return (
    <ShopDataContext.Provider value={value}>
      {children}
    </ShopDataContext.Provider>
  );
}
```

**Hook Implementation:**
```typescript
export function useShopData(): ShopDataContextValue {
  const context = useContext(ShopDataContext);

  if (context === undefined) {
    throw new Error('useShopData must be used within ShopDataProvider');
  }

  return context;
}
```

### No Client-Side Refetching

For MVP, shop data is fetched once on application load and not refetched:
- No polling or real-time updates
- No manual refresh mechanism
- User must reload page to see shop data changes
- Future enhancement: Add refetch capability via loader revalidation

## 7. API Integration

### Endpoint: Get Shop

**URL:** `GET /api/public/shops/{shopId}`

**Authentication:** None required (public endpoint)

**Request:**
- Method: GET
- Path Parameters:
  - `shopId: string` - UUID of the shop (from React Router route params)
- Query Parameters: None
- Headers: None

**Response:**

**Success (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "My Awesome Store",
  "theme_settings": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "accent": "#F59E0B",
      "background": "#FFFFFF",
      "surface": "#F9FAFB",
      "text": "#1F2937",
      "textLight": "#6B7280"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "shop_not_found",
  "message": "Shop not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "server_error",
  "message": "An unexpected error occurred"
}
```

### Implementation in Loader

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  const { shopId } = params;
  const API_URL = import.meta.env.VITE_API_URL;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!shopId || !uuidRegex.test(shopId)) {
    throw new Response("Invalid shop ID format", { status: 400 });
  }

  try {
    const response = await fetch(`${API_URL}/api/public/shops/${shopId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("This shop could not be found", { status: 404 });
      }
      throw new Response("Failed to load shop data", { status: 500 });
    }

    const shopData: ShopData = await response.json();

    // Validate response structure
    if (!shopData.id || !shopData.name || !shopData.theme_settings) {
      throw new Response("Invalid shop data received", { status: 500 });
    }

    return shopData;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    // Network error or other exception
    throw new Response("Network error: Could not connect to server", { status: 503 });
  }
}
```

**Environment Configuration:**
- API base URL configured via `VITE_API_URL` environment variable
- Must be set in `.env` file for demo-shop application
- Example: `VITE_API_URL=http://localhost:8000` for development

**Error Handling:**
- Network errors throw 503 Service Unavailable
- Invalid UUID throws 400 Bad Request
- Missing shop throws 404 Not Found
- Invalid response structure throws 500 Internal Server Error
- React Router catches thrown responses and renders ErrorBoundary

## 8. Theme Application Strategy

### CSS Custom Properties Injection

Theme settings are applied as CSS custom properties on the document root element for global access.

**ThemeApplicator Component:**
```typescript
export function ThemeApplicator() {
  const { theme } = useShopData();

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // Apply colors
    if (theme.colors) {
      root.style.setProperty('--color-primary', theme.colors.primary);
      root.style.setProperty('--color-secondary', theme.colors.secondary);
      if (theme.colors.accent) {
        root.style.setProperty('--color-accent', theme.colors.accent);
      }
      root.style.setProperty('--color-background', theme.colors.background);
      if (theme.colors.surface) {
        root.style.setProperty('--color-surface', theme.colors.surface);
      }
      root.style.setProperty('--color-text', theme.colors.text);
      if (theme.colors.textLight) {
        root.style.setProperty('--color-text-light', theme.colors.textLight);
      }
    }

    // Apply fonts
    if (theme.fonts) {
      root.style.setProperty('--font-heading', theme.fonts.heading);
      root.style.setProperty('--font-body', theme.fonts.body);
    }
  }, [theme]);

  return null; // This component renders nothing
}
```

**Usage in Components:**
```css
/* Component CSS or Tailwind config */
.heading {
  color: var(--color-primary);
  font-family: var(--font-heading);
}

.body-text {
  color: var(--color-text);
  font-family: var(--font-body);
}
```

**Tailwind Integration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
};
```

**Fallback Strategy:**
If theme settings are missing or invalid, CSS defaults are used:
```css
:root {
  /* Default color scheme */
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-text: #1F2937;
  --color-text-light: #6B7280;

  /* Default fonts */
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
```

## 9. Error Handling

### Loader-Level Errors

**Invalid Shop ID (400 Bad Request):**
- Scenario: `shopId` parameter is not a valid UUID format
- Handling: Loader validates UUID with regex before API call, throws 400 Response if invalid
- User Experience: ErrorBoundary displays "Invalid shop URL" message
- Recovery: User needs correct URL with valid shop UUID

**Shop Not Found (404):**
- Scenario: `shopId` does not exist in backend database
- Handling: API returns 404, loader throws 404 Response
- User Experience: ErrorBoundary displays "Shop not found" with friendly message
- Recovery: User should verify URL or contact shop owner

**Server Error (500):**
- Scenario: Backend API encounters unexpected error
- Handling: API returns 500, loader throws 500 Response
- User Experience: ErrorBoundary displays "Something went wrong" message
- Recovery: User can try refreshing; issue requires backend investigation

**Network Error (503):**
- Scenario: Cannot connect to backend API (API down, network failure)
- Handling: Fetch throws error, loader catches and throws 503 Response
- User Experience: ErrorBoundary displays "Could not connect to server" message
- Recovery: User can retry after network/server is restored

### ErrorBoundary Component

```typescript
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">
            {error.status}
          </h1>
          <h2 className="text-2xl font-semibold mb-4">
            {error.status === 404 && "Shop Not Found"}
            {error.status === 400 && "Invalid Request"}
            {error.status === 500 && "Server Error"}
            {error.status === 503 && "Service Unavailable"}
          </h2>
          <p className="text-text-light mb-8">
            {error.statusText || error.data}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Unexpected runtime error
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
        <p className="text-text-light mb-8">
          Something went wrong. Please try again.
        </p>
        {import.meta.env.DEV && error instanceof Error && (
          <pre className="text-left text-xs bg-surface p-4 rounded overflow-auto">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}
```

### Runtime Error Handling

**Theme Application Failure:**
- Scenario: Theme settings have invalid values that bypass validation
- Handling: ThemeApplicator wraps CSS property setting in try-catch
- User Experience: Page renders with default CSS values
- Recovery: Automatic fallback to default theme

**Context Access Error:**
- Scenario: Component tries to use `useShopData()` outside provider
- Handling: Hook throws error with descriptive message
- User Experience: Development error, should not occur in production
- Recovery: Fix component placement in component tree

## 10. Validation

### Shop ID Validation

**UUID Format Validation:**
- Condition: `shopId` must match UUID v4 format
- Validation Method: Regex pattern `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- Impact: Invalid format throws 400 Bad Request before API call
- UI Effect: ErrorBoundary displays "Invalid shop URL" message

**Example Valid UUID:** `660e8400-e29b-41d4-a716-446655440000`
**Example Invalid:** `abc-123`, `not-a-uuid`, `660e8400` (incomplete)

### Shop Data Structure Validation

**Required Fields:**
- Condition: Response must have `id`, `name`, and `theme_settings` properties
- Validation Method: Type check after JSON parsing
- Impact: Missing fields throw 500 Internal Server Error
- UI Effect: ErrorBoundary displays "Invalid shop data" message

**Theme Settings Validation:**
- Condition: `theme_settings.colors` and `theme_settings.fonts` must exist
- Validation Method: Type check before applying to CSS
- Impact: Missing theme structure falls back to default theme
- UI Effect: Page renders with default styling instead of custom theme

### Color Format Validation

**Hex Color Format:**
- Condition: All color values should be valid hex format (`#RRGGBB` or `#RGB`)
- Validation Method: Optional Zod schema or regex validation
- Impact: Invalid colors are skipped during CSS application
- UI Effect: Component uses fallback color from CSS defaults

**Example Valid Colors:** `#3B82F6`, `#10B981`, `#FFF`
**Example Invalid:** `blue`, `rgb(59, 130, 246)`, `#GGGGGG`

### Font Validation

**Font Name Validation:**
- Condition: Font family names must be non-empty strings
- Validation Method: String length check before applying to CSS
- Impact: Empty fonts fall back to system font stack
- UI Effect: Text renders with default font (Inter or system fonts)

## 11. Implementation Steps

### 1. Create Type Definitions

- Create `app/types/shop.ts` file in demo-shop project
- Define `ShopData` interface matching API response structure
- Define `ThemeSettings` interface with colors and fonts
- Define `ShopDataContextValue` interface for context shape
- Export all types for use throughout application

**File:** `app/types/shop.ts`
```typescript
export interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    surface?: string;
    text: string;
    textLight?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface ShopData {
  id: string;
  name: string;
  theme_settings: ThemeSettings;
}

export interface ShopDataContextValue {
  shop: ShopData | null;
  theme: ThemeSettings | null;
  isLoading: boolean;
  error: Error | null;
}
```

### 2. Create API Utility Functions

- Create `app/lib/api.ts` for API helper functions
- Export `API_URL` constant from environment variable
- Create `isValidUuid()` function for UUID validation
- Create `fetchShopData()` function for shop data fetching
- Add proper error handling and TypeScript types

**File:** `app/lib/api.ts`
```typescript
export const API_URL = import.meta.env.VITE_API_URL;

export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function fetchShopData(shopId: string): Promise<ShopData> {
  if (!isValidUuid(shopId)) {
    throw new Response("Invalid shop ID format", { status: 400 });
  }

  const response = await fetch(`${API_URL}/api/public/shops/${shopId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Response("Shop not found", { status: 404 });
    }
    throw new Response("Failed to load shop data", { status: 500 });
  }

  return response.json();
}
```

### 3. Implement ShopDataContext

- Create `app/contexts/ShopDataContext.tsx` file
- Implement `ShopDataContext` using `createContext()`
- Implement `ShopDataProvider` component with state management
- Implement `useShopData` custom hook with validation
- Export provider and hook for use in application

**File:** `app/contexts/ShopDataContext.tsx`
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import type { ShopData, ThemeSettings, ShopDataContextValue } from '~/types/shop';

const ShopDataContext = createContext<ShopDataContextValue | undefined>(undefined);

export function ShopDataProvider({
  initialData,
  children
}: {
  initialData: ShopData;
  children: ReactNode;
}) {
  const [shop] = useState<ShopData | null>(initialData);
  const [theme] = useState<ThemeSettings | null>(initialData.theme_settings);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  return (
    <ShopDataContext.Provider value={{ shop, theme, isLoading, error }}>
      {children}
    </ShopDataContext.Provider>
  );
}

export function useShopData(): ShopDataContextValue {
  const context = useContext(ShopDataContext);
  if (context === undefined) {
    throw new Error('useShopData must be used within ShopDataProvider');
  }
  return context;
}
```

### 4. Implement ThemeApplicator

- Create `app/components/ThemeApplicator.tsx` file
- Use `useShopData()` hook to access theme settings
- Implement `useEffect` to apply CSS custom properties to `:root`
- Map theme colors to `--color-*` CSS variables
- Map theme fonts to `--font-*` CSS variables
- Handle null/undefined theme gracefully
- Return null (this component doesn't render anything)

**File:** `app/components/ThemeApplicator.tsx`
```typescript
import { useEffect } from 'react';
import { useShopData } from '~/contexts/ShopDataContext';

export function ThemeApplicator() {
  const { theme } = useShopData();

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // Apply colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          root.style.setProperty(cssVarName, value);
        }
      });
    }

    // Apply fonts
    if (theme.fonts) {
      root.style.setProperty('--font-heading', theme.fonts.heading);
      root.style.setProperty('--font-body', theme.fonts.body);
    }
  }, [theme]);

  return null;
}
```

### 5. Update Root Route Configuration

- Locate or create `app/root.tsx` (main React Router root file)
- Update route configuration in `app/routes.ts` to include `shopId` parameter
- Define root route as `/shop/:shopId`
- Ensure all child routes inherit this parameter

**File:** `app/routes.ts`
```typescript
import { type RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/shop/:shopId",
    file: "root.tsx",
    children: [
      { index: true, file: "routes/home.tsx" },
      { path: "catalog", file: "routes/catalog.tsx" },
      { path: "product/:productId", file: "routes/product.tsx" },
      { path: "contact", file: "routes/contact.tsx" },
    ],
  },
] satisfies RouteConfig;
```

### 6. Implement Root Loader

- Add `loader` function to `app/root.tsx`
- Extract `shopId` from route params
- Call `fetchShopData(shopId)` utility function
- Handle errors by throwing Response objects for ErrorBoundary
- Return shop data for use in root component

**File:** `app/root.tsx` (loader section)
```typescript
import { LoaderFunctionArgs } from "react-router";
import { fetchShopData } from "~/lib/api";
import type { ShopData } from "~/types/shop";

export async function loader({ params }: LoaderFunctionArgs): Promise<ShopData> {
  const { shopId } = params;

  if (!shopId) {
    throw new Response("Shop ID is required", { status: 400 });
  }

  try {
    return await fetchShopData(shopId);
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    throw new Response("Network error", { status: 503 });
  }
}
```

### 7. Integrate ShopDataProvider in Root Component

- Import `ShopDataProvider` in `app/root.tsx`
- Use `useLoaderData<typeof loader>()` to access shop data
- Wrap `<Outlet />` with `ShopDataProvider`
- Pass loader data as `initialData` prop
- Include `ThemeApplicator` component to apply CSS variables

**File:** `app/root.tsx` (component section)
```typescript
import { useLoaderData, Outlet } from "react-router";
import { ShopDataProvider } from "~/contexts/ShopDataContext";
import { ThemeApplicator } from "~/components/ThemeApplicator";

export default function Root() {
  const shopData = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{shopData.name}</title>
      </head>
      <body>
        <ShopDataProvider initialData={shopData}>
          <ThemeApplicator />
          <Outlet />
        </ShopDataProvider>
      </body>
    </html>
  );
}
```

### 8. Implement Root ErrorBoundary

- Add `ErrorBoundary` export to `app/root.tsx`
- Use `useRouteError()` and `isRouteErrorResponse()` from React Router
- Handle different HTTP status codes (400, 404, 500, 503)
- Display user-friendly error messages for each case
- Include "Try Again" button that reloads the page
- Show stack trace in development mode only

**File:** `app/root.tsx` (error boundary section)
```typescript
import { useRouteError, isRouteErrorResponse } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Error</title>
        </head>
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 text-center">
              <h1 className="text-6xl font-bold text-blue-600 mb-4">
                {error.status}
              </h1>
              <h2 className="text-2xl font-semibold mb-4">
                {error.status === 404 && "Shop Not Found"}
                {error.status === 400 && "Invalid Request"}
                {error.status === 500 && "Server Error"}
                {error.status === 503 && "Service Unavailable"}
              </h2>
              <p className="text-gray-600 mb-8">
                {error.statusText || error.data}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error</title>
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
            <p className="text-gray-600 mb-8">
              Something went wrong. Please try again.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### 9. Configure Tailwind CSS Theme Extension

- Update `tailwind.config.js` to reference CSS custom properties
- Extend theme colors to use `var(--color-*)` variables
- Extend theme fonts to use `var(--font-*)` variables
- This allows using theme colors via Tailwind classes like `bg-primary`, `text-secondary`

**File:** `tailwind.config.js`
```javascript
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### 10. Add CSS Default Theme Variables

- Update global CSS file (e.g., `app/app.css` or `app/root.css`)
- Define default CSS custom properties on `:root`
- These serve as fallbacks if theme settings fail to load
- Ensure variables match the names used by ThemeApplicator

**File:** `app/app.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Default color scheme */
    --color-primary: #3B82F6;
    --color-secondary: #10B981;
    --color-accent: #F59E0B;
    --color-background: #FFFFFF;
    --color-surface: #F9FAFB;
    --color-text: #1F2937;
    --color-text-light: #6B7280;

    /* Default fonts */
    --font-heading: 'Inter', system-ui, sans-serif;
    --font-body: 'Inter', system-ui, sans-serif;
  }

  body {
    font-family: var(--font-body);
    color: var(--color-text);
    background-color: var(--color-background);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
}
```

### 11. Test with Sample Shop Data

- Verify root loader fetches shop data correctly
- Test with valid shop UUID to confirm 200 response
- Test with invalid UUID to confirm 400 error handling
- Test with non-existent UUID to confirm 404 error handling
- Simulate network error to confirm 503 error handling
- Verify theme CSS variables are applied to document root
- Check that Tailwind classes (e.g., `bg-primary`) use theme colors

### 12. Validate Hook Usage

- Create a test component that uses `useShopData()` hook
- Verify hook returns correct shop data, theme, loading, and error states
- Test that hook throws error when used outside ShopDataProvider
- Verify all child routes can access shop data via hook
- Confirm theme changes are reflected across all components

### 13. Document Usage for Developers

- Add JSDoc comments to `useShopData()` hook explaining usage
- Document CSS custom properties in `app/app.css` with comments
- Update project README with information about shop data fetching
- Document the shop ID parameter requirement in routing
- Add examples of using shop data and theme in components

**Example usage documentation:**
```typescript
/**
 * Custom hook to access shop data and theme settings.
 * Must be used within a component that is a child of ShopDataProvider.
 *
 * @returns {ShopDataContextValue} Object containing shop, theme, isLoading, and error
 *
 * @example
 * function MyComponent() {
 *   const { shop, theme, isLoading, error } = useShopData();
 *
 *   if (isLoading) return <p>Loading...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *
 *   return <h1>{shop.name}</h1>;
 * }
 */
export function useShopData(): ShopDataContextValue {
  // implementation
}
```

### 14. Optional: Add Zod Validation

- Install Zod: `npm install zod`
- Create Zod schemas for `ShopData` and `ThemeSettings`
- Validate API response structure before using data
- Provide detailed error messages for invalid data
- This step is optional but recommended for production

**File:** `app/types/shop.ts` (with Zod)
```typescript
import { z } from 'zod';

export const ThemeSettingsSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    textLight: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
  fonts: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
  }),
});

export const ShopDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
  theme_settings: ThemeSettingsSchema,
});

export type ShopData = z.infer<typeof ShopDataSchema>;
export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>;
```

## 12. Success Criteria

### Functional Requirements

- ✅ Shop data is fetched from `/api/public/shops/{shopId}` endpoint
- ✅ Root loader provides shop data before rendering any routes
- ✅ ShopDataProvider makes data available to all child components
- ✅ `useShopData()` hook works in any component within provider
- ✅ Theme settings are applied as CSS custom properties
- ✅ Tailwind CSS classes reference theme colors and fonts
- ✅ All error scenarios (400, 404, 500, 503) are handled gracefully
- ✅ ErrorBoundary displays user-friendly messages for each error type

### User Experience Requirements

- ✅ Shop name appears in browser title and can be used in header
- ✅ Theme colors are visible immediately on page load
- ✅ Custom fonts are applied consistently across all components
- ✅ Error pages are styled and provide clear guidance
- ✅ No flash of unstyled content (FOUC) due to theme loading

### Technical Requirements

- ✅ Type safety with TypeScript interfaces for all data structures
- ✅ Proper error handling with React Router error boundaries
- ✅ Environment variable configuration for API URL
- ✅ UUID validation before making API requests
- ✅ Graceful fallback to default theme if settings are invalid
- ✅ No prop drilling (context-based data distribution)
- ✅ Documentation for other developers on using shop data

## 13. Future Enhancements

### Out of MVP Scope (for future iterations):

- **Automatic Refetching:** Implement periodic refetching or real-time updates of shop data
- **Loading Skeletons:** Add skeleton UI during initial shop data load
- **Retry Logic:** Implement automatic retry for failed API requests
- **Caching:** Cache shop data in localStorage to reduce API calls
- **Multiple Shops:** Support viewing multiple shops without full page reload
- **Theme Preview:** Allow previewing different themes without saving
- **Font Loading:** Implement web font loading strategy (Google Fonts, etc.)
- **Color Scheme Toggle:** Add dark mode support based on theme settings
- **Analytics:** Track shop views and theme engagement
- **SEO Optimization:** Add meta tags based on shop data for better SEO
