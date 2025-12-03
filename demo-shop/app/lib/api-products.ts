import { z } from 'zod';
import type { Product } from '@shared/components/ProductListGrid/types';
import { buildApiUrl } from './api';

/**
 * Zod schema for validating a single product from the API response
 * Backend returns fields in snake_case, which we transform to camelCase
 */
const ApiProductSchema = z.object({
  id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  category_name: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().int().nonnegative(),
  sale_price: z.number().int().nonnegative().nullable(),
  image_thumbnail: z.string().min(1),
  image_medium: z.string().min(1),
  image_large: z.string().min(1),
});


/**
 * Zod schema for validating products API response (with snake_case fields)
 */
const ApiProductsResponseSchema = z.object({
  products: z.array(ApiProductSchema),
});

/**
 * Transforms a product from API format (snake_case) to application format (camelCase)
 */
function transformProduct(apiProduct: z.infer<typeof ApiProductSchema>): Product {
  return {
    id: apiProduct.id,
    categoryId: apiProduct.category_id,
    categoryName: apiProduct.category_name,
    name: apiProduct.name,
    description: apiProduct.description,
    price: apiProduct.price,
    salePrice: apiProduct.sale_price,
    imageThumbnail: apiProduct.image_thumbnail,
    imageMedium: apiProduct.image_medium,
    imageLarge: apiProduct.image_large,
  };
}

/**
 * Fetches products filtered by category ID from the backend API
 *
 * This function handles both server-side (SSR loader) and client-side fetching.
 * The API URL is automatically determined based on execution context:
 * - Server-side: Uses VITE_API_URL environment variable (Vercel/production) or Docker service networking (local dev)
 * - Client-side: Uses VITE_API_URL environment variable
 *
 * @param categoryId - The category ID to filter products by
 * @returns Promise resolving to array of products in the specified category
 * @throws Error if fetch fails or response validation fails
 *
 * @example
 * ```typescript
 * // In a React Router loader
 * export async function loader({ params }: LoaderFunctionArgs) {
 *   const categoryId = parseInt(params.categoryId, 10);
 *   const products = await fetchProductsByCategory(categoryId);
 *   return { products };
 * }
 * ```
 */
export async function fetchProductsByCategory(categoryId: number): Promise<Product[]> {
  const url = buildApiUrl(`/api/demo/products?categoryId=${categoryId}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle 404 specifically for invalid category
      if (response.status === 404) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }

      throw new Error(
        `Failed to fetch products: ${response.status} ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    // Validate response with Zod
    const validationResult = ApiProductsResponseSchema.safeParse(data);

    if (!validationResult.success) {
      console.error('Products API response validation failed:', validationResult.error);
      throw new Error('Invalid products data received from server');
    }

    // Transform API products to application format
    return validationResult.data.products.map(transformProduct);
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      console.error(`Error fetching products for category ${categoryId}:`, error.message);
      throw error;
    }

    // Handle unexpected error types
    console.error('Unexpected error fetching products:', error);
    throw new Error('An unexpected error occurred while fetching products');
  }
}

/**
 * Fetches all products without category filtering from the backend API
 *
 * This function handles both server-side (SSR loader) and client-side fetching.
 * The API URL is automatically determined based on execution context:
 * - Server-side: Uses VITE_API_URL environment variable (Vercel/production) or Docker service networking (local dev)
 * - Client-side: Uses VITE_API_URL environment variable
 *
 * @returns Promise resolving to array of all products
 * @throws Error if fetch fails or response validation fails
 *
 * @example
 * ```typescript
 * // In a React Router loader
 * export async function loader() {
 *   const products = await fetchAllProducts();
 *   return { products };
 * }
 *
 * // In a client-side hook
 * useEffect(() => {
 *   fetchAllProducts()
 *     .then(setProducts)
 *     .catch(setError);
 * }, []);
 * ```
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const url = buildApiUrl('/api/demo/products');

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
        `Failed to fetch products: ${response.status} ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    // Validate response with Zod
    const validationResult = ApiProductsResponseSchema.safeParse(data);

    if (!validationResult.success) {
      console.error('Products API response validation failed:', validationResult.error);
      throw new Error('Invalid products data received from server');
    }

    // Transform API products to application format
    return validationResult.data.products.map(transformProduct);
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      console.error('Error fetching all products:', error.message);
      throw error;
    }

    // Handle unexpected error types
    console.error('Unexpected error fetching products:', error);
    throw new Error('An unexpected error occurred while fetching products');
  }
}

/**
 * Fetches a single product by ID from the backend API
 *
 * This function handles both server-side (SSR loader) and client-side fetching.
 * The API URL is automatically determined based on execution context:
 * - Server-side: Uses VITE_API_URL environment variable (Vercel/production) or Docker service networking (local dev)
 * - Client-side: Uses VITE_API_URL environment variable
 *
 * @param id - The product ID to fetch
 * @returns Promise resolving to a single product
 * @throws Error if fetch fails, product not found, or response validation fails
 *
 * @example
 * ```typescript
 * // In a React Router loader
 * export async function loader({ params }: LoaderFunctionArgs) {
 *   const productId = parseInt(params.productId, 10);
 *   const product = await fetchProductById(productId);
 *   return { product };
 * }
 * ```
 */
export async function fetchProductById(id: number): Promise<Product> {
  const url = buildApiUrl(`/api/demo/products/${id}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle 404 specifically for product not found
      if (response.status === 404) {
        throw new Error(`Product with ID ${id} not found`);
      }

      throw new Error(
        `Failed to fetch product: ${response.status} ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    // Validate response with Zod
    const validationResult = ApiProductSchema.safeParse(data);

    if (!validationResult.success) {
      console.error('Product API response validation failed:', validationResult.error);
      throw new Error('Invalid product data received from server');
    }

    // Transform API product to application format
    return transformProduct(validationResult.data);
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      console.error(`Error fetching product ${id}:`, error.message);
      throw error;
    }

    // Handle unexpected error types
    console.error('Unexpected error fetching product:', error);
    throw new Error('An unexpected error occurred while fetching product');
  }
}
