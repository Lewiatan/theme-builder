import type { ComponentMeta } from '../../types/component-meta';
import type { ProductListGridProps } from './types';

/**
 * Metadata configuration for the ProductListGrid component
 *
 * This metadata is used by the Theme Builder editor to provide
 * a user-friendly interface for configuring the ProductListGrid component.
 *
 * Note: This component is primarily designed for the Catalog page template
 * and may not be draggable to other page types in the MVP.
 */
export const meta: ComponentMeta<
  Omit<ProductListGridProps, 'products' | 'isLoading' | 'error' | 'onRetry'>
> = {
  displayName: 'Product List/Grid',
  description: 'Displays products in a configurable grid layout with responsive columns',

  /**
   * Fields that can be edited in the Theme Builder
   */
  editableFields: [
    {
      name: 'productsPerRow',
      label: 'Products Per Row',
      type: 'select',
      required: true,
      options: [
        { value: '2', label: '2 Products (Large)' },
        { value: '3', label: '3 Products (Balanced)' },
        { value: '4', label: '4 Products (Compact)' },
        { value: '6', label: '6 Products (Dense)' },
      ],
      default: '3',
      description: 'Number of products to display per row on desktop',
    },
  ],

  /**
   * Available variants for the component
   */
  variants: [
    {
      value: '2',
      label: '2 Products Per Row',
      description: 'Large grid layout with medium-sized product images (1 column on mobile)',
    },
    {
      value: '3',
      label: '3 Products Per Row',
      description: 'Balanced grid layout for product browsing (1 column on mobile, 2 on tablet)',
    },
    {
      value: '4',
      label: '4 Products Per Row',
      description: 'Compact grid with thumbnail images (2 columns on mobile, 3 on tablet)',
    },
    {
      value: '6',
      label: '6 Products Per Row',
      description: 'Dense grid layout with thumbnail images (2 columns on mobile, 4 on tablet)',
    },
  ],

  /**
   * Default variant when component is added to the page
   */
  defaultVariant: '3',

  /**
   * Default configuration for new instances
   */
  defaultConfig: {
    productsPerRow: 3,
  },
} as const;

export type ProductListGridMeta = typeof meta;
