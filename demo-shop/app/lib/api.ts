// API configuration and utilities

/**
 * Gets the appropriate API URL based on execution context
 * - Server-side (SSR loader): Use SERVER_API_URL or fallback to Docker service networking (nginx:80)
 * - Client-side (browser): Use VITE_API_URL environment variable (localhost:8000)
 */
function getApiUrl(): string {
  // Check if running server-side (Node.js) or client-side (browser)
  const isServerSide = typeof window === 'undefined';

  if (isServerSide) {
    // Server-side: Use dedicated SERVER_API_URL (for Docker/SSR) or fallback to nginx service name
    return process.env.SERVER_API_URL || process.env.VITE_API_URL || 'http://nginx:80';
  }

  // Client-side: Use environment variable for browser requests
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
}

/**
 * Constructs a full API URL from a path
 * Dynamically determines the correct base URL based on execution context
 * @param path - API endpoint path (e.g., '/api/public/shops/123')
 * @returns Full API URL
 */
export function buildApiUrl(path: string): string {
  const apiUrl = getApiUrl();
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
