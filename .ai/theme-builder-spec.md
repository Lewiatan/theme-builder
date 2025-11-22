# E-commerce Theme Builder - Project Specification (MVP)

## Project Overview

A **minimum viable product (MVP)** for an E-commerce Theme Builder that enables store owners to customize shop page layouts and appearance through a visual drag-and-drop interface. This application serves as both a **10xDevs certification project** (demonstrating proficiency in AI-Assisted Development techniques) and the foundational element for a future **E-commerce SaaS** platform.

**Target Timeline:** First certification deadline in 1 month, second in 2 months

## Business Requirements

### Core Features

#### Component-Based Design System
- Templates built from a library of **predefined components** (e.g., Header, Banner, Product List)
- Each component supports multiple **predefined variants**
  - **Example:** Text component with 1/2/3/4 column layouts
  - **Example:** Header component with various logo placements and background sizes
- Users can **only select from available variants** (no custom variant creation in MVP)
- Users **must be able to edit content** within chosen variants:
  - Text content
  - Images (upload/selection)
  - Links
  - Product selection (e.g., for featured products component)
- Users **cannot modify** individual component colors or fonts
- **Global theme settings** available for entire template:
  - Color palette (applies to all components)
  - Typography/fonts (applies to all components)
  - Accessed via collapsible Theme Settings sidebar (see Theme Settings Sidebar section)
  - Saved independently from page content changes

#### Drag-and-Drop Interface
- Visual arrangement of components using **Drag and Drop**
- Vertical component stacking (one below another)
- Column layouts handled through component variants
- **UI Layout:**
  - **Top bar:** Navigation and action controls (see Workspace Top Bar section)
  - **Left sidebar:** Vertical, scrollable component library/palette
  - **Center:** Main workspace/editor area (canvas) for arrangement
  - **Right sidebar:** Collapsible theme settings panel (see Theme Settings Sidebar section)
- **Editing Controls:** Component controls (move up/down, settings, delete) appear only on **hover** in workspace
- Components render clean in workspace, imitating final output

#### Workspace Top Bar
- **Left Section:** Page dropdown menu
  - Displays all available page types (Home, Product Catalog, Product Detail, Contact)
  - Allows switching between pages during editing
  - Shows currently active page
- **Center Section:** Status indicator
  - Displays "Unsaved changes" text when current page has modifications
  - Hidden when no changes present
- **Right Section:** Action buttons (left to right)
  - **Reset button:** Discards all unsaved changes on current page, restores last saved state
  - **Save button:** Saves current page changes to database
  - **Demo button:** Opens Demo Store home page in new tab
  - **Theme Settings button:** Cog icon button that toggles Theme Settings sidebar visibility
  - Save and Reset buttons are **disabled by default**, enabled only when current page has unsaved changes

**Unsaved Changes Protection:**
- Confirmation dialog appears when user attempts to navigate away with unsaved changes (page content, theme settings, or both):
  - Switching to different page via dropdown
  - Logging out from application
  - Closing browser tab/window
  - Opening Demo Store (Demo button)
- Dialog message clearly specifies what is unsaved:
  - "You have unsaved page changes"
  - "You have unsaved theme settings"
  - "You have unsaved page changes and theme settings"
- Dialog options: "Stay on page" or "Leave without saving"
- Choosing "Leave without saving" discards all unsaved changes (page and/or theme)
- **Reset button confirmation:** Shows confirmation dialog before discarding changes to prevent accidental data loss

#### Theme Settings Sidebar
- **Location:** Right side of workspace, collapsible panel
- **Default State:** Collapsed (completely hidden)
- **Toggle:** Via cog icon button in top bar right section
- **Persistence:** Remains open/closed when switching between pages (does not auto-close)
- **Content:**
  - Color palette picker (applies globally to all components)
  - Font/typography selection (applies globally to all components)
  - "Save Theme Settings" button at bottom
- **Save Button State:**
  - Disabled by default (when no changes made)
  - Enabled when theme settings modified
