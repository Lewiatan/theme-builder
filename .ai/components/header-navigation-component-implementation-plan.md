# Component Implementation Plan: Header/Navigation

## 1. Component Overview

The Header/Navigation component is a critical reusable UI element that provides primary navigation across all pages of the e-commerce theme builder application. It serves as the main navigation header for both the Theme Builder and Demo Shop applications.

This presentational component accepts configurable props for logo display and positioning, and supports three distinct visual variants:
- **Sticky**: Traditional top navigation bar that can either stick to the top when scrolling
- **Static**: Standard horizontal navigation layout
- **Slide-in Left**: Side drawer navigation that slides in from the left side

The component contains hardcoded navigation links to the four core pages (Home, Product Catalog, Contact) and is fully responsive with mobile menu support for traditional variants and a toggle button for the slide-in variant.

## 2. Necessary Data

The component requires the following data to be stored in the database (as part of the page layout JSON):

- **logoUrl**: string - URL to the logo image file
- **logoPosition**: 'left' | 'center' - Alignment of the logo within the header
- **variant**: 'sticky' | 'static' | 'slide-in-left' - Visual variant of the navigation component
- **isLoading**: boolean - Loading state passed by container component
- **error**: Error | null - Error state passed by container component

### Static Data (Hardcoded in Component):

Navigation links array:
```typescript
[
  { label: 'Home', path: '/' },
  { label: 'Catalog', path: '/catalog' },
  { label: 'Contact', path: '/contact' }
]
```

## 3. Rendering Details

### Variant-Specific Rendering:

**Sticky Variant:**
- Renders as a horizontal navigation bar at the top of the page
- Logo displayed according to `logoPosition` prop (left or center aligned)
- Navigation links displayed horizontally in a flex container
- On mobile (< 768px): Hamburger menu icon, links shown in dropdown/slide-out menu
- Sticky variant: Uses `position: sticky` with `top: 0` and high z-index

**Sticky Variant:**
- Renders as a horizontal navigation bar at the top of the page
- Logo displayed according to `logoPosition` prop (left or center aligned)
- Navigation links displayed horizontally in a flex container
- On mobile (< 768px): Hamburger menu icon, links shown in dropdown/slide-out menu
- Static variant: Uses `position: relative`

**Slide-in Left Variant:**
- Fixed-position side drawer (280px width) that slides in from the left
- Toggle button (hamburger icon) to open/close the drawer
- Overlay backdrop when drawer is open (semi-transparent, clickable to close)
- Navigation links displayed vertically within the drawer
- Logo displayed at the top of the drawer, on left or middle of the drawer accordingly to `logoPosition`
- Body scroll lock when drawer is open
- Transform animation: `translateX(-100%)` when closed, `translateX(0)` when open

### Logo Rendering:
- Image element with `src={logoUrl}` and `alt="{Shop Name} Logo"`
- Error handling: If image fails to load, display fallback text ("Shop Name" or similar)
- If logo is rendered on left, it's on the same line as menu (except Slide-in variant)
- If logo is rendered centered, it's above the menu
- Responsive sizing based on viewport

### Navigation Links:
- Rendered as React Router `Link` components (or anchor tags for MVP)
- Active state styling for current page
- Hover/focus states for accessibility
- Keyboard navigable (Tab key)
- Always renders centered (except Slide-in variant)

### Loading State:
- Skeleton UI with placeholder logo (gray box)
- Menu rendered immediately since it's static
- Maintains layout structure to prevent content shift

### Error State:
- Display error message instead of links
- Links are displayed in the middle, since links are static

## 4. Data Flow

### Presentational Component Pattern:
1. Parent container component passes props to HeaderNavigation
2. HeaderNavigation receives: `logoUrl`, `logoPosition`, `variant`, `isLoading`, `error`
3. Component validates props against Zod schema on mount
4. Renders appropriate variant based on `variant` prop
5. No data fetching occurs within this component
6. Navigation links are static and hardcoded

