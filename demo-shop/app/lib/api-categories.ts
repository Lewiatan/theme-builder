import { z } from 'zod';
import { buildApiUrl } from './api';

/**
 * Zod schema for validating individual category response
 */
const CategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

/**
 * Zod schema for validating categories API response
 */
const CategoriesResponseSchema = z.object({
  categories: z.array(CategorySchema),
});

/**
 * TypeScript type for a single category
 */
export type Category = z.infer<typeof CategorySchema>;

/**
 * TypeScript type for the full API response
 */
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;

/**
 * Fetches all product categories from the backend API
 *
 * This function handles both server-side (SSR loader) and client-side fetching.
 * The API URL is automatically determined based on execution context:
 * - Server-side: Uses Docker service networking (nginx:80)
 * - Client-side: Uses environment variable (localhost:8000)
 *
 * @returns Promise resolving to array of categories
 * @throws Error if fetch fails or response validation fails
 *
 * @example
 * ```typescript
 * // In a React Router loader
 * export async function loader() {
 *   const categories = await fetchCategories();
 *   return { categories };
 * }
 *
 * // In a client-side hook
 * useEffect(() => {
 *   fetchCategories()
 *     .then(setCategories)
 *     .catch(setError);
 * }, []);
 * ```
 */
export async function fetchCategories(): Promise<Category[]> {
  const url = buildApiUrl('/api/demo/categories');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories: ${response.status} ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    // Validate response with Zod
    const validationResult = CategoriesResponseSchema.safeParse(data);

    if (!validationResult.success) {
      console.error('Categories API response validation failed:', validationResult.error);
      throw new Error('Invalid categories data received from server');
    }

    return validationResult.data.categories;
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      console.error('Error fetching categories:', error.message);
      throw error;
    }

    // Handle unexpected error types
    console.error('Unexpected error fetching categories:', error);
    throw new Error('An unexpected error occurred while fetching categories');
  }
}
