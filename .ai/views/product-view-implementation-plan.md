# View Implementation Plan: Product Page

## 1. Overview

The Product page view displays detailed information for a single product in the Demo Shop application. Visitors can view comprehensive product details including high-resolution images, full descriptions, pricing information (including sale prices), and category classification. The page is accessed via `/shop/:shopId/product/:productId` and renders the saved page layout configuration combined with dynamic product data fetched from the backend API.

This view serves the Demo Shop's role as a preview environment where shop owners can see how their customized product page appears to customers. The page uses the same dynamic component rendering system as other Demo Shop pages, allowing shop owners to customize the layout while product data is automatically populated from the demo products database.

## 2. View Routing

**Route Path:** `/shop/:shopId/product/:productId`

**Route File:** `demo-shop/app/routes/shop.$shopId.product.$productId.tsx`

**URL Parameters:**
- `shopId` (string, UUID format) - Identifies the shop
- `productId` (string, numeric) - Identifies the specific product to display

**Example URLs:**
- `/shop/550e8400-e29b-41d4-a716-446655440000/product/1`
- `/shop/550e8400-e29b-41d4-a716-446655440000/product/42`

## 3. Component Structure

The Product page follows React Router v7's file-based routing pattern and consists of:

```
ShopProductRoute (route component)
├── DynamicComponentRenderer (renders page layout from API)
│   └── [Dynamic components from page.layout configuration]
│       └── ProductDetail (shared component, rendered if in layout)
│           ├── ProductImageGallery
│           ├── ProductInfo
│           │   ├── ProductTitle
│           │   ├── ProductPrice
│           │   ├── ProductCategory
│           │   └── ProductDescription
│           └── ProductActions
│               └── AddToCartButton (non-functional in MVP)
└── ErrorBoundary (handles loading and error states)
```

**Key Architectural Patterns:**
- React Router v7 loader pattern for data fetching
- Dynamic component rendering via component registry
- Runtime props injection for product data
- Shared component library (`@shared/components`)
- Error boundary for graceful error handling

## 4. Component Details

### ShopProductRoute (Main Route Component)

**Component Description:**
The main route component that serves as the container for the Product page view. It fetches both the page layout configuration and the product data via the loader function, then renders the page using the DynamicComponentRenderer system.

**Main Elements:**
- Root `<div>` container with `min-h-screen` class
- `<DynamicComponentRenderer>` component that maps layout JSON to React components
- Theme application logic via CSS custom properties (useEffect hook)

**Handled Events:**
- None (stateless presentation component)

**Validation Conditions:**
- shopId must be a valid UUID format (validated in loader)
- productId must be a valid positive integer (validated in loader)
- Loader throws Response errors for invalid parameters or API failures

**Types:**
- `Route.LoaderArgs` - React Router type for loader function arguments
- `ShopProductPageLoaderData` - Custom type for loader return data
- `PageLayoutData` - Type for page configuration from API
- `Product` - Type for product data from API

**Props:**
- None (receives data via `useLoaderData<typeof loader>()` hook)

### loader (Data Fetching Function)

**Component Description:**
Async function that runs on the server/client before rendering to fetch all required data for the Product page. It validates URL parameters, fetches the product page layout configuration from the backend, fetches the specific product data, and returns combined data for the route component.

**Main Elements:**
- Parameter extraction and validation (`shopId`, `productId`)
- UUID validation via `isValidUuid()` helper
- Product ID parsing and numeric validation
- Parallel API calls to `/api/public/shops/{shopId}/pages/product` and `/api/demo/products/{productId}`
- Error handling with Response throwing for React Router error boundary

**Handled Events:**
- HTTP errors (400, 404, 500) from API responses
- Network errors from fetch failures
- Validation errors from invalid parameters

**Validation Conditions:**
- `shopId` parameter must exist and be valid UUID format
- `productId` parameter must exist and parse to positive integer
- Page API must return 200 OK with valid PageLayoutData
- Product API must return 200 OK with valid Product data
- Combined data must satisfy `ShopProductPageLoaderData` type contract

**Types:**
- Input: `Route.LoaderArgs` with `params: { shopId: string, productId: string }`
- Output: `ShopProductPageLoaderData` containing `{ shopId, page, product, theme }`

**Props:**
- `params` object from React Router containing `shopId` and `productId`

### ErrorBoundary (Error Handling Component)

**Component Description:**
Provides graceful error handling for both HTTP errors (from loader) and unexpected React rendering errors. Displays user-friendly error messages with appropriate actions based on error type. Shows detailed error information in development mode.

**Main Elements:**
- Alert component (from shadcn/ui) displaying error title and description
- Conditional error message based on status code (400, 404, 500)
- Action buttons for "Go Back" and "Try Again"
- Development-only debug information (error status, message, stack trace)

**Handled Events:**
- Button clicks for "Go Back" (`window.history.back()`)
- Button clicks for "Try Again" (`window.location.reload()`)

**Validation Conditions:**
- Distinguishes between `RouteErrorResponse` (HTTP errors) and generic `Error` (render errors)
- Checks error status codes to provide specific messaging
- Validates `process.env.NODE_ENV` to conditionally show debug info

**Types:**
- `Route.ErrorBoundaryProps` containing `error` property
- `error` can be `RouteErrorResponse` or `Error`

