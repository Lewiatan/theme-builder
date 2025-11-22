# Component Implementation Plan: Product List/Grid

## 1. Component Overview

The Product List/Grid component is a dynamic component that displays products in a configurable grid layout on the Catalog page. It displays products filtered by category based on URL parameters (handled by CategoryPills component).

The component follows the Container/Presentational pattern, where the presentational component in `/shared/components` handles UI rendering, while container components in the demo-shop application handle data fetching and state management.

**Key Characteristics:**
- Configurable grid layout (2, 3, 4, or 6 products per row)
- Responsive design that adapts to different screen sizes
- Skeleton loading states during data fetching
- Error state handling with user-friendly messages
- Empty state handling when no products are available

## 2. Necessary Data

### Runtime Data (Dynamic Usage)
When used on the Catalog page (dynamic template), data comes from:

- `categoryId`: number | null - Extracted from URL parameters (`/catalog/:categoryId`)
- Products fetched from API based on categoryId or without filtering for "All Products"

### Product Data Structure
Products fetched from the `demo_products` table via API include:

- `id`: number - Unique product identifier
- `categoryId`: number - Associated category reference
- `name`: string - Product name
- `description`: string - Product description
- `price`: number - Price in cents (e.g., 1999 = $19.99)
- `salePrice`: number | null - Sale price in cents, null if not on sale
- `imageThumbnail`: string - URL for thumbnail image
- `imageMedium`: string - URL for medium-sized image
- `imageLarge`: string - URL for large-sized image

## 3. Rendering Details

### Layout Variants

The component supports four grid layout variants based on `productsPerRow`:

1. **2 Products Per Row**
   - Grid: 2 columns
   - Image size: Medium
   - Use case: Catalog with large product images
   - Responsive: 1 column on mobile

2. **3 Products Per Row**
   - Grid: 3 columns
   - Image size: Medium
   - Use case: Balanced layout for product browsing
   - Responsive: 1 column on mobile, 2 columns on tablet

3. **4 Products Per Row**
   - Grid: 4 columns
   - Image size: Thumbnail or Medium
   - Use case: Compact product display
   - Responsive: 2 columns on mobile, 3 columns on tablet

4. **6 Products Per Row**
   - Grid: 6 columns
   - Image size: Thumbnail
   - Use case: Dense product listing
   - Responsive: 2 columns on mobile, 4 columns on tablet

### Component Structure

The component should be decomposed into smaller reusable sub-components:

1. **ProductListGrid (Main Component)**
   - Orchestrates layout and rendering
   - Manages grid configuration
   - Handles loading, error, and empty states

2. **ProductGrid (Reusable Grid Container)**
   - Renders the grid layout with configurable columns
   - Handles responsive breakpoints
   - Displays skeleton loading state
   - Reusable by FeaturedProducts component

3. **ProductCard (Reusable Product Display)**
   - Displays individual product information
   - Shows product image, name, price, sale price
   - Handles image size variants
   - Provides hover effects and click handling
   - Reusable by FeaturedProducts and ProductDetailView components

### Visual States

1. **Loading State**
   - Display skeleton grid matching configured layout
   - Number of skeleton cards: reasonable number (e.g., 12-18 cards)
   - Skeleton cards should match ProductCard dimensions

2. **Error State**
   - Display error message with icon
   - Show "Retry" button to trigger refetch
   - Maintain layout container structure

3. **Empty State**
   - Message: "No products found" or "No products in this category"
   - Optional call-to-action (e.g., "Browse all products")
   - Center-aligned, friendly messaging

4. **Success State**
   - Render grid of ProductCard components
   - Apply configured grid columns and spacing

### Product Card Rendering

Each ProductCard should display:

- Product image (size based on grid density)
- Product name (truncated if too long)
- Regular price (struck through if sale price exists)
- Sale price (highlighted in accent color if present)
- "Add to Cart" button placeholder (non-functional in MVP)
- Hover state with subtle elevation/shadow effect
- Click handler for navigation to Product Detail page

