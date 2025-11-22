# View Implementation Plan: Demo Shop Contact Page

## 1. Overview

The Demo Shop Contact Page is one of the four default pages in the e-commerce store preview application. It fetches and renders the saved contact page layout configuration from the backend API, applies global theme settings, and displays components dynamically using the shared component registry. The page is built using React Router 7 with server-side rendering capabilities and implements loader-based data fetching for optimal performance.

This view follows the same architectural patterns as the Home page but serves the "contact" page type, typically displaying contact forms, location information, business hours, and other communication-related components.

**Styling Approach:**
- All UI components and utilities use **Shadcn/ui** component library
- Shadcn/ui provides unstyled, accessible components built on Radix UI primitives
- Components are styled with Tailwind CSS utility classes
- Shadcn/ui components are copied into the project (`app/components/ui/`) for full customization
- The library provides consistent design tokens, accessibility patterns, and responsive behavior out of the box

## 2. View Routing

**Primary Route:** `/shop/:shopId/contact`

This route serves as the contact page for the Demo Shop. The `shopId` parameter identifies which shop's configuration should be loaded and rendered. This route will be defined in `react-router.config.ts` using React Router's route configuration API.

**Navigation Context:**
- Accessed via HeaderNavigation component links from Home, Catalog, or Product pages
- Direct URL access is supported for bookmarking or sharing
- Part of the main navigation structure of the Demo Shop

## 3. Component Structure

```
ShopContactRoute (route component)
├── ShopLayout (layout wrapper - shared with other pages)
│   └── DynamicComponentRenderer (layout renderer)
│       ├── HeaderNavigation (from shared components - consistent across pages)
│       ├── Heading (from shared components - page title/hero)
│       ├── TextSection (from shared components - contact information)
│       ├── ContactForm (from shared components - contact form)
│       └── ... (additional shared components as configured)
└── ErrorBoundary (route-level error handling)
```

## 4. Component Details

### ShopContactRoute

- **Component description:** Top-level route component that orchestrates data loading via React Router loader and renders the contact page layout. Handles loading states and provides data to child components through React Router's data loading mechanisms. Functions as the primary container for the contact page, managing theme application and component rendering.

- **Main elements:**
  - Root `<div>` container with full viewport height (`min-h-screen` class)
  - `DynamicComponentRenderer` component that receives contact page layout data
  - Theme application logic via `useEffect` hook
  - Meta tags for SEO optimization
  - Loading indicator during data fetch (handled by React Router transitions)
  - Error boundary fallback UI for error scenarios

- **Handled events:**
  - None (purely presentational, delegates all interactions to child components)
  - Theme application side effect on mount and theme data changes

- **Validation conditions:**
  - Validates that `shopId` parameter exists and is a valid UUID v4 format
  - Ensures loader data is available and properly structured before rendering
  - Handles cases where shop or contact page data is not found (404 scenarios)
  - Validates theme settings structure if present

- **Types:**
  - `ShopContactLoaderData` (custom ViewModel aggregating loader data)
  - `PageLayoutData` (DTO from API representing page structure)
  - `ThemeSettings` (DTO from API representing global theme configuration)
  - `Route.LoaderArgs` (React Router type for loader function parameters)
  - `Route.MetaArgs` (React Router type for meta function parameters)
  - `Route.ErrorBoundaryProps` (React Router type for error boundary)

- **Props:**
  - None (route component receives data from loader via `useLoaderData<typeof loader>()` hook)
  - Uses `params` from loader args to access `shopId`

### DynamicComponentRenderer

- **Component description:** Core rendering engine that maps JSON layout configuration to React components. Iterates through the contact page's component array and dynamically renders each component from the shared component registry based on component type identifiers. This component is reused across all page types (Home, Catalog, Product, Contact) and provides a consistent rendering mechanism.

- **Main elements:**
  - Wrapper `<div>` or `<Fragment>` for component list
  - Mapped array of shared components rendered from layout configuration
  - Each component receives validated props from layout data
  - Error placeholders for components that fail validation
  - Console warnings for unknown or invalid component types

- **Handled events:**
  - None (purely presentational, child components handle their own events)
  - Component rendering is reactive to layout data changes

