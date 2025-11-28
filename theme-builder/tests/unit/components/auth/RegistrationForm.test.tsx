import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { server } from '../../../mocks/server';
import { toast } from 'sonner';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Start MSW server before all tests
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
  vi.mocked(toast.success).mockClear();
});
afterAll(() => server.close());

describe('RegistrationForm', () => {
  const renderRegistrationForm = () => {
    return render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('renders email, password, and shop name fields', () => {
      renderRegistrationForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shop name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders with correct heading', () => {
      renderRegistrationForm();

      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    it('has no error messages initially', () => {
      renderRegistrationForm();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/shop name is required/i)).not.toBeInTheDocument();
    });

    it('submit button is initially enabled', () => {
      renderRegistrationForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      expect(submitButton).toBeEnabled();
    });

    it('renders link to login page', () => {
      renderRegistrationForm();

      const loginLink = screen.getByRole('link', { name: /log in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('shows error when password is empty', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(shopNameInput, 'Test Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('shows error when shop name is empty', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/shop name is required/i)).toBeInTheDocument();
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'Test Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('shows error when shop name is too short', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'ab'); // Only 2 characters

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/shop name must be at least 3 characters/i)).toBeInTheDocument();
    });

    it('shows error when shop name is too long', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'a'.repeat(51)); // 51 characters

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/shop name must be at most 50 characters/i)).toBeInTheDocument();
    });

    it('shows error when shop name contains invalid characters', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'Test@Shop!'); // Contains @ and !

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/shop name can only contain letters, numbers, spaces, hyphens, and underscores/i)).toBeInTheDocument();
    });

    it('clears email error when user starts typing', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();

      // Start typing in email field
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 't');

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });

    it('clears password error when user starts typing', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      // Fill email and shop name, trigger validation
      const emailInput = screen.getByLabelText(/email/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(shopNameInput, 'Test Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();

      // Start typing in password field
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'p');

      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });

    it('clears shop name error when user starts typing', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      // Fill email and password, trigger validation
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText(/shop name is required/i)).toBeInTheDocument();

      // Start typing in shop name field
      const shopNameInput = screen.getByLabelText(/shop name/i);
      await user.type(shopNameInput, 'T');

      expect(screen.queryByText(/shop name is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Successful Registration', () => {
    it('successfully registers with valid credentials', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Account created successfully! Redirecting to login...');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Start submission - don't await so we can check loading state
      user.click(submitButton);

      // Check for loading state - button text changes and becomes disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();

      // Wait for submission to complete
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('redirects to login immediately after success', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Verify instant redirect (no delay)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 100 }); // Should happen very quickly
    });
  });

  describe('Error Scenarios', () => {
    it('displays error for email already exists', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('displays error for shop name already exists', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'Existing Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/a shop with this name already exists/i)).toBeInTheDocument();
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('displays error for validation error', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Client-side validation should catch this before API call
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('displays error for server error', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'server-error@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/registration failed\. please try again\./i)).toBeInTheDocument();
      });
    });

    it('form remains interactive after error', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      // Trigger error
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });

      // Form should still be usable
      expect(emailInput).toBeEnabled();
      expect(passwordInput).toBeEnabled();
      expect(shopNameInput).toBeEnabled();
      expect(submitButton).toBeEnabled();
    });

    it('clears API error on new submission attempt', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      // First attempt with existing email
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      let submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });

      // Clear and retry with new email
      await user.clear(emailInput);
      await user.clear(passwordInput);
      await user.clear(shopNameInput);
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Error should be cleared during new submission
      await waitFor(() => {
        expect(screen.queryByText(/an account with this email already exists/i)).not.toBeInTheDocument();
      });
    });

    it('shows field-specific error when provided by API', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'New Shop');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Both API error alert and field-specific error should be shown
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation', () => {
    it('accepts valid shop names with letters, numbers, spaces, hyphens, and underscores', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const shopNameInput = screen.getByLabelText(/shop name/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(shopNameInput, 'My Test Shop-2024_v1');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });
});
