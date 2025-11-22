# UI Architecture Planning Summary

## Decisions

### Round 1: Core Architecture Decisions

1. **Workspace Layout**: Three-panel layout with left component library (280px, open by default), center canvas (fluid), and right theme settings panel (320px, collapsed by default). Panels collapsible with state persisted in localStorage. On screens < 1024px, sidebars convert to overlay panels.

2. **State Management**: Use React's built-in state management (`useState` and `useContext`) with three separate contexts: `WorkspaceContext` (current page, UI state), `PageContext` (layouts per page type with dirty flags), and `ThemeContext` (theme settings with dirty flag). Migration to external library (Zustand) can happen later if complexity increases.

3. **Unsaved Changes Indicator**: Display unsaved changes indicator in the top navigation bar (as per PRD specification). Show specific messages: "Unsaved page changes" / "Unsaved theme settings" / "Unsaved page and theme changes". Modal with "Stay" and "Leave without saving" options appears on navigation attempts.

4. **Component Editing Interface**: Implement slide-in panel (600px wide) from the right side with semi-transparent backdrop that dims but shows the component being edited. Include prominent "Apply" (primary) and "Cancel" (secondary) buttons at bottom. Confirmation dialog on Cancel if form has changes (using React Hook Form's `formState.isDirty`).

5. **Drag-and-Drop Feedback**: Use dnd kit's DragOverlay for dragged component preview. Show 3px blue horizontal line (`border-t-3 border-blue-500`) at valid drop positions. Apply subtle pulse animation to drop zones. Hover reveals control buttons (settings cogwheel, delete, drag handle) positioned absolutely in top-right corner of component wrapper.

6. **Responsive Canvas**: Fluid container (max-width: 100%, padding: 2rem) that adapts to browser window. Components render naturally at current viewport size. Add subtle breakpoint indicators (device icons) at sm/md/lg breakpoints in canvas margins as visual guides. Users resize browser for responsive testing.

7. **Authentication & Session Management**: Implement axios interceptors to catch 401 responses. On token expiration: (1) Show modal warning "Your session will expire in 60 seconds", (2) Offer "Continue Working" button for re-login in modal, (3) On timeout/failed re-auth, save workspace state to localStorage with timestamp, then redirect to login with return URL. After successful login, offer to restore saved state.

8. **Error Handling & User Feedback**: Use **Shadcn/ui Sonner** component for toast notifications positioned at top-right. Distinct styles: success (green, auto-dismiss 3s), error (red, manual dismiss with API error message), loading (blue during save operations). Show progress bar for image uploads in component settings modal using Shadcn/ui Progress component. Create custom `useApiRequest` hook for consistent error handling. Use Shadcn/ui Alert component for inline error messages and AlertDialog for confirmation prompts.

9. **Shared Component Library**: Create `/shared/components` directory in monorepo containing all 14 components. Each component accepts `settings` prop (matching API component settings structure) and `themeSettings` prop for global theme. Use Tailwind CSS with CSS custom properties for theme colors/fonts. Export `ComponentRegistry` mapping component types to React components. Both Theme Builder and Demo Shop import from shared source.

10. **Demo Shop Routing & Data Loading**: Implement route loaders at root layout level to fetch shop theme settings once, use `useRouteLoaderData` in child routes. Individual routes for each page type: `/` (home), `/catalog`, `/catalog/:categoryId`, `/product/:id`, `/contact`. The catalog route supports optional category filtering via URL parameter. Each route loader fetches corresponding page layout from `/api/public/shops/{shopId}/pages/{type}`. Additional loaders for demo products from `/api/demo/products` (with optional `?category={id}` filter), `/api/demo/products/{id}`, and `/api/demo/categories`. Use React Router's deferred data pattern for product images.

### Round 2: Implementation Details

11. **React Context Structure**: Hierarchical context with `WorkspaceProvider` as root wrapping `PageProvider` and `ThemeProvider`. Use `useReducer` for complex state in PageProvider (4 page types with layouts and dirty flags) and ThemeProvider (theme settings + dirty flag). Implement memoization with `useMemo` for context values to prevent unnecessary re-renders. Split context consumers: `useWorkspace` for UI state, `usePage` for layout operations, `useTheme` for global styling.

12. **Unsaved Changes Data Structure**: In `WorkspaceContext`, maintain computed state: `{ hasUnsavedPageChanges: boolean, hasUnsavedThemeChanges: boolean, unsavedMessage: string }`. The `unsavedMessage` derives from flags. Update flags in respective contexts when layouts/theme modify, clear on successful save. Use in top nav to show/hide indicator and determine warning modal message.

13. **Reset Button Functionality**: Two separate reset buttons: (1) "Reset Page" in top navigation (active when `hasUnsavedPageChanges === true`), calls `PUT /api/pages/{type}/reset` or reverts to last saved layout. (2) "Reset Theme" in theme settings panel (active when `hasUnsavedThemeChanges === true`), calls `POST /api/theme/reset` or reverts to last saved theme. Both show confirmation dialog. Additionally, show "Restore Default Layout" button in canvas when current page layout array is empty.

14. **Component Library Sidebar Structure**: Scrollable sidebar with component groups using accordion sections (Header/Footer, Content Sections, Product Components, Forms). Each component displays as card with icon, component name, and variant count badge. Use dnd kit's `useDraggable` hook on each component card. On drag start, create DragOverlay with component preview and translucent background. Store component metadata (type, default variant, default settings) in `componentRegistry.ts` file. **Note**: Preview thumbnail on hover is excluded from MVP.

15. **Variant Switching in Settings Panel**: Implement variant selector dropdown in the component settings panel. On variant change, use merge strategy: (1) Define `variantSchema` for each component mapping fields to variants, (2) Extract common fields (e.g., `heading`, `ctaText`) that persist across variants, (3) On variant change, preserve common field values, reset variant-specific fields to defaults, (4) Show subtle notification "Switched to [variant name] - common settings preserved". Use React Hook Form's `reset()` method with merged values.

16. **Accessibility Considerations**: Not prioritized for MVP scope.

17. **Image Upload Integration**: For each component setting requiring an image, implement inline uploader in settings panel: (1) Show current image preview if URL exists, (2) "Upload Image" button opens file picker, (3) On selection, immediately upload to `POST /api/images` with progress bar, (4) On success, update form field with returned URL and show preview, (5) "Remove Image" button to clear URL. Validate file type (JPEG, PNG, WebP, GIF) and size (max 10MB) client-side before upload. Display upload errors inline near upload button.

18. **Demo Button Strategy**: Store current user's `shopId` in WorkspaceContext after login (from `/api/shop` response). Demo button opens new tab to `VITE_DEMO_SHOP_URL/shop/{shopId}`. Demo Shop root loader extracts `shopId` from URL parameter and fetches shop data from `/api/public/shops/{shopId}`. No special session handling needed since public endpoints don't require authentication.

19. **Theme Settings Real-Time Preview**: Use controlled inputs in theme panel (color pickers, font dropdowns) that update ThemeContext state immediately on change. Components in canvas subscribe to ThemeContext via `useTheme()` and apply theme values through CSS custom properties injected in `<style>` tag in document head. Save button in theme panel calls `PUT /api/theme` to persist changes. Achieves PRD requirement: "Changes to theme settings are immediately visible in the workspace" while "Saving theme settings is done independently".

20. **Error Boundary Strategy**: Wrap each rendered component in canvas with individual `ComponentErrorBoundary` that catches rendering errors. On error, display fallback UI showing component type, error icon, and "Failed to render - Edit Settings" button. Log error details to console. Wrap entire workspace in top-level `WorkspaceErrorBoundary` for critical failures showing "Something went wrong" screen with "Reload Workspace" button. For API errors during save operations, show error toasts (Sonner) but keep workspace functional.

## Matched Recommendations

### UI Component Library

1. **Shadcn/ui Integration**
   - Primary UI component library for both Theme Builder and Demo Shop
   - Built on Radix UI primitives with Tailwind CSS styling
   - Components copied into project for full customization
   - Comprehensive component set: Button, Dialog, Sheet, Alert, Form, Input, Select, etc.
   - Built-in accessibility features (ARIA, keyboard navigation, focus management)
   - Type-safe with TypeScript
   - Seamless integration with React Hook Form

2. **Theme Builder Specific Components**
   - Sheet for component settings slide-in panel
   - AlertDialog for confirmations (delete, reset)
   - Sonner for toast notifications
   - Progress for image upload indicators
   - Accordion for component library sections
   - Card and Badge for component library items
   - Skeleton for loading states

3. **Demo Shop Specific Components**
   - Alert for error boundaries and page errors
   - Skeleton for loading states during data fetch
   - Button for navigation and CTAs
   - Card for product displays
   - Form components for contact/newsletter

### Layout & Structure

1. **Three-Panel Workspace Layout**
   - Left sidebar: Component library (280px, open by default)
   - Center: Canvas (fluid, responsive)
   - Right sidebar: Theme settings (320px, collapsed by default)
   - Panel states persisted in localStorage
   - Responsive breakpoint at 1024px converts sidebars to overlays

2. **Top Navigation Bar Components**
   - Page selection dropdown menu
   - Unsaved changes indicator with context-aware messaging
   - Action buttons: Reset, Save, Demo, Theme Settings
   - All aligned with PRD specifications

### State Management

3. **React Context Architecture**
   ```
   WorkspaceProvider
   ├── PageProvider (manages 4 page types, layouts, dirty flags)
   └── ThemeProvider (theme settings, dirty flag)
   ```
   - `useReducer` for complex state management
   - `useMemo` for performance optimization
   - Custom hooks: `useWorkspace()`, `usePage()`, `useTheme()`

4. **Unsaved Changes Tracking**
   ```typescript
   {
     hasUnsavedPageChanges: boolean,
     hasUnsavedThemeChanges: boolean,
     unsavedMessage: string // Computed based on flags
   }
   ```

### User Interface Components

5. **Component Settings Panel**
   - Slide-in panel (600px) from right side
   - Semi-transparent backdrop maintaining visual context
   - Variant selector dropdown at top
   - "Apply" and "Cancel" buttons with confirmation on dirty state
   - Inline image uploader with progress indicators

6. **Component Library Sidebar**
   - Accordion sections grouping components by category
   - Component cards with icon, name, variant count badge
   - Draggable with dnd kit's `useDraggable` hook
   - Component metadata stored in `componentRegistry.ts`

7. **Drag-and-Drop Interface**
   - DragOverlay for visual feedback during drag
   - 3px blue horizontal line indicating valid drop zones
   - Pulse animation on drop zone hover
   - Control buttons (settings, delete, drag handle) on component hover

### API Integration

8. **Authentication Flow**
   - Axios interceptors for 401 handling
   - Session expiration warning (60s before timeout)
   - State preservation in localStorage on session loss
   - Seamless re-authentication without navigation

9. **Save Operations**
   - Independent save mechanisms for pages and theme
   - Page save: `PUT /api/pages/{type}`
   - Theme save: `PUT /api/theme`
   - Reset operations with confirmation dialogs

10. **Image Upload**
    - Client-side validation (type, size)
    - Direct upload to `POST /api/images`
    - Progress indication during upload
    - Immediate preview on success

### Cross-Application Architecture

11. **Shared Component Library**
    - Location: `/shared/components`
    - Component interface: `settings` + `themeSettings` props
    - Tailwind CSS with CSS custom properties
    - `ComponentRegistry` for component type mapping
    - Shared between Theme Builder and Demo Shop

12. **Demo Shop Integration**
    - URL pattern: `/shop/{shopId}`
    - Root loader fetches theme settings once
    - Page-specific loaders for layouts
    - React Router 7 with deferred data for images
    - Public API endpoints (no authentication)

### User Experience

13. **Real-Time Theme Preview**
    - Controlled inputs update ThemeContext immediately
    - CSS custom properties injected in document head
    - Canvas components subscribe to theme changes
    - Separate save action for persistence

14. **Error Handling**
    - Shadcn/ui Sonner component for toast notifications
    - Shadcn/ui Alert for inline error messages
    - Shadcn/ui AlertDialog for confirmation prompts
    - Per-component error boundaries with fallback UI
    - Top-level workspace error boundary
    - Shadcn/ui Progress component for upload progress

15. **Responsive Design**
    - Fluid canvas adapting to viewport
    - Breakpoint indicators in canvas margins
    - Natural component responsiveness
    - Browser resize for testing (no viewport switcher in MVP)

## UI Architecture Planning Summary

### Overview

The E-commerce Theme Builder MVP consists of three applications in a monorepo structure:

1. **Theme Builder** - Visual editor for authenticated users (React 19 + Vite)
2. **Demo Shop** - Public preview application (React Router 7 + SSR)
3. **Backend** - REST API (Symfony 7.3 + PostgreSQL)

The UI architecture emphasizes:
- **Simplicity**: React built-in state management without external dependencies
- **Separation of Concerns**: Independent save mechanisms for pages vs. theme
- **Visual Consistency**: Shared component library between applications
- **User Protection**: Comprehensive unsaved changes tracking and warnings

**UI Component Library:**
- **Shadcn/ui** is used for all UI components in both Theme Builder and Demo Shop
- Provides accessible, customizable components built on Radix UI primitives
- Components are styled with Tailwind CSS utility classes
- Components are copied into the project for full control and customization
- Ensures consistent design patterns, accessibility, and responsive behavior across applications

### Shadcn/ui Integration

#### Overview

Both frontend applications (Theme Builder and Demo Shop) use **Shadcn/ui** as the primary UI component library for all interface elements, form controls, modals, and feedback components.

**Key Benefits:**
- Built on **Radix UI** primitives for robust accessibility (ARIA attributes, keyboard navigation, focus management)
- Styled with **Tailwind CSS** for consistency with custom components
- Components are **copied into the project** (`components/ui/`) rather than installed as dependencies
- Full control over component customization and styling
- Type-safe with TypeScript
- Works seamlessly with React 19 and React Router 7

#### Setup and Installation

**Initial Setup:**
```bash
# In theme-builder directory
cd theme-builder
npx shadcn@latest init

# In demo-shop directory
cd demo-shop
npx shadcn@latest init
```

**Configuration:**
- Creates `components.json` configuration file
- Sets up `lib/utils.ts` with `cn()` utility for className merging
- Extends Tailwind configuration with design tokens
- Configures path aliases for component imports

#### Required Components by Application

**Theme Builder Components:**
- `button` - Action buttons throughout UI (Save, Reset, Apply, Cancel)
- `dialog` - Confirmation dialogs, unsaved changes warnings
- `alert-dialog` - Destructive action confirmations (delete component, reset page)
- `dropdown-menu` - Page selection, user menu, component actions
- `toast` (Sonner) - Success/error/loading notifications
- `alert` - Inline error/warning messages
- `progress` - Image upload progress bars
- `sheet` - Component settings slide-in panel
- `accordion` - Component library sidebar sections
- `form` - Component settings forms with React Hook Form integration
- `input` - Text inputs in forms
- `textarea` - Multi-line text inputs
- `select` - Dropdowns (variant selector, font picker)
- `label` - Form field labels
- `card` - Component cards in sidebar
- `badge` - Variant count badges, status indicators
- `separator` - Visual dividers in UI
- `scroll-area` - Scrollable component library and settings panels
- `skeleton` - Loading states during data fetch

**Demo Shop Components:**
- `button` - Navigation, CTAs in components
- `alert` - Error states (shop not found, page load errors)
- `skeleton` - Loading states during page/product fetch
- `card` - Product cards in grid/list views
- `badge` - Product categories, sale badges
- `separator` - Section dividers
- `form` - Contact form, newsletter signup
- `input` - Form inputs in contact/newsletter components
- `textarea` - Message field in contact form

#### Component Customization Strategy

**Theme Integration:**
All Shadcn/ui components reference CSS custom properties for colors, allowing them to adapt to user-defined theme settings:

```css
/* Generated in <style> tag based on ThemeContext */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  /* ... other theme colors */
}

/* Shadcn/ui components use these variables */
.btn-primary {
  background-color: var(--color-primary);
}
```

**Variant Extensions:**
Components can be extended with custom variants in `components/ui/` directory:

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "base-styles...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        // Custom variant for theme preview actions
        theme: "bg-[var(--color-primary)] text-white",
      },
    },
  }
);
```

#### Directory Structure

**Theme Builder:**
```
theme-builder/
├── components/
│   └── ui/              # Shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       └── ... (other components)
├── lib/
│   └── utils.ts         # cn() utility function
└── components.json      # Shadcn/ui configuration
```

**Demo Shop:**
```
demo-shop/
├── app/
│   ├── components/
│   │   └── ui/          # Shadcn/ui components
│   │       ├── alert.tsx
│   │       ├── button.tsx
│   │       ├── skeleton.tsx
│   │       └── ... (other components)
│   └── lib/
│       └── utils.ts     # cn() utility function
└── components.json      # Shadcn/ui configuration
```

#### Usage Patterns

**Toast Notifications (Sonner):**
```typescript
import { toast } from "sonner";