- **Validation conditions:**
  - Validates each component configuration against its Zod schema before rendering
  - Handles missing or invalid component types gracefully (skips or shows placeholder)
  - Ensures required props are present for each component per its schema
  - Validates image URLs use HTTPS protocol
  - Checks color format compliance (hex format: #RGB or #RRGGBB)
  - Validates font family names are non-empty strings
  - Validates contact form fields (email format, required fields, text length limits)
  - Validates URL format for links in contact information components

- **Types:**
  - `ComponentConfig` (DTO representing single component configuration from API)
  - `ComponentRegistry` (map of component type string to React component reference)
  - Individual component prop types (HeaderNavigationProps, HeadingProps, TextSectionProps, ContactFormProps, etc.)
  - `ZodSchema` types for runtime validation

- **Props:**
  - `layout: PageLayoutData` - Complete layout configuration from API with component array
  - `themeSettings: ThemeSettings` - Global theme configuration (colors, fonts)

### ErrorBoundary

- **Component description:** Route-level error boundary that catches rendering errors, loader errors, and HTTP errors. Displays user-friendly error messages with appropriate status codes and allows recovery actions. Uses Shadcn/ui Alert component for consistent error presentation across all page types. Distinguishes between different error types (400, 404, 500) and provides contextual messaging specific to the contact page.

- **Main elements:**
  - Shadcn/ui `Alert` component with `variant="destructive"` for error message container
  - `AlertTitle` for error heading (e.g., "Invalid Shop ID", "Contact Page Not Found")
  - `AlertDescription` for detailed error explanation
  - Optional stack trace in `<pre>` block (development environment only)
  - Shadcn/ui `Button` components for recovery actions ("Go Back", "Try Again")
  - Responsive layout with centered positioning and max-width container

- **Handled events:**
  - Click event on "Go Back" button: `window.history.back()` for navigation
  - Click event on "Try Again" button: `window.location.reload()` for page refresh
  - No form submission or complex interaction handling

- **Validation conditions:**
  - Distinguishes between HTTP error responses and React rendering errors
  - Identifies 400 errors (invalid shop ID format)
  - Identifies 404 errors (shop not found or contact page not found)
  - Identifies 500 errors (server-side errors)
  - Shows appropriate messaging based on error type and context
  - Displays development information only in non-production environments

- **Types:**
  - `Route.ErrorBoundaryProps` (React Router type containing error object)
  - `Response` type for HTTP errors (from React Router's isRouteErrorResponse check)
  - `Error` type for React rendering errors

- **Props:**
  - `error: unknown` - Error object from React Router (can be Response or Error instance)

## 5. Types

### ShopContactLoaderData (ViewModel)

Custom view model that aggregates data from multiple API endpoints for efficient rendering. This type extends the pattern established by `ShopHomeLoaderData` but specifically typed for contact page context.

```typescript
interface ShopContactLoaderData {
  shopId: string;
  page: PageLayoutData;
  theme: ThemeSettings;
}
```

**Field breakdown:**
- `shopId: string` - UUID v4 format string identifying the shop, extracted from route params and validated before API calls
- `page: PageLayoutData` - Contact page layout configuration received from backend API, contains component array with contact-specific components
- `theme: ThemeSettings` - Global theme settings (colors, fonts) for the shop, applied consistently across all pages including contact

**Usage:**
- Returned from loader function after successful API fetch
- Accessed in route component via `useLoaderData<typeof loader>()`
- Passed to `DynamicComponentRenderer` for rendering
- Used in meta function for SEO optimization

### PageLayoutData (DTO from API)

Represents the page layout structure returned from `/api/public/shops/{shopId}/pages/contact` endpoint. This is the same structure used across all page types with different component configurations.

```typescript
interface PageLayoutData {
  type: string;
  layout: {
    components: ComponentConfig[];
  };
}
```

**Field breakdown:**
- `type: string` - Page type identifier, will be "contact" for this view (enum value from backend)
- `layout.components: ComponentConfig[]` - Ordered array of component configurations defining the page structure, typically includes HeaderNavigation, Heading, TextSection (contact info), ContactForm, Map components

**Validation:**
- Backend ensures `type` is valid enum value ("home", "catalog", "product", "contact")
- Frontend validates structure via TypeScript type checking
- Component array can be empty (valid but renders empty page)

### ComponentConfig (DTO)

Generic structure for a single component's configuration in the layout. Each component in the contact page layout array follows this structure.

```typescript
interface ComponentConfig {
  id: string;
  type: string;
  variant: string;
  props: Record<string, any>;
}
```

**Field breakdown:**
- `id: string` - Unique identifier for the component instance within the page, used as React key
- `type: string` - Component type identifier matching component registry keys (e.g., "ContactForm", "TextSection", "Map")
- `variant: string` - Selected variant of the component (e.g., "default", "inline", "full-width")
- `props: Record<string, any>` - Component-specific props validated against Zod schema at render time, structure varies by component type

**Contact Page Specific Components:**
- **ContactForm**: Props include field configurations, submit button text, success message, validation rules
- **TextSection**: Props for contact information (phone, email, address) with icons and formatting
- **Map**: Props for location display (coordinates, zoom level, markers)
- **Heading**: Props for page hero/title section
- **HeaderNavigation**: Props for consistent navigation across pages

### ThemeSettings (DTO)

Global theme configuration applied across all components on all pages. Fetched once and reused for consistent branding.

```typescript
interface ThemeSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
}
```

**Field breakdown:**
- `colors.primary?: string` - Primary brand color in hex format (#RRGGBB), used for buttons, links, accents
- `colors.secondary?: string` - Secondary accent color in hex format, used for hover states, secondary CTAs
- `colors.background?: string` - Default background color in hex format, applied to page root
- `colors.text?: string` - Default text color in hex format, used for body text and content
- `fonts.heading?: string` - Font family for headings (CSS font-family value, e.g., "Inter, sans-serif")
- `fonts.body?: string` - Font family for body text (CSS font-family value)

**Optional Fields:**
- All fields are optional to handle cases where theme hasn't been configured
- Components should provide fallback values for missing theme settings
- CSS custom properties provide cascading defaults

### ComponentRegistry (Type)

Maps component type strings to React component references. Used by DynamicComponentRenderer to lookup components for rendering.

```typescript
type ComponentRegistry = Record<string, React.ComponentType<any>>;
```

**Purpose:**
- Enables dynamic component rendering based on JSON configuration
- Provides type safety for component lookup operations
- Maintained in `component-registry.config.ts` as single source of truth

**Contact Page Relevant Components:**
- `HeaderNavigation`: Navigation bar with links to other pages
- `Heading`: Page title/hero section
- `TextSection`: Contact information display
- `ContactForm`: Contact form component (if implemented)
- `Map`: Location map component (if implemented)

## 6. State Management

State management for the contact page view is handled primarily through React Router's built-in data loading mechanisms, following the same pattern as the home page. No complex client-side state management is required.

**Loader-Based Data Fetching:**
- React Router's `loader` function fetches all required data (contact page layout, theme settings) before component rendering
- Data is provided to components via `useLoaderData<typeof loader>()` hook with full type safety
- Automatic error handling through React Router's error boundaries (throws Response objects)
- Built-in loading states during navigation managed by React Router transitions
- No loading spinners needed in component as React Router handles navigation states

**No Custom Hook Required:**
The contact page view does not require a custom state management hook because:
- All data is fetched server-side (or during route navigation) via loaders
- No client-side mutations occur on this view (read-only preview, form submissions would be handled by ContactForm component internally)
- Theme settings are applied via CSS custom properties on document root, not React state
- Component configurations are static once loaded from API
- Navigation state is managed by React Router automatically

**Theme Application Strategy:**
- Theme settings from loader data are applied to CSS custom properties on the document root element
- Uses `useEffect` in the route component to inject theme CSS variables on mount and when theme changes
- CSS variables cascade to all child components: `--color-primary`, `--color-secondary`, `--color-background`, `--color-text`, `--font-heading`, `--font-body`
- This allows all shared components to reference theme colors/fonts via CSS variables without prop drilling
- Theme persists across page navigation within the same shop (same theme applies to all pages)

**Local State (if needed):**
- Individual components (like ContactForm) may manage their own internal state
- Form field values, validation errors, and submission status are component-local
- No shared state between page-level component and form components
- Each component is self-contained and manages its own lifecycle

**Error State:**
- Handled automatically by React Router's error boundary mechanism
- Loader errors (network failures, 404s, 500s, validation errors) are caught and rendered by ErrorBoundary component
- No manual error state tracking required in route component
- Errors thrown in loader propagate to nearest ErrorBoundary

## 7. API Integration

### Endpoint: Get Shop Contact Page

**URL:** `GET /api/public/shops/{shopId}/pages/contact`

**Purpose:**
Fetches the saved contact page layout configuration and component structure for a specific shop. This endpoint is part of the public API and does not require authentication, allowing the Demo Shop to be publicly viewable.

**Request:**
- Method: GET
- Path Parameters:
  - `shopId: string` - UUID v4 format identifying the shop (validated by backend)
  - `type: string` - Implicitly "contact" via URL path segment
- Query Parameters: None
- Headers: None (public endpoint, no authentication required)
- Body: None (GET request)

**Request Example:**
```
GET http://localhost:8000/api/public/shops/a3f8d9e2-4b5c-6d7e-8f9a-0b1c2d3e4f5a/pages/contact
Accept: application/json
```

**Response:**
- Success (200 OK):
  ```typescript
  {
    type: "contact";
    layout: {
      components: [
        {
          id: "component-uuid-1",
          type: "HeaderNavigation",
          variant: "default",
          props: { /* navigation props */ }
        },
        {
          id: "component-uuid-2",
          type: "Heading",
          variant: "default",
          props: { /* heading props */ }
        },
        {
          id: "component-uuid-3",
          type: "TextSection",
          variant: "two-columns",
          props: { /* contact info props */ }
        },
        {
          id: "component-uuid-4",
          type: "ContactForm",
          variant: "default",
          props: { /* form props */ }
        }
      ];
    };
  }
  ```

- Not Found (404):
  ```typescript
  {
    error: "Page not found for this shop"
  }
  ```
  Occurs when shopId doesn't exist or contact page hasn't been created for this shop.

- Bad Request (400):
  ```typescript
  {
    error: "Invalid shop ID format"
  }
  ```
  Occurs when shopId is not a valid UUID v4 format (caught by frontend before API call).

- Server Error (500):
  ```typescript
  {
    error: "An unexpected error occurred"
  }
  ```
  Occurs when backend encounters unexpected error during data retrieval.

**Implementation in Loader:**

The loader function in `app/routes/shop.$shopId.contact.tsx` implements the API integration:

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  const { shopId } = params;

  // Validate shopId format before making API call
  if (!shopId || !isValidUuid(shopId)) {
    throw new Response("Invalid shop ID format", { status: 400 });
  }

  try {
    // Fetch contact page data from public API
    const response = await fetch(
      buildApiUrl(`/api/public/shops/${shopId}/pages/contact`)
    );

    // Handle non-success responses
    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("Contact page not found", { status: 404 });
      }
      throw new Response("Failed to load contact page data", { status: 500 });
    }

    // Parse JSON response
    const pageData: PageLayoutData = await response.json();

    // Return aggregated loader data
    const loaderData: ShopContactLoaderData = {
      shopId,
      page: pageData,
      theme: {}, // TODO: Fetch theme settings in future iteration
    };

    return loaderData;
  } catch (error) {
    // Handle network errors and re-throw Response errors
    if (error instanceof Response) {
      throw error;
    }
    console.error("Error loading contact page data:", error);
    throw new Response("Failed to load contact page data", { status: 500 });
  }
}
```

**Environment Configuration:**
- API base URL configured via `VITE_API_URL` environment variable (e.g., "http://localhost:8000")
- Loader function uses `buildApiUrl()` helper from `app/lib/api.ts` to construct full URL
- Different behavior for SSR (uses internal Docker network) vs client-side (uses external URL)

**Error Handling Strategy:**
- Network errors are caught and thrown as 500 Response objects
- React Router automatically catches thrown Response objects and renders ErrorBoundary
- Validation errors (invalid UUID) prevent API call and return 400 Bad Request
- Missing resources (shop or page not found) return 404 Not Found
- Server failures return 500 Internal Server Error
- All errors include user-friendly messages for ErrorBoundary display

**Future Enhancements:**
- Add theme settings endpoint integration (currently stubbed as empty object)
- Implement request caching to avoid redundant API calls
- Add retry logic for transient network failures
- Implement request timeout handling

## 8. User Interactions

The contact page is primarily a read-only view with minimal direct user interactions at the page level. Most interactions occur within individual components (ContactForm for submissions, Map for zoom/pan). The page-level interactions are limited to navigation and error recovery.

**Navigation Interactions:**
- **Header Navigation:** Users can click links within the HeaderNavigation component to navigate to other pages (Home, Catalog, Product)
  - Handled by React Router's `<Link>` component within the HeaderNavigation shared component
  - Clicking a navigation link triggers React Router's navigation and loader for the target route
  - Active page indicator shows user is on Contact page
  - Smooth client-side navigation with loading states

- **Back Navigation:** Users can use browser back button to return to previous page
  - React Router handles navigation history automatically
  - Loader re-fetches data if needed (based on cache policy)

- **Direct URL Access:** Users can access contact page directly via URL or bookmark
  - Loader fetches all required data on initial load
  - Full page renders with contact page layout

**Component-Level Interactions:**
- **Contact Form Submissions:** Handled internally by ContactForm component
  - User fills out form fields (name, email, message)
  - Validation provides real-time feedback
  - Submit button triggers form submission (implementation in ContactForm)
  - Success/error messages displayed within ContactForm component

- **Map Interactions:** Handled internally by Map component (if present)
  - User can zoom in/out, pan, click markers
  - All interactions contained within Map component
  - No page-level state changes

- **Link Clicks:** TextSection components may contain links (phone, email, social media)
  - Email links: `mailto:` protocol opens email client
  - Phone links: `tel:` protocol initiates phone call on mobile
  - External links: Open in new tab with `target="_blank" rel="noopener noreferrer"`

**Image Loading Interactions:**
- Images in components (Heading backgrounds, TextSection images, icons) load asynchronously
- Browser handles image loading states natively (progressive rendering)
- Failed image loads fall back to alt text or placeholder
- No JavaScript handling required for image loading

**Error Recovery Interactions:**
- **Error Boundary Display:** If ErrorBoundary is displayed due to loader error:
  - User sees clear error message in Shadcn/ui Alert component with red destructive styling
  - Two action buttons provided: "Go Back" and "Try Again"
  - "Go Back" button: Navigates to previous page using `window.history.back()`
  - "Try Again" button: Reloads current page using `window.location.reload()`
  - Both buttons have hover states and are keyboard accessible

- **Network Error Recovery:** If network fails during navigation:
  - Error boundary catches error and displays message
  - User can retry by clicking "Try Again" button
  - Alternatively, user can navigate away using "Go Back" button

**Scrolling Interactions:**
- If HeaderNavigation uses 'sticky' variant, header remains fixed during scroll
- Smooth scrolling behavior applied via CSS (`scroll-behavior: smooth`)
- No JavaScript scroll listeners required for basic scrolling
- Contact form or content sections scroll naturally with page

**Theme Visibility:**
- Global theme settings (colors, fonts) visible immediately on page load
- No user interaction required to view theme effects
- Theme applied via CSS custom properties ensures consistency across components
- Theme persists across navigation within same shop

**Accessibility Interactions:**
- Keyboard navigation: Tab through interactive elements (links, form fields, buttons)
- Screen reader support: All components use semantic HTML and ARIA labels
- Focus indicators: Visible focus states on all interactive elements
- Skip links: Allow keyboard users to skip to main content

## 9. Conditions and Validation

### Loader-Level Validation

**Shop ID Format Validation:**
- **Condition:** `shopId` parameter must be a valid UUID v4 format (8-4-4-4-12 hex pattern)
- **Validation Method:** `isValidUuid(shopId)` utility function using regex test
- **Validation Location:** Loader function, before API call
- **Impact if Invalid:** Loader throws 400 Bad Request Response object
- **UI Effect:** ErrorBoundary displays "Invalid Shop ID" alert with description
- **User Guidance:** Error message instructs user to check URL format
- **Recovery:** User needs correct URL with valid UUID v4 format

**Shop ID Existence Validation:**
- **Condition:** `shopId` must exist in database (shop must be created)
- **Validation Method:** Backend API query, checked via API response status
- **Validation Location:** Backend API, validated in loader via response check
- **Impact if Invalid:** API returns 404, loader throws 404 Not Found Response
- **UI Effect:** ErrorBoundary displays "Shop Not Found" alert
- **User Guidance:** Error explains shop doesn't exist or was removed
- **Recovery:** User needs valid shop ID or should contact support

**Contact Page Existence Validation:**
- **Condition:** Contact page must exist for the shop (one of four default pages)
- **Validation Method:** Backend database query, checked via API response
- **Validation Location:** Backend API, validated in loader via response
- **Impact if Invalid:** API returns 404, loader throws 404 Not Found Response
- **UI Effect:** ErrorBoundary displays "Contact Page Not Found" alert
- **User Guidance:** Error explains contact page hasn't been created for this shop
- **Recovery:** Page should be created in Theme Builder application

**API Response Structure Validation:**
- **Condition:** API must return valid JSON with expected structure
- **Validation Method:** TypeScript type checking and JSON parsing
- **Validation Location:** Loader function after successful response
- **Impact if Invalid:** JSON parse error throws 500 Server Error Response
- **UI Effect:** ErrorBoundary displays generic server error message
- **Recovery:** Indicates backend issue, requires technical investigation

### Component-Level Validation

**Component Configuration Validation:**
- **Condition:** Each component in layout must have valid type, variant, and props
- **Validation Method:** Zod schema validation in DynamicComponentRenderer
- **Validation Location:** Before rendering each component
- **Impact if Invalid:** Component is skipped or error placeholder is rendered
- **UI Effect:** Component area shows error placeholder or is omitted from page
- **Components Affected:** All shared components (HeaderNavigation, Heading, TextSection, ContactForm, Map)
- **Error Logging:** Validation errors logged to console in development mode

**Component Type Validation:**
- **Condition:** Component `type` must exist in component registry
- **Validation Method:** Registry lookup using `isValidComponentType()` function
- **Validation Location:** DynamicComponentRenderer during iteration
- **Impact if Invalid:** Component is skipped, warning logged to console
- **UI Effect:** Component is not rendered, layout continues with remaining components
- **Recovery:** Automatic graceful degradation, no user action needed

**Contact Form Field Validation:**
- **Condition:** Form fields must meet validation rules (email format, required fields, length limits)
- **Validation Method:** Zod schema validation in ContactForm component (if implemented)
- **Validation Location:** ContactForm component, on blur and on submit
- **Impact if Invalid:** Form submission prevented, error messages displayed
- **UI Effect:** Field-specific error messages appear below invalid fields
- **Components Affected:** ContactForm component
- **User Guidance:** Clear error messages indicate what's wrong and how to fix

**Image URL Validation:**
- **Condition:** All image URLs must use HTTPS protocol
- **Validation Method:** Zod schema with URL validation and HTTPS requirement
- **Validation Location:** Component prop validation during render
- **Impact if Invalid:** Non-HTTPS URLs are rejected, validation fails
- **UI Effect:** Component displays without image or shows error state
- **Components Affected:** HeaderNavigation (logo), Heading (background), TextSection (images/icons), Map (custom markers)
- **Security Benefit:** Prevents mixed content warnings and security issues

**Color Format Validation:**
- **Condition:** Theme colors must be valid hex format (#RGB or #RRGGBB)
- **Validation Method:** Regex validation in Zod schema: `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i`
- **Validation Location:** Theme settings validation in loader or effect
- **Impact if Invalid:** Invalid colors fall back to default theme values
- **UI Effect:** Component uses fallback color (e.g., default primary blue) instead of invalid value
- **Components Affected:** All components that reference theme colors via CSS variables
- **Fallback Behavior:** CSS custom properties provide default values if theme color is invalid

**Font Validation:**
- **Condition:** Font family names must be non-empty strings
- **Validation Method:** Zod string schema with minimum length validation
- **Validation Location:** Theme settings validation
- **Impact if Invalid:** Invalid fonts fall back to system font stack
- **UI Effect:** Text renders with fallback font (e.g., system sans-serif)
- **Components Affected:** All text-containing components (Heading, TextSection, ContactForm)
- **Fallback Behavior:** CSS provides fallback font stack: `sans-serif` or `serif`

**URL Format Validation (Links):**
- **Condition:** Links in contact information must be valid URLs or special protocols (mailto:, tel:)
- **Validation Method:** Zod schema with URL validation or protocol check
- **Validation Location:** Component prop validation in TextSection
- **Impact if Invalid:** Link is rendered as plain text or disabled
- **UI Effect:** Invalid links don't appear as clickable or show disabled state
- **Components Affected:** TextSection (contact info links), HeaderNavigation (logo link)

### Data Integrity Validation

**Layout Structure Validation:**
- **Condition:** `layout.components` must be an array
- **Validation Method:** TypeScript type checking and array type validation
- **Validation Location:** Loader and DynamicComponentRenderer
- **Impact if Invalid:** Empty or invalid structure renders empty page with message
- **UI Effect:** Page shows "No content configured" message or empty state
- **Recovery:** Contact page needs to be configured in Theme Builder

**Component Props Completeness:**
- **Condition:** Each component must have all required props per its Zod schema
- **Validation Method:** Zod parse with error handling in DynamicComponentRenderer
- **Validation Location:** Before rendering each component
- **Impact if Invalid:** Missing required props cause validation to fail
- **UI Effect:** Component is omitted from layout or shows error placeholder
- **Components Affected:** Individually validated per component type
- **Error Details:** Zod provides detailed error messages about missing fields

**Theme Settings Completeness:**
- **Condition:** Theme object can be partial or empty (all fields optional)
- **Validation Method:** Optional field validation in TypeScript interface
- **Validation Location:** Loader and theme application effect
- **Impact if Invalid:** Missing theme values use defaults
- **UI Effect:** Components use default colors and fonts defined in CSS
- **Fallback Behavior:** CSS custom properties have default values

## 10. Error Handling

### Loader Errors

**Network Failures:**
- **Scenario:** API endpoint is unreachable, connection times out, or DNS fails
- **Detection:** Fetch throws network error, caught in loader's try-catch block
- **Handling:** Loader catches network error and throws 500 Response object
- **User Experience:** ErrorBoundary displays "Failed to load contact page data" alert with server error styling
- **Error Message:** "We're having trouble loading this contact page. Please try again later."
- **Recovery Options:** User can click "Try Again" to reload page or "Go Back" to navigate away
- **Logging:** Network error logged to console with full error details
- **Future Enhancement:** Implement retry logic with exponential backoff

**Contact Page Not Found (404):**
- **Scenario:** Shop exists but contact page hasn't been created or was deleted
- **Detection:** API returns 404 status code, checked in loader
- **Handling:** Loader throws 404 Response object: `throw new Response("Contact page not found", { status: 404 })`
- **User Experience:** ErrorBoundary displays "Contact Page Not Found" alert
- **Error Message:** "The contact page for this shop doesn't exist or has been removed."
- **Recovery Options:** User can go back to previous page or check if they have correct shop ID
- **Logging:** 404 status logged to backend logs for monitoring
- **Business Context:** Indicates shop configuration issue, contact page should exist for all shops

**Invalid Shop ID (400):**
- **Scenario:** `shopId` parameter is not a valid UUID v4 format (malformed URL)
- **Detection:** `isValidUuid(shopId)` returns false in loader validation
- **Handling:** Loader validates UUID before API call, throws 400 Response if invalid
- **User Experience:** ErrorBoundary displays "Invalid Shop ID" alert
- **Error Message:** "The shop ID provided is not valid. Please check the URL and try again."
- **Recovery Options:** User needs correct URL with valid shop ID format
- **Logging:** Invalid shop ID logged with attempted value (sanitized)
- **Prevention:** Frontend routing should prevent most invalid UUID scenarios

**Shop Not Found (404):**
- **Scenario:** `shopId` is valid UUID format but doesn't exist in database
- **Detection:** API returns 404, checked in loader response handling
- **Handling:** Loader throws 404 Response based on API response status
- **User Experience:** ErrorBoundary displays "Shop Not Found" alert
- **Error Message:** "The shop you're looking for doesn't exist or has been removed."
- **Recovery Options:** User should verify shop ID or contact support
- **Logging:** Shop not found events logged for monitoring potential issues
- **Business Context:** Shop may have been deleted or user has incorrect URL

**Server Error (500):**
- **Scenario:** Backend API encounters unexpected error (database connection failure, unhandled exception)
- **Detection:** API returns 500 status code or loader catches unexpected error
- **Handling:** Loader throws 500 Response: `throw new Response("Failed to load contact page data", { status: 500 })`
- **User Experience:** ErrorBoundary displays "Server Error" alert
- **Error Message:** "We're having trouble loading this contact page. Please try again later."
- **Recovery Options:** User can try refreshing; issue requires backend investigation
- **Logging:** Full error details logged to backend logs with stack trace
- **Monitoring:** 500 errors should trigger alerts for operations team

### Component Rendering Errors

**Invalid Component Type:**
- **Scenario:** Layout includes component type that doesn't exist in registry (typo or unregistered component)
- **Detection:** Registry lookup returns undefined, checked in DynamicComponentRenderer
- **Handling:** DynamicComponentRenderer skips unknown component, logs warning to console
- **User Experience:** Component is not rendered; page continues rendering other components
- **Error Message:** Console warning: "Unknown component type: {type}"
- **Recovery:** Automatic graceful degradation, no user action needed
- **Impact:** Layout may appear incomplete but functional
- **Prevention:** Backend should validate component types against allowed list

**Component Validation Failure:**
- **Scenario:** Component props fail Zod schema validation (missing required field, wrong type)
- **Detection:** Zod parse throws validation error in DynamicComponentRenderer
- **Handling:** Validation error caught, component renders error placeholder or is skipped
- **User Experience:** Component shows "Configuration error" message or is omitted
- **Error Message:** Console shows detailed Zod validation errors in development mode
- **Recovery:** Requires fixing configuration in Theme Builder application
- **Logging:** Validation errors logged with component type and failing fields
- **UI Placeholder:** Optional error placeholder component shows configuration issue

**Image Load Failure:**
- **Scenario:** Image URL is valid format but image fails to load (404, network error, CORS issue)
- **Detection:** Browser handles natively, `<img>` element fires `onerror` event
- **Handling:** Browser displays alt text or broken image icon (native behavior)
- **User Experience:** Alt text shown in place of image; layout remains intact
- **Recovery:** Automatic browser-level handling, no JavaScript intervention needed
- **Accessibility:** Alt text provides context for screen readers and image load failures
- **Future Enhancement:** Implement custom image error handling with placeholder images

**Contact Form Submission Error:**
- **Scenario:** Form submission fails due to network error or server rejection
- **Detection:** Handled internally by ContactForm component
- **Handling:** ContactForm component shows error message within form UI
- **User Experience:** Error message appears below form: "Failed to send message. Please try again."
- **Recovery:** User can retry submission after error
- **Logging:** Submission errors logged with form data (excluding sensitive info)
- **Component Boundary:** Error doesn't affect page-level rendering, contained in ContactForm

### Runtime Errors

**Theme Application Error:**
- **Scenario:** Theme settings have invalid values that bypass validation, or DOM manipulation fails
- **Detection:** Try-catch block in useEffect hook for theme application
- **Handling:** Error caught and logged, theme application skipped
- **User Experience:** Page renders with default browser styles or previous theme
- **Error Message:** Console error: "Failed to apply theme settings"
- **Recovery:** Automatic fallback to default theme via CSS defaults
- **Impact:** Visual inconsistency but page remains functional
- **Logging:** Theme application errors logged with error details

**React Rendering Error:**
- **Scenario:** Unexpected React error during component render (null reference, infinite loop, etc.)
- **Detection:** React error boundary catches rendering errors
- **Handling:** ErrorBoundary component catches error and displays error UI
- **User Experience:** Full page error state with error message and recovery options
- **Error Message:** "Unexpected Error - Something went wrong while rendering this page. Please try refreshing."
- **Recovery:** User can refresh page to attempt recovery
- **Logging:** Full stack trace logged to console in development mode
- **Production:** Stack trace suppressed in production, error details sent to monitoring service

**JSON Parse Error:**
- **Scenario:** API returns malformed JSON that can't be parsed
- **Detection:** `response.json()` throws parse error in loader
- **Handling:** Caught in loader try-catch, thrown as 500 Server Error
- **User Experience:** ErrorBoundary displays server error message
- **Error Message:** "Failed to load contact page data" (generic to avoid exposing technical details)
- **Recovery:** User can refresh, indicates backend issue
- **Logging:** Parse error logged with response text for debugging

### Error Logging Strategy

**Development Mode:**
- All errors logged to browser console with full stack traces
- Validation errors show detailed Zod error messages with field paths
- API response errors include full response data for debugging
- Component rendering errors show component tree and props
- Network errors include request details (URL, method, headers)

**Production Mode:**
- Errors logged to browser console without sensitive data
- Stack traces suppressed to prevent information leakage
- Generic error messages shown to users
- Detailed errors sent to error tracking service (e.g., Sentry, LogRocket)
- API errors logged with sanitized request/response data
- PII (personally identifiable information) excluded from logs

**Error Monitoring:**
- Future integration with error tracking service (Sentry recommended)
- Error rates monitored for anomaly detection
- Critical errors trigger alerts for operations team
- Error trends analyzed to identify systemic issues
- User sessions recorded for error reproduction (privacy-compliant)

## 11. Implementation Steps

1. **Verify Shadcn/ui Setup:**
   - Confirm Shadcn/ui is already initialized in demo-shop project from home page implementation
   - Verify required components exist: `alert`, `button`, `skeleton` in `app/components/ui/`
   - Check `components.json` configuration is correct
   - Ensure `app/lib/utils.ts` contains the `cn` utility function
   - Confirm Tailwind CSS is properly configured to work with Shadcn/ui

2. **Configure Contact Page Route:**
   - Update `react-router.config.ts` to add new route configuration for `/shop/:shopId/contact`
   - Import and register the contact route component: `app/routes/shop.$shopId.contact.tsx`
   - Verify route is accessible via React Router DevTools
   - Test direct URL access: `http://localhost:5174/shop/{shopId}/contact`
   - Confirm route parameters are correctly extracted (`shopId`)

