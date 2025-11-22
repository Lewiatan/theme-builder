import { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '~/lib/api-categories';
import type { Category } from '~/lib/api-categories';

/**
 * Return type for the useCategories hook
 */
export interface UseCategoriesResult {
  /** Array of categories fetched from the API */
  categories: Category[];
  /** Whether the categories are currently being loaded */
  isLoading: boolean;
  /** Error object if the fetch failed, null otherwise */
  error: Error | null;
  /** Function to manually trigger a refetch of categories */
  refetch: () => void;
}

/**
 * Custom hook for fetching and managing product categories
 *
 * This hook handles the entire lifecycle of category data:
 * - Fetches categories on component mount
 * - Manages loading state during fetch
 * - Handles and stores errors
 * - Provides a refetch function for manual refresh
 *
 * Categories are fetched client-side, making this hook ideal for
 * components that need dynamic category data without SSR.
 *
 * @returns Object containing categories, loading state, error, and refetch function
 *
 * @example
 * ```typescript
 * function CategoryFilter() {
 *   const { categories, isLoading, error, refetch } = useCategories();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *
 *   return (
 *     <select>
 *       {categories.map(cat => (
 *         <option key={cat.id} value={cat.id}>{cat.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches categories from the API
   * Wrapped in useCallback to prevent unnecessary effect re-runs
   */
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('An unexpected error occurred while fetching categories');

      setError(errorObj);
      console.error('useCategories hook error:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch categories on mount
   */
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /**
   * Public refetch function that consumers can call to manually refresh categories
   * Uses the same loadCategories function to ensure consistent behavior
   */
  const refetch = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
}