// Success
toast.success("Page saved successfully");

// Error with description
toast.error("Failed to save page", {
  description: "Network connection lost. Please try again.",
});

// Loading
const toastId = toast.loading("Saving page...");
// Later: toast.dismiss(toastId);
```

**Confirmation Dialogs:**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Component</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete this component from your page.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Component Settings Sheet:**
```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right" className="w-[600px]">
    <SheetHeader>
      <SheetTitle>Component Settings</SheetTitle>
    </SheetHeader>
    {/* Form content */}
    <SheetFooter>
      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleApply}>Apply</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

**Form Integration with React Hook Form:**
```tsx
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="heading"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Heading</FormLabel>
          <FormControl>
            <Input placeholder="Enter heading" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

#### Accessibility Features

Shadcn/ui components come with built-in accessibility:
- **Keyboard Navigation:** Full keyboard support (Tab, Enter, Esc, Arrow keys)
- **Screen Reader Support:** Proper ARIA labels, roles, and live regions
- **Focus Management:** Focus trapping in modals, focus restoration on close
- **Color Contrast:** Default variants meet WCAG AA standards
- **Semantic HTML:** Proper use of button, dialog, nav, etc. elements

#### Tailwind CSS Integration

**Configuration:**
Shadcn/ui extends Tailwind with custom theme tokens in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... other semantic colors
      },
    },
  },
};
```

