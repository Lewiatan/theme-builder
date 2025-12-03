import { useState } from 'react';
import { Link } from 'react-router';
import { formatPrice } from '../ProductListGrid/types';
import type { ProductDetailProps } from './types';
import styles from './ProductDetail.module.css';

/**
 * ProductDetail component displays comprehensive product information
 * including image, title, pricing, category, and description.
 *
 * This component is used in the Demo Shop product page to show
 * detailed information about a single product.
 */
export function ProductDetail({ product, shopId }: ProductDetailProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const catalogUrl = `/shop/${shopId}/catalog?category=${product.categoryId}`;

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        {imageLoading && !imageError && (
          <div className={styles.imageSkeleton} aria-label="Loading image" />
        )}
        {imageError ? (
          <div className={styles.imageFallback} aria-label="Image not available">
            <svg
              className={styles.fallbackIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className={styles.fallbackText}>Image not available</span>
          </div>
        ) : (
          <img
            src={product.imageLarge}
            alt={product.name}
            className={`${styles.image} ${imageLoading ? styles.imageHidden : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.category}>
          <Link to={catalogUrl} className={styles.categoryLink}>
            {product.categoryName}
          </Link>
        </div>

        <h1 className={styles.title}>{product.name}</h1>

        <div className={styles.priceSection}>
          {product.salePrice !== null ? (
            <>
              <span className={styles.salePrice}>{formatPrice(product.salePrice)}</span>
              <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
              <span className={styles.saleBadge}>Sale</span>
            </>
          ) : (
            <span className={styles.price}>{formatPrice(product.price)}</span>
          )}
        </div>

        <p className={styles.description}>{product.description}</p>

        <button
          type="button"
          className={styles.addToCartButton}
          disabled
          aria-label="Add to cart (not available in demo)"
        >
          Add to Cart
        </button>
        <p className={styles.demoNote}>
          Note: Shopping cart is not functional in this demo
        </p>
      </div>
    </div>
  );
}
