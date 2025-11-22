# Frontend Component Implementation Plan: CategoryPills

## 1. Requirements Analysis

### Objective
Create a reusable CategoryPills component that displays product categories as interactive navigation pills on the Catalog page. The component fetches categories from the backend API and enables users to filter products by category.

### Key Requirements
- **Purpose**: Display product categories as clickable pills for category-based navigation and filtering
- **Data Source**: Fetches categories from `GET /api/demo/categories` endpoint
- **Interactivity**: Users can click pills to filter products by category
- **Visual Design**: Pill-style buttons with hover states and active state for selected category
- **Responsive**: Adapts to mobile, tablet, and desktop layouts with wrapping or horizontal scrolling
- **Performance**: Client-side caching of categories, skeleton loading state during fetch
- **Accessibility**: Full keyboard navigation, ARIA labels, semantic HTML

### Use Cases
1. **Catalog Page Navigation**: Primary use case for filtering products by category
2. **Category Browsing**: Allows users to explore available product categories
3. **Visual Indication**: Shows active category selection with distinct styling
4. **All Products View**: Includes an "All" pill to show unfiltered products

---

## 2. Architectural Overview

### Design Pattern
This component follows the **Container/Presentational Pattern** established in the project:

1. **Presentational Component**: `/shared/components/CategoryPills/CategoryPills.tsx` - Dumb UI component that renders pills
2. **Container Component**: `/demo-shop/src/containers/CategoryPillsContainer.tsx` - Smart component that handles data fetching and state
3. **Data Hook**: `/demo-shop/src/hooks/useCategories.ts` - Encapsulates category fetching logic
4. **API Service**: `/demo-shop/src/services/api/categories.ts` - Handles HTTP requests to backend

### Component Hierarchy
```
CategoryPillsContainer (Smart)
└── CategoryPills (Presentational)
    └── Individual pill buttons
```

### Technology Stack
- **React 19**: For component logic and hooks
- **TypeScript**: Type-safe props and API responses
- **Zod**: Runtime validation of props and API responses
- **CSS Modules**: Scoped component styling
- **React Router 7**: For navigation between category filters

### Architecture Principles Applied
- **Separation of Concerns**: UI logic separated from data fetching
- **Single Responsibility**: Each file has one clear purpose
- **Type Safety**: TypeScript interfaces with Zod runtime validation
- **Reusability**: Presentational component can be used in any context
- **Testability**: Easy to test with mocked data

---

## 3. Technical Specification

### 3.1. Component Props Interface

**Location**: `/home/maciej/web/theme-builder/shared/components/CategoryPills/types.ts`

### 3.2. Component Metadata

**Location**: `/home/maciej/web/theme-builder/shared/components/CategoryPills/meta.ts`

### 3.3. Component Implementation

**Location**: `/home/maciej/web/theme-builder/shared/components/CategoryPills/CategoryPills.tsx`

**Key Features**:
- Renders category pills with active state styling
- Handles click events via `onCategorySelect` callback
- Shows loading skeleton during data fetch
- Displays error state with fallback UI
- Supports keyboard navigation (Tab, Enter, Space)
- Implements ARIA attributes for accessibility
- Responsive layout with wrapping or horizontal scroll

### 3.4. Component Styling

**Location**: `/home/maciej/web/theme-builder/shared/components/CategoryPills/CategoryPills.module.css`

**Key Features**:
- Variant-specific styles (left, center, fullWidth)
- Active state with distinct visual treatment
- Hover and focus states for interactivity
- Responsive layout with horizontal scrolling on mobile
- Skeleton loading animation
- CSS custom properties for theme integration

### 3.5. Data Hook Implementation

**Location**: `/home/maciej/web/theme-builder/demo-shop/src/hooks/useCategories.ts`

### 3.6. API Service Implementation

**Location**: `/home/maciej/web/theme-builder/demo-shop/src/services/api/categories.ts`

**Purpose**: Handles HTTP requests to the categories endpoint

### 3.7. Container Component Implementation

**Location**: `/home/maciej/web/theme-builder/demo-shop/src/containers/CategoryPillsContainer.tsx`

**Purpose**: Smart component that handles data fetching and state management

### 3.8. Component Index File

**Location**: `/home/maciej/web/theme-builder/shared/components/CategoryPills/index.ts`

---

## 4. Implementation Phases

### Phase 1: Create Type Definitions
**Priority**: High
**Estimated Time**: 10 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/shared/components/CategoryPills/types.ts`
2. Define `Category` interface
3. Define `CategoryPillsProps` interface
4. Implement Zod schemas for validation
5. Export all types and schemas

**Acceptance Criteria**:
- TypeScript interfaces are properly defined
- Zod schemas validate all props correctly
- Type exports work for both frontend apps
- No TypeScript compilation errors

### Phase 2: Create Component Metadata
**Priority**: High
**Estimated Time**: 10 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/shared/components/CategoryPills/meta.ts`
2. Define `ComponentMeta` object with editable fields
3. Define three variants (left, center, fullWidth)
4. Set default configuration