**CSS Variables:**
Defined in `app.css` or `globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... other variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables (future enhancement) */
  }
}
```

#### Performance Considerations

- **Tree Shaking:** Only components actually used are included in bundle
- **Code Splitting:** Components can be lazy-loaded if needed
- **No Runtime Dependencies:** Radix UI has minimal runtime overhead
- **Optimized Tailwind:** PurgeCSS removes unused classes in production

#### Testing Strategy

**Component Testing:**
- Shadcn/ui components are pre-tested by the library
- Focus testing on custom business logic and integrations
- Test form validations and user interactions
- Verify accessibility with testing-library/react and jest-axe

### Main UI Architecture Requirements

#### Theme Builder Application

**Primary Views:**

1. **Main Workspace** (Single-page application)
   - Top Navigation Bar
     - Page selection dropdown (Home, Catalog, Product, Contact)
     - Unsaved changes indicator (context-aware messaging)
     - Action buttons: Reset Page, Save Page, Demo, Theme Settings toggle
   - Left Sidebar (280px, open by default)
     - Component library organized in accordion sections
     - Draggable component cards
     - Collapsible with state persistence
   - Center Canvas (fluid)
     - Live preview of page layout
     - Vertical component stacking
     - Drop zones with visual feedback
     - Hover controls per component
   - Right Sidebar (320px, collapsed by default)
     - Theme settings panel
     - Color pickers and font selectors
     - Real-time preview of changes
     - Reset Theme and Save Theme buttons

