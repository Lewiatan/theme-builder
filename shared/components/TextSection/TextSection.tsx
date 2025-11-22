import React, { useState, useMemo, memo } from 'react';
import type { TextSectionProps, TextSectionColumn } from './types';
import { TextSectionPropsSchema } from './types';
import styles from './TextSection.module.css';

/**
 * TextSection component - Multi-column text layout with optional icons or images
 *
 * Supports three variants:
 * - text-only: Display columns with text content only
 * - with-icons: Display small icons beside text in each column
 * - with-images: Display larger images above text in each column
 *
 * Features:
 * - Responsive grid layout (1-4 columns)
 * - Semantic HTML with proper accessibility
 * - Loading states with skeleton UI
 * - Error handling with graceful fallbacks
 * - Lazy loading for images
 * - React.memo optimization
 */
const TextSection: React.FC<TextSectionProps> = (props) => {
  const { columns, variant, columnCount, isLoading, error } = props;

  // Track image loading errors per column
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Validate props with Zod schema
  const validationResult = useMemo(() => {
    try {
      TextSectionPropsSchema.parse(props);
      return { success: true, error: null };
    } catch (err) {
      console.error('TextSection component validation error:', err);
      return { success: false, error: err };
    }
  }, [props]);

  // Handle image load error
  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
    console.error(`Failed to load image for column ${index}`);
  };

  // Render error state
  if (error) {
    return (
      <section className={styles.errorContainer} role="alert" aria-live="polite">
        <h2 className={styles.errorHeading}>
          <span className={styles.errorIcon} aria-hidden="true">
            ⚠
          </span>
          Unable to Display Content
        </h2>
        <p className={styles.errorMessage}>
          {error.message || 'An error occurred while loading this section. Please try again later.'}
        </p>
      </section>
    );
  }

  // Render loading state
  if (isLoading) {
    return <SkeletonLoader variant={variant} columnCount={columnCount} />;
  }

  // Handle empty state
  if (!columns || columns.length === 0) {
    return (
      <section className={styles.emptyState}>
        <p className={styles.emptyStateText}>No content available</p>
      </section>
    );
  }

  // Warn if validation failed but continue with defaults
  if (!validationResult.success) {
    console.warn('TextSection component rendering with validation errors');
  }

  // Determine container class based on variant
  const containerClass = `${styles.container} ${
    variant === 'text-only'
      ? styles.textOnly
      : variant === 'with-icons'
        ? styles.withIcons
        : styles.withImages
  }`;

  return (
    <section className={containerClass}>
      <div className={styles.columnsGrid} data-column-count={columnCount}>
        {columns.map((column, index) => renderColumn(column, variant, index, imageErrors, handleImageError))}
      </div>
    </section>
  );
};

/**
 * Renders a single column based on the variant type
 *
 * @param column - The column data to render
 * @param variant - The visual variant style
 * @param index - Column index for key generation
 * @param imageErrors - Set of indices where images failed to load
 * @param handleImageError - Callback for image load errors
 */
const renderColumn = (
  column: TextSectionColumn,
  variant: 'text-only' | 'with-icons' | 'with-images',
  index: number,
  imageErrors: Set<number>,
  handleImageError: (index: number) => void
): React.ReactElement => {
  const { text, iconUrl, imageUrl } = column;

  // Text-only variant - simplest case
  if (variant === 'text-only') {
    return (
      <article key={index} className={styles.column}>
        <p className={styles.columnText}>{text}</p>
      </article>
    );
  }

  // With-icons variant
  if (variant === 'with-icons') {
    // Fallback to text-only if icon URL is missing or failed to load
    if (!iconUrl || imageErrors.has(index)) {
      return (
        <article key={index} className={styles.column}>
          <p className={styles.columnText}>{text}</p>
        </article>
      );
    }

    return (
      <article key={index} className={styles.column}>
        <div className={styles.iconWrapper}>
          <img
            src={iconUrl}
            alt=""
            className={styles.icon}
            onError={() => handleImageError(index)}
            loading="lazy"
            role="presentation"
          />
        </div>
        <div className={styles.columnContent}>
          <p className={styles.columnText}>{text}</p>
        </div>
      </article>
    );
  }

  // With-images variant
  if (variant === 'with-images') {
    // Fallback to text-only if image URL is missing or failed to load
    if (!imageUrl || imageErrors.has(index)) {
      return (
        <article key={index} className={styles.column}>
          <p className={styles.columnText}>{text}</p>
        </article>
      );
    }

    return (
      <article key={index} className={styles.column}>
        <figure className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt=""
            className={styles.image}
            onError={() => handleImageError(index)}
            loading="lazy"
            role="presentation"
          />
        </figure>
        <div className={styles.columnContent}>
          <p className={styles.columnText}>{text}</p>
        </div>
      </article>
    );
  }

  // Should never reach here due to TypeScript, but handle gracefully
  return (
    <article key={index} className={styles.column}>
      <p className={styles.columnText}>{text}</p>
    </article>
  );
};

/**
 * SkeletonLoader component for loading state
 *
 * @param variant - The visual variant to match skeleton structure
 * @param columnCount - Number of skeleton columns to display
 */
const SkeletonLoader: React.FC<{
  variant: 'text-only' | 'with-icons' | 'with-images';
  columnCount: 1 | 2 | 3 | 4;
}> = ({ variant, columnCount }) => {
  // Create array of skeleton columns matching the column count
  const skeletonColumns = Array.from({ length: columnCount }, (_, i) => i);

  return (
    <div className={styles.loadingContainer} aria-label="Loading content" role="status" aria-live="polite">
      <div className={styles.loadingGrid} data-column-count={columnCount}>
        {skeletonColumns.map((index) => (
          <SkeletonColumn key={index} variant={variant} />
        ))}
      </div>
    </div>
  );
};

/**
 * SkeletonColumn component for individual column loading state
 *
 * @param variant - The visual variant to match skeleton structure
 */
const SkeletonColumn: React.FC<{
  variant: 'text-only' | 'with-icons' | 'with-images';
}> = ({ variant }) => {
  return (
    <div className={styles.skeletonColumn}>
      {/* Icon placeholder for with-icons variant */}
      {variant === 'with-icons' && (
        <div className={`${styles.skeleton} ${styles.skeletonIcon}`}>
          <div className={styles.shimmer} />
        </div>
      )}

      {/* Image placeholder for with-images variant */}
      {variant === 'with-images' && (
        <div className={`${styles.skeleton} ${styles.skeletonImage}`}>
          <div className={styles.shimmer} />
        </div>
      )}

      {/* Text placeholder for all variants */}
      <div className={`${styles.skeleton} ${styles.skeletonText}`}>
        <div className={styles.shimmer} />
      </div>
    </div>
  );
};

// Wrap component with React.memo to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(TextSection);
