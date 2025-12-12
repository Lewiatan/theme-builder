import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { server } from '../../../mocks/server';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Start MSW server before all tests
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
  localStorage.clear();
});
afterAll(() => server.close());

describe('LoginForm', () => {
  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('renders email and password fields', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('renders with correct heading', () => {
      renderLoginForm();

      expect(screen.getByRole('heading', { name: /theme builder login/i })).toBeInTheDocument();
    });

    it('has no error messages initially', () => {
      renderLoginForm();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });

    it('submit button is initially enabled', () => {
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeEnabled();
    });
  });

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Validation errors are shown in <p> tags with text-red-600 class
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('shows error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('clears email error when user starts typing', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();

      // Start typing in email field
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 't');

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });

    it('clears password error when user starts typing', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      // Fill email and trigger validation
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();

      // Start typing in password field
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'p');

      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Successful Login', () => {
    it('successfully logs in with valid credentials', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('jwt_token')).toBe('mock-jwt-token-12345');
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();

      // Add delay to login endpoint for this test only
      const { http, HttpResponse, delay } = await import('msw');
      server.use(
        http.post('http://localhost:8000/api/auth/login', async () => {
          await delay(300); // 300ms delay to catch loading state
          return HttpResponse.json({
            token: 'mock-jwt-token-12345',
          });
        })
      );

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });

      // Start submission without awaiting
      const clickPromise = user.click(submitButton);

      // Check for loading state - button text changes and becomes disabled
      await waitFor(
        () => {
          const button = screen.queryByRole('button', { name: /logging in/i });
          expect(button).toBeInTheDocument();
          expect(button).toBeDisabled();
        },
        { timeout: 1000 }
      );

      // Wait for submission to complete
      await clickPromise;
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('dispatches auth-change event on successful login', async () => {
      const user = userEvent.setup();
      const eventSpy = vi.fn();
      window.addEventListener('auth-change', eventSpy);

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(eventSpy).toHaveBeenCalled();
      });

      window.removeEventListener('auth-change', eventSpy);
    });
  });

  describe('Error Scenarios', () => {
    it('displays error for invalid credentials', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });

    it('displays error for server error', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'server-error@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed\. please try again\./i)).toBeInTheDocument();
      });
    });

    it('form remains interactive after error', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      // Trigger error
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      // Form should still be usable
      expect(emailInput).toBeEnabled();
      expect(passwordInput).toBeEnabled();
      expect(submitButton).toBeEnabled();
    });

    it('clears API error on new submission attempt', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      // First attempt with wrong credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');

      let submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      // Clear and retry with correct credentials
      await user.clear(emailInput);
      await user.clear(passwordInput);
      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Error should be cleared during new submission
      await waitFor(() => {
        expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
      });
    });
  });
});
