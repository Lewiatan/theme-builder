import React, { useState, useEffect, useMemo, memo } from 'react';
import type { HeadingProps } from './types';
import { HeadingPropsSchema } from './types';
import styles from './Heading.module.css';

/**
 * Heading component - A versatile heading component with multiple visual variants
 *
 * Supports three variants:
 * - text-only: Clean heading with no background
 * - background-image: Heading displayed over a background image
 * - background-color: Heading with a solid background color
 */
const Heading: React.FC<HeadingProps> = (props) => {
  const {
    text,
    level,
    variant,
    textColor,
    backgroundImageUrl,
    backgroundColor,
    height,
    isLoading,
    error,
  } = props;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Validate props with Zod schema
  const validationResult = useMemo(() => {
    try {
      HeadingPropsSchema.parse(props);
      return { success: true, error: null };
    } catch (err) {
      console.error('Heading component validation error:', err);
      return { success: false, error: err };
    }
  }, [props]);

  // Handle background image loading
  useEffect(() => {
    if (variant === 'background-image' && backgroundImageUrl) {
      setImageLoaded(false);
      setImageError(false);

      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        console.error('Failed to load background image:', backgroundImageUrl);
      };
      img.src = backgroundImageUrl;
    }
  }, [variant, backgroundImageUrl]);

  // Render error state
  if (error) {
    const HeadingElement = level as 'h1' | 'h2' | 'h3';
    return (
      <div className={styles.errorContainer}>
        <HeadingElement className={styles.errorHeading}>
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          {text || 'Heading Error'}
        </HeadingElement>
        <p className={styles.errorMessage}>
          {error.message || 'An error occurred while rendering this heading'}
        </p>
      </div>
    );
  }

  // Render loading state (only for background-image variant)
  if (isLoading && variant === 'background-image') {
    const containerHeight = height || 300;
    return (
      <div
        className={styles.loadingContainer}
        style={{ height: `${containerHeight}px` }}
      >
        <div className={styles.skeleton}>
          <div className={styles.shimmer} />
        </div>
      </div>
    );
  }

  // Use defaults if validation failed
  const safeText = text || 'Heading Text';
  const safeLevel = level || 'h2';
  const HeadingElement = safeLevel as 'h1' | 'h2' | 'h3';

  // Warn about variant-specific requirements if validation failed
  if (!validationResult.success) {
    console.warn('Heading component rendering with defaults due to validation errors');
  }

  // Handle background-image variant
  if (variant === 'background-image') {
    // Fallback to text-only if image URL is missing or failed to load
    if (!backgroundImageUrl || imageError) {
      console.warn(
        'Background image variant requires backgroundImageUrl. Falling back to text-only variant.'
      );
      return <HeadingElement className={styles.heading}>{safeText}</HeadingElement>;
    }

    const containerHeight = height || 300;
    const containerStyle: React.CSSProperties = {
      height: `${containerHeight}px`,
      backgroundImage: imageLoaded ? `url(${backgroundImageUrl})` : 'none',
      backgroundColor: imageLoaded ? 'transparent' : '#e5e7eb',
    };

    return (
      <div className={styles.backgroundImageContainer} style={containerStyle}>
        <div className={styles.overlay} />
        <HeadingElement
          className={styles.centeredHeading}
          style={{ color: textColor }}
        >
          {safeText}
        </HeadingElement>
      </div>
    );
  }

  // Handle background-color variant
  if (variant === 'background-color') {
    // Fallback to text-only if background color is missing
    if (!backgroundColor) {
      console.warn(
        'Background color variant requires backgroundColor. Falling back to text-only variant.'
      );
      return <HeadingElement className={styles.heading}>{safeText}</HeadingElement>;
    }

    const containerHeight = height || 200;
    const containerStyle: React.CSSProperties = {
      height: `${containerHeight}px`,
      backgroundColor: backgroundColor,
    };

    return (
      <div className={styles.backgroundColorContainer} style={containerStyle}>
        <HeadingElement
          className={styles.centeredHeading}
          style={{ color: textColor }}
        >
          {safeText}
        </HeadingElement>
      </div>
    );
  }

  // Default: text-only variant
  return <HeadingElement className={styles.heading}>{safeText}</HeadingElement>;
};

// Wrap component with React.memo to prevent unnecessary re-renders
export default memo(Heading);