### Responsive Behavior

- **Mobile (< 640px)**: Force 1-2 columns regardless of config
- **Tablet (640px - 1024px)**: Reduce columns (e.g., 6→4, 4→3)
- **Desktop (> 1024px)**: Use configured `productsPerRow`
- Images should be responsive with proper aspect ratios

## 4. Data Flow

### Dynamic Usage Flow (Catalog Page)

1. **URL Parameter Extraction**
   - React Router v7 loader extracts `categoryId` from route params (`/catalog/:categoryId`)
   - If no categoryId, fetch all products

2. **Data Fetching in Loader**
   - Loader calls API: `GET /api/demo/products?categoryId={categoryId}`

3. **Loader Data Return**
   - Loader returns: `{ products, categoryId }`
   - React Router passes loader data to page component

4. **Component Rendering**
   - Page component renders ProductListGrid container
   - Container receives products data (already fetched)
   - CategoryPills component (separate) handles category filtering UI

### API Endpoints

**Fetch Products by Category:**
```
GET /api/demo/products?categoryId=2
Response: Product[]
```

**Fetch All Products:**
```
GET /api/demo/products
Response: Product[]
```

### Container Component Responsibilities (demo-shop)

The container component in `/demo-shop/containers/ProductListGridContainer.tsx` should:

1. Receive props from page component (products from loader)
2. Handle loading, error, and data states (passed from loader)
3. Pass processed data to presentational component
4. Calculate appropriate image size based on `productsPerRow`

### Presentational Component Responsibilities (shared)

The presentational component in `/shared/components/ProductListGrid/` should:

1. Accept props: products, productsPerRow, isLoading, error
2. Render grid layout based on configuration
3. Render loading skeleton when `isLoading=true`
4. Render error UI when `error` is present
5. Render empty state when products array is empty
6. Be purely presentational with no data fetching logic

## 5. Security Considerations

### Input Validation

**Props Validation (Zod Schema):**
- Validate `productsPerRow` is one of: 2, 3, 4, 6 (use enum)
- Validate `categoryId` (if present) is valid positive integer

**API Response Validation (Zod Schema):**
- Validate product array structure matches Product interface
- Validate all required fields are present (id, name, price, images)
- Validate price and salePrice are non-negative integers
- Validate image URLs are non-empty strings (basic format check)
- Validate categoryId is positive integer

### Data Security

1. **Public Read-Only Data**: Demo products are publicly accessible with no authentication required
2. **URL Parameter Validation**: categoryId comes from URL, validate it's a valid positive integer
3. **XSS Prevention**: Ensure product names and descriptions are properly escaped in React (automatic via JSX)
4. **Image URL Safety**: Validate image URLs to prevent loading malicious resources (basic URL format check)

### Authorization

- No authorization checks needed (public demo data)
- Future consideration: If products become shop-specific, add shop ownership validation

## 6. Error Handling

### Network Errors

**Scenario**: API request fails due to network issue or server error (500)

**Handling:**
- Catch error in data fetching hook/loader
- Set `error` state with descriptive Error object
- Pass error to presentational component via `error` prop
- Component renders error UI with message: "Failed to load products. Please try again."
- Display "Retry" button that re-triggers fetch

**Implementation:**
- Use try/catch in API service layer
- Transform API errors into user-friendly messages
- Log errors to console for debugging (not in production)

### Invalid Category ID

**Scenario**: URL contains categoryId that doesn't exist (e.g., `/catalog/999`)

**Handling:**
- Backend returns 404 or empty products array
- React Router loader catches 404, sets error state
- Component renders error: "Category not found"
- Provide link to "View all products" (navigate to `/catalog`)

**Implementation:**
- Backend validates categoryId exists
- Returns 404 if category doesn't exist
- Loader throws error or sets error state
- ErrorBoundary or error state UI handles display

