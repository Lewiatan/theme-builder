import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { fetchProductsByCategory, fetchAllProducts } from '~/lib/api-products';

describe('fetchProductsByCategory', () => {
  // Silence expected error logging in tests that exercise failure paths
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and transforms products on success', async () => {
    const fetchSpy = vi
      .spyOn(globalThis as any, 'fetch')
      .mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          products: [
            {
              id: 1,
              category_id: 10,
              category_name: 'Cameras',
              name: 'DSLR Camera',
              description: 'High quality camera',
              price: 100_00,
              sale_price: 80_00,
              image_thumbnail: '/images/thumb.jpg',
              image_medium: '/images/medium.jpg',
              image_large: '/images/large.jpg',
            },
          ],
        }),
      } as any);

    const products = await fetchProductsByCategory(10);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = (fetchSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(calledUrl).toContain('/api/demo/products?categoryId=10');

    expect(products).toEqual([
      {
        id: 1,
        categoryId: 10,
        categoryName: 'Cameras',
        name: 'DSLR Camera',
        description: 'High quality camera',
        price: 100_00,
        salePrice: 80_00,
        imageThumbnail: '/images/thumb.jpg',
        imageMedium: '/images/medium.jpg',
        imageLarge: '/images/large.jpg',
      },
    ]);
  });

  it('throws a specific error when category is not found (404)', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
    } as any);

    await expect(fetchProductsByCategory(999)).rejects.toThrow(
      'Category with ID 999 not found',
    );
  });

  it('throws a generic error for non-OK responses', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    } as any);

    await expect(fetchProductsByCategory(1)).rejects.toThrow(
      'Failed to fetch products: 500 Internal Server Error',
    );
  });

  it('throws when response payload does not match schema', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      // Missing required fields / wrong types to trigger Zod failure
      json: async () => ({
        products: [
          {
            id: 'not-a-number',
          },
        ],
      }),
    } as any);

    await expect(fetchProductsByCategory(1)).rejects.toThrow(
      'Invalid products data received from server',
    );
  });
});

describe('fetchAllProducts', () => {
  // Silence expected error logging in tests that exercise failure paths
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and transforms all products on success', async () => {
    const fetchSpy = vi
      .spyOn(globalThis as any, 'fetch')
      .mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          products: [
            {
              id: 2,
              category_id: 20,
              category_name: 'Accessories',
              name: 'Camera Bag',
              description: 'Protective bag',
              price: 50_00,
              sale_price: null,
              image_thumbnail: '/images/bag-thumb.jpg',
              image_medium: '/images/bag-medium.jpg',
              image_large: '/images/bag-large.jpg',
            },
          ],
        }),
      } as any);

    const products = await fetchAllProducts();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = (fetchSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(calledUrl).toContain('/api/demo/products');

    expect(products).toEqual([
      {
        id: 2,
        categoryId: 20,
        categoryName: 'Accessories',
        name: 'Camera Bag',
        description: 'Protective bag',
        price: 50_00,
        salePrice: null,
        imageThumbnail: '/images/bag-thumb.jpg',
        imageMedium: '/images/bag-medium.jpg',
        imageLarge: '/images/bag-large.jpg',
      },
    ]);
  });

  it('throws a generic error for non-OK responses', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({}),
    } as any);

    await expect(fetchAllProducts()).rejects.toThrow(
      'Failed to fetch products: 503 Service Unavailable',
    );
  });

  it('throws when response payload does not match schema', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        // Missing "products" key entirely
        items: [],
      }),
    } as any);

    await expect(fetchAllProducts()).rejects.toThrow(
      'Invalid products data received from server',
    );
  });

  it('wraps non-Error rejections in an unexpected error', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockRejectedValue('network down');

    await expect(fetchAllProducts()).rejects.toThrow(
      'An unexpected error occurred while fetching products',
    );
  });
});