**Props:**
- `error` - The error object thrown during loading or rendering

### DynamicComponentRenderer (Layout Rendering System)

**Component Description:**
Renders the page layout by mapping the JSON configuration from the API to actual React components using the component registry. Injects runtime props (including product data) into components that need them. This is an existing shared utility, not a new component.

**Main Elements:**
- Component registry lookup based on `type` field in layout
- Props merging (settings from layout + runtime props)
- Zod validation of component props
- Array mapping over layout components

**Handled Events:**
- None (pure rendering based on props)

**Validation Conditions:**
- Each component `type` must exist in component registry
- Component settings must validate against corresponding Zod schema
- Runtime props must be compatible with component prop types

**Types:**
- `layout` - `PageLayoutData` type with array of component configurations
- `themeSettings` - Theme configuration object
- `runtimeProps` - Object containing dynamic data like `{ shopId, product }`

**Props:**
- `layout: PageLayoutData` - Page layout configuration from API
- `themeSettings: object` - Global theme settings (colors, fonts)
- `runtimeProps: { shopId: string, product: Product }` - Runtime data injected into components

### ProductDetail (Shared Component - if included in layout)

**Component Description:**
A shared component (to be created in `/shared/components/ProductDetail/`) that displays comprehensive product information. This component receives product data via runtime props injected by DynamicComponentRenderer. It's only rendered if included in the page layout configuration returned by the API.

**Main Elements:**
- Product image gallery with primary image and optional thumbnails
- Product title (h1 heading)
- Price display with sale price support
- Category badge linking to catalog filtered by category
- Full product description
- Add to Cart button (non-functional in MVP)

**Handled Events:**
- Image error handling (fallback to placeholder)
- Category badge click (navigation to `/shop/:shopId/catalog?category=:categoryId`)
- Add to Cart button click (disabled, no action in MVP)

**Validation Conditions:**
- Product data must satisfy `Product` type (validated via Zod schema)
- Image URLs must be valid strings (fallback if loading fails)
- Price values must be non-negative integers in cents
- Category ID must be positive integer

**Types:**
- `ProductDetailProps` - Component props interface
- `Product` - Product data type from API
- `ProductDetailPropsSchema` - Zod schema for runtime validation

**Props:**
- `product: Product` - Complete product data including images, pricing, description
- `shopId: string` - Shop identifier for navigation links

## 5. Types

### Core Data Types

#### Product (Existing Type)
```typescript
interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number; // in cents
  salePrice: number | null; // in cents, null if not on sale
  imageThumbnail: string;
  imageMedium: string;
  imageLarge: string;
}
```
- Already defined in `/shared/components/ProductListGrid/types.ts`
- Used throughout the application for product data
- Prices stored as integers in cents (e.g., 19999 = $199.99)

#### PageLayoutData (Existing Type)
```typescript
interface PageLayoutData {
  type: string; // 'product'
  layout: Array<{
    id: string;
    type: string;
    variant?: string;
    settings: Record<string, unknown>;
  }>;
}
```
- Already defined in `demo-shop/app/types/shop.ts`
- Represents page configuration from API
- Contains array of component definitions

### New Types to Define

#### ShopProductPageLoaderData
```typescript
interface ShopProductPageLoaderData {
  shopId: string;
  page: PageLayoutData;
  product: Product;
  theme: {
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
  };
}
```
- **Purpose:** Type for data returned by the loader function
- **Location:** Define in route file or extract to `demo-shop/app/types/shop.ts`
- **Fields:**
  - `shopId` - Shop UUID for navigation and API calls
  - `page` - Page layout configuration from backend
  - `product` - Complete product data fetched from backend
  - `theme` - Global theme settings (colors, fonts) - currently empty object, populated in future

#### ProductDetailProps
```typescript
interface ProductDetailProps {
  product: Product;
  shopId: string;
}
```
- **Purpose:** Props for the ProductDetail shared component
- **Location:** `/shared/components/ProductDetail/types.ts`
- **Fields:**
  - `product` - Full product information to display
  - `shopId` - Shop identifier for building navigation links to catalog

#### ProductDetailPropsSchema
```typescript
const ProductDetailPropsSchema = z.object({
  product: ProductSchema,
  shopId: z.string().uuid(),
});
```
- **Purpose:** Zod schema for runtime validation of ProductDetail props
- **Location:** `/shared/components/ProductDetail/types.ts`
- **Usage:** Validated by DynamicComponentRenderer when injecting runtime props

### API Response Types

#### ProductApiResponse (Backend Format)
```typescript
interface ProductApiResponse {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  image_thumbnail: string;
  image_medium: string;
  image_large: string;
}
```
- **Purpose:** Type for raw API response from `GET /api/demo/products/{id}`
- **Location:** `demo-shop/app/lib/api-products.ts` (extend existing file)
- **Note:** Uses snake_case (backend convention), transformed to camelCase Product type

## 6. State Management

### Loader-Based Data Fetching (Server/Client)

The Product page uses React Router v7's loader pattern for data fetching, which means:

- **No component-level state** for product data or page layout
- **No custom hooks** for data fetching (data comes from loader)
- **Data available immediately** on component mount via `useLoaderData()`
- **Automatic revalidation** when route parameters change

