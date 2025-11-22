import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useProducts } from '~/hooks/useProducts';
import * as apiProducts from '~/lib/api-products';

// Mock URL search params used by the hook
let searchParamsValue = '';

vi.mock('react-router', () => ({
  useSearchParams: () => [new URLSearchParams(searchParamsValue), vi.fn()],
}));

vi.mock('~/lib/api-products', async () => {
  const actual = await vi.importActual<typeof import('~/lib/api-products')>(
    '~/lib/api-products',
  );

  return {
    ...actual,
    fetchAllProducts: vi.fn(),
    fetchProductsByCategory: vi.fn(),
  };
});

function ProductsTestHarness() {
  const { products, isLoading, error, categoryId, refetch } = useProducts();

  return (
    <div>
      <div data-testid="is-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="category-id">
        {categoryId === null ? 'null' : String(categoryId)}
      </div>
      <div data-testid="error-message">{error?.message ?? ''}</div>
      <div data-testid="products-count">{products.length}</div>
      <button
        type="button"
        data-testid="refetch-button"
        onClick={() => refetch()}
      >
        Refetch
      </button>
    </div>
  );
}

describe('useProducts', () => {
  const mockedFetchAll = vi.mocked(apiProducts.fetchAllProducts);
  const mockedFetchByCategory = vi.mocked(apiProducts.fetchProductsByCategory);

  beforeEach(() => {
    searchParamsValue = '';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all products when no category param is present', async () => {
    mockedFetchAll.mockResolvedValueOnce([
      {
        id: 1,
        categoryId: 10,
        name: 'Product A',
        description: 'Desc',
        price: 100_00,
        salePrice: null,
        imageThumbnail: '/thumb-a.jpg',
        imageMedium: '/medium-a.jpg',
        imageLarge: '/large-a.jpg',
      },
    ] as any);

    render(<ProductsTestHarness />);

    expect(screen.getByTestId('is-loading').textContent).toBe('true');
    expect(screen.getByTestId('category-id').textContent).toBe('null');

    await waitFor(() =>
      expect(mockedFetchAll).toHaveBeenCalledTimes(1),
    );

    await waitFor(() =>
      expect(screen.getByTestId('is-loading').textContent).toBe('false'),
    );

    expect(screen.getByTestId('products-count').textContent).toBe('1');
    expect(screen.getByTestId('error-message').textContent).toBe('');
    expect(mockedFetchByCategory).not.toHaveBeenCalled();
  });

  it('fetches products for the category from search params', async () => {
    searchParamsValue = 'category=5';

    mockedFetchByCategory.mockResolvedValueOnce([
      {
        id: 2,
        categoryId: 5,
        name: 'Product B',
        description: 'Desc',
        price: 200_00,
        salePrice: 150_00,
        imageThumbnail: '/thumb-b.jpg',
        imageMedium: '/medium-b.jpg',
        imageLarge: '/large-b.jpg',
      },
    ] as any);

    render(<ProductsTestHarness />);

    await waitFor(() =>
      expect(mockedFetchByCategory).toHaveBeenCalledWith(5),
    );

    await waitFor(() =>
      expect(screen.getByTestId('is-loading').textContent).toBe('false'),
    );

    expect(screen.getByTestId('category-id').textContent).toBe('5');
    expect(screen.getByTestId('products-count').textContent).toBe('1');
    expect(mockedFetchAll).not.toHaveBeenCalled();
  });

  it('treats invalid category param as null and fetches all products', async () => {
    searchParamsValue = 'category=abc';

    mockedFetchAll.mockResolvedValueOnce([] as any);

    render(<ProductsTestHarness />);

    await waitFor(() =>
      expect(mockedFetchAll).toHaveBeenCalledTimes(1),
    );

    expect(screen.getByTestId('category-id').textContent).toBe('null');
    expect(screen.getByTestId('products-count').textContent).toBe('0');
    expect(mockedFetchByCategory).not.toHaveBeenCalled();
  });

  it('sets error state when the underlying fetch throws', async () => {
    mockedFetchAll.mockRejectedValueOnce(new Error('Network failed'));

    render(<ProductsTestHarness />);

    await waitFor(() =>
      expect(screen.getByTestId('is-loading').textContent).toBe('false'),
    );

    expect(screen.getByTestId('error-message').textContent).toBe(
      'Network failed',
    );
    expect(screen.getByTestId('products-count').textContent).toBe('0');
  });

  it('refetches products when refetch is called', async () => {
    const user = userEvent.setup();

    mockedFetchAll
      .mockResolvedValueOnce([] as any)
      .mockResolvedValueOnce([
        {
          id: 3,
          categoryId: 10,
          name: 'Refetched Product',
          description: 'Desc',
          price: 300_00,
          salePrice: null,
          imageThumbnail: '/thumb-c.jpg',
          imageMedium: '/medium-c.jpg',
          imageLarge: '/large-c.jpg',
        },
      ] as any);

    render(<ProductsTestHarness />);

    await waitFor(() =>
      expect(mockedFetchAll).toHaveBeenCalledTimes(1),
    );

    await user.click(screen.getByTestId('refetch-button'));

    await waitFor(() =>
      expect(mockedFetchAll).toHaveBeenCalledTimes(2),
    );

    await waitFor(() =>
      expect(screen.getByTestId('products-count').textContent).toBe('1'),
    );
  });
});

