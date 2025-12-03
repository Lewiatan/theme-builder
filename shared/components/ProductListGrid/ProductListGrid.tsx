import React, { useMemo } from 'react';
import type { ProductListGridProps } from './types';
import { getImageSizeForLayout } from './types';
import ProductGrid from './ProductGrid';
import styles from './ProductListGrid.module.css';

/**
 * ProductListGrid Component
 *
 * Main component that orchestrates the display of products in a configurable grid layout.
 * Handles loading, error, and empty states while delegating actual grid rendering to
 * the ProductGrid sub-component.
 *
 * This is a presentational component designed to be used with a container component
 * that handles data fetching and state management.
 *
 * @example
 * ```tsx
 * <ProductListGrid
 *   products={products}
 *   productsPerRow={3}
 *   isLoading={false}
 *   error={null}
 *   onRetry={handleRetry}
 * />
 * ```
 */
const ProductListGrid: React.FC<ProductListGridProps> = ({
  products,
  productsPerRow = 3,
  isLoading = false,
  error = null,
  onRetry,
  onProductClick
}) => {
  // Calculate appropriate image size based on grid density
  const imageSize = useMemo(() => {
    return getImageSizeForLayout(productsPerRow);
  }, [productsPerRow]);

  // Loading State
  if (isLoading) {
    return (
      <div className={styles.container}>
        <ProductGrid
          products={[]}
          columns={productsPerRow}
          imageSize={imageSize}
          isLoading={true}
          skeletonCount={12}
        />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState} role="alert" aria-live="polite">
          <svg
            className={styles.errorIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
          </svg>
          <h3 className={styles.errorTitle}>Failed to load products</h3>
          <p className={styles.errorMessage}>
            {error.message || 'An error occurred while loading products. Please try again.'}
          </p>
          {onRetry && (
            <button
              className={styles.retryButton}
              onClick={onRetry}
              aria-label="Retry loading products"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState} role="status" aria-live="polite">
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="7" strokeWidth="2" />
            <line x1="21" y1="21" x2="15" y2="15" strokeWidth="2" />
          </svg>
          <h3 className={styles.emptyTitle}>No products found</h3>
          <p className={styles.emptyMessage}>
            We couldn't find any products matching your criteria.
          </p>
          <a href="/catalog" className={styles.browseAllButton}>
            Browse all products
          </a>
        </div>
      </div>
    );
  }

  // Success State - Render Product Grid
  return (
    <div className={styles.container}>
      <ProductGrid
        products={products}
        columns={productsPerRow}
        imageSize={imageSize}
        isLoading={false}
        onProductClick={onProductClick}
      />
    </div>
  );
};

ProductListGrid.displayName = 'ProductListGrid';

export default ProductListGrid;