**Loader Execution Flow:**
1. User navigates to `/shop/:shopId/product/:productId`
2. React Router calls `loader({ params })` before rendering
3. Loader validates `shopId` (UUID) and `productId` (positive integer)
4. Loader fetches page layout: `GET /api/public/shops/:shopId/pages/product`
5. Loader fetches product data: `GET /api/demo/products/:productId`
6. Both API calls can run in parallel using `Promise.all()`
7. Loader returns combined data or throws Response error
8. Component receives data via `useLoaderData<typeof loader>()`

### Local Component State

**Theme Application State:**
- Managed via `useEffect` hook in main route component
- Applies theme settings to CSS custom properties on `document.documentElement`
- Runs when `data.theme` changes (from loader data)
- No explicit state variables needed

**Image Loading State (in ProductDetail component):**
- Local `useState` for image loading status
- Local `useState` for image error handling
- Provides skeleton/loading UI during image fetch
- Shows fallback UI if image fails to load

### No Global State Required

- No Redux, Context API, or other global state management
- Product data flows from loader → component props
- No state sharing between components (data flows down from loader)
- Navigation handled by React Router's built-in navigation

### State Management Summary

**Pattern Used:** React Router Loader + Local Component State

**Rationale:**
- Product page is a standalone view with no shared state requirements
- Data fetching happens once per route navigation (loader pattern)
- Local UI state (image loading, errors) is encapsulated in components
- Simpler mental model than introducing global state for single-page data
- Follows existing patterns from Catalog and Home pages

## 7. API Integration

### Endpoint 1: GET /api/public/shops/{shopId}/pages/{type}

**Purpose:** Fetch the page layout configuration for the product page

**Request:**
- **Method:** GET
- **URL:** `/api/public/shops/{shopId}/pages/product`
- **Authentication:** None required (public endpoint)
- **Headers:**
  - `Accept: application/json`
  - `Content-Type: application/json`

**Request Parameters:**
- `shopId` (path parameter) - Shop UUID
- `type` (path parameter) - Fixed value: `"product"`

**Response (200 OK):**
```json
{
  "type": "product",
  "layout": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "type": "ProductDetail",
      "settings": {}
    }
  ]
}
```

**Response Type:** `PageLayoutData`

**Error Responses:**
- **400 Bad Request** - Invalid page type (if not "product")
- **404 Not Found** - Shop or page not found
- **500 Internal Server Error** - Server error

**Error Handling:**
- 404 errors throw Response for ErrorBoundary with "Page not found" message
- 500 errors throw Response with "Failed to load page" message
- Network errors caught and re-thrown as 500 Response

**Implementation Location:**
- API call in loader function
- Error handling via try/catch → throw Response
- Existing endpoint (already implemented in PublicShopController)

### Endpoint 2: GET /api/demo/products/{id}

**Purpose:** Fetch detailed information for a specific demo product

**Request:**
- **Method:** GET
- **URL:** `/api/demo/products/{id}`
- **Authentication:** None required (public endpoint)
- **Headers:**
  - `Accept: application/json`
  - `Content-Type: application/json`

**Request Parameters:**
- `id` (path parameter) - Product ID (positive integer)

**Response (200 OK):**
```json
{
  "id": 1,
  "category_id": 1,
  "category_name": "Electronics",
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality. Features include Bluetooth 5.0, active noise cancellation, and comfortable over-ear design.",
  "price": 19999,
  "sale_price": 14999,
  "image_thumbnail": "https://r2.example.com/products/headphones-thumb.jpg",
  "image_medium": "https://r2.example.com/products/headphones-medium.jpg",
  "image_large": "https://r2.example.com/products/headphones-large.jpg"
}
```

**Response Type:** `ProductApiResponse` (transformed to `Product`)

**Error Responses:**
- **404 Not Found** - Product not found
  ```json
  {
    "error": "product_not_found",
    "message": "Product not found"
  }
  ```
- **500 Internal Server Error** - Server error

**Error Handling:**
- 404 errors throw Response for ErrorBoundary with "Product not found" message
- 500 errors throw Response with "Failed to load product" message
- Network errors caught and re-thrown as 500 Response

**Implementation Location:**
- API call in loader function
- New `fetchProductById(id: number)` function in `demo-shop/app/lib/api-products.ts`
- Response transformation from snake_case to camelCase
- Zod validation via `ProductApiResponseSchema`

**Backend Implementation Required:**
- **NEW ENDPOINT** - Not yet implemented in `PublicShopController`
- Requires new controller method in `PublicShopController.php`
- Requires service method in `DemoProductService.php`
- Requires repository method in `DemoProductRepository.php`
- Uses existing `DemoProductReadModel` for response

### API Call Optimization

**Parallel Fetching:**
Use `Promise.all()` to fetch page layout and product data simultaneously:

```typescript
const [pageResponse, productResponse] = await Promise.all([
  fetch(buildApiUrl(`/api/public/shops/${shopId}/pages/product`)),
  fetch(buildApiUrl(`/api/demo/products/${productId}`))
]);
```

**Benefits:**
- Reduces total loading time (parallel vs sequential)
- Both requests are independent and can run concurrently
- Single error handling point for both requests

### API Integration Summary

**New Functions to Create:**
- `fetchProductById(id: number): Promise<Product>` in `api-products.ts`