3. **Create Route File:**
   - Create new file: `app/routes/shop.$shopId.contact.tsx`
   - Add file-level imports (React, React Router hooks, types, components)
   - Export loader function with proper type annotations
   - Export default route component function
   - Export ErrorBoundary component function
   - Export meta function for SEO
   - Follow same structure as `shop.$shopId.tsx` (home page) for consistency

4. **Implement Loader Function:**
   - Define `loader` function with `Route.LoaderArgs` parameter type
   - Extract `shopId` from `params` object
   - Add UUID validation: `if (!shopId || !isValidUuid(shopId))`
   - Construct API URL using `buildApiUrl()` helper: `/api/public/shops/${shopId}/pages/contact`
   - Implement try-catch block for error handling
   - Make fetch request to API endpoint
   - Check response status: handle 404, 400, 500 cases
   - Parse JSON response: `const pageData: PageLayoutData = await response.json()`
   - Create and return `ShopContactLoaderData` object with shopId, page, theme
   - Throw appropriate Response objects for errors
   - Add console logging for debugging

5. **Define TypeScript Types:**
   - Verify `app/types/shop.ts` exists from home page implementation
   - Reuse existing types: `PageLayoutData`, `ComponentConfig`, `ThemeSettings`
   - Reuse `ComponentRegistry` type (no changes needed)
   - Create `ShopContactLoaderData` type alias or interface if specific to contact page
   - Export all types for use in route component and renderer
   - Add JSDoc comments for type documentation