2. **Component Settings Panel**
   - Slide-in from right (600px)
   - Variant selector at top
   - Dynamic form fields based on component type
   - Inline image uploader with progress
   - Apply and Cancel actions

3. **Modal Dialogs**
   - Unsaved changes warning
   - Confirmation dialogs for reset operations
   - Session expiration warning
   - Re-authentication modal

#### Demo Shop Application

**Page Routes:**
- `/shop/{shopId}` - Home page
- `/shop/{shopId}/catalog` - Product catalog (all products)
- `/shop/{shopId}/catalog/:categoryId` - Product catalog filtered by category
- `/shop/{shopId}/product/:id` - Product detail
- `/shop/{shopId}/contact` - Contact page

**Data Loading Strategy:**
- Root loader: Shop metadata and theme settings
- Page loaders: Page-specific layouts
- Product loaders: Demo product data (with optional category filtering)
- Category loader: All categories for CategoryPills component
- Deferred loading for images

### Key User Flows

#### 1. New User Onboarding Flow
```
Registration → JWT Token → Auto-create 4 default pages → Login → Workspace loads Home page
```

#### 2. Page Editing Flow
```
Select page from dropdown → View current layout → Drag component from library → Drop in canvas →
Click settings icon → Configure in panel → Apply changes → Mark as unsaved → Save → API persists
```