### Missing Required Props

**Scenario**: Component instantiated without required props (productsPerRow)

**Handling:**
- Zod validation catches missing props at runtime
- Fall back to sensible defaults: productsPerRow=3
- Log warning to console in development mode

**Implementation:**
- Define default values in prop schema
- Validate props with Zod at component entry
- Use defaults if validation fails

### Empty Results

**Scenario**: Valid request but no products match criteria (empty category, no products in database)

**Handling:**
- Component receives empty products array
- Render empty state UI with friendly message
- Message: "No products found in this category"
- Provide action: "Browse all products" button (links to `/catalog` without category filter)

**Implementation:**
- Check `products.length === 0` before rendering grid
- Render EmptyState component with contextual message
- Include navigation option to broader product view

### Image Loading Errors

**Scenario**: Product image URL fails to load (404, broken link)

**Handling:**
- Use `<img>` onError handler to detect failed loads
- Display placeholder image or generic product icon
- Product card remains functional even without image

**Implementation:**
- ProductCard component handles image error event
- Swaps src to fallback placeholder image
- Maintains card layout integrity

## 7. Performance Considerations

### Image Optimization

**Challenge**: Loading large images for many products impacts performance

**Solutions:**
1. **Responsive Image Sizing**: Select appropriate image size based on grid density
   - 6 per row → imageThumbnail
   - 4 per row → imageThumbnail
   - 3 per row → imageMedium
   - 2 per row → imageMedium

2. **Lazy Loading**: Use `loading="lazy"` attribute on `<img>` tags
   - Images below fold load only when scrolled into view
   - Reduces initial page load time

3. **Image Format**: Ensure backend serves optimized formats (WebP with JPEG fallback)
   - Cloudflare R2 can handle format conversion

4. **Aspect Ratio Preservation**: Use CSS aspect-ratio to prevent layout shift
   - Define fixed aspect ratio (e.g., 1:1 or 4:3)
   - Prevents cumulative layout shift (CLS) metric degradation

### Component Rendering Performance

**Challenge**: Re-rendering many ProductCard components on state changes

**Solutions:**
1. **Memoization**: Wrap ProductCard with React.memo()
   - Prevents re-render when props haven't changed
   - Especially important for large grids (6x3 = 18 cards)

2. **Key Optimization**: Use stable product.id as key in map()
   - Enables efficient React reconciliation
   - Prevents unnecessary DOM mutations

3. **Event Handler Optimization**: Memoize click handlers with useCallback
   - Prevents creating new function instances on each render
   - Reduces prop change detection overhead

### Data Fetching Optimization

**Challenge**: Fetching many products can be slow

**Solutions:**
1. **Response Compression**: Ensure backend uses gzip/brotli compression
   - Reduces payload size over network

### CSS Performance

**Challenge**: Complex grid layouts can cause reflows

**Solutions:**
1. **CSS Grid**: Use modern CSS Grid for layout
   - Hardware-accelerated, efficient rendering
   - Responsive with minimal media queries

2. **Avoid Layout Thrashing**: Batch DOM reads/writes
   - Use ResizeObserver if needed for responsive behavior
   - Minimize forced synchronous layouts

## 8. Implementation Steps

### Step 1: Create Component Directory Structure

Create the following directory and files in `/shared/components/`:

```
ProductListGrid/
├── ProductListGrid.tsx          # Main component
├── ProductListGrid.module.css   # Component styles
├── types.ts                     # TypeScript interfaces and Zod schemas
├── meta.ts                      # Editor metadata for theme-builder
├── index.ts                     # Public exports
├── ProductCard/
│   ├── ProductCard.tsx          # Reusable product card
│   ├── ProductCard.module.css
│   └── index.ts
├── ProductGrid/
    ├── ProductGrid.tsx          # Reusable grid container
    ├── ProductGrid.module.css
    └── index.ts
```

### Step 2: Define TypeScript Interfaces and Zod Schemas

