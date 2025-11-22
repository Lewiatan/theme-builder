import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCategories } from '~/lib/api-categories';

describe('fetchCategories', () => {
  // Silence expected error logging for failure-path tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and returns categories on success', async () => {
    const fetchSpy = vi
      .spyOn(globalThis as any, 'fetch')
      .mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          categories: [
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Clothing' },
          ],
        }),
      } as any);

    const categories = await fetchCategories();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = (fetchSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(calledUrl).toContain('/api/demo/categories');

    expect(categories).toEqual([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
    ]);
  });

  it('throws a generic error for non-OK responses', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    } as any);

    await expect(fetchCategories()).rejects.toThrow(
      'Failed to fetch categories: 500 Internal Server Error',
    );
  });

  it('throws when response payload does not match schema', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      // Invalid shape: missing "categories" key
      json: async () => ({
        items: [],
      }),
    } as any);

    await expect(fetchCategories()).rejects.toThrow(
      'Invalid categories data received from server',
    );
  });

  it('wraps non-Error rejections in an unexpected error', async () => {
    vi.spyOn(globalThis as any, 'fetch').mockRejectedValue('network down');

    await expect(fetchCategories()).rejects.toThrow(
      'An unexpected error occurred while fetching categories',
    );
  });
});