#### 3. Theme Customization Flow
```
Click Theme Settings button → Right panel opens → Modify colors/fonts → See immediate preview →
Click Save Theme → API persists → Clear unsaved flag
```

#### 4. Component Management Flow
```
Hover component → Reveal controls → Click settings (edit) / delete / drag handle →
Delete: Confirmation → Remove from layout → Mark unsaved
Reorder: Drag → Drop zone indicator → Drop → Update layout → Mark unsaved
```

#### 5. Preview Flow
```
Click Demo button → Check for unsaved changes → Save workspace state to localStorage →
Open new tab with /shop/{shopId} → Demo Shop renders saved state with mock data
```

#### 6. Session Management Flow
```
Token expires → Intercept 401 → Show "60s warning" → Prompt re-login →
Success: Continue session | Failure: Save state to localStorage → Redirect to login →
After login: Offer to restore state
```

### State Management Strategy

#### Context Providers Hierarchy

```typescript
<WorkspaceProvider>
  <PageProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </PageProvider>
</WorkspaceProvider>
```

#### WorkspaceContext State Shape

```typescript
interface WorkspaceState {
  currentPageType: 'home' | 'catalog' | 'product' | 'contact';
  shopId: string;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  hasUnsavedPageChanges: boolean;    // Computed from PageContext
  hasUnsavedThemeChanges: boolean;   // Computed from ThemeContext
  unsavedMessage: string;            // Computed message for UI
}
```

#### PageContext State Shape