**Existing Functions to Use:**
- `buildApiUrl(path: string): string` - Constructs full API URL
- `isValidUuid(uuid: string): boolean` - Validates shop ID format

**Backend Endpoints Status:**
- ✅ Page layout endpoint - Already implemented
- ❌ Single product endpoint - **Needs implementation**

## 8. User Interactions

### Navigation to Product Page

**User Action:** Click on a product card in the Catalog page

**Expected Behavior:**
1. User clicks ProductCard in ProductListGrid component
2. ProductCard's `onClick` handler is triggered with `productId`
3. Navigation to `/shop/:shopId/product/:productId` via React Router
4. Loader fetches page layout and product data
5. Product page renders with complete product information

**Component Responsibility:**
- ProductCard: Trigger navigation on click
- React Router: Handle URL change and call loader
- Loader: Fetch required data
- ProductDetail: Display product information

**Error Scenarios:**
- Invalid product ID → Loader catches and shows 404 error
- API failure → ErrorBoundary displays error with retry option
- Network timeout → ErrorBoundary displays error with retry option

### Viewing Product Images

**User Action:** View high-resolution product images

**Expected Behavior:**
1. Product page loads with large image displayed
2. Image loads progressively (skeleton → image)
3. If image fails to load, fallback placeholder is shown
4. Image has proper alt text for accessibility

**Component Responsibility:**
- ProductDetail: Manages image display
- Image element: Handles loading states and errors
- CSS: Provides skeleton and fade-in animations

**Error Scenarios:**
- Image URL broken → Fallback placeholder with icon
- Slow image loading → Skeleton UI while loading
- Network interruption → Fallback placeholder

### Navigating to Category

**User Action:** Click on product category to see similar products

**Expected Behavior:**
1. User clicks category badge/link in ProductDetail
2. Navigation to `/shop/:shopId/catalog?category=:categoryId`
3. Catalog page loads with products filtered by category
4. CategoryPills component highlights active category

**Component Responsibility:**
- ProductDetail: Render category as clickable link
- React Router Link: Handle navigation
- Catalog page: Apply category filter from URL params
- CategoryPills: Display active state for selected category

**Error Scenarios:**
- Invalid category ID → Catalog page shows empty state
- Category no longer exists → Backend returns 404, error displayed

### Attempting to Add to Cart (MVP Limitation)

**User Action:** Click "Add to Cart" button

**Expected Behavior:**
1. Button appears disabled (non-functional in MVP)
2. No action occurs on click
3. Button styled to indicate disabled state
4. Tooltip or visual cue explains feature not available in demo

**Component Responsibility:**
- ProductDetail: Render disabled Add to Cart button
- CSS: Style button as disabled
- No event handler needed (button disabled)

**Error Scenarios:**
- None (feature intentionally disabled in MVP)

### Error Recovery Actions

**User Action:** Encounter error loading product page

**Expected Behavior - Go Back:**
1. User clicks "Go Back" button in ErrorBoundary
2. Browser navigates to previous page (usually Catalog)
3. Previous page's data already cached (no refetch)

**Expected Behavior - Try Again:**
1. User clicks "Try Again" button in ErrorBoundary
2. Page reloads via `window.location.reload()`
3. Loader re-runs and attempts to fetch data again
4. If successful, product page renders normally
5. If still failing, error displays again

**Component Responsibility:**
- ErrorBoundary: Provide clear action buttons
- Button handlers: Execute navigation or reload
- Loader: Re-execute on page reload

## 9. Conditions and Validation

### URL Parameter Validation (Loader Level)

**Shop ID Validation:**
- **Condition:** `shopId` must be a valid UUID format
- **Validation Method:** `isValidUuid(shopId)` helper function
- **Failed Validation:** Throw `Response("Invalid shop ID format", { status: 400 })`
- **Error Display:** ErrorBoundary shows "Invalid Request" with helpful message
- **Component Impact:** Route never renders; ErrorBoundary takes over

**Product ID Validation:**
- **Condition:** `productId` must be a valid positive integer
- **Validation Method:**
  1. `parseInt(productId, 10)` - Convert string to number
  2. `isNaN(parsedId)` - Check if conversion succeeded
  3. `parsedId <= 0` - Check if positive
- **Failed Validation:** Throw `Response("Invalid product ID", { status: 400 })`
- **Error Display:** ErrorBoundary shows "Invalid Request" message
- **Component Impact:** Route never renders; ErrorBoundary takes over

### API Response Validation (Loader Level)

**Page Layout Validation:**
- **Condition:** API response must return 200 OK status
- **Validation Method:** `if (!response.ok)` check
- **Failed Validation (404):** Throw `Response("Product page not found", { status: 404 })`
- **Failed Validation (500):** Throw `Response("Failed to load product page", { status: 500 })`
- **Error Display:** ErrorBoundary with appropriate error message
- **Component Impact:** Page doesn't render; error state shown

**Product Data Validation:**
- **Condition:** API response must return valid product data
- **Validation Method:** Zod schema validation via `ProductApiResponseSchema.safeParse()`
- **Failed Validation (404):** Product doesn't exist → throw 404 Response
- **Failed Validation (Schema):** Invalid data structure → throw 500 Response
- **Error Display:** ErrorBoundary shows detailed error in development mode
- **Component Impact:** Page doesn't render; error state shown

### Component Props Validation (Runtime Level)

