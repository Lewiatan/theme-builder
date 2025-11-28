import { describe, it, expect } from 'vitest';
import { login, register, AuthenticationError } from '@/lib/api/auth';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Note: MSW server is started globally in src/test/setup.ts

describe('Auth API', () => {
  describe('login()', () => {
    it('returns token on successful login', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'password123',
      };

      const response = await login(credentials);

      expect(response).toEqual({
        token: 'mock-jwt-token-12345',
      });
    });

    it('throws AuthenticationError for invalid credentials (401)', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(login(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await login(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('Invalid email or password');
        expect((error as AuthenticationError).code).toBe('invalid_credentials');
      }
    });

    it('throws AuthenticationError for validation error (400)', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(login(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await login(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('Invalid email format');
        expect((error as AuthenticationError).code).toBe('validation_error');
        expect((error as AuthenticationError).field).toBe('email');
      }
    });

    it('throws AuthenticationError for server error (500)', async () => {
      const credentials = {
        email: 'server-error@example.com',
        password: 'password123',
      };

      await expect(login(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await login(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('Login failed. Please try again.');
        expect((error as AuthenticationError).code).toBe('login_failed');
      }
    });

    it('throws network error for non-JSON response', async () => {
      // Override handler to return non-JSON response
      server.use(
        http.post('http://localhost:8000/api/auth/login', () => {
          return new HttpResponse('Internal Server Error', { status: 500 });
        })
      );

      const credentials = {
        email: 'user@example.com',
        password: 'password123',
      };

      await expect(login(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await login(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('Network error. Please try again.');
        expect((error as AuthenticationError).code).toBe('network_error');
      }
    });

    it('includes field information in error when provided', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123',
      };

      try {
        await login(credentials);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).field).toBe('email');
      }
    });

    it('sends correct request payload', async () => {
      let capturedRequest: any = null;

      // Override handler to capture request
      server.use(
        http.post('http://localhost:8000/api/auth/login', async ({ request }) => {
          capturedRequest = await request.json();
          return HttpResponse.json({ token: 'test-token' });
        })
      );

      const credentials = {
        email: 'test@example.com',
        password: 'testpass',
      };

      await login(credentials);

      expect(capturedRequest).toEqual({
        email: 'test@example.com',
        password: 'testpass',
      });
    });

    it('sets correct request headers', async () => {
      let capturedHeaders: Headers | undefined;

      // Override handler to capture headers
      server.use(
        http.post('http://localhost:8000/api/auth/login', ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ token: 'test-token' });
        })
      );

      const credentials = {
        email: 'test@example.com',
        password: 'testpass',
      };

      await login(credentials);

      expect(capturedHeaders?.get('Content-Type')).toBe('application/json');
    });
  });

  describe('register()', () => {
    it('returns userId on successful registration', async () => {
      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
        shopName: 'New Shop',
      };

      const response = await register(credentials);

      expect(response).toEqual({
        userId: '550e8400-e29b-41d4-a716-446655440000',
      });
    });

    it('throws AuthenticationError for email already exists (409)', async () => {
      const credentials = {
        email: 'existing@example.com',
        password: 'password123',
        shopName: 'New Shop',
      };

      await expect(register(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await register(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('An account with this email already exists');
        expect((error as AuthenticationError).code).toBe('email_exists');
      }
    });

    it('throws AuthenticationError for shop name already exists (409)', async () => {
      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
        shopName: 'Existing Shop',
      };

      await expect(register(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await register(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('A shop with this name already exists');
        expect((error as AuthenticationError).code).toBe('shop_exists');
      }
    });

    it('throws AuthenticationError for validation error (400)', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123',
        shopName: 'New Shop',
      };

      await expect(register(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await register(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('Invalid email format');
        expect((error as AuthenticationError).code).toBe('validation_error');
        expect((error as AuthenticationError).field).toBe('email');
      }
    });

    it('throws AuthenticationError for server error (500)', async () => {
      const credentials = {
        email: 'server-error@example.com',
        password: 'password123',
        shopName: 'New Shop',
      };

      await expect(register(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await register(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('Registration failed. Please try again.');
        expect((error as AuthenticationError).code).toBe('registration_failed');
      }
    });

    it('throws network error for non-JSON response', async () => {
      // Override handler to return non-JSON response
      server.use(
        http.post('http://localhost:8000/api/auth/register', () => {
          return new HttpResponse('Internal Server Error', { status: 500 });
        })
      );

      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
        shopName: 'New Shop',
      };

      await expect(register(credentials)).rejects.toThrow(AuthenticationError);

      try {
        await register(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).message).toBe('Network error. Please try again.');
        expect((error as AuthenticationError).code).toBe('network_error');
      }
    });

    it('includes field information in error when provided', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123',
        shopName: 'New Shop',
      };

      try {
        await register(credentials);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).field).toBe('email');
      }
    });

    it('sends correct request payload with camelCase shopName', async () => {
      let capturedRequest: any = null;

      // Override handler to capture request
      server.use(
        http.post('http://localhost:8000/api/auth/register', async ({ request }) => {
          capturedRequest = await request.json();
          return HttpResponse.json({ userId: 'test-uuid' }, { status: 201 });
        })
      );

      const credentials = {
        email: 'test@example.com',
        password: 'testpass',
        shopName: 'Test Shop',
      };

      await register(credentials);

      expect(capturedRequest).toEqual({
        email: 'test@example.com',
        password: 'testpass',
        shopName: 'Test Shop', // Verify camelCase, not snake_case
      });
    });

    it('sets correct request headers', async () => {
      let capturedHeaders: Headers | null = null;

      // Override handler to capture headers
      server.use(
        http.post('http://localhost:8000/api/auth/register', ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ userId: 'test-uuid' }, { status: 201 });
        })
      );

      const credentials = {
        email: 'test@example.com',
        password: 'testpass',
        shopName: 'Test Shop',
      };

      await register(credentials);

      expect(capturedHeaders?.get('Content-Type')).toBe('application/json');
    });
  });

  describe('AuthenticationError', () => {
    it('creates error with message and code', () => {
      const error = new AuthenticationError('Test message', 'test_code');

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('test_code');
      expect(error.name).toBe('AuthenticationError');
    });

    it('creates error with optional field', () => {
      const error = new AuthenticationError('Test message', 'test_code', 'email');

      expect(error.field).toBe('email');
    });

    it('is instance of Error', () => {
      const error = new AuthenticationError('Test message', 'test_code');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AuthenticationError);
    });
  });
});