```typescript
interface PageState {
  pages: {
    home: { layout: ComponentLayout[], isDirty: boolean, savedLayout: ComponentLayout[] },
    catalog: { layout: ComponentLayout[], isDirty: boolean, savedLayout: ComponentLayout[] },
    product: { layout: ComponentLayout[], isDirty: boolean, savedLayout: ComponentLayout[] },
    contact: { layout: ComponentLayout[], isDirty: boolean, savedLayout: ComponentLayout[] }
  };
}

type PageActions =
  | { type: 'SET_LAYOUT'; pageType: PageType; layout: ComponentLayout[] }
  | { type: 'ADD_COMPONENT'; pageType: PageType; component: ComponentLayout; position: number }
  | { type: 'REMOVE_COMPONENT'; pageType: PageType; componentId: string }
  | { type: 'REORDER_COMPONENTS'; pageType: PageType; layout: ComponentLayout[] }
  | { type: 'UPDATE_COMPONENT'; pageType: PageType; componentId: string; settings: any }
  | { type: 'SAVE_SUCCESS'; pageType: PageType }
  | { type: 'RESET_PAGE'; pageType: PageType };
```

#### ThemeContext State Shape

```typescript
interface ThemeState {
  current: ThemeSettings;
  saved: ThemeSettings;
  isDirty: boolean;
}

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

type ThemeActions =
  | { type: 'UPDATE_COLOR'; colorKey: string; value: string }
  | { type: 'UPDATE_FONT'; fontKey: string; value: string }
  | { type: 'SAVE_SUCCESS'; theme: ThemeSettings }
  | { type: 'RESET_THEME' };
```

### API Integration Patterns

#### Custom Hooks for API Operations

**`useApiRequest` Hook:**
```typescript
// Wraps fetch calls with automatic error handling and toast notifications
const { execute, loading, error } = useApiRequest();
```

**`useSavePage` Hook:**
```typescript
const { savePage, isSaving } = useSavePage();
// Calls PUT /api/pages/{type} with layout
```

**`useSaveTheme` Hook:**
```typescript
const { saveTheme, isSaving } = useSaveTheme();
// Calls PUT /api/theme with theme settings
```

**`useImageUpload` Hook:**
```typescript
const { upload, progress, isUploading } = useImageUpload();
// Calls POST /api/images with multipart/form-data
```

#### API Endpoints Used by Theme Builder

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Shop Management:**
- `GET /api/shop` - Get current user's shop (includes shopId for Demo link)
- `PUT /api/shop` - Update shop name

**Page Management:**
- `GET /api/pages` - Get all pages on initial load
- `GET /api/pages/{type}` - Get specific page
- `PUT /api/pages/{type}` - Save page layout
- `POST /api/pages/{type}/reset` - Reset to default layout

**Theme Management:**
- `GET /api/theme` - Get current theme settings
- `PUT /api/theme` - Save theme settings
- `POST /api/theme/reset` - Reset to default theme

**Image Upload:**
- `POST /api/images` - Upload image to Cloudflare R2

#### API Endpoints Used by Demo Shop

**Public Shop Access:**
- `GET /api/public/shops/{shopId}` - Get shop metadata and theme
- `GET /api/public/shops/{shopId}/pages` - Get all pages
- `GET /api/public/shops/{shopId}/pages/{type}` - Get specific page

**Demo Product Catalog:**
- `GET /api/demo/categories` - Get all categories
- `GET /api/demo/products` - Get products (with optional `?category={id}` filter for CategoryPills component)
- `GET /api/demo/products/{id}` - Get single product
- `GET /api/demo/products/batch?ids=1,5,12` - Batch fetch for featured products

### Component Architecture

#### Shared Component Library (`/shared/components`)

**Component Interface:**
```typescript
interface ComponentProps {
  settings: Record<string, any>;  // Component-specific settings from API
  themeSettings: ThemeSettings;   // Global theme
  isEditing?: boolean;            // true in Theme Builder, false in Demo Shop
}
```

**Component Registry:**
```typescript
// componentRegistry.ts
export const componentRegistry = {
  hero: {
    component: HeroComponent,
    displayName: 'Hero',
    icon: 'hero-icon',
    category: 'Content Sections',
    variants: ['with-image', 'video-background', 'minimal'],
    defaultVariant: 'with-image',
    defaultSettings: {
      heading: 'Welcome',
      subheading: 'Your tagline here',
      ctaText: 'Get Started',
      ctaLink: '/catalog',
      imageUrl: ''
    },
    variantSchema: {
      'with-image': ['heading', 'subheading', 'ctaText', 'ctaLink', 'imageUrl'],
      'video-background': ['heading', 'subheading', 'ctaText', 'ctaLink', 'videoUrl'],
      'minimal': ['heading', 'subheading']
    }
  },
  // ... 12 more components
};
```

**14 Predefined Components (from PRD):**
1. Heading
2. Header/Navigation
3. Footer
4. Hero/Full-Width Banner
5. Text Section
6. Call-to-Action (CTA) Block
7. Product List/Grid
8. Featured Products
9. Product Detail View
10. Review/Testimonial Section
11. Contact Form
12. Image Gallery
13. Map/Location Block
14. CategoryPills (category navigation for Catalog page)