In `types.ts`, define:

1. **Product Interface**: Match demo_products table structure
2. **ProductListGridProps Interface**: Component props with all required and optional fields
3. **ProductCardProps Interface**: Sub-component props
4. **ProductGridProps Interface**: Grid container props

Create Zod schemas for runtime validation:

1. **ProductSchema**: Validate product API responses
2. **ProductListGridPropsSchema**: Validate component props
3. **ProductsPerRowSchema**: Enum validation (2, 3, 4, 6)

### Step 3: Implement ProductCard Sub-Component

Create reusable ProductCard component:

1. Accept props: product data, imageSize variant
2. Render product image with appropriate size
3. Display product name (with text truncation)
4. Display price formatting (convert cents to dollars)
5. Display sale price with visual distinction (strikethrough regular price)
6. Add hover effects (elevation, shadow)
7. Handle image loading errors with fallback
8. Add click handler for navigation to product detail page
9. Use CSS modules for styling
10. Memoize component with React.memo()

### Step 4: Implement ProductGrid Sub-Component

Create reusable grid container:

1. Accept props: products array, columns configuration, isLoading
2. Render CSS Grid layout with dynamic column count
3. Implement responsive breakpoints with media queries
4. Render skeleton loading state when isLoading=true
5. Calculate and render correct number of skeleton cards
6. Handle empty products array (render nothing, let parent handle empty state)
7. Use CSS modules for grid layout styles
8. Ensure proper spacing and gap between cards

### Step 5: Implement Main ProductListGrid Component

Create main component that orchestrates sub-components:

1. Accept props: products, productsPerRow, isLoading, error
2. Validate props with Zod schema, apply defaults if needed
3. Calculate which image size to use based on productsPerRow
4. Implement loading state: render ProductGrid with isLoading=true
5. Implement error state: render error message UI with retry button
6. Implement empty state: render "No products found" message
7. Implement success state: render ProductGrid with all products
8. Pass appropriate props to sub-components
9. Use CSS modules for layout and spacing

### Step 6: Create Component Styles

In respective `.module.css` files:

1. **ProductCard.module.css**:
   - Card container with border, border-radius, shadow
   - Image container with aspect-ratio preservation
   - Product info section layout
   - Price styling with sale price highlighting
   - Hover effects (transform, shadow increase)

2. **ProductGrid.module.css**:
   - CSS Grid layout with dynamic columns (CSS custom properties)
   - Responsive media queries for breakpoints
   - Gap/spacing between cards
   - Skeleton loading styles

3. **ProductListGrid.module.css**:
   - Main container spacing
   - Error state styling
   - Empty state styling

### Step 7: Define Editor Metadata

In `meta.ts`, create metadata object for theme-builder editor:

1. Define component name: "Product List/Grid"
2. Define component category: "Product"
3. Define editable properties:
   - productsPerRow: Select input (options: 2, 3, 4, 6)
4. Define default values: productsPerRow=3
5. Define variant names matching PRD (2/3/4/6 products per row)
6. Include component description and icon reference
7. Note: This component is only used on Catalog page template, not draggable on other pages

### Step 8: Create Public Exports

In `index.ts`:

1. Export ProductListGrid component as default
2. Export all TypeScript interfaces and types
3. Export Zod schemas for external validation
4. Export meta object for editor
5. Export ProductCard and ProductGrid sub-components for reusability (can be used by FeaturedProducts)

### Step 9: Create Container Component (demo-shop)

In `/demo-shop/containers/ProductListGridContainer.tsx`:

1. Create container component that wraps presentational component
2. Accept props from page component (products, isLoading, error from loader)
3. Calculate imageSize based on productsPerRow
4. Pass all necessary props to presentational ProductListGrid component

### Step 10: Implement API Service Layer (demo-shop)

In `/demo-shop/services/api.ts`:

