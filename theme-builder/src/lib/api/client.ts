const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('jwt_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token and reload page to show login form
      localStorage.removeItem('jwt_token');
      window.location.href = '/';
      throw new ApiError('Authentication failed', 401);
    }

    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // Response might not be JSON
    }

    const errorMessage =
      errorData.message ||
      errorData.error ||
      `Request failed: ${response.statusText}`;

    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
}