#### Theme Application via CSS Custom Properties

```typescript
// In Theme Builder and Demo Shop
const { colors, fonts } = useTheme();

useEffect(() => {
  const styleEl = document.getElementById('theme-styles') || document.createElement('style');
  styleEl.id = 'theme-styles';
  styleEl.innerHTML = `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-surface: ${colors.surface};
      --color-text: ${colors.text};
      --color-text-light: ${colors.textLight};
      --font-heading: ${fonts.heading};
      --font-body: ${fonts.body};
    }
  `;
  document.head.appendChild(styleEl);
}, [colors, fonts]);
```

Components use Tailwind classes with CSS variables:
```tsx
<h1 className="font-[var(--font-heading)] text-[var(--color-primary)]">
  {settings.heading}
</h1>
```

### Responsiveness Considerations

#### Theme Builder Responsiveness

- **Desktop (> 1024px):** Full three-panel layout
- **Tablet (768px - 1024px):** Sidebars collapse to overlays, canvas remains fluid
- **Mobile (< 768px):** Not primary target for Theme Builder (editing on desktop recommended)

**Responsive Breakpoints in Canvas:**
- Visual indicators at Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Canvas components render naturally responsive
- Users resize browser window for responsive testing

#### Demo Shop Responsiveness

- Fully responsive design for all devices
- Mobile-first approach using Tailwind CSS
- Shared components include responsive variants
- SSR ensures fast loading on mobile networks

### Security Considerations

#### Authentication & Authorization

1. **JWT Token Storage:**
   - Store in memory (React state) for active session
   - No localStorage storage of tokens (XSS protection)
   - Tokens expire after 1 hour

2. **API Request Security:**
   - All authenticated requests include `Authorization: Bearer {token}` header
   - Axios interceptors handle token injection
   - 401 responses trigger re-authentication flow

3. **Data Isolation:**
   - Backend enforces user data isolation via shop_id
   - Frontend never exposes other users' shopId
   - Demo Shop uses public endpoints (no sensitive data exposure)

#### Input Validation

1. **Client-Side Validation:**
   - Image uploads: File type (JPEG, PNG, WebP, GIF), size (max 10MB)
   - Form fields: React Hook Form validation schemas
   - URL validation for links in component settings

2. **API Validation:**
   - Backend performs comprehensive validation (see API plan)
   - Frontend displays validation errors inline
   - No trust in client-side validation alone

#### XSS Protection

- React's automatic escaping of JSX prevents XSS
- User-generated content (text fields) sanitized on render
- Image URLs validated against expected domain pattern
- No `dangerouslySetInnerHTML` usage

### Error Handling & User Feedback

#### Toast Notifications (Shadcn/ui Sonner)

**Success Messages:**
- "Page saved successfully" (auto-dismiss 3s)
- "Theme saved successfully" (auto-dismiss 3s)
- "Image uploaded successfully" (auto-dismiss 3s)

**Error Messages:**
- "Failed to save page: {error message}" (manual dismiss)
- "Upload failed: File too large (max 10MB)" (manual dismiss)
- "Session expired. Please log in again." (manual dismiss)

**Loading States:**
- "Saving page..." (shown during API call)
- "Uploading image..." with progress bar
- "Loading workspace..." (initial load)

#### Error Boundaries

**Component-Level Error Boundary:**
```tsx
<ComponentErrorBoundary componentId={id} componentType={type}>
  <Component settings={settings} themeSettings={themeSettings} />
</ComponentErrorBoundary>
```

Fallback UI:
```
┌─────────────────────────────────┐
│ ⚠️  Failed to render Hero       │
│                                 │
│ [Edit Settings] button          │
└─────────────────────────────────┘
```

**Workspace-Level Error Boundary:**
```tsx
<WorkspaceErrorBoundary>
  <Workspace />
</WorkspaceErrorBoundary>
```

Fallback UI:
```
┌─────────────────────────────────┐
│ ⚠️  Something went wrong        │
│                                 │
│ [Reload Workspace] button       │
└─────────────────────────────────┘
```

### Performance Considerations

#### State Management Optimization

- `useMemo` for context values to prevent unnecessary re-renders
- Component memoization with `React.memo()` for expensive canvas components
- `useCallback` for event handlers passed to child components

#### Code Splitting

**Theme Builder:**
- Component settings panels loaded lazily per component type
- Theme settings panel loaded on demand

**Demo Shop:**
- React Router 7 route-level code splitting
- `React.lazy()` for route components
- Deferred data loading for images

#### Image Optimization

- Client-side validation before upload
- Progress indication for uploads
- Lazy loading for images in Demo Shop
- Consider WebP format recommendation for users

