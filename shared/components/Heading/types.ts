import { z } from 'zod';

/**
 * Props for the Heading component
 */
export interface HeadingProps {
  /** The heading text content to display */
  text: string;
  /** Semantic heading level for proper HTML structure */
  level: 'h1' | 'h2' | 'h3';
  /** Visual variant of the heading component */
  variant: 'text-only' | 'background-image' | 'background-color';
  /** Text color for background variants (hex format) */
  textColor?: string;
  /** URL to background image (required for 'background-image' variant) */
  backgroundImageUrl?: string;
  /** Background color value (rgba format, required for 'background-color' variant) */
  backgroundColor?: string;
  /** Height in pixels for background variants (ignored for 'text-only' variant) */
  height?: number;
  /** Loading state passed by container component */
  isLoading: boolean;
  /** Error state passed by container component */
  error: Error | null;
}

/**
 * Zod schema for runtime validation of Heading props
 */
export const HeadingPropsSchema = z
  .object({
    text: z.string().min(1, 'Heading text is required').max(500, 'Heading text too long'),
    level: z.enum(['h1', 'h2', 'h3']),
    variant: z.enum(['text-only', 'background-image', 'background-color']),
    textColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Text color must be a valid hex color')
      .optional(),
    backgroundImageUrl: z.string().optional(),
    backgroundColor: z
      .string()
      .regex(
        /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/,
        'Background color must be in rgba format'
      )
      .optional(),
    height: z.number().min(50).max(1000).optional(),
    isLoading: z.boolean(),
    error: z.instanceof(Error).nullable(),
  })
  .refine(
    (data) => {
      if (data.variant === 'background-image') {
        return !!data.backgroundImageUrl && !!data.textColor;
      }
      if (data.variant === 'background-color') {
        return !!data.backgroundColor && !!data.textColor;
      }
      return true;
    },
    {
      message: 'Required fields for variant are missing',
    }
  );
