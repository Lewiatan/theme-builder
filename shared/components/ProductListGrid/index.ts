/**
 * ProductListGrid Component - Public API
 *
 * This file exports all public interfaces, types, and components
 * from the ProductListGrid component for use in other parts of the application.
 */

// Main Component
export { default } from './ProductListGrid';
export { default as ProductListGrid } from './ProductListGrid';

// Sub-components (reusable by other components like FeaturedProducts)
export { default as ProductCard } from './ProductCard';
export { default as ProductGrid } from './ProductGrid';

// Types and Interfaces
export type {
  Product,
  ProductsPerRow,
  ImageSize,
  ProductListGridProps,
  ProductCardProps,
  ProductGridProps,
  ComponentState,
} from './types';

// Zod Schemas (for validation)
export {
  ProductSchema,
  ProductsPerRowSchema,
  ImageSizeSchema,
  ProductListGridPropsSchema,
  ProductCardPropsSchema,
  ProductGridPropsSchema,
} from './types';

// Utility Functions
export {
  getImageUrl,
  getImageSizeForLayout,
  formatPrice,
} from './types';

// Component Metadata
export { meta } from './meta';
export type { ProductListGridMeta } from './meta';