6. **Implement Route Component:**
   - Create default export function component: `ShopContactRoute`
   - Use `useLoaderData<typeof loader>()` to access loader data with type safety
   - Implement theme application logic in `useEffect` hook
     - Extract theme settings from loader data
     - Set CSS custom properties on `document.documentElement`
     - Map theme.colors to `--color-*` variables
     - Map theme.fonts to `--font-*` variables
     - Add dependency array: `[data.theme]`
   - Return JSX with root `<div className="min-h-screen">`
   - Render `DynamicComponentRenderer` component
   - Pass `layout={data.page}` and `themeSettings={data.theme}` props
   - Add any contact page-specific styling or wrappers if needed

7. **Implement Error Boundary:**
   - Create `ErrorBoundary` export function in route file
   - Accept `Route.ErrorBoundaryProps` parameter with error object
   - Use `isRouteErrorResponse(error)` to check for HTTP errors
   - Create switch statement for error status codes: 400, 404, 500
   - Define title and description for each error type
   - Return JSX with centered layout: `min-h-screen flex items-center justify-center`
   - Use Shadcn/ui components:
     - `Alert` with `variant="destructive"`
     - `AlertTitle` for error heading
     - `AlertDescription` for error details
     - `Button` for "Go Back" and "Try Again" actions
   - Add development-only stack trace display: `process.env.NODE_ENV === 'development'`
   - Implement button click handlers: `window.history.back()` and `window.location.reload()`
   - Handle non-HTTP React errors with fallback error display

