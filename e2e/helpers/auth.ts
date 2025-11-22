/**
 * Authentication helper functions for E2E tests
 */

const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Gets a valid JWT token from the backend API for testing
 * Based on the seeded user: demo@example.com with shop ID 550e8400-e29b-41d4-a716-446655440002
 */
export async function createTestJWT(): Promise<string> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'demo@example.com',
      password: 'test123',
    }),
  });

  if (!response.ok) {
    // Try to get detailed error message from response body
    let errorDetails = '';
    try {
      const errorBody = await response.text();
      errorDetails = errorBody ? `\nResponse body: ${errorBody}` : '';
    } catch (e) {
      errorDetails = '\nCould not read response body';
    }
    throw new Error(`Failed to login: ${response.status} ${response.statusText}${errorDetails}`);
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error('No token in login response');
  }

  return data.token;
}

/**
 * Gets the shop ID from the test JWT
 */
export function getTestShopId(): string {
  return '550e8400-e29b-41d4-a716-446655440002';
}

/**
 * Gets the user ID from the test JWT
 */
export function getTestUserId(): string {
  return '550e8400-e29b-41d4-a716-446655440001';
}

/**
 * Gets the test user email
 */
export function getTestUserEmail(): string {
  return 'demo@example.com';
}
