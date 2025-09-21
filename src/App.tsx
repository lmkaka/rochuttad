import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

// Navigation tracking service
class NavigationTracker {
  private static instance: NavigationTracker
  private allowedRoutes: Set<string> = new Set()
  private visitedPages: Set<string> = new Set()
  
  static getInstance(): NavigationTracker {
    if (!NavigationTracker.instance) {
      NavigationTracker.instance = new NavigationTracker()
    }
    return NavigationTracker.instance
  }
  
  // Allow access to a route
  allowRoute(route: string): void {
    this.allowedRoutes.add(route)
    this.visitedPages.add(route)
    // Store in sessionStorage to persist across page refreshes
    sessionStorage.setItem('allowedRoutes', JSON.stringify(Array.from(this.allowedRoutes)))
    sessionStorage.setItem('visitedPages', JSON.stringify(Array.from(this.visitedPages)))
  }
  
  // Check if route is allowed
  isRouteAllowed(route: string): boolean {
    // Load from sessionStorage on first check
    if (this.allowedRoutes.size === 0) {
      const stored = sessionStorage.getItem('allowedRoutes')
      if (stored) {
        const routes = JSON.parse(stored)
        routes.forEach((r: string) => this.allowedRoutes.add(r))
      }
    }
    return this.allowedRoutes.has(route)
  }
  
  // Check if user has visited dashboard
  hasVisitedDashboard(): boolean {
    if (this.visitedPages.size === 0) {
      const stored = sessionStorage.getItem('visitedPages')
      if (stored) {
        const pages = JSON.parse(stored)
        pages.forEach((p: string) => this.visitedPages.add(p))
      }
    }
    return this.visitedPages.has('/dashboard')
  }
  
  // Reset tracking (on logout)
  reset(): void {
    this.allowedRoutes.clear()
    this.visitedPages.clear()
    sessionStorage.removeItem('allowedRoutes')
    sessionStorage.removeItem('visitedPages')
  }
  
  // Block direct access to protected routes
  blockDirectAccess(): void {
    // Clear any stored allowed routes on direct page load
    if (!document.referrer || !document.referrer.includes(window.location.origin)) {
      this.reset()
    }
  }
}

// Protected Route Component with Navigation Tracking
const ProtectedRoute = ({ 
  children, 
  requiresDashboardVisit = false, 
  routePath 
}: { 
  children: React.ReactNode
  requiresDashboardVisit?: boolean
  routePath: string
}) => {
  const { session, profile, loading } = useAuth()
  const location = useLocation()
  const tracker = NavigationTracker.getInstance()
  
  useEffect(() => {
    // Block direct access on initial load
    if (!loading) {
      tracker.blockDirectAccess()
    }
  }, [loading])
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Verifying access...</p>
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
  
  // For routes that require dashboard visit (like /stream)
  if (requiresDashboardVisit && !tracker.hasVisitedDashboard()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center text-white p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-slate-400 mb-6">
            Please navigate through the dashboard to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  // Check if route is allowed for other protected routes
  if (!tracker.isRouteAllowed(routePath) && routePath !== '/dashboard') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

// Dashboard Route Component with Route Allowance
const DashboardRoute = ({ children }: { children: React.ReactNode }) => {
  const tracker = NavigationTracker.getInstance()
  
  useEffect(() => {
    // Allow dashboard and grant access to other routes
    tracker.allowRoute('/dashboard')
    tracker.allowRoute('/profile')
    tracker.allowRoute('/stream')
    // Add any other routes that should be accessible after visiting dashboard
  }, [])
  
  return <>{children}</>
}

// Public Route Component
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
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    // Reset navigation tracking on logout
    if (!session) {
      const tracker = NavigationTracker.getInstance()
      tracker.reset()
    }
    setIsInitialized(true)
  }, [session])
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Initializing...</p>
        </div>
      </div>
    )
  }
  
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
        
        {/* Onboarding Route */}
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
        
        {/* Dashboard Route - Entry point for navigation */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute routePath="/dashboard">
              <DashboardRoute>
                <Dashboard />
              </DashboardRoute>
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Routes - Require login and dashboard visit */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute routePath="/profile">
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/stream" 
          element={
            <ProtectedRoute routePath="/stream" requiresDashboardVisit={true}>
              <StreamPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route - Special access */}
        <Route 
          path="/admin" 
          element={
            session && profile?.is_admin ? (
              <AdminPanel />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        {/* Default Route - Always redirect to dashboard */}
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
        
        {/* Catch-all Route - Block all direct access */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="max-w-md mx-auto text-center text-white p-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
                <p className="text-slate-400 mb-6">
                  The page you're looking for doesn't exist or access is restricted.
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </Layout>
  )
}