### State Management:
- **Slide-in drawer state**: Local React state (`useState`) for open/closed status
- **Mobile menu state**: Local React state (`useState`) for open/closed status
- No global state required
- State resets when component unmounts

### User Interactions:
- Click logo → Navigate to home page
- Click navigation link → Navigate to respective page
- Click hamburger button → Toggle mobile menu / slide-in drawer
- Click overlay (slide-in variant) → Close drawer
- Press Escape key → Close drawer / mobile menu
- Click navigation link in drawer → Navigate and close drawer

## 5. Security Considerations

### Input Validation:
- **logoUrl**: Validated as non-empty string via Zod schema
  - No URL format validation at component level (handled by browser)
  - XSS protection via React's automatic escaping of string values
- **logoPosition**: Validated against enum ('left' | 'center') via Zod schema
- **variant**: Validated against enum ('sticky' | 'static' | 'slide-in-left') via Zod schema

### XSS Prevention:
- All text content rendered through React (automatic escaping)
- No `dangerouslySetInnerHTML` usage
- Image URLs passed directly to `src` attribute (browser-validated)

### Content Security Policy:
- Logo images should be served from trusted CDN (Cloudflare R2)
- No inline scripts or event handlers in rendered HTML

### Authentication/Authorization:
- No authentication required at component level
- Navigation links are public (no protected routes in MVP)
- Component is presentational and doesn't handle user data

## 6. Error Handling

### Error Scenarios and Handling:

**1. Logo Image Load Failure:**
- **Cause**: Invalid URL, network error, 404, CORS issue
- **Handling**:
  - Use `onError` event handler on `<img>` tag
  - Set local state to trigger fallback rendering
  - Display text fallback (Site name)
  - Log error to console for debugging

**2. Invalid Props:**
- **Cause**: Parent passes invalid `logoPosition` or `variant` value
- **Handling**:
  - Zod schema validation catches invalid values
  - Log validation error to console
  - Render with default values (logoPosition: 'left', variant: 'static')

**3. Error Prop from Parent:**
- **Cause**: Container component encounters error (API failure, etc.)
- **Handling**:
  - Check if `error` prop is non-null
  - Render error state UI: minimal navigation with error message
  - Provide fallback text-only navigation links

**4. Missing Required Props:**
- **Cause**: Parent doesn't provide `logoUrl`
- **Handling**:
  - Zod schema marks as required
  - Render without logo with Shop name instead

**5. Slide-in Drawer State Errors:**
- **Cause**: State management issues, event listener failures
- **Handling**:
  - Ensure cleanup of event listeners in useEffect
  - Provide manual close button as fallback
  - Escape key always available as backup close mechanism

**6. Body Scroll Lock Issues:**
- **Cause**: Scroll lock not released when drawer closes
- **Handling**:
  - Use useEffect cleanup to always restore scroll
  - Set `overflow: hidden` on body when drawer open
  - Remove on drawer close and component unmount

## 7. Performance Considerations

### Potential Bottlenecks:
- **Slide-in drawer animation**: CSS transforms can be expensive on low-end devices
- **Mobile menu re-renders**: State changes trigger full component re-render
- **Logo image loading**: Large images can delay initial render

### Optimization Strategies:

**1. Memoization:**
- Wrap component with `React.memo()` to prevent unnecessary re-renders when parent re-renders
- Use `useMemo()` for static navigation links array (though unlikely to cause performance issues)
- Use `useCallback()` for event handlers passed to child elements

**2. CSS Animations:**
- Use CSS transitions for drawer slide-in animation (hardware accelerated)
- Use `transform` and `opacity` properties for animations (avoid layout properties)
- Add `will-change: transform` to drawer element for optimized rendering

**3. Image Optimization:**
- Recommend logo images be optimized (WebP format, appropriate dimensions)
- Use responsive images with `srcset` if multiple logo sizes available
- Lazy load logo only if below the fold (unlikely for header)

