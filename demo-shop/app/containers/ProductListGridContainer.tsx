import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import ProductListGrid from '@shared/components/ProductListGrid/ProductListGrid';
import { useProducts } from '~/hooks/useProducts';
import type { ProductsPerRow } from '@shared/components/ProductListGrid/types';
import type { ProductListGridProps } from '@shared/components/ProductListGrid/types';

/**
 * Props for the ProductListGridContainer component
 */
export interface ProductListGridContainerProps {
  /** Number of products per row (2, 3, 4, or 6) */
  productsPerRow?: ProductsPerRow;
  /** Shop ID for navigation to product pages */
  shopId?: string;
}

/**
 * ProductListGridContainer - Smart component that manages product data and filtering
 *
 * This container component handles:
 * - Fetching products from the API via useProducts hook
 * - Responding to category filter changes from URL search params
 * - Managing loading and error states
 * - Passing data and callbacks to the presentational ProductListGrid component
 *
 * URL State Management:
 * - Uses the 'category' query parameter to filter products
 * - Example: /catalog?category=2 shows products from category ID 2
 * - No parameter or category=null shows all products
 *
 * Data Flow:
 * 1. useProducts hook fetches products based on URL category param
 * 2. Container receives products, loading, and error states from hook
 * 3. Container passes data to presentational ProductListGrid component
 * 4. ProductListGrid handles rendering of loading/error/empty/success states
 *
 * This pattern ensures:
 * - Consistent data fetching across components (same as CategoryPills)
 * - Automatic refetching when category filter changes
 * - Client-side data management with proper loading/error states
 *
 * @example
 * ```tsx
 * // In the component registry or page layout
 * <ProductListGridContainer productsPerRow={3} />
 * ```
 */
const ProductListGridContainer: FC<ProductListGridContainerProps> = ({
  productsPerRow = 3,
  shopId,
}) => {
  const navigate = useNavigate();

  // Fetch products with automatic category filtering from URL
  const { products, isLoading, error, refetch } = useProducts();

  // Handle product card click - navigate to product detail page
  const handleProductClick = useCallback((productId: number) => {
    if (shopId) {
      navigate(`/shop/${shopId}/product/${productId}`);
    }
  }, [shopId, navigate]);

  // Build props for presentational component
  const gridProps: ProductListGridProps = {
    products,
    productsPerRow,
    isLoading,
    error,
    onRetry: refetch,
    onProductClick: shopId ? handleProductClick : undefined,
  };

  return <ProductListGrid {...gridProps} />;
};

export default ProductListGridContainer;
