import { Route, Routes, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
import Ios from './routes/Ios'
import stream from './stream'
import Layout from './components/Layout'
import { useAuth } from './context/AuthProvider'

export default function App() {
  const { session, profile } = useAuth()

  return (
    <Layout>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/auth" 
          element={session ? <Navigate to={profile ? '/dashboard' : '/onboarding'} /> : <AuthPage />} 
        />

        {/* Public Routes - No authentication required */}
        <Route 
          path="/Android" 
          element={<Android />} 
        />

        <Route 
          path="/Ios" 
          element={<Ios />} 
        />

        <Route 
          path="/streamok" 
          element={<stream />} 
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
        
        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={session ? (profile ? <Dashboard /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} 
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
        
        {/* **SIMPLIFIED: Direct Stream Route - No restrictions** */}
        <Route 
          path="/stream" 
          element={session ? (profile ? <StreamPage /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} 
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
