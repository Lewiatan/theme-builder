import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { fetchAllProducts, fetchProductsByCategory } from '~/lib/api-products';
import type { Product } from '@shared/components/ProductListGrid/types';

/**
 * Return type for the useProducts hook
 */
export interface UseProductsResult {
  /** Array of products fetched from the API */
  products: Product[];
  /** Whether the products are currently being loaded */
  isLoading: boolean;
  /** Error object if the fetch failed, null otherwise */
  error: Error | null;
  /** Function to manually trigger a refetch of products */
  refetch: () => void;
  /** Currently selected category ID (from URL params), null for all products */
  categoryId: number | null;
}

/**
 * Custom hook for fetching and managing products with category filtering
 *
 * This hook handles the entire lifecycle of product data:
 * - Fetches products on component mount and when category changes
 * - Manages loading state during fetch
 * - Handles and stores errors
 * - Provides a refetch function for manual refresh
 * - Automatically responds to URL category parameter changes
 *
 * Products are fetched client-side, filtering by the 'category' URL parameter:
 * - /catalog → All products
 * - /catalog?category=2 → Products from category ID 2
 *
 * @returns Object containing products, loading state, error, categoryId, and refetch function
 *
 * @example
 * ```typescript
 * function ProductList() {
 *   const { products, isLoading, error, refetch, categoryId } = useProducts();
 *
 *   if (isLoading) return <SkeletonGrid />;
 *   if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *
 *   return (
 *     <div>
 *       <p>Showing {categoryId ? `category ${categoryId}` : 'all products'}</p>
 *       <ProductGrid products={products} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams] = useSearchParams();

  // Extract and parse category ID from URL search params
  const categoryId = (() => {
    const categoryParam = searchParams.get('category');

    if (!categoryParam) {
      return null;
    }

    const parsedId = parseInt(categoryParam, 10);
    return isNaN(parsedId) ? null : parsedId;
  })();

  /**
   * Fetches products from the API based on current category filter
   * Wrapped in useCallback to prevent unnecessary effect re-runs
   */
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedProducts: Product[] = categoryId !== null
        ? await fetchProductsByCategory(categoryId)
        : await fetchAllProducts();

      setProducts(fetchedProducts);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('An unexpected error occurred while fetching products');

      setError(errorObj);
      console.error('useProducts hook error:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  /**
   * Fetch products on mount and whenever category filter changes
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * Public refetch function that consumers can call to manually refresh products
   * Uses the same loadProducts function to ensure consistent behavior
   */
  const refetch = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    error,
    refetch,
    categoryId,
  };
}
