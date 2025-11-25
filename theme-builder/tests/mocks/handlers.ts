import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8000';

export const handlers = [
  // Login endpoint - matches backend AuthController responses
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Mock successful login - matches backend 200 response
    if (body.email === 'user@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token-12345',
      });
    }

    // Mock invalid credentials - matches backend 401 response
    if (body.email === 'wrong@example.com' || body.password === 'wrongpassword') {
      return HttpResponse.json(
        {
          error: 'invalid_credentials',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Mock validation error - matches backend 400 response
    if (body.email === 'invalid-email') {
      return HttpResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid email format',
          field: 'email',
        },
        { status: 400 }
      );
    }

    // Mock server error - matches backend 500 response
    if (body.email === 'server-error@example.com') {
      return HttpResponse.json(
        {
          error: 'login_failed',
          message: 'Login failed. Please try again.',
        },
        { status: 500 }
      );
    }

    // Default to invalid credentials
    return HttpResponse.json(
      {
        error: 'invalid_credentials',
        message: 'Invalid email or password',
      },
      { status: 401 }
    );
  }),
];
