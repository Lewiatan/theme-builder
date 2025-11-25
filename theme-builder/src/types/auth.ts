/**
 * Authentication-related types for the Login View
 */

/**
 * Local form state for login form inputs
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Request DTO for POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response DTO for successful login
 * Contains JWT token returned by backend
 */
export interface LoginResponse {
  token: string;
}

/**
 * Error response DTO from login endpoint
 * Matches backend error format from AuthController
 */
export interface LoginError {
  error: 'invalid_credentials' | 'validation_error' | 'login_failed';
  message: string;
  field?: string; // Optional, for field-specific validation errors
  exception?: string; // Optional, in development mode only
  file?: string; // Optional, in development mode only
}

/**
 * Client-side validation errors mapped by field name
 */
export interface ValidationErrors {
  email?: string;
  password?: string;
}

/**
 * User information decoded from JWT token payload
 */
export interface UserInfo {
  id: string;
  email: string;
  shopId?: string;
}
