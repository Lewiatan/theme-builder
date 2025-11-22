## Architecture & Key Concepts

### Frontend Architecture

**Demo Shop:**

- React Router 7 with SSR capabilities
- Tailwind CSS 4 for styling
- Uses React Router's file-based routing (`app/routes/`)
- Designed to render saved themes with mock product data
- Run typecheck after each change to typescript code: `npm run typecheck`

### Component Registry System

The Demo Shop uses a unified component registry system that provides a single source of truth for all shared components. This system automatically manages both React component references and their Zod validation schemas.

**Key Files:**
- `component-registry.config.ts` - Unified component registry (root of demo-shop)
- `app/components/DynamicComponentRenderer.tsx` - Renders components dynamically from layout config

**How It Works:**

The component registry configuration maps component type identifiers to both their React component and Zod schema:

```typescript
const componentRegistryConfig = {
  ComponentName: {
    component: ComponentName,
    schema: ComponentNamePropsSchema,
  },
};
```

From this single configuration, two registries are automatically derived:
- `componentRegistry` - Maps type strings to React components (used for rendering)
- `schemaRegistry` - Maps type strings to Zod schemas (used for validation)

This ensures component definitions and validations stay in sync without manual duplication.

**Adding a New Component:**

When you need to add a new shared component to the Demo Shop:

1. **Create the component in `/shared/components/`** (if not already created)
   - Follow the shared component structure: `.tsx`, `types.ts`, `meta.ts`, `.module.css`
   - Ensure component exports both the component itself and its Zod props schema

2. **Register in `component-registry.config.ts`**:
   ```typescript
   // Add import at the top
   import { NewComponent, NewComponentPropsSchema } from '@shared/components/NewComponent';

   // Add to componentRegistryConfig object
   const componentRegistryConfig = {
     // ... existing components
     NewComponent: {
       component: NewComponent,
       schema: NewComponentPropsSchema,
     },
   };
   ```

3. **That's it!** Both registries update automatically via `Object.fromEntries()`

The DynamicComponentRenderer will automatically:
- Recognize the new component type
- Validate props against its schema
- Render the component with validated props

**Important:** The component type identifier (e.g., "NewComponent") must match exactly in:
- The registry configuration key
- The `type` field in page layout JSON from the API
- The component import name

## Coding Standards

### Frontend Standards

#### React

- Use functional components with hooks instead of class components
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Use the new use hook for data fetching in React 19+ projects
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive

#### React Router

- Use createBrowserRouter instead of BrowserRouter for better data loading and error handling
- Implement lazy loading with React.lazy() for route components to improve initial load time
- Use the useNavigate hook instead of the navigate component prop for programmatic navigation
- Leverage loader and action functions to handle data fetching and mutations at the route level
- Implement error boundaries with errorElement to gracefully handle routing and data errors
- Use relative paths with dot notation (e.g., "../parent") to maintain route hierarchy flexibility
- Utilize the useRouteLoaderData hook to access data from parent routes
- Implement fetchers for non-navigation data mutations
- Use route.lazy() for route-level code splitting with automatic loading states
- Implement shouldRevalidate functions to control when data revalidation happens after navigation

#### Tailwind CSS

- Use the @layer directive to organize styles into components, utilities, and base layers
- Implement Just-in-Time (JIT) mode for development efficiency and smaller CSS bundles
- Use arbitrary values with square brackets (e.g., w-[123px]) for precise one-off designs
- Leverage the @apply directive in component classes to reuse utility combinations
- Implement the Tailwind configuration file for customizing theme, plugins, and variants
- Use component extraction for repeated UI patterns instead of copying utility classes
- Leverage the theme() function in CSS for accessing Tailwind theme values
- Implement dark mode with the dark: variant
- Use responsive variants (sm:, md:, lg:, etc.) for adaptive designs
- Leverage state variants (hover:, focus:, active:, etc.) for interactive elements

### Testing Standards

#### Vitest (Unit Testing)

- Leverage the `vi` object for test doubles - Use `vi.fn()` for function mocks, `vi.spyOn()` to monitor existing functions, and `vi.stubGlobal()` for global mocks
- Master `vi.mock()` factory patterns - Place mock factory functions at the top level of your test file
- Create setup files for reusable configuration - Define global mocks, custom matchers, and environment setup in dedicated files referenced in your `vitest.config.ts`
- Use inline snapshots for readable assertions with `expect(value).toMatchInlineSnapshot()`
- Monitor coverage with purpose and only when asked - Configure coverage thresholds in `vitest.config.ts`
- Make watch mode part of your workflow - Run `vitest --watch` during development
- Explore UI mode for complex test suites - Use `vitest --ui` to visually navigate large test suites
- Configure jsdom for DOM testing - Set `environment: 'jsdom'` for frontend component tests
- Structure tests for maintainability - Group related tests with descriptive `describe` blocks
- Leverage TypeScript type checking in tests - Enable strict typing, use `expectTypeOf()` for type-level assertions