1. Create reusable API service functions:
   - fetchProductsByCategory(categoryId: number): Promise<Product[]>
   - fetchAllProducts(): Promise<Product[]>
2. Handle API base URL from environment variable
3. Add error handling and response validation
4. Add request/response logging in development mode

### Step 11: Integrate with Catalog Page Loader (demo-shop)

In `/demo-shop/routes/catalog.$categoryId.tsx` (or equivalent React Router v7 route):

1. Define loader function that extracts categoryId from params
2. Fetch products based on categoryId
3. Handle errors and return error state if needed
4. Return loader data: { products, categoryId }
5. In component, access loader data with useLoaderData()
6. Pass data to ProductListGridContainer
7. Note: CategoryPills component handles its own category fetching separately

### Step 12: Add Component to Component Registry (demo-shop)

In `/demo-shop/components/ComponentRegistry.tsx` (or equivalent):

1. Import ProductListGridContainer
2. Register component with type identifier (e.g., "product-list-grid")
3. Map component type to container component
4. Ensure dynamic import for code splitting if applicable
5. Note: This component is primarily used in Catalog page template

### Step 13: Implement Loading Skeleton

Create skeleton component for loading state:

1. In ProductGrid, render skeleton cards when isLoading=true
2. Skeleton card should match ProductCard dimensions
3. Use CSS animations for shimmer effect
4. Render reasonable number of skeletons (e.g., 12-18 cards)
5. Maintain grid layout during loading

### Step 14: Implement Error Boundary (Optional)

For robust error handling:

1. Create ErrorBoundary component in demo-shop
2. Wrap ProductListGridContainer with ErrorBoundary
3. Catch and display rendering errors gracefully
4. Provide fallback UI with error message

### Step 15: Add Responsive Behavior

Ensure component is fully responsive:

1. Test on mobile (< 640px): Verify 1-2 columns
2. Test on tablet (640px - 1024px): Verify column reduction
3. Test on desktop (> 1024px): Verify configured columns
4. Verify images scale correctly
5. Test touch interactions on mobile

### Step 16: Implement Accessibility Features

Ensure component is accessible:

1. Add alt text to product images (from product name)
2. Ensure color contrast meets WCAG standards
3. Add focus styles for keyboard navigation
4. Ensure product cards are keyboard navigable
5. Test with screen reader

### Step 17: Integration Testing

Test component integration:

1. Test dynamic usage on Catalog page with categoryId filtering
2. Test loading states display correctly
3. Test error states with network failures
4. Test empty states with no products
5. Test all layout variants (2, 3, 4, 6 per row)
6. Verify image sizing logic works correctly
7. Test navigation to product detail pages
8. Test with different category IDs

### Step 18: Performance Optimization

Apply performance optimizations:

1. Verify React.memo on ProductCard prevents unnecessary re-renders
2. Ensure lazy loading works for images
3. Test with large product counts (e.g., 50+ products)
4. Check bundle size impact
5. Test page load performance with browser dev tools
6. Verify no memory leaks in component lifecycle

### Step 19: Visual Polish

Final visual refinements:

1. Ensure hover effects are smooth and performant
2. Verify spacing and alignment are pixel-perfect
3. Test sale price styling is visually distinct
4. Ensure empty state is centered and well-designed
5. Verify error state is clear and actionable
6. Test dark mode compatibility (if applicable)
7. Ensure consistency with design system

### Step 20: Documentation

Document component usage:

1. Add JSDoc comments to component props interfaces
2. Document expected data structures
3. Document usage in Catalog page context
4. Document error handling expectations
5. Add inline comments for complex logic
6. Document relationship with CategoryPills component

### Step 21: Final Review and Cleanup

Before marking complete:

1. Remove console.log statements
2. Remove commented-out code
3. Ensure all imports are used
4. Verify no TypeScript errors or warnings
5. Run linter and fix issues
6. Ensure code follows project coding standards
7. Review for potential security issues
8. Verify all edge cases are handled