8. **Reuse DynamicComponentRenderer:**
   - Confirm `DynamicComponentRenderer` exists at `app/components/DynamicComponentRenderer.tsx`
   - Verify it's the same component used by home page (no duplication)
   - Component should already handle:
     - Component registry lookup
     - Zod validation for each component
     - Error handling for invalid components
     - Props validation and passing
   - No changes needed to DynamicComponentRenderer for contact page
   - Component is page-agnostic and works for all page types

9. **Verify Component Registry:**
   - Confirm `component-registry.config.ts` exists at demo-shop root
   - Verify it includes all components used in contact pages:
     - `HeaderNavigation` (navigation bar)
     - `Heading` (page title/hero)
     - `TextSection` (contact information)
     - `ContactForm` (if implemented)
     - `Map` (if implemented)
   - If new components needed, add them following registry pattern:
     - Import component and schema from `@shared/components`
     - Add entry to `componentRegistryConfig` object
     - Registry exports automatically update
   - Test component registry lookups with console logs

10. **Verify API Configuration:**
    - Confirm `app/lib/api.ts` exists with `buildApiUrl()` function
    - Verify `app/lib/validation.ts` exists with `isValidUuid()` function
    - Test API URL construction in different environments:
      - Development: `http://localhost:8000`
      - SSR context: `http://nginx:80`
    - Confirm `VITE_API_URL` environment variable is set in `.env` file
    - Test UUID validation with valid and invalid inputs

