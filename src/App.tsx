import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import AuthPage from './routes/AuthPage'
import AuthCallback from './routes/AuthCallback'
import Onboarding from './routes/Onboarding'
import StreamPage from './routes/StreamPage'
import Dashboard from './routes/Dashboard'
import ResetPassword from './routes/ResetPassword'
import AdminPanel from './routes/AdminPanel'
import Profile from './routes/Profile'
import Layout from './components/Layout'
import { useAuth } from './context/AuthProvider'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth()
  const location = useLocation()
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Redirect to login if no session
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  
  // Redirect to onboarding if session but no profile
  if (session && !profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  
  return <>{children}</>
}

// Admin Protected Route
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Checking permissions...</p>
        </div>
      </div>
    )
  }
  
  // Check if user is admin
  if (!session || !profile || !profile.is_admin) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

// Public Route Component (only for auth-related pages)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If user is already authenticated, redirect to appropriate page
  if (session && profile) {
    return <Navigate to="/dashboard" replace />
  }
  
  if (session && !profile) {
    return <Navigate to="/onboarding" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  const { session, profile, loading } = useAuth()
  
  return (
    <Layout>
      <Routes>
        {/* Public Routes - Only accessible when NOT logged in */}
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
        />
        
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes - Only accessible when logged in */}
        <Route 
          path="/onboarding" 
          element={
            session ? (
              profile ? <Navigate to="/dashboard" replace /> : <Onboarding />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/stream" 
          element={
            <ProtectedRoute>
              <StreamPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route - Only for admin users */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } 
        />
        
        {/* Default Route - Redirect based on auth status */}
        <Route 
          path="/" 
          element={
            loading ? (
              <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm">Loading...</p>
                </div>
              </div>
            ) : session ? (
              profile ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        {/* Catch-all Route - Redirect to dashboard or auth */}
        <Route 
          path="*" 
          element={
            loading ? (
              <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm">Loading...</p>
                </div>
              </div>
            ) : session ? (
              profile ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
    </Layout>
  )
}
