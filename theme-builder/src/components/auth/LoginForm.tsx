import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [token, setToken] = useState(import.meta.env.VITE_DEFAULT_JWT_TOKEN || '');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (token.trim()) {
      localStorage.setItem('jwt_token', token.trim());
      // Dispatch custom event to notify App component of auth change
      window.dispatchEvent(new Event('auth-change'));
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900" data-testid="login-header">
          Theme Builder Login
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Enter your JWT token to access the workspace
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="token">JWT Token</Label>
            <textarea
              id="token"
              data-testid="token-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="mt-1 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!token.trim()} data-testid="login-button">
            Login
          </Button>
        </form>

        <div className="mt-6 rounded-md bg-blue-50 p-4">
          <p className="text-xs text-blue-900">
            <strong>For testing:</strong> Get a valid JWT token from the backend API and paste it above.
          </p>
        </div>
      </div>
    </div>
  );
}
