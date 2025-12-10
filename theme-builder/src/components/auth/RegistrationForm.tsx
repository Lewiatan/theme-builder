import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { register, AuthenticationError } from '@/lib/api/auth';
import type { ValidationErrors } from '@/types/auth';

export function RegistrationForm() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
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
   * Handles shop name input change
   * Clears shop name validation error when user starts typing
   */
  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShopName(e.target.value);
    // Clear shop name error when user starts typing
    if (validationErrors.shopName) {
      setValidationErrors((prev) => ({ ...prev, shopName: undefined }));
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

    // Shop name validation
    if (!shopName.trim()) {
      errors.shopName = 'Shop name is required';
    } else if (shopName.trim().length < 3) {
      errors.shopName = 'Shop name must be at least 3 characters';
    } else if (shopName.trim().length > 50) {
      errors.shopName = 'Shop name must be at most 50 characters';
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(shopName)) {
      errors.shopName = 'Shop name can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  /**
   * Handles form submission
   * Validates inputs, calls register API, handles success/error responses
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
      // Call register API
      await register({
        email,
        password,
        shopName,
      });

      // Show success toast and redirect immediately
      toast.success('Account created successfully! Redirecting to login...');
      navigate('/login');
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

      // Clear loading state on error
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900" data-testid="register-header">
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate data-testid="register-form">
          {/* API Error Alert */}
          {apiError && (
            <Alert variant="destructive" data-testid="api-error">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" data-testid="email-label">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={validationErrors.email ? 'border-red-500' : ''}
              disabled={isLoading}
              data-testid="email-input"
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600" data-testid="email-error">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" data-testid="password-label">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              className={validationErrors.password ? 'border-red-500' : ''}
              disabled={isLoading}
              data-testid="password-input"
            />
            {validationErrors.password && (
              <p className="text-sm text-red-600" data-testid="password-error">{validationErrors.password}</p>
            )}
          </div>

          {/* Shop Name Field */}
          <div className="space-y-2">
            <Label htmlFor="shopName" data-testid="shop-name-label">Shop Name</Label>
            <Input
              id="shopName"
              type="text"
              value={shopName}
              onChange={handleShopNameChange}
              placeholder="Enter your shop name"
              className={validationErrors.shopName ? 'border-red-500' : ''}
              disabled={isLoading}
              data-testid="shop-name-input"
            />
            {validationErrors.shopName && (
              <p className="text-sm text-red-600" data-testid="shop-name-error">{validationErrors.shopName}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="submit-button"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500" data-testid="login-link">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
