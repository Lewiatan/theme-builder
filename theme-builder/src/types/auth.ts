/**
 * Authentication-related types for Login and Registration Views
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
  shopName?: string;
}

/**
 * User information decoded from JWT token payload
 */
export interface UserInfo {
  id: string;
  email: string;
  shopId?: string;
}

/**
 * Local form state for registration form inputs
 */
export interface RegistrationFormData {
  email: string;
  password: string;
  shopName: string;
}

/**
 * Request DTO for POST /api/auth/register
 * Note: uses camelCase to match backend RegisterRequest DTO
 */
export interface RegisterRequest {
  email: string;
  password: string;
  shopName: string;
}

/**
 * Response DTO for successful registration
 * Contains only userId based on actual AuthController implementation
 */
export interface RegisterResponse {
  userId: string;
}

/**
 * Error response DTO from registration endpoint
 * Matches backend error format from AuthController
 */
export interface RegisterError {
  error: 'email_exists' | 'shop_exists' | 'validation_error' | 'registration_failed';
  message: string;
  field?: string; // Optional, for field-specific validation errors
  exception?: string; // Optional, in development mode only
  file?: string; // Optional, in development mode only
}