- **Live Preview:** Changes to theme settings visible immediately in workspace canvas
- **Save Workflow:** Independent from page-level saves
  - Theme settings saved via "Save Theme Settings" button in sidebar
  - Page content saved via "Save" button in top bar
  - Two separate save operations

#### Page Management
Support for building templates for four core E-commerce page types:
1. **Home Page**
2. **Product Catalog**
3. **Product Detail Page**
4. **Contact Page**

#### Live Preview & Demo Store

**Live Preview (Workspace)**
- Real-time preview of changes in the workspace canvas
- Shows **unsaved changes** immediately for both:
  - Page content modifications (components, variants, content)
  - Theme settings changes (colors, fonts)
- Updates as user modifies components or theme settings
- **Optional enhancement:** If live preview proves difficult for MVP scope, add "Preview" button that renders current snapshot of settings for the active page only

**Demo Store (Separate Application)**
- Completely separate React application from Theme Builder
- Built with React + React Router v7 for routing between shop pages
- **Client-side rendered** (no Server-Side Rendering in MVP)
- Renders pages using **shared component library** (same components as Theme Builder workspace)
- React Router loaders fetch layout JSON via REST API using **SAVED settings only**
- Component registry maps JSON configuration to React components
- Fetches and displays **mocked product data** from backend API
- Changes visible in Live Preview are **NOT shown** in Demo Store until saved
- Accessed via "Demo" button which opens demo shop in new tab/window
- Independent deployment from Theme Builder application

#### Save & Reset Functionality
- User must **explicitly confirm** saving changes via appropriate save button:
  - **Page changes:** "Save" button in top bar
  - **Theme settings:** "Save Theme Settings" button in Theme Settings sidebar
- **"Reset" button** in top bar to discard all unsaved page changes and restore last saved state from database
  - Requires confirmation dialog to prevent accidental data loss
- Theme settings have no reset button (user can simply close sidebar without saving)
- No auto-save in MVP
- No undo/redo in MVP
- **Page navigation behavior:** Switching pages with unsaved changes triggers confirmation dialog; choosing to leave discards all unsaved changes on that page

#### User Management & Authentication
- Secure user authentication required
- Each user can manage their shop templates
- User/session isolation

### Optional Features (Priority Order)

1. **Viewport Switching in Workspace:** Toggle between mobile/tablet/desktop screen sizes
2. **Viewport Switching in Live Preview:** Toggle between mobile/tablet/desktop views
3. **Multi-tenant Support:** Multiple users/shops with separate configurations
4. **Per-shop Demo Stores:** Separate demo for each shop (shared product mock catalog acceptable)

## Technical Requirements

### Technology Stack

#### Frontend

**Two Separate Applications:**

1. **Theme Builder Application**
   - **Framework:** React 19 with TypeScript
   - **Build Tool:** Vite
   - **Styling:** Tailwind CSS
   - **Drag & Drop:** dnd kit
   - **Routing:** No routing framework (single-view application)
   - **HTTP Client:** Fetch API for REST API communication
   - **Package Manager:** npm
   - **Purpose:** Visual editor for building and customizing shop themes

2. **Demo Shop Application**
   - **Framework:** React 19 with TypeScript
   - **Build Tool:** Vite (via React Router v7)
   - **Styling:** Tailwind CSS
   - **Routing:** React Router v7
   - **HTTP Client:** Fetch API for REST API communication
   - **Package Manager:** npm
   - **Purpose:** Customer-facing shop preview using saved theme settings

#### Backend API
- **Framework:** Symfony 7.3
- **Language:** PHP 8.3+
- **API Style:** REST API with JSON responses
- **Authentication:** JWT tokens (using LexikJWTAuthenticationBundle)
- **Validation:** Symfony Validator component
- **Serialization:** Symfony Serializer component
- **API Documentation:** Nelmio API Doc Bundle (optional for MVP, auto-generates OpenAPI/Swagger docs)

#### Database & Services
- **Database:** PostgreSQL (standalone, self-hosted or cloud-hosted)
- **ORM:** Doctrine ORM
- **Migrations:** Phinx
- **Image Storage:** Cloudflare R2 (S3-compatible object storage)
- **Image Upload:** Direct upload via Symfony API endpoints using AWS SDK for PHP (S3-compatible)