**ProductDetail Props Validation:**
- **Condition:** Props must conform to `ProductDetailPropsSchema`
- **Validation Method:** Zod validation in DynamicComponentRenderer
- **Failed Validation:** Console error + component doesn't render
- **Error Display:** DynamicComponentRenderer may show fallback or skip component
- **Component Impact:** Individual component fails gracefully, page continues rendering

**Product Object Field Validation:**
- **Condition:** All required Product fields must be present and correct type
- **Validation Fields:**
  - `id` - positive integer
  - `categoryId` - positive integer
  - `name` - non-empty string
  - `description` - string (can be empty)
  - `price` - non-negative integer (cents)
  - `salePrice` - non-negative integer or null (cents)
  - `imageThumbnail`, `imageMedium`, `imageLarge` - non-empty strings (URLs)
- **Validation Method:** Zod `ProductSchema` validation
- **Failed Validation:** Loader throws error; ErrorBoundary catches
- **Component Impact:** Page doesn't render if validation fails

### Image URL Validation (Component Level)

**Image Loading Validation:**
- **Condition:** Image URL must successfully load
- **Validation Method:** `<img onError={handleImageError}>`
- **Failed Validation:** Set `imageError` state to true
- **Error Display:** Fallback placeholder with icon shown instead of image
- **Component Impact:** Component renders with fallback image; no page failure

### Navigation Link Validation (Component Level)

**Category Link Validation:**
- **Condition:** Category ID must be valid positive integer
- **Validation Method:** Implicit - comes from validated Product object
- **Failed Validation:** N/A (categoryId already validated in loader)
- **Error Display:** If category doesn't exist, Catalog page handles 404
- **Component Impact:** Link renders correctly; target page handles invalid category

### Validation Summary

**Validation Layers:**
1. **Loader Level (Pre-Render):** URL params, API responses, data schemas
2. **Component Level (Runtime):** Props validation, image loading, user input
3. **Backend Level (API):** Product exists, data integrity, business rules

**Validation Principles:**
- **Fail Fast:** Invalid parameters caught in loader before rendering
- **Type Safety:** TypeScript + Zod for compile-time and runtime validation
- **User-Friendly Errors:** Clear messages in ErrorBoundary for failures
- **Graceful Degradation:** Image errors don't crash page, show fallback

## 10. Error Handling

### Loader-Level Error Handling

**Invalid Shop ID Format (400 Error):**
- **Trigger:** `shopId` parameter fails UUID validation
- **Detection:** `!isValidUuid(shopId)` returns true
- **Action:** `throw new Response("Invalid shop ID format", { status: 400 })`
- **User Experience:** ErrorBoundary displays "Invalid Request" with message "The request is not valid. Please check the URL and try again."
- **Recovery Options:** "Go Back" button to navigate away
- **Prevention:** Validate all navigation links generate correct shop IDs

**Invalid Product ID Format (400 Error):**
- **Trigger:** `productId` parameter is not a positive integer
- **Detection:** `isNaN(parseInt(productId))` or `productId <= 0`
- **Action:** `throw new Response("Invalid product ID", { status: 400 })`
- **User Experience:** ErrorBoundary displays "Invalid Request" message
- **Recovery Options:** "Go Back" button to return to previous page
- **Prevention:** Ensure all product links use valid numeric IDs

**Page Not Found (404 Error):**
- **Trigger:** Shop doesn't exist or product page not configured
- **Detection:** Page API returns 404 status
- **Action:** `throw new Response("Product page not found", { status: 404 })`
- **User Experience:** ErrorBoundary displays "Page Not Found" with message "The product page doesn't exist or has been removed."
- **Recovery Options:** "Go Back" and "Try Again" buttons
- **Prevention:** Ensure all shops have product page created on registration

**Product Not Found (404 Error):**
- **Trigger:** Product ID doesn't exist in database
- **Detection:** Product API returns 404 status with `{"error": "product_not_found"}`
- **Action:** `throw new Response("Product not found", { status: 404 })`
- **User Experience:** ErrorBoundary displays "Product Not Found" with message "This product doesn't exist or has been removed."
- **Recovery Options:** "Go Back" button to return to catalog
- **Prevention:** Ensure product links only reference valid, existing products

**Server Error (500 Error):**
- **Trigger:** Backend API returns 500 error or unexpected failure
- **Detection:** API response status 500 or catch block in loader
- **Action:** `throw new Response("Failed to load product data", { status: 500 })`
- **User Experience:** ErrorBoundary displays "Server Error" with message "We're having trouble loading this product. Please try again later."
- **Recovery Options:** "Try Again" button to reload page
- **Prevention:** Backend error handling, logging, monitoring

**Network Timeout / Offline (500 Error):**
- **Trigger:** Network request fails due to connectivity issues
- **Detection:** Fetch throws error (caught in loader catch block)
- **Action:** `throw new Response("Network error", { status: 500 })`
- **User Experience:** ErrorBoundary displays generic error message
- **Recovery Options:** "Try Again" button to retry request
- **Prevention:** Client-side connectivity check, offline detection

### Component-Level Error Handling

**Image Loading Failure:**
- **Trigger:** Product image URL fails to load
- **Detection:** `<img onError={handleImageError}>` event
- **Action:** Set `imageError` state to `true`
- **User Experience:** Fallback placeholder with icon shown instead of broken image
- **Recovery Options:** None needed (graceful degradation)
- **Prevention:** Validate image URLs on upload, use CDN with high availability