**4. Code Splitting:**
- Component is small, no need for further code splitting within component
- Parent application should lazy load this component if not needed on all pages

**5. Event Listeners:**
- Use passive event listeners for scroll events (if implementing scroll detection)
- Clean up all event listeners in useEffect cleanup functions
- Debounce resize handlers if viewport-specific logic is added

**6. Conditional Rendering:**
- Only render mobile menu DOM when open (not just hidden with CSS)
- Use conditional rendering to avoid rendering unused variant markup

## 8. Implementation Steps

1. **Create component directory structure** at `/shared/components/HeaderNavigation/`
   - Create `HeaderNavigation.tsx`, `types.ts`, `meta.ts`, `HeaderNavigation.module.css`, `index.ts`

2. **Define `types.ts`**:
   - Import `z` from 'zod'
   - Create `NavigationLink` type: `{ label: string, path: string }`
   - Create TypeScript interface `HeaderNavigationProps`:
     ```typescript
     interface HeaderNavigationProps {
       logoUrl: string;
       logoPosition: 'left' | 'center';
       variant: 'sticky' | 'static' | 'slide-in-left';
       isLoading: boolean;
       error: Error | null;
     }
     ```
   - Create Zod schema `HeaderNavigationPropsSchema`:
     ```typescript
     const HeaderNavigationPropsSchema = z.object({
       logoUrl: z.string().min(1, 'Logo URL is required'),
       logoPosition: z.enum(['left', 'center']),
       variant: z.enum(['sticky', 'static', 'slide-in-left']),
       isLoading: z.boolean(),
       error: z.instanceof(Error).nullable(),
     });
     ```
   - Export both interface and schema

3. **Implement `HeaderNavigation.tsx`**:
   - Import React, useState, useEffect
   - Import types and schema from './types'
   - Import styles from './HeaderNavigation.module.css'
   - Define static navigation links array at top of file
   - Create functional component accepting `HeaderNavigationProps`
   - Validate props with Zod schema (log errors, use defaults if validation fails)
   - Add state: `const [isDrawerOpen, setIsDrawerOpen] = useState(false)`
   - Add state: `const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)`
   - Add state: `const [logoError, setLogoError] = useState(false)`
   - Implement loading state render: skeleton UI
   - Implement error state render: minimal navigation with error message
   - Implement variant-specific rendering logic:
     - Use switch/conditional to determine which variant to render
     - **Sticky/Static variant**: horizontal nav with conditional className
     - **Simple Horizontal variant**: standard flex layout
     - **Slide-in Left variant**: drawer + overlay + toggle button
   - Add logo rendering with error handling:
     ```tsx
     <img
       src={logoUrl}
       alt="Site Logo"
       onError={() => setLogoError(true)}
     />
     ```
   - Add mobile menu toggle for sticky/simple variants (< 768px)
   - Implement drawer open/close handlers
   - Implement overlay click handler to close drawer
   - Add useEffect for body scroll lock when drawer is open:
     ```tsx
     useEffect(() => {
       if (isDrawerOpen) {
         document.body.style.overflow = 'hidden';
       } else {
         document.body.style.overflow = '';
       }
       return () => { document.body.style.overflow = ''; };
     }, [isDrawerOpen]);
     ```
   - Add useEffect for Escape key listener:
     ```tsx
     useEffect(() => {
       const handleEscape = (e: KeyboardEvent) => {
         if (e.key === 'Escape') {
           setIsDrawerOpen(false);
           setIsMobileMenuOpen(false);
         }
       };
       document.addEventListener('keydown', handleEscape);
       return () => document.removeEventListener('keydown', handleEscape);
     }, []);
     ```
   - Add accessibility attributes:
     - `<nav>` semantic element
     - `aria-label="Main navigation"`
     - `aria-expanded={isDrawerOpen}` on toggle button
     - `aria-label="Open menu"` / `"Close menu"` on buttons
   - Export component with `React.memo()` wrapper

