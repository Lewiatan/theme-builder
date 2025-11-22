import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { WorkspaceView } from './components/workspace/WorkspaceView'
import { LoginForm } from './components/auth/LoginForm'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has a token
    const token = localStorage.getItem('jwt_token')
    setIsAuthenticated(!!token)

    // Listen for storage changes (for cross-tab synchronization)
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('jwt_token')
      setIsAuthenticated(!!currentToken)
    }

    window.addEventListener('storage', handleStorageChange)

    // Listen for custom auth events (for same-tab synchronization)
    const handleAuthChange = () => {
      const currentToken = localStorage.getItem('jwt_token')
      setIsAuthenticated(!!currentToken)
    }

    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginForm />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <WorkspaceProvider>
                <WorkspaceView />
              </WorkspaceProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>
  )
}

export default App