**Acceptance Criteria**:
- Metadata follows established pattern from existing components
- All editable fields are properly configured
- Variants are clearly described
- Default config is valid

### Phase 3: Implement Presentational Component
**Priority**: High
**Estimated Time**: 30 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/shared/components/CategoryPills/CategoryPills.tsx`
2. Implement component with loading, error, and success states
3. Add keyboard navigation support
4. Implement ARIA attributes for accessibility
5. Add prop validation with Zod
6. Memoize component for performance

**Acceptance Criteria**:
- Component renders all three variants correctly
- Loading skeleton displays during data fetch
- Error state shows user-friendly message
- Keyboard navigation works (Tab, Enter, Space)
- ARIA attributes are correctly applied
- Component is memoized with React.memo

### Phase 4: Create Component Styles
**Priority**: High
**Estimated Time**: 30 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/shared/components/CategoryPills/CategoryPills.module.css`
2. Implement base pill styles
3. Create variant-specific styles (left, center, fullWidth)
4. Add active, hover, and focus states
5. Implement skeleton loading animation
6. Add responsive styles for mobile

**Acceptance Criteria**:
- All three variants have distinct visual styles
- Active state is clearly visible
- Hover and focus states work correctly
- Skeleton animation is smooth
- Component is responsive on mobile
- Uses CSS custom properties for theme integration

### Phase 5: Implement API Service
**Priority**: High
**Estimated Time**: 15 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/demo-shop/src/services/api/categories.ts`
2. Implement `fetchCategories()` function
3. Add Zod validation for API response
4. Handle fetch errors gracefully
5. Use environment variable for API URL

**Acceptance Criteria**:
- Function fetches from correct endpoint
- Response is validated with Zod
- Errors are properly thrown and logged
- API URL comes from environment variable
- TypeScript types are correct

### Phase 6: Implement Data Hook
**Priority**: High
**Estimated Time**: 15 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/demo-shop/src/hooks/useCategories.ts`
2. Implement state management (categories, loading, error)
3. Add `useEffect` to fetch on mount
4. Implement `refetch` function for manual refresh
5. Handle errors with proper state updates

**Acceptance Criteria**:
- Hook manages categories state correctly
- Loading state updates appropriately
- Errors are caught and stored in state
- Refetch function works correctly
- Hook follows React best practices

### Phase 7: Implement Container Component
**Priority**: High
**Estimated Time**: 20 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/demo-shop/src/containers/CategoryPillsContainer.tsx`
2. Integrate `useCategories` hook
3. Implement URL query parameter handling with `useSearchParams`
4. Create `handleCategorySelect` callback
5. Pass all props to presentational component

**Acceptance Criteria**:
- Container fetches categories on mount
- Selected category syncs with URL params
- Category selection updates URL correctly
- All props are passed to presentational component
- Container handles loading and error states

### Phase 8: Create Index File
**Priority**: High
**Estimated Time**: 2 minutes

**Tasks**:
1. Create `/home/maciej/web/theme-builder/shared/components/CategoryPills/index.ts`
2. Export component as default
3. Export all types
4. Export metadata

**Acceptance Criteria**:
- Clean import pattern for other files
- All public API is exported
- No circular dependencies

### Phase 9: Update TypeScript Path Aliases
**Priority**: High
**Estimated Time**: 10 minutes

**Tasks**:
1. Verify `@shared/components` alias in `demo-shop/tsconfig.json`
2. Verify Vite resolve alias in `demo-shop/vite.config.ts` (React Router config)
3. Update if necessary to include CategoryPills

**Acceptance Criteria**:
- TypeScript resolves imports correctly
- No import errors in VS Code
- Build process works without errors

---

## 5. Testing Strategy

### 5.1. Unit Tests (Vitest)

#### CategoryPills Component Tests
**Location**: `/home/maciej/web/theme-builder/shared/components/CategoryPills/CategoryPills.test.tsx`

**Test Cases**:
1. `renders loading skeleton when isLoading is true`
2. `renders error message when error is present`
3. `renders empty message when categories array is empty`
4. `renders all categories with "All" option when showAllOption is true`
5. `renders only categories without "All" option when showAllOption is false`
6. `applies active class to selected category pill`
7. `calls onCategorySelect when pill is clicked`
8. `calls onCategorySelect when Enter key is pressed`
9. `calls onCategorySelect when Space key is pressed`
10. `renders correct variant styles (left, center, fullWidth)`
11. `validates props with Zod schema`

#### useCategories Hook Tests
**Location**: `/home/maciej/web/theme-builder/demo-shop/src/hooks/useCategories.test.ts`

**Test Cases**:
1. `fetches categories on mount`
2. `sets loading state to true during fetch`
3. `sets categories state on successful fetch`
4. `sets error state on fetch failure`
5. `refetch function fetches categories again`

#### fetchCategories API Service Tests
**Location**: `/home/maciej/web/theme-builder/demo-shop/src/services/api/categories.test.ts`

**Test Cases**:
1. `fetches categories from correct endpoint`
2. `returns array of categories on success`
3. `throws error when response is not ok`
4. `throws error when response validation fails`
5. `includes correct headers in request`

---

## 6. Performance Considerations

### Optimization Strategies

1. **Component Memoization**:
   - Use `React.memo()` to prevent unnecessary re-renders
   - Memoize callback functions with `useCallback`
   - Memoize derived data with `useMemo`

3. **CSS Performance**:
   - Use CSS Modules for scoped styles
   - Leverage CSS custom properties for theming
   - Minimize layout shifts with proper sizing

4. **Lazy Loading**:
   - Component can be code-split if not needed on initial page load
   - Use React.lazy() if component is only on specific pages

---

## 7. Dependencies

### Required Dependencies
**No new dependencies required** - All necessary packages already installed:
- React 19
- TypeScript
- Zod
- React Router 7

### Environment Variables
```env
VITE_API_URL=http://localhost:8000
```

### Backend Endpoint Dependency
**Prerequisite**: `GET /api/demo/categories` endpoint must be functional

**Verification**:
```bash
curl http://localhost:8000/api/demo/categories
```

**Expected Response**:
```json
{
  "categories": [
    {"id": 1, "name": "Beauty & Personal Care"},
    {"id": 2, "name": "Books"},
    {"id": 3, "name": "Clothing"},
    {"id": 4, "name": "Electronics"},
    {"id": 5, "name": "Home & Garden"},
    {"id": 6, "name": "Sports & Outdoors"}
  ]
}
```

---

## 12. Integration Points

### Demo Shop Integration

**Where to Use**:
- **Primary Location**: Catalog page (`/demo-shop/src/routes/shop.$shopId.catalog.tsx`)
- **Optional**: Home page for category browsing

**Import Pattern**:
```typescript
import CategoryPillsContainer from '../containers/CategoryPillsContainer';