4. **Create `HeaderNavigation.module.css`**:
   - Define base header styles (`.header`)
   - Define logo positioning styles (`.logoLeft`, `.logoCenter`)
   - Define variant-specific styles:
     - `.sticky`: `position: sticky; top: 0; z-index: 100;`
     - `.static`: `position: relative;`
     - `.simpleHorizontal`: flex layout, simple spacing
     - `.slideInLeft`: fixed drawer styles, 280px width
   - Define drawer styles:
     - `.drawer`: fixed left, transform translateX, transition
     - `.drawerOpen`: translateX(0)
     - `.drawerClosed`: translateX(-100%)
     - `.overlay`: fixed overlay, semi-transparent background
   - Define navigation link styles:
     - Base link styles with hover states
     - Active link styles
     - Focus styles for accessibility
   - Define mobile menu styles:
     - `.hamburger`: hamburger icon button
     - `.mobileMenu`: mobile dropdown/slide-out
   - Define skeleton loading styles:
     - `.skeleton`: gray placeholders for logo and links
   - Define responsive breakpoints:
     - `@media (max-width: 768px)`: mobile styles
     - Hide desktop menu, show hamburger
     - Adjust logo size

5. **Define `meta.ts`**:
   - Export `meta` object for theme editor integration:
     ```typescript
     export const meta = {
       displayName: 'Header/Navigation',
       description: 'Main navigation header with configurable logo and variants',
       category: 'Navigation',
       editableFields: [
         {
           name: 'logoUrl',
           label: 'Logo URL',
           type: 'url',
           required: true,
           description: 'URL to the logo image file',
         },
         {
           name: 'logoPosition',
           label: 'Logo Position',
           type: 'select',
           required: true,
           options: [
             { value: 'left', label: 'Left' },
             { value: 'center', label: 'Center' },
           ],
           default: 'left',
         },
       ],
       variants: [
         {
           value: 'sticky',
           label: 'Sticky',
           description: 'Stays at top when scrolling',
         },
         {
           value: 'static',
           label: 'Static',
           description: 'Fixed position navigation',
         },
         {
           value: 'slide-in-left',
           label: 'Slide-in Left',
           description: 'Side drawer navigation from left',
         },
       ],
       defaultVariant: 'static',
     };
     ```

6. **Create `index.ts`** barrel export:
   ```typescript
   export { default as HeaderNavigation } from './HeaderNavigation';
   export { HeaderNavigationProps, HeaderNavigationPropsSchema } from './types';
   export { meta } from './meta';
   ```

7. **Test edge cases manually**:
   - Verify logo load failure shows fallback
   - Test all three variants render correctly
   - Test mobile menu functionality for sticky/simple variants
   - Test slide-in drawer open/close functionality
   - Test overlay click closes drawer
   - Test Escape key closes drawer/menu
   - Test body scroll lock when drawer is open
   - Test navigation link clicks navigate correctly
   - Verify product link uses placeholder `/product/1`
   - Test responsive behavior at different viewport sizes
   - Verify loading state renders skeleton UI
   - Verify error state renders error message

8. **Accessibility verification**:
   - Test keyboard navigation (Tab, Enter, Escape)
   - Verify screen reader announces navigation landmarks
   - Ensure focus management in drawer (focus trap)
   - Verify ARIA attributes are correct
   - Test with keyboard-only navigation
   - Ensure sufficient color contrast for links

9. **Performance verification**:
   - Check component doesn't re-render unnecessarily (use React DevTools)
   - Verify drawer animation is smooth (60fps)
   - Check logo image loads efficiently
   - Verify no memory leaks from event listeners (check cleanup)

10. **Integration testing**:
    - Import component in demo-shop or theme-builder test page
    - Verify shared component import path works (`@shared/components/HeaderNavigation`)
    - Test component receives props correctly from parent
    - Verify CSS modules are scoped correctly
    - Test component works in both applications (theme-builder and demo-shop)
