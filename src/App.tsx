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
import Test from './routes/Test'
import Android from './routes/Android'
import Ios from './routes/Ios';
import Layout from './components/Layout'
import { useAuth } from './context/AuthProvider'

// Stream access tracker
const StreamAccessTracker = {
  // Set stream access when user comes from dashboard
  allowStreamAccess: () => {
    sessionStorage.setItem('streamAccessAllowed', 'true')
    sessionStorage.setItem('streamAccessTime', Date.now().toString())
  },
  
  // Check if stream access is allowed
  isStreamAccessAllowed: () => {
    const allowed = sessionStorage.getItem('streamAccessAllowed')
    const accessTime = sessionStorage.getItem('streamAccessTime')
    
    if (!allowed || !accessTime) return false
    
    // Access expires after 1 hour for security
    const currentTime = Date.now()
    const storedTime = parseInt(accessTime)
    const oneHour = 60 * 60 * 1000
    
    if (currentTime - storedTime > oneHour) {
      sessionStorage.removeItem('streamAccessAllowed')
      sessionStorage.removeItem('streamAccessTime')
      return false
    }
    
    return allowed === 'true'
  },
  
  // Reset stream access
  resetStreamAccess: () => {
    sessionStorage.removeItem('streamAccessAllowed')
    sessionStorage.removeItem('streamAccessTime')
  }
}

// Protected Stream Component
const ProtectedStreamRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile } = useAuth()
  const [accessChecked, setAccessChecked] = useState(false)
  
  useEffect(() => {
    // Check if user is coming from dashboard
    const referrer = document.referrer
    const fromDashboard = referrer.includes('/dashboard') && referrer.includes(window.location.origin)
    
    if (fromDashboard) {
      StreamAccessTracker.allowStreamAccess()
    }
    
    setAccessChecked(true)
  }, [])
  
  // Show loading while checking
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Verifying access...</p>
        </div>
      </div>
    )
  }
  
  // Check authentication first
  if (!session) {
    return <Navigate to="/auth" replace />
  }
  
  if (!profile) {
    return <Navigate to="/onboarding" replace />
  }
  
  // Check if user has proper stream access
  if (!StreamAccessTracker.isStreamAccessAllowed()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center text-white p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Stream Access Denied</h2>
          <p className="text-slate-400 mb-2">
            Direct access to stream is not allowed.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Please navigate through dashboard to watch streams.
          </p>
          <button
            onClick={() => {
              StreamAccessTracker.resetStreamAccess()
              window.location.href = '/dashboard'
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

// Enhanced Dashboard Component
const EnhancedDashboard = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Grant stream access when user visits dashboard
    StreamAccessTracker.allowStreamAccess()
  }, [])
  
  return <>{children}</>
}

export default function App() {
  const { session, profile } = useAuth()
  
  // Reset stream access on logout
  useEffect(() => {
    if (!session) {
      StreamAccessTracker.resetStreamAccess()
    }
  }, [session])

  return (
    <Layout>
      <Routes>
        {/* Auth Routes */}

                <Route 
          path="/auth" 
          element={session ? <Navigate to={profile ? '/dashboard' : '/onboarding'} /> : <AuthPage />} 
        />

        <Route 
          path="/Android" 
          element={<Android />} 
        />

               <Route 
          path="/Ios" 
          element={<Ios />} 
        />
        
        {/* Auth Callback Route for Google OAuth */}
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
        />
        
        {/* Reset Password Route */}
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        
        {/* Onboarding Route */}
        <Route 
          path="/onboarding" 
          element={session ? (profile ? <Navigate to="/dashboard" /> : <Onboarding />) : <Navigate to="/auth" />} 
        />
        
        {/* Dashboard Route - Enhanced with stream access granting */}
        <Route 
          path="/dashboard" 
          element={session ? (profile ? (
            <EnhancedDashboard>
              <Dashboard />
            </EnhancedDashboard>
          ) : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} 
        />
        
        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={session ? (profile ? <Profile /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} 
        />
        
        {/* Admin Panel Route */}
        <Route 
          path="/admin" 
          element={session ? (profile ? <AdminPanel /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} 
        />
        
        {/* PROTECTED Stream Route - Only accessible from dashboard */}
        <Route 
          path="/stream" 
          element={
            <ProtectedStreamRoute>
              <StreamPage />
            </ProtectedStreamRoute>
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" />} 
        />
        
        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" />} 
        />
      </Routes>
    </Layout>
  )
}