**Invalid Component Props (Runtime):**
- **Trigger:** DynamicComponentRenderer receives invalid props for ProductDetail
- **Detection:** Zod schema validation fails
- **Action:** Console error logged, component skipped
- **User Experience:** Component doesn't render, rest of page continues
- **Recovery Options:** Reload page to retry
- **Prevention:** Strict type checking, loader-level validation

### React Rendering Errors

**Unexpected Component Error:**
- **Trigger:** Unhandled exception in component render or lifecycle
- **Detection:** ErrorBoundary catches React rendering errors
- **Action:** Display generic error screen
- **User Experience:** ErrorBoundary shows "Unexpected Error" with message and stack trace (dev mode only)
- **Recovery Options:** "Refresh Page" button
- **Prevention:** Component-level try/catch, defensive programming

### Error Boundary Configuration

**ErrorBoundary Component Features:**
- Catches all thrown Response errors from loader
- Catches all unhandled React rendering errors
- Distinguishes between HTTP errors and rendering errors
- Maps error status codes to user-friendly messages
- Provides appropriate recovery actions per error type
- Shows technical details in development mode only

**Error Message Mapping:**
```typescript
switch (error.status) {
  case 400:
    title = "Invalid Request";
    description = "The request is not valid. Please check the URL and try again.";
    break;
  case 404:
    title = "Product Not Found";
    description = "This product doesn't exist or has been removed.";
    break;
  case 500:
    title = "Server Error";
    description = "We're having trouble loading this product. Please try again later.";
    break;
}
```

### Development vs Production Error Display

**Development Mode:**
- Full error details shown (status, message, stack trace)
- Helps developers debug issues quickly
- Enabled via `process.env.NODE_ENV === 'development'`

