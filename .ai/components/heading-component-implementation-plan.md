# Component Implementation Plan: Heading

## 1. Component Overview

The Heading component is a fundamental reusable UI element that provides semantic heading display with flexible styling options. It serves as a versatile text heading component for both the Theme Builder and Demo Shop applications.

This presentational component accepts configurable props for heading text, semantic level, and optional background styling, and supports three distinct visual variants:
- **Text only**: Clean heading with no background
- **Text with background image**: Heading displayed over a background image
- **Text with background color**: Heading with a solid background color

The component supports three semantic levels (H1, H2, H3) for proper document structure and accessibility, includes height customization for background variants, and is fully responsive across all device sizes.

## 2. Necessary Data

The component requires the following data to be stored in the database (as part of the page layout JSON):

- **text**: string - The heading text content to display
- **level**: 'h1' | 'h2' | 'h3' - Semantic heading level for proper HTML structure
- **variant**: 'text-only' | 'background-image' | 'background-color' - Visual variant of the heading component
- **textColor**: string | undefined - text color for 'background-image' and 'background-color' variants
- **backgroundImageUrl**: string | undefined - URL to background image (required for 'background-image' variant, ignored for others)
- **backgroundColor**: string | undefined - Background color value (required for 'background-color' variant, ignored for others)
- **height**: number | undefined - Height in pixels for background variants (ignored for 'text-only' variant)
- **isLoading**: boolean - Loading state passed by container component
- **error**: Error | null - Error state passed by container component

### Variant-Specific Data Requirements:

**Text only variant:**
- Required: `text`, `level`
- Optional: none
- Ignored: `backgroundImageUrl`, `backgroundColor`, `height`

**Text with background image variant:**
- Required: `text`, `level`, `textColor`, `backgroundImageUrl`
- Optional: `height` (defaults to 300px if not provided)
- Ignored: `backgroundColor`

**Text with background color variant:**
- Required: `text`, `level`, `textColor`, `backgroundColor`
- Optional: `height` (defaults to 200px if not provided)
- Ignored: `backgroundImageUrl`

## 3. Rendering Details

### Variant-Specific Rendering:

**Text Only Variant:**
- Renders as a standard semantic heading (h1, h2, or h3) with no container
- Text styled according to the heading level based on the theme styling
- No background, padding, or height constraints
- Typography follows global theme settings (font family from CSS custom properties)
- Responsive font sizing using CSS clamp or viewport units

**Text with Background Image Variant:**
- Outer container with fixed or customizable height
- Background image applied to container with `background-size: cover` and `background-position: center`
- Heading text centered vertically and horizontally within container
- Semi-transparent overlay (optional, for text readability)
- Text color selected by user, with additional shadow for better readability
- Responsive: height may adjust on smaller viewports

**Text with Background Color Variant:**
- Outer container with fixed or customizable height
- Solid background color applied to container
- Heading text centered vertically and horizontally within container
- Text color selected by user
- Padding applied to ensure text doesn't touch edges
- Responsive: height may adjust on smaller viewports

### Heading Level Rendering:
- Font sizes follows the main theme styling, the component shouldn't enforce font sizes
- Font sizes scale responsively across viewports
- Only one H1 should typically appear on a page (editor should warn but not prevent)

### Text Color Rendering:
- Accept only hex color format

### Background Image Rendering:
- Use CSS `background-image` on container div
- Apply `background-size: cover` to fill container
- Center image with `background-position: center`
- Handle loading state with skeleton and shimmer animation
- Error handling: If image fails to load, display background color fallback

### Background Color Rendering:
- Accept only rgba color format
- Validate color format and fallback to default if invalid

### Loading State:
- Applies only to the `background-image` variant
- No specific lodaing indicator, the image just fades in
- Height matches expected rendered height
- Shimmer animation on placeholder
- Maintains layout structure to prevent content shift

### Error State:
- Display error message if `error` prop is non-null
- Show fallback heading with warning icon
- Log error details to console for debugging
- Maintain semantic heading level even in error state

## 4. Data Flow

### Presentational Component Pattern:
1. Parent container component passes props to Heading
2. Heading receives: `text`, `level`, `variant`, `backgroundImageUrl`, `backgroundColor`, `height`, `isLoading`, `error`
3. Component validates props against Zod schema on mount
4. Renders appropriate variant based on `variant` prop
5. No data fetching occurs within this component
6. Component is purely presentational and stateless

