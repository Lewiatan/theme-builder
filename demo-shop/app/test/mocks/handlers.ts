import { http, HttpResponse } from 'msw';

const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';

export const handlers = [
  // Shop public endpoint
  http.get(`${API_URL}/api/public/shop/:domain`, ({ params }) => {
    return HttpResponse.json({
      id: 1,
      name: 'Demo Shop',
      domain: params.domain,
    });
  }),

  // Pages public endpoint
  http.get(`${API_URL}/api/public/pages`, () => {
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

  // Theme public endpoint
  http.get(`${API_URL}/api/public/theme`, () => {
    return HttpResponse.json({
      id: 1,
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter',
    });
  }),

  // Mock products
  http.get(`${API_URL}/api/public/products`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Sample Product 1',
        price: 29.99,
        image: '/images/product1.jpg',
      },
      {
        id: 2,
        name: 'Sample Product 2',
        price: 49.99,
        image: '/images/product2.jpg',
      },
    ]);
  }),

  // Mock categories
  http.get(`${API_URL}/api/public/categories`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Home & Garden' },
    ]);
  }),
];
