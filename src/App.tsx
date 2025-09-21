import { Route, Routes, Navigate } from 'react-router-dom'
import AuthPage from './routes/AuthPage'
import AuthCallback from './routes/AuthCallback'
import Onboarding from './routes/Onboarding'
import Dashboard from './routes/Dashboard'
import ResetPassword from './routes/ResetPassword'
import AdminPanel from './routes/AdminPanel'
import Profile from './routes/Profile'
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
        
        {/* Auth Callback Route for Google OAuth */}
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
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
          element={<AdminPanel />} 
        />
        
        {/* Default Route */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" />} 
        />

        <Route path="/reset-password" element={<ResetPassword />} />
        
      </Routes>
    </Layout>
  )
}