### State Management:
- **Background image load state**: Local React state (`useState`) to track image loading status
- **Background image error state**: Local React state (`useState`) to track image load failures
- No global state required
- State resets when component unmounts

### User Interactions:
- No direct user interactions (component is display-only)

## 5. Security Considerations

### Input Validation:
- **text**: Validated as non-empty string via Zod schema
  - XSS protection via React's automatic escaping of string values
  - Maximum length validation (e.g., 500 characters)
- **level**: Validated against enum ('h1' | 'h2' | 'h3') via Zod schema
- **variant**: Validated against enum ('text-only' | 'background-image' | 'background-color') via Zod schema
- **backgroundImageUrl**: Validated as string via Zod schema (required for 'background-image' variant)
  - No URL format validation at component level (handled by browser)
  - XSS protection via CSS background-image (not innerHTML)
- **backgroundColor**: Validated as string via Zod schema (required for 'background-color' variant)
  - Basic color format validation (regex for hex, rgb, rgba, named colors)
  - Sanitized before applying to CSS to prevent injection
- **height**: Validated as positive number via Zod schema
  - Minimum: 50px, Maximum: 1000px to prevent layout issues

### XSS Prevention:
- All text content rendered through React (automatic escaping)
- No `dangerouslySetInnerHTML` usage
- Background images applied via CSS, not inline HTML
- Background colors sanitized and validated before CSS application
- No inline scripts or event handlers in rendered HTML

### Content Security Policy:
- Background images should be served from trusted CDN (Cloudflare R2)
- No external resources loaded from untrusted sources
- No inline styles with dynamic content (use CSS classes)

### Authentication/Authorization:
- No authentication required at component level
- Component is presentational and doesn't handle sensitive data
- Content controlled by parent container

## 6. Error Handling

### Error Scenarios and Handling:

**1. Background Image Load Failure:**
- **Cause**: Invalid URL, network error, 404, CORS issue
- **Handling**:
  - Use Image element in useEffect to detect load failure
  - Set local state to trigger fallback rendering
  - Display the `text-only` variant
  - Log error to console for debugging

**2. Invalid Props:**
- **Cause**: Parent passes invalid `level`, `variant`, `backgroundColor`, or `height` value
- **Handling**:
  - Zod schema validation catches invalid values
  - Log validation error to console
  - Render with default values:
    - `level`: 'h2'
    - `variant`: 'text-only'

**3. Error Prop from Parent:**
- **Cause**: Container component encounters error (API failure, etc.)
- **Handling**:
  - Check if `error` prop is non-null
  - Render error state UI with warning icon
  - Display error message if available
  - Maintain proper heading level for accessibility

**4. Missing Required Props:**
- **Cause**: Parent doesn't provide `text` or variant-specific required props
- **Handling**:
  - Zod schema marks required props
  - For missing `text`: render placeholder "Heading Text"
  - For missing `backgroundImageUrl` in 'background-image' variant: fallback to `text-only` variant
  - For missing `backgroundColor` in 'background-color' variant: fallback to `text-only` variant

**5. Invalid Color Format:**
- **Cause**: backgroundColor is in invalid format (e.g., "notacolor")
- **Handling**:
  - Validate color format with regex or color parsing library
  - Log warning to console
  - Fallback to `text-only` variant
  - Continue rendering without breaking layout

**6. Height Out of Range:**
- **Cause**: height prop is negative, zero, or extremely large
- **Handling**:
  - Zod schema validates range (50-1000px)
  - Clamp values outside range to min/max
  - Log warning to console
  - Render with clamped value

**7. Background Image and Color Both Provided:**
- **Cause**: Misconfiguration where both backgroundImageUrl and backgroundColor are provided
- **Handling**:
  - Variant prop takes precedence
  - If variant is 'background-image', ignore backgroundColor
  - If variant is 'background-color', ignore backgroundImageUrl
  - If variant is 'text-only', ignore both backgroundImageUrl and backgroundColor
  - Log warning about ignored prop

## 7. Performance Considerations

### Potential Bottlenecks:
- **Background image loading**: Large images can delay rendering and impact LCP (Largest Contentful Paint)
- **Text contrast calculation**: Computing contrasting text color for background colors may be expensive
- **Re-renders**: Component may re-render unnecessarily if parent re-renders

