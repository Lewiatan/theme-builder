import React, { useMemo, memo, useCallback } from 'react';
import type { CategoryPillsProps, Category } from './types';
import { CategoryPillsPropsSchema } from './types';
import styles from './CategoryPills.module.css';

/**
 * CategoryPills component - Interactive category navigation pills
 *
 * Displays product categories as clickable pills for filtering.
 * Supports three layout variants:
 * - left: Pills aligned to the left with wrapping
 * - center: Pills centered horizontally with wrapping
 * - fullWidth: Pills stretched evenly across available width
 */
const CategoryPills: React.FC<CategoryPillsProps> = (props) => {
  const {
    categories,
    selectedCategoryId,
    onCategorySelect,
    variant,
    showAllOption,
    isLoading,
    error,
  } = props;

  // Validate props with Zod schema
  const validationResult = useMemo(() => {
    try {
      CategoryPillsPropsSchema.parse(props);
      return { success: true, error: null };
    } catch (err) {
      console.error('CategoryPills component validation error:', err);
      return { success: false, error: err };
    }
  }, [props]);

  // Warn about validation errors
  if (!validationResult.success) {
    console.warn('CategoryPills component rendering with defaults due to validation errors');
  }

  // Handle pill click with keyboard support
  const handlePillClick = useCallback(
    (categoryId: number | null) => {
      onCategorySelect(categoryId);
    },
    [onCategorySelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, categoryId: number | null) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCategorySelect(categoryId);
      }
    },
    [onCategorySelect]
  );

  // Build pills array with optional "All" option
  // IMPORTANT: This hook must be called before any conditional returns to avoid React Hooks violations
  const pills: Array<{ id: number | null; name: string }> = useMemo(() => {
    const result: Array<{ id: number | null; name: string }> = [];

    if (showAllOption) {
      result.push({ id: null, name: 'All' });
    }

    if (categories && Array.isArray(categories)) {
      categories.forEach((category: Category) => {
        result.push({ id: category.id, name: category.name });
      });
    }

    return result;
  }, [categories, showAllOption]);

  // Render error state
  if (error) {
    return (
      <div className={styles.errorContainer} role="alert" aria-live="assertive">
        <span className={styles.errorIcon} aria-hidden="true">
          ⚠
        </span>
        <p className={styles.errorMessage}>
          {error.message || 'Failed to load categories. Please try again later.'}
        </p>
      </div>
    );
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div
        className={`${styles.container} ${styles[variant]}`}
        aria-busy="true"
        aria-label="Loading categories"
      >
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className={styles.skeletonPill}>
            <div className={styles.shimmer} />
          </div>
        ))}
      </div>
    );
  }

  // Render empty state
  if (!categories || categories.length === 0) {
    return (
      <div className={styles.emptyContainer} role="status" aria-live="polite">
        <p className={styles.emptyMessage}>No categories available</p>
      </div>
    );
  }

  return (
    <nav
      className={`${styles.container} ${styles[variant]}`}
      aria-label="Product categories"
      role="navigation"
    >
      {pills.map((pill) => {
        const isActive = pill.id === selectedCategoryId;

        return (
          <button
            key={pill.id ?? 'all'}
            type="button"
            className={`${styles.pill} ${isActive ? styles.active : ''}`}
            onClick={() => handlePillClick(pill.id)}
            onKeyDown={(e) => handleKeyDown(e, pill.id)}
            aria-pressed={isActive}
            aria-current={isActive ? 'true' : undefined}
          >
            {pill.name}
          </button>
        );
      })}
    </nav>
  );
};

// Wrap component with React.memo to prevent unnecessary re-renders
export default memo(CategoryPills);
