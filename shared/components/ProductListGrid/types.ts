import { z } from 'zod';

// ============================================================================
// Product Data Types
// ============================================================================

/**
 * Represents a product from the demo_products table.
 * Prices are stored in cents (e.g., 1999 = $19.99)
 */
export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number; // in cents
  salePrice: number | null; // in cents, null if not on sale
  imageThumbnail: string;
  imageMedium: string;
  imageLarge: string;
}

/**
 * Zod schema for Product validation
 */
export const ProductSchema = z.object({
  id: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative().nullable(),
  imageThumbnail: z.string().min(1),
  imageMedium: z.string().min(1),
  imageLarge: z.string().min(1),
});

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Number of products to display per row in the grid
 */
export type ProductsPerRow = 2 | 3 | 4 | 6;

/**
 * Zod schema for ProductsPerRow validation
 */
export const ProductsPerRowSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(6),
]);

/**
 * Image size variant to use based on grid density
 */
export type ImageSize = 'thumbnail' | 'medium' | 'large';

/**
 * Zod schema for ImageSize validation
 */
export const ImageSizeSchema = z.enum(['thumbnail', 'medium', 'large']);

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the main ProductListGrid component
 */
export interface ProductListGridProps {
  /**
   * Array of products to display
   */
  products: Product[];

  /**
   * Number of products per row (2, 3, 4, or 6)
   * @default 3
   */
  productsPerRow?: ProductsPerRow;

  /**
   * Loading state indicator
   * @default false
   */
  isLoading?: boolean;

  /**
   * Error object if data fetching failed
   */
  error?: Error | null;

  /**
   * Callback to retry fetching data
   */
  onRetry?: () => void;
}

/**
 * Zod schema for ProductListGridProps validation
 */
export const ProductListGridPropsSchema = z.object({
  products: z.array(ProductSchema),
  productsPerRow: ProductsPerRowSchema.default(3),
  isLoading: z.boolean().default(false),
  error: z.instanceof(Error).nullable().optional(),
  onRetry: z.function().optional(),
});

/**
 * Props for the ProductCard sub-component
 */
export interface ProductCardProps {
  /**
   * Product data to display
   */
  product: Product;

  /**
   * Image size variant to use
   * @default 'medium'
   */
  imageSize?: ImageSize;

  /**
   * Click handler for navigation to product detail page
   */
  onClick?: (productId: number) => void;
}

/**
 * Zod schema for ProductCardProps validation
 */
export const ProductCardPropsSchema = z.object({
  product: ProductSchema,
  imageSize: ImageSizeSchema.default('medium'),
  onClick: z.function().optional(),
});

/**
 * Props for the ProductGrid sub-component
 */
export interface ProductGridProps {
  /**
   * Array of products to display
   */
  products: Product[];

  /**
   * Number of columns in the grid
   */
  columns: ProductsPerRow;

  /**
   * Image size variant for product cards
   */
  imageSize: ImageSize;

  /**
   * Loading state indicator
   */
  isLoading?: boolean;

  /**
   * Number of skeleton cards to show during loading
   * @default 12
   */
  skeletonCount?: number;

  /**
   * Click handler for product cards
   */
  onProductClick?: (productId: number) => void;
}

/**
 * Zod schema for ProductGridProps validation
 */
export const ProductGridPropsSchema = z.object({
  products: z.array(ProductSchema),
  columns: ProductsPerRowSchema,
  imageSize: ImageSizeSchema,
  isLoading: z.boolean().default(false),
  skeletonCount: z.number().int().positive().default(12),
  onProductClick: z.function().optional(),
});

// ============================================================================
// Utility Types
// ============================================================================

/**
 * State types for the component
 */
export type ComponentState = 'loading' | 'error' | 'empty' | 'success';

/**
 * Helper function to get image URL based on size
 */
export function getImageUrl(product: Product, size: ImageSize): string {
  switch (size) {
    case 'thumbnail':
      return product.imageThumbnail;
    case 'medium':
      return product.imageMedium;
    case 'large':
      return product.imageLarge;
    default:
      return product.imageMedium;
  }
}

/**
 * Helper function to determine image size based on products per row
 */
export function getImageSizeForLayout(productsPerRow: ProductsPerRow): ImageSize {
  switch (productsPerRow) {
    case 2:
    case 3:
      return 'medium';
    case 4:
    case 6:
      return 'thumbnail';
    default:
      return 'medium';
  }
}

/**
 * Helper function to format price in cents to dollar string
 */
export function formatPrice(priceInCents: number): string {
  const dollars = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}
