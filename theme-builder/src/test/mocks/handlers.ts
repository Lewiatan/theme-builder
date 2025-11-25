import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const handlers = [
  // Auth handlers - matches backend AuthController responses
  http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
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

  // Shop handlers
  http.get(`${API_URL}/api/shop`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test Shop',
      domain: 'test-shop.example.com',
    });
  }),

  // Pages handlers
  http.get(`${API_URL}/api/pages`, () => {
    return HttpResponse.json([
      {
        id: 1,
        type: 'home',
        name: 'Home',
        layout: { components: [] },
      },
      {
        id: 2,
        type: 'catalog',
        name: 'Catalog',
        layout: { components: [] },
      },
      {
        id: 3,
        type: 'product',
        name: 'Product',
        layout: { components: [] },
      },
      {
        id: 4,
        type: 'contact',
        name: 'Contact',
        layout: { components: [] },
      },
    ]);
  }),

  http.get(`${API_URL}/api/pages/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      type: 'home',
      name: 'Home',
      layout: { components: [] },
    });
  }),

  http.put(`${API_URL}/api/pages/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Theme handlers
  http.get(`${API_URL}/api/theme`, () => {
    return HttpResponse.json({
      id: 1,
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter',
    });
  }),

  http.put(`${API_URL}/api/theme`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),
];