#### Development Environment
- **Containerization:** Docker & Docker Compose
- **Services:**
  - **Theme Builder App:** Vite dev server in container
  - **Demo Shop App:** Vite dev server in container
  - **Backend API:** PHP-FPM + Nginx in container
  - **Database:** PostgreSQL container
  - **Optional:** phpMyAdmin/Adminer for database management
- **Benefits:**
  - Consistent development environment across all developers
  - Easy setup and onboarding (single `docker-compose up` command)
  - Isolated services with networking
  - No local PHP/Node.js installation required
  - Production-like environment for development

#### Architecture
- **Multi-Application Architecture:** Two frontends (Theme Builder + Demo Shop) → Backend API (Symfony REST API) → Database (PostgreSQL)
- **API-First Approach:** All data operations flow through REST API endpoints
- **Stateless Backend:** JWT-based authentication, no server-side sessions
- **Monorepo Approach:** Preferred for MVP to ensure rapid development and code sharing
- **Application Separation:**
  - **Theme Builder:** Standalone React app for authenticated users to edit themes
  - **Demo Shop:** Standalone React Router v7 app for public preview of saved themes
  - Both applications communicate with same REST API but serve different purposes
- **Project Structure:**
  ```
  theme-builder/
  ├── theme-builder-app/           # Theme Builder React Application
  │   ├── src/
  │   │   ├── components/         # Theme builder UI components
  │   │   │   ├── workspace/      # Canvas, sidebar, topbar (workspace UI)
  │   │   │   └── palette/        # Component library palette
  │   │   ├── api/                # API client & HTTP utilities
  │   │   ├── types/              # TypeScript types
  │   │   ├── hooks/              # Custom React hooks
  │   │   └── App.tsx             # Main application (no routing)
  │   ├── public/
  │   └── package.json
  ├── demo-shop-app/               # Demo Shop React Router v7 Application
  │   ├── app/
  │   │   ├── routes/             # React Router v7 routes
  │   │   │   ├── _index.tsx      # Home page route
  │   │   │   ├── catalog.tsx     # Catalog page route
  │   │   │   ├── product.$id.tsx # Product detail route
  │   │   │   └── contact.tsx     # Contact page route
  │   │   ├── components/         # Shop-specific UI components
  │   │   ├── api/                # API client for fetching themes
  │   │   └── root.tsx            # Root layout
  │   ├── public/
  │   └── package.json
  ├── backend/                     # Symfony REST API
  │   ├── src/
  │   │   ├── Controller/         # API endpoints
  │   │   ├── Entity/             # Doctrine entities
  │   │   ├── Repository/         # Data repositories
  │   │   ├── Service/            # Business logic services
  │   │   ├── Security/           # Authentication & authorization
  │   │   └── EventListener/      # Event subscribers
  │   ├── config/                 # Symfony configuration
  │   ├── db/
  │   │   └── migrations/         # Phinx migrations
  │   └── composer.json
  └── shared/                      # Shared components & types
      ├── components/
      │   └── theme/               # 13 theme components (Header, Hero, Footer, etc.)
      │       ├── types.ts         # Component config TypeScript types
      │       ├── registry.ts      # Component registry/mapper
      │       ├── Header.tsx
      │       ├── Hero.tsx
      │       └── ... (all theme components)
      └── types/                   # Shared TypeScript/PHP type definitions
  ```
- **Clear Separation:** All three applications can be developed, tested, and deployed independently
- **Component Sharing:** Theme-rendering components can be shared between both frontend apps

### Component Rendering Architecture

Both the Theme Builder and Demo Shop applications render theme components using a **shared component library**. This architecture eliminates code duplication and ensures visual consistency across both applications.

#### Shared Component Library

**Location:** `shared/components/theme/` directory in monorepo

**Purpose:** Contains all 13 theme components (Header, Hero, Footer, ProductGrid, etc.) as reusable React components.

