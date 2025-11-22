import type { ComponentMeta } from '../../types/component-meta';
import type { TextSectionProps } from './types';

/**
 * Metadata configuration for the TextSection component
 *
 * This metadata is used by the Theme Builder editor to provide
 * a user-friendly interface for configuring the TextSection component.
 */

export const meta: ComponentMeta<Omit<TextSectionProps, 'isLoading' | 'error'>> = {
  displayName: 'Text Section',
  description: 'Multi-column text layout with optional icons or images',

  /**
   * Fields that can be edited in the Theme Builder
   */
  editableFields: [
    {
      name: 'variant',
      label: 'Visual Variant',
      type: 'select',
      required: true,
      options: [
        { value: 'text-only', label: 'Text Only' },
        { value: 'with-icons', label: 'With Icons' },
        { value: 'with-images', label: 'With Images' },
      ],
      default: 'text-only',
      description: 'Choose the visual style for the text section',
    },
    {
      name: 'columnCount',
      label: 'Number of Columns',
      type: 'number',
      required: true,
      min: 1,
      max: 4,
      default: 3,
      description: 'Number of columns to display (1-4)',
    },
    {
      name: 'columns',
      label: 'Columns',
      type: 'repeater',
      required: true,
      minItems: 1,
      maxItems: 4,
      description: 'Configure each column with text and optional media',
      fields: [
        {
          name: 'text',
          label: 'Column Text',
          type: 'textarea',
          required: true,
          maxLength: 2000,
          description: 'The text content for this column',
        },
        {
          name: 'iconUrl',
          label: 'Icon URL',
          type: 'url',
          required: false,
          description: 'URL to an icon image (for with-icons variant)',
          visibleWhen: { variant: 'with-icons' },
        },
        {
          name: 'imageUrl',
          label: 'Image URL',
          type: 'url',
          required: false,
          description: 'URL to a larger image (for with-images variant)',
          visibleWhen: { variant: 'with-images' },
        },
      ],
    },
  ],

  /**
   * Available variants for the component
   */
  variants: [
    {
      value: 'text-only',
      label: 'Text Only',
      description: 'Display columns with text content only',
    },
    {
      value: 'with-icons',
      label: 'With Icons',
      description: 'Display small icons beside text in each column',
    },
    {
      value: 'with-images',
      label: 'With Images',
      description: 'Display larger images above text in each column',
    },
  ],

  /**
   * Default variant when component is added to the page
   */
  defaultVariant: 'text-only',

  /**
   * Default configuration for new instances
   */
  defaultConfig: {
    variant: 'text-only',
    columnCount: 3,
    columns: [
      {
        text: 'Column 1 text content',
      },
      {
        text: 'Column 2 text content',
      },
      {
        text: 'Column 3 text content',
      },
    ],
  },
} as const;

export type TextSectionMeta = typeof meta;
