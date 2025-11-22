import type { ComponentMeta } from '../../types/component-meta';
import type { HeaderNavigationProps } from './types';

/**
 * Metadata for the HeaderNavigation component
 * Used by the theme editor for component configuration UI
 */
export const meta: ComponentMeta<Omit<HeaderNavigationProps, 'isLoading' | 'error' | 'shopId'>> = {
  displayName: 'Header/Navigation',
  description: 'Main navigation header with configurable logo and variants',
  editableFields: [
    {
      name: 'logoUrl',
      label: 'Logo URL',
      type: 'url',
      required: true,
      description: 'URL to the logo image file',
    },
    {
      name: 'logoPosition',
      label: 'Logo Position',
      type: 'select',
      required: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
      ],
      default: 'left',
    },
  ],
  variants: [
    {
      value: 'sticky',
      label: 'Sticky',
      description: 'Stays at top when scrolling',
    },
    {
      value: 'static',
      label: 'Static',
      description: 'Fixed position navigation',
    },
    {
      value: 'slide-in-left',
      label: 'Slide-in Left',
      description: 'Side drawer navigation from left',
    },
  ],
  defaultVariant: 'static',
  defaultConfig: {
    logoUrl: 'https://via.placeholder.com/150x50',
    logoPosition: 'left',
    variant: 'static',
  },
} as const;

export type HeaderNavigationMeta = typeof meta;
