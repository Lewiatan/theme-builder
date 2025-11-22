import { describe, it, expect, afterAll } from 'vitest';
import { buildApiUrl } from '~/lib/api';

describe('buildApiUrl', () => {
  const originalApiUrl = import.meta.env.VITE_API_URL;

  it('uses VITE_API_URL on the client and normalizes slashes', () => {
    (import.meta as any).env.VITE_API_URL = 'http://localhost:8000/';

    const withLeadingSlash = buildApiUrl('/api/demo/products');
    const withoutLeadingSlash = buildApiUrl('api/demo/products');

    expect(withLeadingSlash).toBe('http://localhost:8000/api/demo/products');
    expect(withoutLeadingSlash).toBe('http://localhost:8000/api/demo/products');
  });

  it('falls back to default browser URL when VITE_API_URL is not set', () => {
    (import.meta as any).env.VITE_API_URL = '';

    const url = buildApiUrl('/api/demo/categories');

    expect(url).toBe('http://localhost:8000/api/demo/categories');
  });

  it('uses Docker internal URL when running server-side (no window)', () => {
    const originalWindow = (globalThis as any).window;

    try {
      (globalThis as any).window = undefined;
      (import.meta as any).env.VITE_API_URL = 'http://example.com:1234';

      const url = buildApiUrl('/api/internal/health');

      expect(url).toBe('http://nginx:80/api/internal/health');
    } finally {
      (globalThis as any).window = originalWindow;
      (import.meta as any).env.VITE_API_URL = originalApiUrl;
    }
  });

  // Restore original env value after all tests in this suite
  afterAll(() => {
    (import.meta as any).env.VITE_API_URL = originalApiUrl;
  });
});