11. **Test Error Scenarios:**
    - **Invalid UUID Test:**
      - Navigate to `/shop/invalid-uuid/contact`
      - Verify 400 error displays with "Invalid Shop ID" message
      - Confirm "Go Back" and "Try Again" buttons work
    - **Non-existent Shop Test:**
      - Navigate to `/shop/00000000-0000-0000-0000-000000000000/contact` (valid UUID, fake shop)
      - Verify 404 error displays with "Shop Not Found" message
    - **Network Error Simulation:**
      - Stop backend server
      - Navigate to valid shop contact page
      - Verify 500 error displays with "Server Error" message
    - **Malformed Response Test:**
      - Use browser DevTools to mock malformed API response
      - Verify error handling catches parse errors
    - **Development Mode:**
      - Verify stack traces appear in development environment
      - Confirm error details are logged to console

12. **Apply and Test Theme Settings:**
    - Create test shop with custom theme settings (colors and fonts)
    - Navigate to contact page for that shop
    - Verify CSS custom properties are set on `:root` element (inspect with DevTools)
    - Check computed styles show correct theme values:
      - `--color-primary`, `--color-secondary`, `--color-background`, `--color-text`
      - `--font-heading`, `--font-body`
    - Verify all components reflect theme colors and fonts
    - Test theme persistence when navigating between pages
    - Test fallback behavior when theme settings are missing
    - Confirm theme updates when switching between shops

