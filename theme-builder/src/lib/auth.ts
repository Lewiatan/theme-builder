/**
 * Decodes a JWT token and returns the payload
 */
export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Gets the shop ID from the stored JWT token
 */
export function getShopIdFromToken(): string | null {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    return null;
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  // Extract shopId from the token payload
  // Adjust the key based on what the backend actually puts in the JWT
  return payload.shopId || payload.shop_id || null;
}

/**
 * Gets the user ID from the stored JWT token
 */
export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    return null;
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return payload.sub || payload.userId || payload.user_id || null;
}
