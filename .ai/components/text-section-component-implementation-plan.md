# Component Implementation Plan: Text Section

## 1. Component Overview

The Text Section component is a flexible content display component that renders text content in a multi-column layout (1 to 4 columns). Each column can contain plain text, text with an icon, or text with an image. This component is ideal for showcasing features, benefits, services, or any informational content that benefits from a structured columnar presentation.

The component follows the Container/Presentational pattern, accepting all necessary data as props and remaining completely presentational. It supports three visual variants: text-only, with icons, and with images. The component must be fully responsive, gracefully collapsing columns on smaller screens.

## 2. Necessary Data

### Core Component Data (Stored in Database)

- **columns**: Array of column objects, each containing:
  - **text**: string (required) - The text content for the column
  - **iconUrl**: string (optional) - URL to an icon image (for 'with-icons' variant)
  - **imageUrl**: string (optional) - URL to an image (for 'with-images' variant)
- **variant**: enum ('text-only' | 'with-icons' | 'with-images') - Visual presentation style
- **columnCount**: number (1 | 2 | 3 | 4) - Number of columns to display
- **isLoading**: boolean (passed by container) - Loading state indicator
- **error**: Error | null (passed by container) - Error state from data fetching

### Data Constraints

- Minimum columns: 1
- Maximum columns: 4
- Text per column: 1-2000 characters
- Column array length should not exceed columnCount
- For 'with-icons' variant: iconUrl should be provided for each column
- For 'with-images' variant: imageUrl should be provided for each column
- URLs must be valid HTTP/HTTPS URLs

## 3. Rendering Details

### Visual Variants

**1. Text Only (`text-only`)**
- Renders columns with text content only
- No icons or images displayed

**2. With Icons (`with-icons`)**
- Each column displays a small icon beside the text
- Icons should be consistent in size (e.g., 48x48px or 64x64px)
- Icon positioning: on the left side of the text
- Fallback: if iconUrl is missing for a column, render without icon

**3. With Images (`with-images`)**
- Each column displays a larger image above the text
- Images should have consistent aspect ratio 16:9
- Image rendering with object-fit to maintain aspect ratio
- Fallback: if imageUrl is missing, render text-only for that column

### Column Layout Behavior

- **1 Column**: Full width, centered content
- **2 Columns**: 50% width each on desktop, stack on mobile
- **3 Columns**: 33.33% width each on desktop, stack or 2+1 on tablet, stack on mobile
- **4 Columns**: 25% width each on desktop, 2x2 grid on tablet, stack on mobile

### Responsive Breakpoints

- **Mobile (<640px)**: All columns stack vertically, 100% width
- **Tablet (640px-1024px)**:
  - 2 columns: side by side
  - 3-4 columns: 2 columns per row
- **Desktop (>1024px)**: All columns display according to columnCount setting

### Loading State

- Display skeleton loaders for each column
- Skeleton should match the variant (show icon/image placeholder)
- Maintain layout structure during loading

### Error State

- Display error message in place of component content
- Include retry mechanism if applicable
- Error styling should be consistent with theme

### Empty State Handling

- If columns array is empty: display placeholder message
- If column has empty text: skip rendering that column (or show warning in editor)
- If column count exceeds available data: render available columns only

## 4. Data Flow

### Data Source

- Component data is fetched from the backend API as part of the page layout
- The `columns` array and variant settings are stored as JSON in the `pages.layout` JSONB column
- Container component in demo-shop passes data as props to presentational component
- Theme Builder stores the same data structure when user saves

### Data Transformation

- No complex transformation required
- API returns data in the exact structure expected by component
- Column data is validated against Zod schema before rendering
- Invalid columns are filtered out or replaced with error indicators

### Image/Icon Loading

- Images and icons are loaded from URLs provided in column data
- URLs point to Cloudflare R2 storage (for user-uploaded media)
- Implement lazy loading for images to improve performance
- Use `loading="lazy"` attribute on img elements
- Handle loading states with placeholder images

### Data Validation Flow

