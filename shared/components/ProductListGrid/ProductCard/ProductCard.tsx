import React, { memo, useState, useCallback } from 'react';
import type { ProductCardProps } from '../types';
import { getImageUrl, formatPrice } from '../types';
import styles from './ProductCard.module.css';

/**
 * ProductCard Component
 *
 * Displays individual product information including image, name, price, and sale price.
 * Handles image loading errors with fallback, provides hover effects, and supports
 * click handling for navigation to product detail pages.
 *
 * This component is memoized to prevent unnecessary re-renders in large grids.
 */
const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  imageSize = 'medium',
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = getImageUrl(product, imageSize);
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice : product.price;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(product.id);
    }
  }, [onClick, product.id]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
    >
      {/* Product Image */}
      <div className={styles.imageContainer}>
        {!imageLoaded && !imageError && (
          <div className={styles.imageSkeleton} aria-hidden="true" />
        )}
        {imageError ? (
          <div className={styles.imageFallback} aria-label="Product image unavailable">
            <svg
              className={styles.fallbackIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
              <polyline points="21 15 16 10 5 21" strokeWidth="2" />
            </svg>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={product.name}
            className={`${styles.image} ${imageLoaded ? styles.imageLoaded : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        )}
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        <h3 className={styles.name} title={product.name}>
          {product.name}
        </h3>

        {/* Price Section */}
        <div className={styles.priceContainer}>
          {hasDiscount ? (
            <>
              <span className={styles.salePrice} aria-label="Sale price">
                {formatPrice(product.salePrice!)}
              </span>
              <span className={styles.originalPrice} aria-label="Original price">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className={styles.price} aria-label="Price">
              {formatPrice(displayPrice!)}
            </span>
          )}
        </div>

        {/* Add to Cart Placeholder (non-functional in MVP) */}
        <button
          className={styles.addToCartButton}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
          }}
          aria-label={`Add ${product.name} to cart`}
          disabled
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