## Unresolved Issues

### Items Requiring Further Clarification

1. **Component Specifications:**
   - Detailed specifications needed for all 13 predefined components
   - Each component requires: variants list, settings schema, default values, preview thumbnail (if added later)
   - Recommended: Create separate component specification document

2. **Default Page Layouts:**
   - Exact component composition for default pages (Home, Catalog, Product, Contact)
   - Settings values for default components
   - Should be defined in backend `DefaultLayoutService` and documented for frontend

3. **Font Selection:**
   - Available font choices for the font picker in theme settings
   - Integration method (Google Fonts API, self-hosted, limited preset)
   - Default font options

4. **Color Palette Structure:**
   - Confirm 7 colors are sufficient (primary, secondary, accent, background, surface, text, textLight)
   - Any additional color tokens needed for specific components
   - Dark mode considerations (excluded from MVP but architecture should not prevent future addition)

5. **Demo Product Catalog:**
   - Number of demo products to seed in database
   - Product categories and their relationships
   - Image assets for demo products (need to be uploaded to R2 before deployment)

6. **Environment Configuration:**
   - `VITE_API_URL` values for development and production
   - `VITE_DEMO_SHOP_URL` values for development and production
   - Cloudflare R2 bucket configuration and public URL pattern

7. **Empty State Handling:**
   - Design for empty component library search results (if search is added)
   - Empty page state when all components deleted (PRD mentions "Restore Default Layout" button)
   - Empty product catalog state in Demo Shop

8. **Component Variant Preview:**
   - If variant preview thumbnails are added post-MVP, strategy needed for generating/storing thumbnails
   - Consider automated screenshot generation or manual design asset creation

9. **Validation Rules:**
   - Character limits for text fields in component settings
   - URL validation patterns for links
   - Maximum number of components per page (API plan suggests 50, confirm UX handling)

10. **Mobile Experience for Theme Builder:**
    - Current plan deprioritizes mobile editing
    - Define minimum supported screen width
    - Consider read-only mobile view or redirect to desktop message

### Technical Debt Considerations

1. **State Management Migration Path:**
   - If React Context becomes unwieldy, have migration plan to Zustand ready
   - Document state shape thoroughly to ease future migration

2. **Accessibility:**
   - Currently excluded from MVP
   - Track accessibility debt for post-MVP iteration
   - Document WCAG 2.1 AA requirements for future compliance

3. **Testing Strategy:**
   - Unit tests for custom hooks (state management, API calls)
   - Integration tests for component interactions
   - E2E tests for critical user flows (Playwright)
   - Define test coverage targets

4. **Monitoring & Analytics:**
   - Error tracking (consider Sentry integration post-MVP)
   - User behavior analytics (optional for MVP)
   - Performance monitoring (Web Vitals)

### Future Enhancements (Post-MVP)

Items explicitly excluded from MVP but should be architecturally accommodated:

1. **Global Header/Footer:** Architecture should support promoting components to global scope
2. **Undo/Redo:** State management should track history (consider using Immer for immutability)
3. **Auto-saving:** Current architecture supports this via periodic saves to API
4. **Media Library:** Image upload infrastructure can be extended to support library view
5. **Custom Components:** Component Registry can be extended to support user-defined components
6. **Viewport Switcher:** Canvas can be wrapped in iframe with responsive dimensions
7. **Template Versioning:** API already tracks `updated_at`, can extend to version history
8. **Forgot Password:** Authentication flow can be extended

---

## Next Steps

1. **Shadcn/ui Setup:** Initialize Shadcn/ui in both theme-builder and demo-shop applications
   - Run `npx shadcn@latest init` in each project
   - Install required components for Theme Builder (button, dialog, sheet, alert, form, etc.)
   - Install required components for Demo Shop (alert, button, skeleton, card, etc.)
   - Verify `components.json` configuration and path aliases
2. **Component Specification:** Create detailed specs for all 13 components
3. **Default Layouts Definition:** Define exact component composition for 4 default pages
4. **Environment Setup:** Configure environment variables for development
5. **Seed Data Preparation:** Prepare demo products and categories for database seeding
6. **Shared Component Library Setup:** Create `/shared/components` directory structure
7. **Context Providers Implementation:** Build state management foundation
8. **Theme Builder Layout:** Implement three-panel workspace layout using Shadcn/ui components
9. **Demo Shop Routing:** Set up React Router 7 structure with error boundaries using Shadcn/ui Alert
10. **API Integration Hooks:** Create custom hooks for API operations with Shadcn/ui toast integration
11. **Component Registry:** Define all component metadata and schemas

This UI architecture plan provides a comprehensive foundation for implementing the E-commerce Theme Builder MVP while maintaining flexibility for future enhancements.