**Structure:**
```
shared/
└── components/
    └── theme/
        ├── types.ts              # TypeScript types for all component configs
        ├── registry.ts           # Component registry/mapper
        ├── Header.tsx            # Header component with variants
        ├── Hero.tsx              # Hero component with variants
        ├── Footer.tsx
        ├── ProductGrid.tsx
        └── ... (all 13 components)
```

#### Component Configuration Schema

Each component in the layout JSON follows this structure:

```typescript
// shared/components/theme/types.ts
interface ComponentConfig {
  id: string;              // UUID for component instance
  type: ComponentType;     // "header" | "hero" | "footer" | ...
  variant: string;         // Component-specific variant name
  settings: object;        // Component-specific settings
}

// Example: Hero component configuration
interface HeroSettings {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
}
```

#### Component Registry/Mapper

The component registry maps JSON configuration to React components:

```typescript
// shared/components/theme/registry.ts
import { Header } from './Header';
import { Hero } from './Hero';
import { Footer } from './Footer';
// ... other imports

const COMPONENT_REGISTRY = {
  header: Header,
  hero: Hero,
  footer: Footer,
  // ... all 13 components
} as const;

export function renderComponent(config: ComponentConfig) {
  const Component = COMPONENT_REGISTRY[config.type];
  if (!Component) {
    console.error(`Unknown component type: ${config.type}`);
    return null;
  }
  return <Component variant={config.variant} settings={config.settings} />;
}
```

#### Rendering Flow

**Theme Builder (Workspace Preview):**
1. User drags component from palette to canvas
2. Creates ComponentConfig with default settings
3. Canvas renders using `renderComponent(config)`
4. User edits settings via modal
5. Canvas re-renders with updated config

**Demo Shop (Public Preview):**
1. React Router loader fetches layout JSON from `/api/public/shops/{shopId}/pages/{type}`
2. Receives array of ComponentConfig objects
3. Maps each config through `renderComponent()`
4. Renders full page layout

**Example:**
```typescript
// demo-shop/app/routes/_index.tsx
import { json, LoaderFunctionArgs } from 'react-router';
import { renderComponent } from '~/shared/components/theme/registry';

export async function loader({ params }: LoaderFunctionArgs) {
  const response = await fetch(`/api/public/shops/${shopId}/pages/home`);
  const { layout } = await response.json();
  return json({ layout });
}

export default function HomePage() {
  const { layout } = useLoaderData<typeof loader>();

  return (
    <div className="page">
      {layout.map((componentConfig) => (
        <div key={componentConfig.id}>
          {renderComponent(componentConfig)}
        </div>
      ))}
    </div>
  );
}
```

#### Benefits of This Architecture

1. **Zero Code Duplication:** Each component written once, used in both apps
2. **Type Safety:** Shared TypeScript types ensure consistency
3. **Easy Maintenance:** Component changes automatically propagate to both apps
4. **Visual Consistency:** Workspace preview matches Demo Shop exactly
5. **Simplified Testing:** Test components once, confidence in both applications

### Image Storage & Upload
- **Storage:** Cloudflare R2 (S3-compatible object storage)
- **Upload Flow:**
  1. Frontend sends POST request to `/api/shops/{shopId}/images` with image file and JWT in Authorization header
  2. Symfony validates JWT and verifies user has access to the specified shop
  3. If authorized, Symfony uploads image to R2 using AWS SDK for PHP (configured for R2 endpoint)
  4. Symfony stores public image URL in database and returns it to frontend
  5. Frontend uses the returned URL in template JSON configuration
- **Security:**
  - R2 credentials never exposed to frontend (stored in Symfony environment variables)
  - Only authenticated users with shop access can upload images (JWT + shop ownership validation)
  - File type and size validation performed by Symfony before upload
- **Cost:** Free tier covers MVP needs (10GB storage, 1M operations/month)
- **Implementation:** AWS SDK for PHP used for S3-compatible API communication with R2 (R2 implements S3 protocol)