13. **Validate Component Rendering:**
    - Create test contact page layout in backend with various components
    - Verify HeaderNavigation renders with correct links and active state
    - Verify Heading renders with contact page title
    - Verify TextSection renders with contact information (phone, email, address)
    - Verify ContactForm renders if included in layout
    - Verify all components receive correct props from layout configuration
    - Check component spacing and layout flow
    - Test with different component variants
    - Verify error handling for invalid component configurations

14. **Test Responsive Behavior:**
    - Test contact page on mobile viewport (375px width)
    - Test on tablet viewport (768px width)
    - Test on desktop viewport (1920px width)
    - Verify all components are responsive and adapt to screen size
    - Check HeaderNavigation collapses to mobile menu on small screens
    - Verify ContactForm is usable on mobile devices
    - Test touch interactions on mobile (tap, scroll, zoom)
    - Ensure text is readable at all sizes
    - Verify images scale appropriately

15. **Accessibility Testing:**
    - Test keyboard navigation (Tab, Shift+Tab, Enter)
    - Verify all interactive elements are keyboard accessible
    - Test with screen reader (NVDA, JAWS, or VoiceOver)
    - Verify ARIA labels and roles are present
    - Check focus indicators are visible on all focusable elements
    - Test with high contrast mode
    - Verify color contrast ratios meet WCAG 2.1 AA standards
    - Test form validation messages are announced to screen readers
    - Ensure error messages are associated with form fields
    - Test skip links functionality