// In component:
<CategoryPillsContainer variant="left" showAllOption={true} />
```

### Theme Builder Integration

**Component Configuration**:
- Shop owners can add CategoryPills to any page via drag-and-drop
- Configure variant (left, center, fullWidth) to control pill alignment
- Toggle "Show All" option
- No category selection needed (fetched dynamically)

**Variant Descriptions**:
- **left**: Pills aligned to the left with flex-start
- **center**: Pills centered horizontally
- **fullWidth**: Pills stretched to fill available width evenly

**Database Storage**:
```json
{
  "component": "CategoryPills",
  "props": {
    "variant": "left",
    "showAllOption": true
  }
}
```

---

## 13. Success Criteria

### Definition of Done

- ✅ Presentational component renders all three variants correctly
- ✅ Container component fetches and manages category data
- ✅ API service communicates with backend endpoint
- ✅ URL params sync with category selection
- ✅ Loading skeleton displays during fetch
- ✅ Error state shows user-friendly message
- ✅ Keyboard navigation works (Tab, Enter, Space)
- ✅ ARIA attributes correctly implemented
- ✅ Component is responsive on mobile, tablet, desktop
- ✅ All unit tests pass with >80% coverage
- ✅ Component follows established patterns from existing components
- ✅ TypeScript types are comprehensive and correct
- ✅ Zod validation works for props and API responses

---

## 14. File Structure Summary

### Files to Create

```
/home/maciej/web/theme-builder/shared/components/CategoryPills/
├── CategoryPills.tsx                 # Presentational component
├── CategoryPills.module.css          # Component styles
├── types.ts                          # TypeScript interfaces and Zod schemas
├── meta.ts                           # Component metadata for Theme Builder
├── index.ts                          # Public API exports
└── CategoryPills.test.tsx            # Unit tests (optional for MVP)

/home/maciej/web/theme-builder/demo-shop/src/
├── hooks/
│   └── useCategories.ts              # Data fetching hook
├── services/api/
│   └── categories.ts                 # API service for categories endpoint
└── containers/
    └── CategoryPillsContainer.tsx    # Smart container component
```

### Files to Update

1. `/home/maciej/web/theme-builder/demo-shop/src/routes/shop.$shopId.catalog.tsx` - Import and use CategoryPillsContainer
2. `/home/maciej/web/theme-builder/CHANGELOG.md` - Add changelog entry
3. `/home/maciej/web/theme-builder/demo-shop/tsconfig.json` - Verify TypeScript path aliases (if needed)
4. `/home/maciej/web/theme-builder/demo-shop/vite.config.ts` or React Router config - Verify resolve aliases (if needed)

---

## 16. Deployment Checklist

### Pre-Deployment

- [ ] All TypeScript compilation passes without errors
- [ ] ESLint shows no errors or warnings
- [ ] All unit tests pass
- [ ] Manual testing completed successfully
- [ ] Backend categories endpoint is functional
- [ ] Component follows established patterns
- [ ] Code review completed
- [ ] Documentation updated

---
