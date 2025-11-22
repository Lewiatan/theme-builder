import { z } from 'zod';

/**
 * Represents a single column in the Text Section component
 */
export interface TextSectionColumn {
  /** The text content to display in the column */
  text: string;
  /** Optional URL to an icon image (used in 'with-icons' variant) */
  iconUrl?: string;
  /** Optional URL to a larger image (used in 'with-images' variant) */
  imageUrl?: string;
}

/**
 * Props for the TextSection component
 */
export interface TextSectionProps {
  /** Array of columns to display (1-4 columns) */
  columns: TextSectionColumn[];
  /** Visual presentation style */
  variant: 'text-only' | 'with-icons' | 'with-images';
  /** Number of columns to display in the layout */
  columnCount: 1 | 2 | 3 | 4;
  /** Loading state passed by container component */
  isLoading: boolean;
  /** Error state passed by container component */
  error: Error | null;
}

/**
 * Zod schema for validating URL format (HTTPS only for security)
 */
const httpsUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine((url) => url.startsWith('https://'), {
    message: 'URL must use HTTPS protocol',
  });

/**
 * Zod schema for a single column
 */
const TextSectionColumnSchema = z.object({
  text: z
    .string()
    .min(1, 'Column text is required')
    .max(2000, 'Column text cannot exceed 2000 characters'),
  iconUrl: httpsUrlSchema.optional(),
  imageUrl: httpsUrlSchema.optional(),
});

/**
 * Zod schema for runtime validation of TextSection props
 */
export const TextSectionPropsSchema = z
  .object({
    columns: z
      .array(TextSectionColumnSchema)
      .min(1, 'At least one column is required')
      .max(4, 'Maximum of 4 columns allowed'),
    variant: z.enum(['text-only', 'with-icons', 'with-images']),
    columnCount: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    isLoading: z.boolean(),
    error: z.instanceof(Error).nullable(),
  })
  .refine(
    (data) => {
      // For 'with-icons' variant, verify that all columns have iconUrl
      if (data.variant === 'with-icons') {
        return data.columns.every((col) => col.iconUrl);
      }
      return true;
    },
    {
      message: "All columns must have iconUrl for 'with-icons' variant",
      path: ['columns'],
    }
  )
  .refine(
    (data) => {
      // For 'with-images' variant, verify that all columns have imageUrl
      if (data.variant === 'with-images') {
        return data.columns.every((col) => col.imageUrl);
      }
      return true;
    },
    {
      message: "All columns must have imageUrl for 'with-images' variant",
      path: ['columns'],
    }
  )
  .refine(
    (data) => {
      // Columns array should not exceed columnCount
      return data.columns.length <= data.columnCount;
    },
    {
      message: 'Number of columns cannot exceed columnCount setting',
      path: ['columns'],
    }
  );
