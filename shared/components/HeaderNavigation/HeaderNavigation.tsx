import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import type { HeaderNavigationProps, NavigationLink } from './types';
import { HeaderNavigationPropsSchema } from './types';
import styles from './HeaderNavigation.module.css';

const FALLBACK_SITE_NAME = 'Shop';

/**
 * HeaderNavigation - Reusable navigation component with multiple variants
 *
 * Supports three visual variants:
 * - sticky: Navigation bar that sticks to the top when scrolling
 * - static: Standard horizontal navigation layout
 * - slide-in-left: Side drawer navigation that slides in from the left
 */
const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  logoUrl,
  logoPosition,
  variant,
  shopId,
  isLoading,
  error,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navigationLinks = useMemo((): NavigationLink[] => [
    { label: 'Home', path: `/shop/${shopId}` },
    { label: 'Catalog', path: `/shop/${shopId}/catalog` },
    { label: 'Contact', path: `/shop/${shopId}/contact` },
  ], [shopId]);

  // Validate props with Zod schema
  const validationResult = useMemo(() => {
    try {
      HeaderNavigationPropsSchema.parse({
        logoUrl,
        logoPosition,
        variant,
        shopId,
        isLoading,
        error,
      });
      return { success: true, error: null };
    } catch (err) {
      console.error('HeaderNavigation component validation error:', err);
      return { success: false, error: err };
    }
  }, [logoUrl, logoPosition, variant, shopId, isLoading, error]);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Escape key listener to close drawer/mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleLogoError = useCallback(() => {
    setLogoError(true);
  }, []);

  const handleLinkClick = useCallback(() => {
    setIsDrawerOpen(false);
    setIsMobileMenuOpen(false);
  }, []);

  // Warn if validation failed but continue with rendering
  if (!validationResult.success) {
    console.warn('HeaderNavigation component rendering with validation errors');
  }

  // Loading state
  if (isLoading) {
    return (
      <nav className={styles.header} aria-label="Main navigation">
        <div className={styles.container}>
          <div className={`${styles.skeleton} ${styles.skeletonLogo}`} />
          <div className={styles.navLinks}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${styles.skeleton} ${styles.skeletonLink}`} />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  // Error state
  if (error) {
    return (
      <nav className={styles.header} aria-label="Main navigation">
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            Failed to load navigation. Please try again.
          </div>
          <div className={styles.navLinks}>
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={styles.navLink}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  // Logo component (reusable across variants)
  const Logo = ({ className }: { className?: string }) => (
    <div className={`${styles.logoContainer} ${className || ''}`}>
      {logoError ? (
        <span className={styles.fallbackLogo}>{FALLBACK_SITE_NAME}</span>
      ) : (
        <img
          src={logoUrl}
          alt={`${FALLBACK_SITE_NAME} Logo`}
          className={styles.logo}
          onError={handleLogoError}
        />
      )}
    </div>
  );

  // Navigation links component (reusable across variants)
  const NavLinks = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <div className={`${styles.navLinks} ${className || ''}`}>
      {navigationLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={styles.navLink}
          onClick={onClick}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  // Slide-in Left variant
  if (variant === 'slide-in-left') {
    return (
      <>
        <button
          className={styles.drawerToggle}
          onClick={toggleDrawer}
          aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isDrawerOpen}
        >
          <span className={styles.hamburger}></span>
        </button>

        {isDrawerOpen && (
          <div className={styles.overlay} onClick={closeDrawer} aria-hidden="true" />
        )}

        <nav
          className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : styles.drawerClosed}`}
          aria-label="Main navigation"
        >
          <Logo className={logoPosition === 'center' ? styles.logoCenter : styles.logoLeft} />
          <NavLinks className={styles.drawerLinks} onClick={handleLinkClick} />
        </nav>
      </>
    );
  }

  // Sticky and Static variants (horizontal layout)
  const headerClassName = `${styles.header} ${
    variant === 'sticky' ? styles.sticky : styles.static
  } ${logoPosition === 'center' ? styles.headerLogoCenter : ''}`;

  return (
    <nav className={headerClassName} aria-label="Main navigation">
      <div className={styles.container}>
        <Logo className={logoPosition === 'center' ? styles.logoCenter : styles.logoLeft} />

        {/* Desktop navigation */}
        <NavLinks className={styles.desktopNav} />

        {/* Mobile hamburger button */}
        <button
          className={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span className={styles.hamburger}></span>
        </button>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <NavLinks onClick={handleLinkClick} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default memo(HeaderNavigation);