16. **Performance Testing:**
    - Measure Time to Interactive (TTI) for contact page
    - Check Largest Contentful Paint (LCP) is under 2.5s
    - Verify First Input Delay (FID) is under 100ms
    - Test with slow network throttling (Slow 3G)
    - Check bundle size impact of contact page route
    - Verify lazy loading of components works correctly
    - Test with React DevTools Profiler for render performance
    - Identify and optimize any unnecessary re-renders

17. **Integration Testing:**
    - Test navigation from home page to contact page via HeaderNavigation
    - Test browser back button from contact page to previous page
    - Test direct URL access to contact page
    - Test navigation between multiple shops
    - Verify loader data is fresh for each shop
    - Test theme consistency across page navigation within same shop
    - Test with real backend API (integration environment)
    - Verify contact form submission works end-to-end (if implemented)

18. **Add Meta Function for SEO:**
    - Implement `meta` function export in route file
    - Accept `Route.MetaArgs` with loader data
    - Return meta tag array:
      - `title`: "Contact - {Shop Name}" or default
      - `description`: Contact page description
      - OpenGraph tags for social sharing (optional)
    - Handle case when loader data is not available (error state)
    - Test meta tags appear in HTML `<head>` (view page source)
    - Verify meta tags update on navigation

19. **Code Review and Cleanup:**
    - Remove any console.log statements used for debugging
    - Ensure all TypeScript types are properly defined
    - Verify all imports are used and necessary
    - Check code follows project linting rules (ESLint)
    - Format code with Prettier
    - Add JSDoc comments for complex functions
    - Ensure error messages are user-friendly and clear
    - Verify no hardcoded values (use constants or config)
    - Check for code duplication between home and contact pages

20. **Documentation:**
    - Update project README if needed (contact page route)
    - Document any new environment variables
    - Add inline comments for complex logic
    - Update API documentation if contact page has unique requirements
    - Document any known issues or limitations
    - Add examples of contact page layout configurations
    - Document theme variable naming convention
    - Create troubleshooting guide for common errors