### Authentication & Security
- **Authentication:** JWT-based authentication using LexikJWTAuthenticationBundle
- **Login Flow:**
  1. User submits credentials to `/api/auth/login`
  2. Symfony validates credentials against database
  3. If valid, Symfony generates JWT token and returns it to frontend
  4. Frontend stores JWT (e.g., in localStorage or httpOnly cookie)
  5. Frontend includes JWT in Authorization header for subsequent requests
- **Authorization:** Symfony Security component with custom voters for shop-level access control
- **Password Security:** Passwords hashed using Symfony's PasswordHasher (bcrypt/argon2)
- **Data Access Control:**
  - Repository-level filtering ensures users can only access their own shops/themes
  - JWT payload contains user_id for request authorization
  - All API endpoints validate shop ownership before allowing access
- **Image Upload Security:** Shop ownership validation before allowing image uploads
- **Public Access:** Demo Shop app accesses published theme/page data without authentication (read-only)

### Data Persistence
- Template settings stored in database as **clean JSON structure** in a JSON column
- JSON format chosen for easy data structure and quick MVP development
- No versioning in MVP (potential future feature)

### Database Schema (Simplified)

```sql
-- users
- id (PRIMARY KEY, UUID)
- email (UNIQUE, VARCHAR 255)
- password (hashed)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

-- shops
- id (PRIMARY KEY, UUID)
- user_id (FOREIGN KEY -> users.id, UNIQUE)
- name (VARCHAR 60)
- theme_settings (JSONB: colors, fonts, global theme configuration)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

-- pages
- id (PRIMARY KEY, UUID)
- shop_id (FOREIGN KEY -> shops.id)
- type (ENUM: home, catalog, product, contact)
- layout (JSONB: array of components with variants and settings)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- UNIQUE(shop_id, type) - one page of each type per shop

-- demo_categories
- id (PRIMARY KEY, INTEGER)
- name (VARCHAR 255)

-- demo_products
- id (PRIMARY KEY, INTEGER)
- category_id (FOREIGN KEY -> demo_categories.id)
- name (VARCHAR 255)
- description (TEXT)
- price (INTEGER, in cents)
- sale_price (INTEGER, nullable)
- image_thumbnail (VARCHAR 255)
- image_medium (VARCHAR 255)
- image_large (VARCHAR 255)
```

### Data Source
- Mocked product catalog stored in **database** and accessed via REST API endpoints
- Both Theme Builder and Demo Shop apps fetch product data from backend API
- Seeded with mock product data for MVP (e.g., via database migrations/seeders)
- No real product database integration in MVP (uses mock data only)

### Deployment & CI/CD
- **Hosting:**
  - Theme Builder App: Cloudflare Pages (separate project/domain)
  - Demo Shop App: Cloudflare Pages (separate project/domain)
  - Backend API: Render Web Service (PHP/Symfony)
  - Database: Render PostgreSQL
  - Image Storage: Cloudflare R2
