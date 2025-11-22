import React, { memo } from 'react';
import type { ProductGridProps } from '../types';
import ProductCard from '../ProductCard';
import styles from './ProductGrid.module.css';

/**
 * ProductGrid Component
 *
 * Reusable grid container that renders products in a configurable column layout.
 * Handles responsive breakpoints and loading states with skeleton cards.
 *
 * This component is designed to be reused by:
 * - ProductListGrid (main catalog grid)
 * - FeaturedProducts component (future use)
 */
const ProductGrid: React.FC<ProductGridProps> = memo(({
  products,
  columns,
  imageSize,
  isLoading = false,
  skeletonCount = 12,
  onProductClick
}) => {
  // Render skeleton loading state
  if (isLoading) {
    return (
      <div
        className={styles.grid}
        style={{ '--grid-columns': columns } as React.CSSProperties}
        data-columns={columns}
        aria-busy="true"
        aria-label="Loading products"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={`skeleton-${index}`} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonTitleShort} />
              <div className={styles.skeletonPrice} />
              <div className={styles.skeletonButton} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Don't render anything if no products (let parent handle empty state)
  if (products.length === 0) {
    return null;
  }

  // Render product grid
  return (
    <div
      className={styles.grid}
      style={{ '--grid-columns': columns } as React.CSSProperties}
      data-columns={columns}
      role="list"
      aria-label="Product grid"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard
            product={product}
            imageSize={imageSize}
            onClick={onProductClick}
          />
        </div>
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
