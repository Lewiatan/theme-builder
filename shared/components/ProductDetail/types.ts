import { z } from 'zod';
import type { Product } from '../ProductListGrid/types';
import { ProductSchema } from '../ProductListGrid/types';

/**
 * Props for the ProductDetail component
 */
export interface ProductDetailProps {
  /**
   * Product data to display
   */
  product: Product;

  /**
   * Shop ID for navigation links (e.g., back to catalog)
   */
  shopId: string;
}

/**
 * Zod schema for ProductDetailProps validation
 */
export const ProductDetailPropsSchema = z.object({
  product: ProductSchema,
  shopId: z.string().uuid(),
});
