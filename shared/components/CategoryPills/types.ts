import { z } from 'zod';

/**
 * Represents a single product category
 */
export interface Category {
  /** Unique identifier for the category */
  id: number;
  /** Display name of the category */
  name: string;
}

/**
 * Props for the CategoryPills component
 */
export interface CategoryPillsProps {
  /** Array of categories to display as pills */
  categories: Category[];
  /** Currently selected category ID (null for "All") */
  selectedCategoryId: number | null;
  /** Callback when a category pill is clicked */
  onCategorySelect: (categoryId: number | null) => void;
  /** Visual variant for pill layout */
  variant: 'left' | 'center' | 'fullWidth';
  /** Whether to show an "All" option for unfiltered view */
  showAllOption: boolean;
  /** Loading state passed by container component */
  isLoading: boolean;
  /** Error state passed by container component */
  error: Error | null;
}

/**
 * Zod schema for Category validation
 */
export const CategorySchema = z.object({
  id: z.number().int().positive('Category ID must be a positive integer'),
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
});

/**
 * Zod schema for runtime validation of CategoryPills props
 * Note: onCategorySelect uses z.function() which validates it's a function but doesn't validate arguments/return type
 */
export const CategoryPillsPropsSchema = z.object({
  categories: z.array(CategorySchema),
  selectedCategoryId: z.number().int().positive().nullable(),
  onCategorySelect: z.function(),
  variant: z.enum(['left', 'center', 'fullWidth']),
  showAllOption: z.boolean(),
  isLoading: z.boolean(),
  error: z.instanceof(Error).nullable(),
});

/**
 * Zod schema for API response validation
 */
export const CategoriesApiResponseSchema = z.object({
  categories: z.array(CategorySchema),
});

/**
 * Type inferred from API response schema
 */
export type CategoriesApiResponse = z.infer<typeof CategoriesApiResponseSchema>;
