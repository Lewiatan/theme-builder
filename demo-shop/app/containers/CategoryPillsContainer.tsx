import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import CategoryPills from '@shared/components/CategoryPills/CategoryPills';
import { useCategories } from '~/hooks/useCategories';
import type { CategoryPillsProps } from '@shared/components/CategoryPills/types';

/**
 * Props for the CategoryPillsContainer component
 */
export interface CategoryPillsContainerProps {
  /** Visual variant for pill layout */
  variant?: 'left' | 'center' | 'fullWidth';
  /** Whether to show an "All" option for unfiltered view */
  showAllOption?: boolean;
}

/**
 * CategoryPillsContainer - Smart component that manages category data and URL state
 *
 * This container component handles:
 * - Fetching categories from the API via useCategories hook
 * - Managing selected category state via URL search params
 * - Handling category selection and URL updates
 * - Passing data and callbacks to the presentational CategoryPills component
 *
 * URL State Management:
 * - Uses the 'category' query parameter to track selected category
 * - Example: /catalog?category=3 shows products from category ID 3
 * - No parameter or category=null shows all products
 *
 * @example
 * ```tsx
 * // In a route component
 * <CategoryPillsContainer variant="left" showAllOption={true} />
 * ```
 */
const CategoryPillsContainer: React.FC<CategoryPillsContainerProps> = ({
  variant = 'left',
  showAllOption = true,
}) => {
  // Fetch categories from API
  const { categories, isLoading, error } = useCategories();

  // Manage selected category via URL search params
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse selected category ID from URL params
  const selectedCategoryId = useMemo(() => {
    const categoryParam = searchParams.get('category');

    if (!categoryParam) {
      return null;
    }

    const parsedId = parseInt(categoryParam, 10);
    return isNaN(parsedId) ? null : parsedId;
  }, [searchParams]);

  /**
   * Handle category selection by updating URL search params
   * This triggers a re-render and allows other components to react to category changes
   */
  const handleCategorySelect = useCallback(
    (categoryId: number | null) => {
      if (categoryId === null) {
        // Remove category param to show all products
        searchParams.delete('category');
      } else {
        // Set category param to filter products
        searchParams.set('category', categoryId.toString());
      }

      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Build props for presentational component
  const pillsProps: CategoryPillsProps = {
    categories,
    selectedCategoryId,
    onCategorySelect: handleCategorySelect,
    variant,
    showAllOption,
    isLoading,
    error,
  };

  return <CategoryPills {...pillsProps} />;
};

export default CategoryPillsContainer;
