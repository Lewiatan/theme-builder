import { z } from 'zod';

/**
 * Represents a single navigation link
 */
export interface NavigationLink {
  label: string;
  path: string;
}

/**
 * Props for the HeaderNavigation component
 */
export interface HeaderNavigationProps {
  /** URL to the logo image file */
  logoUrl: string;
  /** Alignment of the logo within the header */
  logoPosition: 'left' | 'center';
  /** Visual variant of the navigation component */
  variant: 'sticky' | 'static' | 'slide-in-left';
  /** The ID of the shop, used to construct navigation links */
  shopId: string;
  /** Loading state passed by container component */
  isLoading: boolean;
  /** Error state passed by container component */
  error: Error | null;
}

/**
 * Zod schema for runtime validation of HeaderNavigation props
 */
export const HeaderNavigationPropsSchema = z.object({
  logoUrl: z.string().min(1, 'Logo URL is required'),
  logoPosition: z.enum(['left', 'center']),
  variant: z.enum(['sticky', 'static', 'slide-in-left']),
  shopId: z.string().uuid('Invalid shop ID format'),
  isLoading: z.boolean(),
  error: z.instanceof(Error).nullable(),
});
