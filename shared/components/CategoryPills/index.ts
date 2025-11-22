/**
 * CategoryPills Component - Public API
 *
 * This barrel file exports all public interfaces for the CategoryPills component.
 * It provides a clean import pattern for consuming components.
 *
 * @example
 * ```typescript
 * // Import component
 * import CategoryPills from '@shared/components/CategoryPills';
 *
 * // Import types
 * import type { CategoryPillsProps, Category } from '@shared/components/CategoryPills';
 *
 * // Import metadata
 * import { componentMeta } from '@shared/components/CategoryPills';
 * ```
 */

// Export presentational component as default
export { default } from './CategoryPills';
export { default as CategoryPills } from './CategoryPills';

// Export all TypeScript types and interfaces
export type { CategoryPillsProps, Category } from './types';

// Export Zod schemas for runtime validation
export { CategoryPillsPropsSchema, CategorySchema } from './types';

// Export component metadata for Theme Builder
export { meta } from './meta';
export type { CategoryPillsMeta } from './meta';
