## Architecture & Key Concepts

### Frontend Architecture

**Theme Builder:**

- Vanilla React 19 with Vite for HMR
- No routing library (simple SPA)
- Expected to have drag-and-drop functionality (dnd kit mentioned in main README)
- Component-based architecture for 13 predefined components
- Shadcn UI library for UI components

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
