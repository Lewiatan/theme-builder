import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/api/auth/login`, () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: 1,
        email: 'test@example.com',
        shopId: 1,
      },
    });
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
