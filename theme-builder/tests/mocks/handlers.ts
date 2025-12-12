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

  // Register endpoint - matches backend AuthController responses
  http.post(`${API_BASE_URL}/api/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string; shopName: string };

    // Mock successful registration - matches backend 201 response
    if (body.email === 'newuser@example.com' && body.shopName !== 'Existing Shop') {
      return HttpResponse.json(
        {
          message: 'Registration successful',
        },
        { status: 201 }
      );
    }

    // Mock email already exists - matches backend 409 response
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          error: 'email_exists',
          message: 'An account with this email already exists',
          field: 'email',
        },
        { status: 409 }
      );
    }

    // Mock shop name already exists - matches backend 409 response
    if (body.shopName === 'Existing Shop') {
      return HttpResponse.json(
        {
          error: 'shop_name_exists',
          message: 'A shop with this name already exists',
          field: 'shopName',
        },
        { status: 409 }
      );
    }

    // Mock server error - matches backend 500 response
    if (body.email === 'server-error@example.com') {
      return HttpResponse.json(
        {
          error: 'registration_failed',
          message: 'Registration failed. Please try again.',
        },
        { status: 500 }
      );
    }

    // Default to successful registration for any other valid input
    return HttpResponse.json(
      {
        message: 'Registration successful',
      },
      { status: 201 }
    );
  }),
];
