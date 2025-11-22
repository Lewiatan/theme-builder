import type { ComponentMeta } from '../../types/component-meta';
import type { HeadingProps } from './types';

/**
 * Metadata configuration for the Heading component
 *
 * This metadata is used by the Theme Builder editor to provide
 * a user-friendly interface for configuring the Heading component.
 */

export const meta: ComponentMeta<Omit<HeadingProps, 'isLoading' | 'error'>> = {
  displayName: 'Heading',
  description: 'Semantic heading with optional background image or color',

  /**
   * Fields that can be edited in the Theme Builder
   */
  editableFields: [
    {
      name: 'text',
      label: 'Heading Text',
      type: 'text',
      required: true,
      description: 'The heading text to display',
      maxLength: 500,
    },
    {
      name: 'level',
      label: 'Heading Level',
      type: 'select',
      required: true,
      options: [
        { value: 'h1', label: 'H1 (Main Heading)' },
        { value: 'h2', label: 'H2 (Section Heading)' },
        { value: 'h3', label: 'H3 (Subsection Heading)' },
      ],
      default: 'h2',
      description: 'Semantic heading level for document structure',
    },
    {
      name: 'variant',
      label: 'Visual Variant',
      type: 'select',
      required: true,
      options: [
        { value: 'text-only', label: 'Text Only' },
        { value: 'background-image', label: 'Background Image' },
        { value: 'background-color', label: 'Background Color' },
      ],
      default: 'text-only',
      description: 'Choose the visual style for the heading',
    },
    {
      name: 'textColor',
      label: 'Text Color',
      type: 'color',
      required: false,
      description: 'Color of the text for background-image and background-color variants',
      visibleWhen: { variant: ['background-image', 'background-color'] },
    },
    {
      name: 'backgroundImageUrl',
      label: 'Background Image URL',
      type: 'url',
      required: false,
      description: 'URL to background image (for background-image variant)',
      visibleWhen: { variant: 'background-image' },
    },
    {
      name: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      required: false,
      description: 'Background color (for background-color variant)',
      visibleWhen: { variant: 'background-color' },
    },
    {
      name: 'height',
      label: 'Height (px)',
      type: 'number',
      required: false,
      min: 50,
      max: 1000,
      default: 300,
      description: 'Container height for background variants',
      visibleWhen: { variant: ['background-image', 'background-color'] },
    },
  ],

  /**
   * Available variants for the component
   */
  variants: [
    {
      value: 'text-only',
      label: 'Text Only',
      description: 'Simple heading with no background',
    },
    {
      value: 'background-image',
      label: 'Background Image',
      description: 'Heading with background image',
    },
    {
      value: 'background-color',
      label: 'Background Color',
      description: 'Heading with solid background color',
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
    text: 'Heading Text',
    level: 'h2',
    variant: 'text-only',
  },
} as const;

export type HeadingMeta = typeof meta;
