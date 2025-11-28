import type {
  LoginRequest,
  LoginResponse,
  LoginError,
  RegisterRequest,
  RegisterResponse,
  RegisterError,
} from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Custom error class for authentication-related errors
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authenticates user with email and password credentials
 *
 * @param credentials - User email and password
 * @returns Promise resolving to LoginResponse with JWT token
 * @throws AuthenticationError for authentication failures or network errors
 *
 * @example
 * ```typescript
 * try {
 *   const response = await login({ email: 'user@example.com', password: 'password' });
 *   console.log('Token:', response.token);
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     console.error('Auth failed:', error.message, error.code);
 *   }
 * }
 * ```
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorData: LoginError;

    try {
      errorData = await response.json();
    } catch {
      // If response body is not JSON, throw network error
      throw new AuthenticationError(
        'Network error. Please try again.',
        'network_error'
      );
    }

    // Throw authentication error with message and code from API
    throw new AuthenticationError(
      errorData.message,
      errorData.error,
      errorData.field
    );
  }

  return response.json();
}

/**
 * Registers a new user with shop and default pages
 *
 * @param credentials - User email, password, and shop name
 * @returns Promise resolving to RegisterResponse with userId
 * @throws AuthenticationError for registration failures or network errors
 *
 * @example
 * ```typescript
 * try {
 *   const response = await register({
 *     email: 'user@example.com',
 *     password: 'SecurePass123!',
 *     shopName: 'My Shop'
 *   });
 *   console.log('User ID:', response.userId);
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     console.error('Registration failed:', error.message, error.code);
 *   }
 * }
 * ```
 */
export async function register(
  credentials: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorData: RegisterError;

    try {
      errorData = await response.json();
    } catch {
      // If response body is not JSON, throw network error
      throw new AuthenticationError(
        'Network error. Please try again.',
        'network_error'
      );
    }

    // Throw authentication error with message and code from API
    throw new AuthenticationError(
      errorData.message,
      errorData.error,
      errorData.field
    );
  }

  return response.json();
}
