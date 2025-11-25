import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login, AuthenticationError } from '@/lib/api/auth';
import type { ValidationErrors } from '@/types/auth';

export function LoginForm() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  /**
   * Handles email input change
   * Clears email validation error when user starts typing
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear email error when user starts typing
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  /**
   * Handles password input change
   * Clears password validation error when user starts typing
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear password error when user starts typing
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  /**
   * Validates form fields before submission
   * Returns validation errors object or null if valid
   */
  const validateForm = (): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      errors.password = 'Password is required';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  /**
   * Handles form submission
   * Validates inputs, calls login API, handles success/error responses
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setApiError(null);
    setValidationErrors({});

    // Client-side validation
    const errors = validateForm();
    if (errors) {
      setValidationErrors(errors);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Call login API
      const response = await login({ email, password });

      // Store token in localStorage
      localStorage.setItem('jwt_token', response.token);

      // Dispatch custom event to notify App component of auth change
      window.dispatchEvent(new Event('auth-change'));

      // Navigate to workspace
      navigate('/', { replace: true });
    } catch (error) {
      // Handle authentication errors
      if (error instanceof AuthenticationError) {
        setApiError(error.message);

        // If field-specific error, also set validation error
        if (error.field) {
          setValidationErrors({ [error.field]: error.message });
        }
      } else {
        // Handle unexpected errors
        setApiError('Unable to connect. Please check your internet connection.');
      }
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Theme Builder Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* API Error Alert */}
          {apiError && (
            <Alert variant="destructive">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={validationErrors.email ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              className={validationErrors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p className="text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
