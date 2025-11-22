import type { ComponentMeta } from '../../types/component-meta';
import type { CategoryPillsProps } from './types';

/**
 * Metadata configuration for the CategoryPills component
 *
 * This metadata is used by the Theme Builder editor to provide
 * a user-friendly interface for configuring the CategoryPills component.
 */
export const meta: ComponentMeta<
  Omit<CategoryPillsProps, 'categories' | 'selectedCategoryId' | 'onCategorySelect' | 'isLoading' | 'error'>
> = {
  displayName: 'Category Pills',
  description: 'Interactive category navigation pills for filtering products',

  /**
   * Fields that can be edited in the Theme Builder
   */
  editableFields: [
    {
      name: 'variant',
      label: 'Layout Variant',
      type: 'select',
      required: true,
      options: [
        { value: 'left', label: 'Left Aligned' },
        { value: 'center', label: 'Center Aligned' },
        { value: 'fullWidth', label: 'Full Width' },
      ],
      default: 'left',
      description: 'Choose how the category pills are laid out',
    },
    {
      name: 'showAllOption',
      label: 'Show "All" Option',
      type: 'select',
      required: true,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      default: 'true',
      description: 'Display an "All" pill to show unfiltered products',
    },
  ],

  /**
   * Available variants for the component
   */
  variants: [
    {
      value: 'left',
      label: 'Left Aligned',
      description: 'Pills aligned to the left with wrapping',
    },
    {
      value: 'center',
      label: 'Center Aligned',
      description: 'Pills centered horizontally with wrapping',
    },
    {
      value: 'fullWidth',
      label: 'Full Width',
      description: 'Pills stretched evenly across available width',
    },
  ],

  /**
   * Default variant when component is added to the page
   */
  defaultVariant: 'left',

  /**
   * Default configuration for new instances
   */
  defaultConfig: {
    variant: 'left',
    showAllOption: true,
  },
} as const;

export type CategoryPillsMeta = typeof meta;