**Production Mode:**
- User-friendly messages only
- No technical details exposed
- Security-conscious (doesn't leak implementation details)

### Logging and Monitoring

**Client-Side Logging:**
- `console.error()` calls in loader catch blocks
- Error details logged for debugging
- Does not expose to user in production

**Backend Logging:**
- Symfony's PSR-3 logger in controller/service layers
- Logs all 404, 500 errors with context
- Trace logging for debugging

### Error Handling Summary

**Principles:**
- **Fail Gracefully:** Never show blank screen or uncaught errors
- **User-Friendly Messages:** Non-technical language, actionable guidance
- **Multiple Recovery Paths:** Back, reload, retry options
- **Progressive Enhancement:** Component failures don't crash entire page
- **Comprehensive Logging:** All errors logged for monitoring and debugging

## 11. Implementation Steps

### Step 1: Backend API Implementation

**Tasks:**
1. **Add route to PublicShopController**
   - File: `backend/src/Controller/PublicShopController.php`
   - Add route attribute: `#[Route('/api/demo/products/{id}', name: 'demo_product_detail', methods: ['GET'])]`
   - Create public method `getProduct(int $id): JsonResponse`
   - Validate `$id` parameter (positive integer check)
   - Call service layer to fetch product

2. **Add service method**
   - File: `backend/src/Service/DemoProductService.php`
   - Add method: `public function getProductById(int $id): ?DemoProductReadModel`
   - Call repository to fetch product entity
   - Return DemoProductReadModel or null if not found

3. **Add repository method**
   - File: `backend/src/Repository/DemoProductRepository.php`
   - Add method: `public function findProductById(int $id): ?DemoProductReadModel`
   - Query database for product by ID
   - Build DemoProductReadModel with category join
   - Return read model or null

4. **Test backend endpoint**
   - Manual test via curl or Postman
   - Test valid product ID → 200 response
   - Test invalid product ID → 404 response
   - Test malformed ID → 400 response
   - Verify response structure matches API spec

**Acceptance Criteria:**
- ✅ Endpoint returns 200 with valid product data
- ✅ Endpoint returns 404 when product doesn't exist
- ✅ Response matches `ProductApiResponse` structure
- ✅ Category name included in response

### Step 2: Frontend API Client Function

**Tasks:**
1. **Create fetchProductById function**
   - File: `demo-shop/app/lib/api-products.ts`
   - Add function: `export async function fetchProductById(id: number): Promise<Product>`
   - Use `buildApiUrl()` to construct URL
   - Add Zod schema for API response validation
   - Transform snake_case response to camelCase Product
   - Handle 404 errors with specific message
   - Handle network errors

2. **Add Zod schemas**
   - Add `ApiSingleProductResponseSchema` for validation
   - Reuse existing `ApiProductSchema` from products list
   - Add transformation logic to `transformProduct()` helper

3. **Write unit tests**
   - File: `demo-shop/app/lib/api-products.test.ts`
   - Test successful fetch (200 response)
   - Test 404 error (product not found)
   - Test 500 error (server error)
   - Test network error handling
   - Test response transformation (snake_case → camelCase)
   - Test Zod validation (invalid response structure)

**Acceptance Criteria:**
- ✅ Function fetches product by ID successfully
- ✅ Returns Product object in camelCase format
- ✅ Throws descriptive error for 404
- ✅ Throws descriptive error for network failures
- ✅ Validates response with Zod schema
- ✅ All tests passing

### Step 3: Create ProductDetail Shared Component

**Tasks:**
1. **Create component directory structure**
   - Directory: `/shared/components/ProductDetail/`
   - Files: `ProductDetail.tsx`, `types.ts`, `meta.ts`, `ProductDetail.module.css`, `index.ts`

2. **Define types and schemas**
   - File: `types.ts`
   - Define `ProductDetailProps` interface
   - Export `ProductDetailPropsSchema` (Zod)
   - Import/reuse `Product` type from ProductListGrid
   - Export helper functions for price formatting, image handling

3. **Implement component**
   - File: `ProductDetail.tsx`
   - Create functional component with TypeScript
   - Render product image with loading state
   - Display product name as h1 heading
   - Show pricing (regular + sale price)
   - Display category as link to filtered catalog
   - Render full description
   - Add disabled "Add to Cart" button
   - Implement image error handling with fallback
   - Add accessibility attributes (alt, aria-label, semantic HTML)

4. **Style component**
   - File: `ProductDetail.module.css`
   - Responsive layout (mobile-first)
   - Image container with aspect ratio
   - Typography hierarchy (h1, price, description)
   - Button styling (disabled state)
   - Sale price badge styling
   - Category link styling
   - Loading skeleton for image

5. **Define component metadata**
   - File: `meta.ts`
   - Export component metadata for component registry
   - Define available variants (if any)
   - Document props and usage

6. **Create barrel export**
   - File: `index.ts`
   - Export ProductDetail component, types, and schema

**Acceptance Criteria:**
- ✅ Component renders all product information
- ✅ Handles image loading and errors gracefully
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessible (semantic HTML, ARIA labels)
- ✅ Sale price displayed when applicable
- ✅ Category link navigates correctly
- ✅ Styled consistently with design system

### Step 4: Register ProductDetail in Component Registry

**Tasks:**
1. **Update component registry config**
   - File: `demo-shop/component-registry.config.ts`
   - Import ProductDetail component and schema
   - Add to `componentRegistryConfig` object:
     ```typescript
     ProductDetail: {
       component: ProductDetail,
       schema: ProductDetailPropsSchema,
     }
     ```

2. **Verify registry**
   - Run type check: `npm run typecheck`
   - Ensure no TypeScript errors
   - Verify component can be resolved by type string "ProductDetail"

**Acceptance Criteria:**
- ✅ ProductDetail registered in component config
- ✅ Component accessible via DynamicComponentRenderer
- ✅ Schema validation configured
- ✅ No TypeScript errors

### Step 5: Create Product Route Component

**Tasks:**
1. **Create route file**
   - File: `demo-shop/app/routes/shop.$shopId.product.$productId.tsx`
   - Follow React Router v7 file naming convention

2. **Implement loader function**
   - Extract and validate `shopId` (UUID validation)
   - Extract and validate `productId` (parse to int, check positive)
   - Fetch page layout from `/api/public/shops/{shopId}/pages/product`
   - Fetch product data from `/api/demo/products/{productId}`
   - Use `Promise.all()` for parallel fetching
   - Handle errors (400, 404, 500) by throwing Response
   - Return `ShopProductPageLoaderData` object
   - Add TypeScript types for loader args and return value

3. **Implement route component**
   - Use `useLoaderData<typeof loader>()` to get data
   - Apply theme settings via CSS custom properties (useEffect)
   - Render DynamicComponentRenderer with page layout
   - Pass `runtimeProps` with `{ shopId, product }` to inject into components

4. **Implement ErrorBoundary**
   - Handle HTTP errors from loader (RouteErrorResponse)
   - Handle React rendering errors (Error)
   - Map status codes to user-friendly messages
   - Provide "Go Back" and "Try Again" buttons
   - Show debug info in development mode only

5. **Add meta function**
   - Set page title to product name
   - Add meta description with product summary
   - Handle case where data is unavailable (404)

6. **Add shouldRevalidate function (optional)**
   - Prevent unnecessary loader re-runs
   - Only revalidate on pathname change, not search params

**Acceptance Criteria:**
- ✅ Route accessible at `/shop/:shopId/product/:productId`
- ✅ Loader fetches both page layout and product data
- ✅ Component renders DynamicComponentRenderer with data
- ✅ Theme settings applied correctly
- ✅ ErrorBoundary handles all error scenarios
- ✅ Meta tags set correctly
- ✅ TypeScript types defined and used

### Step 6: Add Navigation from Catalog to Product Page

**Tasks:**
1. **Update ProductCard component**
   - File: `/shared/components/ProductListGrid/ProductCard/ProductCard.tsx`
   - Already has `onClick` prop accepting `(productId: number) => void`
   - Verify click handler fires correctly

2. **Update ProductListGridContainer**
   - File: `demo-shop/app/containers/ProductListGridContainer.tsx`
   - Add navigation handler using React Router's `useNavigate` hook
   - Create `handleProductClick` function:
     ```typescript
     const navigate = useNavigate();
     const handleProductClick = (productId: number) => {
       navigate(`/shop/${shopId}/product/${productId}`);
     };
     ```
   - Pass `onProductClick={handleProductClick}` to ProductListGrid
   - ProductListGrid passes it down to ProductCard components

3. **Test navigation flow**
   - Navigate to catalog page
   - Click product card
   - Verify navigation to product page
   - Verify correct product ID in URL
   - Verify product page loads successfully

**Acceptance Criteria:**
- ✅ Clicking product card navigates to product page
- ✅ Correct product ID passed in URL
- ✅ Product page loads with correct data
- ✅ Navigation works on catalog and filtered catalog pages

### Step 7: Testing

**Unit Tests:**
1. **Test `fetchProductById` function**
   - File: `demo-shop/app/lib/api-products.test.ts`
   - Already covered in Step 2

2. **Test ProductDetail component**
   - File: `/shared/components/ProductDetail/ProductDetail.test.tsx`
   - Test rendering with valid product data
   - Test image loading states (loading, loaded, error)
   - Test sale price display logic
   - Test category link generation
   - Test accessibility attributes

3. **Test loader function**
   - File: `demo-shop/app/routes/shop.$shopId.product.$productId.test.tsx`
   - Mock fetch API
   - Test successful data loading
   - Test invalid shopId handling
   - Test invalid productId handling
   - Test 404 error from page API
   - Test 404 error from product API
   - Test network error handling

**Integration Tests:**
1. **Test full page rendering**
   - Use React Testing Library
   - Mock loader data
   - Render route component
   - Assert DynamicComponentRenderer receives correct props
   - Assert theme application logic runs

2. **Test ErrorBoundary**
   - Simulate loader throwing 400, 404, 500 errors
   - Assert correct error messages displayed
   - Assert correct action buttons shown
   - Test button interactions (go back, try again)

**E2E Tests (Playwright):**
1. **Test product page navigation**
   - Navigate to catalog page
   - Click first product card
   - Assert URL changes to product page
   - Assert product details displayed correctly

2. **Test product page content**
   - Navigate directly to product page URL
   - Assert product name displayed
   - Assert product price displayed
   - Assert product image loaded
   - Assert category link present

3. **Test error scenarios**
   - Navigate to invalid product ID
   - Assert 404 error page displayed
   - Click "Go Back" button
   - Assert navigation to previous page

**Acceptance Criteria:**
- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ E2E tests covering happy path and errors
- ✅ Test coverage > 80% for new code

### Step 8: Documentation

**Tasks:**
1. **Update CLAUDE.md**
   - Document ProductDetail shared component
   - Add to component registry documentation
   - Document product route structure

2. **Update README**
   - Add product page to list of demo shop pages
   - Document new API endpoint

3. **Add JSDoc comments**
   - Ensure all new functions have JSDoc
   - Document component props with JSDoc
   - Add usage examples in comments

4. **Create component documentation**
   - File: `/shared/components/ProductDetail/README.md` (optional)
   - Document props, variants, usage examples

**Acceptance Criteria:**
- ✅ Documentation updated and accurate
- ✅ All public APIs documented
- ✅ Examples provided where helpful

### Step 9: Code Review and Refinement

**Tasks:**
1. **Self-review checklist**
   - Run linter: `npm run lint`
   - Run type checker: `npm run typecheck`
   - Run all tests: `npm run test`
   - Check responsive design on mobile, tablet, desktop
   - Test on different browsers (Chrome, Firefox, Safari)

2. **Performance review**
   - Check bundle size impact
   - Verify images use lazy loading
   - Ensure no unnecessary re-renders
   - Confirm loader uses parallel fetching

3. **Accessibility review**
   - Test with keyboard navigation
   - Test with screen reader
   - Verify all images have alt text
   - Check color contrast ratios

4. **Code quality review**
   - Remove console.logs (except intentional error logging)
   - Ensure consistent code style
   - Remove unused imports
   - Add error handling where needed

**Acceptance Criteria:**
- ✅ No linter errors or warnings
- ✅ No TypeScript errors
- ✅ All tests passing
- ✅ Responsive design verified
- ✅ Accessibility verified
- ✅ Performance optimizations applied

### Step 10: Deployment Preparation

**Tasks:**
1. **Environment variables**
   - Verify `VITE_API_URL` configured correctly
   - Test with production API URL

2. **Build verification**
   - Run production build: `npm run build`
   - Check build output for errors
   - Verify bundle size acceptable

3. **Integration with existing pages**
   - Test navigation from Home → Catalog → Product
   - Test category links from Product → Catalog
   - Verify all pages work together seamlessly

4. **Final manual testing**
   - Test full user journey end-to-end
   - Verify all error states work correctly
   - Ensure loading states display properly

**Acceptance Criteria:**
- ✅ Production build successful
- ✅ All integration points working
- ✅ Full user journey tested
- ✅ Ready for deployment

## Implementation Steps Summary

1. ✅ Backend API Implementation (controller, service, repository)
2. ✅ Frontend API Client Function (fetch + validation)
3. ✅ ProductDetail Shared Component (UI component)
4. ✅ Register in Component Registry (DynamicComponentRenderer integration)
5. ✅ Product Route Component (loader, component, ErrorBoundary)
6. ✅ Navigation from Catalog (ProductCard click handler)
7. ✅ Testing (unit, integration, E2E)
8. ✅ Documentation (CLAUDE.md, README, JSDoc)
9. ✅ Code Review and Refinement (quality, performance, a11y)
10. ✅ Deployment Preparation (build, integration, final testing)

**Estimated Effort:** 2-3 development days for full implementation and testing