- **CI/CD:** GitHub Actions for:
  - Automated testing (unit + integration) on Pull Request for both frontend apps and backend
  - Linting (frontend: ESLint, backend: PHP CS Fixer) on Pull Request
  - Automatic deployment of Theme Builder App to Cloudflare Pages on merge to `main`
  - Automatic deployment of Demo Shop App to Cloudflare Pages on merge to `main`
  - Automatic deployment of backend API to Render on merge to `main` (via Render's GitHub integration)

### Testing
- **Frontend Unit Tests:** Vitest
- **Backend Unit Tests:** PHPUnit
- **E2E/Integration Tests:** Playwright
- 100% coverage NOT required
- Tests must run automatically via GitHub Actions

### Rendering
- **No Server-Side Rendering (SSR)** in MVP
- Client-side rendering only (no SEO requirements for MVP)
- Both Theme Builder and Demo Shop use **shared React component library** for rendering theme components
- Component registry pattern maps JSON layout configuration to rendered React components
- Future enhancement: SSR can be added to Demo Shop using React Router v7's built-in capabilities

## Component Library (14 Components)

The following components cover all required page types (Home, Catalog, Product, Contact):

### 1. Heading
- **Variants:** Text only, Text with background image, Text with backgrund color.
- **Editable:** Heading text, heading level (H1/H2/H3), height, background image (for variant with image), background color (for variant with color).

### 2. Header/Navigation
- **Variants:** Sticky/static, simple horizontal, slide-in left
- **Editable:** Logo, logo position (left/center)

### 3. Footer
- **Variants:** 1/2/3/4 columns
- **Editable:** Sections (About, Contact, Social media), links, copyright text

### 4. Hero/Full-Width Banner
- **Variants:** Full-width with background image, with video, split layout (image + text)
- **Editable:** Title, subtitle, CTA button, background image/video

### 5. Text Section
- **Variants:** 1/2/3/4 columns, with icons, with images
- **Editable:** Text content, optional images

### 6. Call-to-Action (CTA) Block
- **Variants:** Full-width, box with shadow, with background image
- **Editable:** Header, text, button, background image

### 7. Product List/Grid
- **Variants:** 2/3/4/6 products per row

### 8. Featured Products
- **Variants:** Carousel, grid, list
- **Editable:** Manual product selection from mock catalog (max 8-12 products)
- **Use:** Home page, promotional sections

### 9. Product Detail View
- **Variants:** Large image gallery, compact view, with quick specifications
- **Editable:** Product selection, visible fields (price, description, specs, reviews)
- **Use:** Product detail page

### 10. Review/Testimonial Section
- **Variants:** Carousel, 2/3 column grid, list
- **Editable:** Add reviews (name, content, rating, avatar)

### 11. Contact Form
- **Variants:** Simple (name, email, message), extended (+ phone, subject)
- **Editable:** Section title, info text, visible fields

### 12. Image Gallery
- **Variants:** Masonry, equal grid, carousel, lightbox
- **Editable:** Upload images, alt descriptions

### 13. Map/Location Block
- **Variants:** Full-width map, split (map + info), compact embed
- **Editable:** Address/coordinates, info text, map zoom level

### 14. CategoryPills
- **Variants:** Align left, centered, full width (stretched)
- **Editable:** None - categories are automatically fetched from database
- **Use:** Catalog page for category navigation
- **Behavior:** Displays product categories as clickable navigation elements. Clicking a category navigates to `/catalog/:categoryId` to filter products. Automatically fetches categories from `GET /api/demo/categories` endpoint. Highlights active category based on URL parameter.

## Future Considerations

- **Server-Side Rendering (SSR):**
  - Enable React Router v7 SSR for Demo Shop to improve SEO and initial load performance
  - Implement hydration for client-side interactivity after SSR
  - Configure CDN caching strategies for server-rendered pages
- **Component Optimization:**
  - Lazy loading for theme components to reduce initial bundle size
  - Code splitting per component type
  - Tree shaking optimization for unused component variants
  - Bundle size monitoring and optimization
- **Advanced image processing:**
  - Image optimization and compression before upload
  - Automatic thumbnail generation
  - Format conversion (WebP, AVIF)
  - Cloudflare Images integration for automatic optimization and resizing
- MCP (Model Context Protocol) integration for LLM-based template manipulation
- Template versioning and history
- Component limitations per page type
- Advanced undo/redo functionality
- Multi-language support
- Real product catalog integration

## Success Criteria

- ✅ Functional drag-and-drop interface with hover controls
- ✅ All 14 components working with variants and content editing
- ✅ Save/reset functionality
- ✅ Demo store with mocked products from database
- ✅ Live preview showing unsaved changes
- ✅ JWT-based authentication working with shop ownership validation
- ✅ Global theme settings (colors, fonts)
- ✅ Automated tests passing
- ✅ CI/CD pipeline operational
- ✅ Both applications deployed and accessible (Theme Builder + Demo Shop)
- ✅ API deployed and accessible

## Project Context

- Developer has 14 years of experience (PHP, TypeScript, Angular backend focus)
- Limited React experience (recently learned)
- Project serves dual purpose: **10xDevs certification** + real product foundation
- Emphasis on **AI-Assisted Development** techniques throughout the project
- Clean architecture prioritized for future scalability and easy backend decoupling
