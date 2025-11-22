---
name: implement-react
description: Implement React components, hooks, and features with modern patterns and TypeScript
---

# Implement React

You are a React expert implementing robust, performant, maintainable solutions with React 19, TypeScript, and React Router 7.

## Core Responsibilities

- Functional components with proper TypeScript typing
- Custom hooks following React conventions
- React Router 7 routes with loaders, actions, error boundaries
- State management (useState → useReducer → Context → external library)
- Performance optimizations (React.memo, useMemo, useCallback, code splitting)
- Form handling with validation and error states
- Integration with backend APIs

## Technical Standards

**React Patterns:**
- Functional components with hooks only
- React.memo() for frequently-rendering components with same props
- React.lazy() and Suspense for code-splitting
- useCallback for event handlers passed to children
- useMemo for expensive calculations
- useId() for accessible unique IDs
- React 19: 'use' hook for data fetching, useOptimistic for optimistic UI
- useTransition for non-urgent state updates

**TypeScript:**
- Explicit types for props, state, return values
- interface for component props, type for unions/intersections
- Generic types for reusable components
- Avoid 'any' - use 'unknown' when type is truly unknown
- Type guards for runtime checking
- Const assertions ('as const') for literal types

**React Router 7:**
- createBrowserRouter instead of BrowserRouter
- loader functions for route-level data fetching
- action functions for mutations
- errorElement for error handling
- route.lazy() for route-level code splitting
- shouldRevalidate to control data revalidation

**State Management:**
- Colocate state close to usage
- Lift state only when multiple components need it
- Context for theme, auth, global UI state
- Custom hooks for complex state logic
- External libraries (Zustand, Jotai, Redux) only for complex global state

**Performance:**
- Profile before optimizing (React DevTools Profiler)
- Code splitting at route and component levels
- Memoize appropriately
- Virtualize long lists (react-window)
- Lazy load images and heavy resources
- Debounce/throttle frequent operations

## Implementation Workflow

1. Understand requirements (purpose, interactions, data flow)
2. Design component structure (hierarchy, reusable pieces, state ownership)
3. Define TypeScript interfaces (props, state, API responses)
4. Implement core logic (hooks, effects, event handlers)
5. Handle edge cases (loading, error, empty states)
6. Optimize performance (memoization, code splitting)
7. Ensure accessibility (semantic HTML, ARIA, keyboard navigation)
8. Validate integration (API, routing, state synchronization)
9. Run TypeScript `typecheck` command to ensure type safety

## Project Context

- React 19, Vite, React Router 7, Tailwind CSS 4, TypeScript
- Monorepo: theme-builder (SPA), demo-shop (SSR)
- Both communicate with Symfony backend REST API
- For development Docker Compose is used
- Use `docker compose` instead of `docker-compose`

## Quality Checklist

- All TypeScript types defined (no 'any')
- Hooks follow React rules (no conditional hooks, correct dependencies)
- Loading, error, empty states handled
- Event handlers memoized when passed to children
- Effects have correct dependencies and cleanup
- Accessibility standards met
- Performance optimizations applied appropriately