### Optimization Strategies:

**1. Memoization:**
- Wrap component with `React.memo()` to prevent unnecessary re-renders when parent re-renders
- Use `useMemo()` for computed values like text color contrast calculation
- Use `useCallback()` for any event handlers (though component has minimal interactivity)

**2. Background Image Optimization:**
- Recommend background images be optimized (WebP format, appropriate dimensions)
- Use responsive images with different sizes for different viewports
- Consider lazy loading for background images below the fold
- Implement fade-in effect once image loads to improve perceived performance

**3. CSS Performance:**
- Use CSS transforms for any animations (hardware accelerated)
- Avoid expensive CSS properties in animations (box-shadow, filter)
- Use `will-change: transform` for animated elements
- Minimize repaints and reflows

**4. Conditional Rendering:**
- Only render variant-specific elements (don't render all variants and hide with CSS)
- Use early returns for loading and error states
- Minimize DOM nodes in rendered output

**5. Loading Strategy:**
- Prioritize critical text rendering over background images
- Use placeholder background color while image loads
- Consider using blur-up technique (tiny preview image)
- Implement progressive image loading for large backgrounds

**6. Height Recalculation:**
- Avoid JavaScript-based height calculations on resize
- Use CSS for responsive height adjustments
- Leverage CSS custom properties for dynamic values

## 8. Implementation Steps

1. **Create component directory structure** at `/shared/components/Heading/`
   - Create `Heading.tsx`, `types.ts`, `meta.ts`, `Heading.module.css`, `index.ts`

2. **Define `types.ts`**:
   - Import `z` from 'zod'
   - Create TypeScript interface `HeadingProps`:
     ```typescript
     interface HeadingProps {
       text: string;
       level: 'h1' | 'h2' | 'h3';
       variant: 'text-only' | 'background-image' | 'background-color';
       backgroundImageUrl?: string;
       backgroundColor?: string;
       height?: number;
       isLoading: boolean;
       error: Error | null;
     }
     ```
   - Create Zod schema `HeadingPropsSchema`:
     ```typescript
     const HeadingPropsSchema = z.object({
       text: z.string().min(1, 'Heading text is required').max(500, 'Heading text too long'),
       level: z.enum(['h1', 'h2', 'h3']),
       variant: z.enum(['text-only', 'background-image', 'background-color']),
       backgroundImageUrl: z.string().optional(),
       backgroundColor: z.string().optional(),
       height: z.number().min(50).max(1000).optional(),
       isLoading: z.boolean(),
       error: z.instanceof(Error).nullable(),
     }).refine(
       (data) => {
         if (data.variant === 'background-image' && !data.backgroundImageUrl) {
           return false;
         }
         if (data.variant === 'background-color' && !data.backgroundColor) {
           return false;
         }
         return true;
       },
       {
         message: 'Required fields for variant are missing',
       }
     );
     ```
   - Export both interface and schema

3. **Implement `Heading.tsx`**:
   - Import React, useState, useEffect, useMemo
   - Import types and schema from './types'
   - Import styles from './Heading.module.css'
   - Create functional component accepting `HeadingProps`
   - Validate props with Zod schema (log errors, use defaults if validation fails)
   - Add state: `const [imageLoaded, setImageLoaded] = useState(false)`
   - Add state: `const [imageError, setImageError] = useState(false)`
   - Implement loading state render: skeleton UI with shimmer animation
   - Implement error state render: heading with error icon and message
   - Implement variant-specific rendering logic:
     - Use switch statement to determine which variant to render
     - **Text only variant**: render semantic heading element directly
     - **Background image variant**: container div with background-image CSS + centered heading
     - **Background color variant**: container div with background-color CSS + centered heading
   - Add background image loading detection:
     ```tsx
     useEffect(() => {
       if (variant === 'background-image' && backgroundImageUrl) {
         const img = new Image();
         img.onload = () => setImageLoaded(true);
         img.onerror = () => setImageError(true);
         img.src = backgroundImageUrl;
       }
     }, [variant, backgroundImageUrl]);
     ```
   - Implement dynamic heading element rendering:
     ```tsx
     const HeadingElement = level as keyof JSX.IntrinsicElements;
     return <HeadingElement className={styles.heading}>{text}</HeadingElement>;
     ```
   - Add accessibility attributes:
     - Semantic HTML heading elements (h1, h2, h3)
     - `role="heading"` with `aria-level` as fallback (not needed if using semantic elements)
     - `aria-label` if text is truncated or visually hidden
   - Export component with `React.memo()` wrapper

4. **Create `Heading.module.css`**:
   - Define base heading styles for each level:
     - `.h1`: large font size, bold weight, appropriate line-height
     - `.h2`: medium font size, semi-bold weight
     - `.h3`: smaller font size, normal weight
   - Define variant-specific container styles:
     - `.textOnly`: no container, just heading
     - `.backgroundImageContainer`: positioned container with background-image
     - `.backgroundColorContainer`: positioned container with background-color
   - Define text positioning styles:
     - `.centeredText`: flexbox centering (horizontal and vertical)
     - Text shadow for readability over images
   - Define background image styles:
     - Background-size: cover
     - Background-position: center
     - Optional overlay for text readability (`.overlay`)
   - Define text color variants:
     - `.lightText`: white or light color for dark backgrounds
     - `.darkText`: dark color for light backgrounds
   - Define skeleton loading styles:
     - `.skeleton`: gray placeholder box
     - `.shimmer`: shimmer animation keyframes
   - Define responsive styles:
     - `@media (max-width: 768px)`: adjust font sizes
     - `@media (max-width: 480px)`: further adjustments
     - Responsive height adjustments for background variants
   - Define height utility classes:
     - Dynamic height applied via inline style or CSS custom property
     - Min-height constraints to prevent text overflow

5. **Define `meta.ts`**:
   - Export `meta` object for theme editor integration:
     ```typescript
     export const meta = {
       displayName: 'Heading',
       description: 'Semantic heading with optional background image or color',
       category: 'Content',
       editableFields: [
         {
           name: 'text',
           label: 'Heading Text',
           type: 'text',
           required: true,
           description: 'The heading text to display',
           maxLength: 500,
         },
         {
           name: 'level',
           label: 'Heading Level',
           type: 'select',
           required: true,
           options: [
             { value: 'h1', label: 'H1 (Main Heading)' },
             { value: 'h2', label: 'H2 (Section Heading)' },
             { value: 'h3', label: 'H3 (Subsection Heading)' },
           ],
           default: 'h2',
           description: 'Semantic heading level for document structure',
         },
         {
           name: 'textColor',
           label: 'Text color',
           type: 'color',
           required: false,
           description: 'Color of the text for background-image and background-color variants',
           visibleWhen: { variant: ['background-image', 'background-color'] },
         },
         {
           name: 'backgroundImageUrl',
           label: 'Background Image URL',
           type: 'url',
           required: false,
           description: 'URL to background image (for background-image variant)',
           visibleWhen: { variant: 'background-image' },
         },
         {
           name: 'backgroundColor',
           label: 'Background Color',
           type: 'color',
           required: false,
           description: 'Background color (for background-color variant)',
           visibleWhen: { variant: 'background-color' },
         },
         {
           name: 'height',
           label: 'Height (px)',
           type: 'number',
           required: false,
           min: 50,
           max: 1000,
           default: 300,
           description: 'Container height for background variants',
           visibleWhen: { variant: ['background-image', 'background-color'] },
         },
       ],
       variants: [
         {
           value: 'text-only',
           label: 'Text Only',
           description: 'Simple heading with no background',
         },
         {
           value: 'background-image',
           label: 'Background Image',
           description: 'Heading with background image',
         },
         {
           value: 'background-color',
           label: 'Background Color',
           description: 'Heading with solid background color',
         },
       ],
       defaultVariant: 'text-only',
     };
     ```

6. **Create `index.ts`** barrel export:
   ```typescript
   export { default as Heading } from './Heading';
   export { HeadingProps, HeadingPropsSchema } from './types';
   export { meta } from './meta';
   ```

7. **Test edge cases manually**:
   - Verify all three variants render correctly
   - Test all three heading levels (h1, h2, h3)
   - Test invalid text color values
   - Test background image load success and failure
   - Test invalid background color values
   - Test height constraints (min/max)
   - Test with missing optional props
   - Test with extremely long text
   - Test with empty text (should show validation error)
   - Verify loading state renders skeleton UI
   - Verify error state renders error message
   - Test text color contrast on light and dark backgrounds
   - Test responsive behavior at different viewport sizes