1. API returns page layout with Text Section component data
2. Container component receives raw data
3. Zod schema validation runs before passing to presentational component
4. If validation fails: log error, render error state, prevent render
5. If validation succeeds: pass validated data as typed props

## 5. Security Considerations

### Input Validation

- **Text Content**: Sanitize HTML to prevent XSS attacks (use DOMPurify or similar if rendering HTML)
- **URLs**: Validate URL format and protocol (only allow https://)
- **URL Sanitization**: Ensure iconUrl and imageUrl don't contain JavaScript protocols
- **Column Count**: Validate against allowed range (1-4) to prevent layout breaking

### Authentication & Authorization

- Component rendering is read-only (no user input)
- Authentication required in Theme Builder to edit component
- Demo Shop is publicly accessible (no auth needed)
- Backend API validates user ownership before saving component data

### Data Sanitization

- Strip potentially dangerous HTML tags from text content
- Escape special characters in text to prevent injection
- Validate array bounds to prevent buffer overflow-like issues
- Limit text length to reasonable maximum (2000 chars per column)

## 6. Error Handling

### Potential Errors and Handling Strategies

**1. Invalid Column Data**
- **Error**: Column missing required `text` field
- **Handling**: Skip rendering that column, log warning in development
- **User Impact**: Column doesn't appear, layout adjusts

**2. Image/Icon Loading Failure**
- **Error**: 404 or network error loading image URL
- **Handling**: Render text-only
- **User Impact**: Graceful degradation, content still readable

**3. Column Count Mismatch**
- **Error**: columnCount is 4 but only 2 columns provided in array
- **Handling**: Render available columns, don't force empty placeholders
- **User Impact**: Layout displays with fewer columns than configured

**4. Invalid Variant**
- **Error**: Variant value not in allowed enum
- **Handling**: Fall back to 'text-only' variant
- **User Impact**: Component renders with safe default

**5. Oversized Content**
- **Error**: Text content exceeds maximum length
- **Handling**: Reject at validation
- **User Impact**: Content may be cut off

**6. Network Timeout**
- **Error**: API call to fetch component data times out
- **Handling**: Display error state with retry button
- **User Impact**: User can retry loading

**7. Malformed JSON**
- **Error**: Invalid JSON structure in database
- **Handling**: Catch at Zod validation, render error state
- **User Impact**: Component shows error message

**8. CORS Issues**
- **Error**: Image URLs blocked by CORS policy
- **Handling**: Use proxy or ensure proper CORS headers on R2
- **User Impact**: Images don't load, fallback to text

### Error Boundaries

- Implement React Error Boundary around component in demo-shop
- Catch rendering errors and display fallback UI
- Log errors to monitoring service (future enhancement)

### Validation Error Messages

- Provide clear, actionable error messages in Theme Builder
- In Demo Shop, fail silently with graceful fallbacks
- Development mode: verbose error logging
- Production mode: minimal error exposure

## 7. Performance Considerations

### Rendering Optimization

- Use `React.memo()` to prevent unnecessary re-renders
- Memoize column rendering logic if expensive calculations exist
- Implement windowing/virtualization if supporting very large column counts (future)

### Image Optimization

- Lazy load images below the fold using `loading="lazy"`
- Use responsive images with srcset if multiple sizes available
- Implement blur-up placeholder technique for better perceived performance
- Consider WebP format with fallback for better compression

### CSS Performance

- Use CSS modules for scoped, tree-shakeable styles
- Leverage CSS Grid for column layout (more performant than flexbox for grids)
- Minimize style recalculations with fixed dimensions where possible
- Use CSS custom properties for theme-responsive styling

### Bundle Size

- Dynamic import component only when needed (React.lazy)
- Ensure icons/images are loaded from CDN, not bundled
- Tree-shake unused variant code if variants become complex

### Data Fetching

- Component is presentational, so no direct fetching
- Container should implement parallel fetching with other components
- Use React Router loaders for SSR-ready data fetching pattern

### Memory Management

- Clean up image object URLs if using createObjectURL
- Remove event listeners in useEffect cleanup
- Avoid memory leaks in image loading error handlers

### Potential Bottlenecks

- **Too Many Columns**: 4 columns with large images = heavy page
- **Large Text Content**: Very long text in columns could slow rendering
- **Image Size**: Unoptimized images from user uploads
- **Layout Thrashing**: Frequent column count changes causing reflows

### Optimization Strategies

- Limit image dimensions on upload (backend validation)
- Implement image resizing/optimization pipeline on R2
- Use intersection observer for smarter lazy loading
- Debounce resize events if responsive recalculations are expensive

## 8. Implementation Steps

### Step 1: Define TypeScript Interfaces and Zod Schema
- Create `types.ts` file in `/shared/components/TextSection/`
- Define `TextSectionColumn` interface with text, iconUrl, imageUrl
- Define `TextSectionProps` interface extending base props (isLoading, error)
- Create Zod schema `TextSectionPropsSchema` with validation rules:
  - Validate columns array (min 1, max 4 items)
  - Validate text (required, 1-2000 chars)
  - Validate URLs (optional, valid HTTPS format)
  - Validate variant enum
  - Validate columnCount (1-4)
  - Add refinement to check iconUrl presence for 'with-icons' variant
  - Add refinement to check imageUrl presence for 'with-images' variant

### Step 2: Create Component Meta Configuration
- Create `meta.ts` file in `/shared/components/TextSection/`
- Define component display name: "Text Section"
- Define description: "Multi-column text layout with optional icons or images"
- Define category: "Content"
- Define editable fields:
  - `variant`: select dropdown (text-only, with-icons, with-images)
  - `columnCount`: number input (1-4)
  - `columns`: repeater field (array input)
    - `text`: textarea (required, max 2000 chars)
    - `iconUrl`: URL input (conditional on variant)
    - `imageUrl`: URL input (conditional on variant)
- Define available variants with labels and descriptions
- Set default variant: 'text-only'
- Set default columnCount: 3

### Step 3: Create CSS Module
- Create `TextSection.module.css` file
- Define container styles with responsive grid layout
- Define column styles with proper spacing
- Create styles for each variant:
  - `.textOnly`: simple text layout
  - `.withIcons`: icon + text layout with alignment
  - `.withImages`: image + text layout with aspect ratio handling
- Implement responsive breakpoints (mobile, tablet, desktop)
- Define loading skeleton styles
- Define error state styles
- Use CSS Grid for column layout: `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`

### Step 4: Implement Presentational Component
- Create `TextSection.tsx` file
- Import types, schema, and styles
- Implement functional component accepting `TextSectionProps`
- Handle loading state: render skeleton loaders
- Handle error state: render error message component
- Handle empty state: render placeholder or nothing
- Implement main rendering logic:
  - Map over columns array
  - Render each column based on variant
  - Apply responsive column count classes
- Implement image/icon loading with error handling
- Add proper semantic HTML (section, article, figure)
- Implement accessibility: proper heading hierarchy, alt text, ARIA labels
- Use React.memo for optimization

### Step 5: Implement Column Rendering Logic
- Create helper function `renderColumn(column, variant, index)`:
  - For 'text-only': render text in paragraph
  - For 'with-icons': render icon img + text
  - For 'with-images': render image with figure/figcaption + text
- Handle missing URLs gracefully (fallback to text-only)
- Implement image lazy loading attributes
- Add error handling for image onError event
- Ensure consistent spacing and alignment across variants

### Step 6: Implement Loading and Error States
- Create `SkeletonColumn` component for loading state
- Match skeleton structure to variant (show icon/image placeholder)
- Create `ErrorState` component for error display
- Style error states to be visually distinct but not alarming
- Implement retry logic if applicable

### Step 7: Create Public Export
- Create `index.ts` file in `/shared/components/TextSection/`
- Export `TextSection` component as default
- Export `TextSectionProps`, `TextSectionPropsSchema` from types
- Export `meta` from meta file
- Ensure clean public API for consumers
