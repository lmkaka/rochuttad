import { Route, Routes, Navigate } from 'react-router-dom'
import AuthPage from './routes/AuthPage'
import Onboarding from './routes/Onboarding'
import Dashboard from './routes/Dashboard'
import AdminPanel from './routes/AdminPanel'
import Profile from './routes/Profile'  // Import Profile
import Layout from './components/Layout'
import { useAuth } from './context/AuthProvider'

export default function App() {
  const { session, profile } = useAuth()

  return (
    <Layout>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to={profile ? '/dashboard' : '/onboarding'} /> : <AuthPage />} />
        <Route path="/onboarding" element={session ? (profile ? <Navigate to="/dashboard" /> : <Onboarding />) : <Navigate to="/auth" />} />
        <Route path="/dashboard" element={session ? (profile ? <Dashboard /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profile" element={session ? (profile ? <Profile /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} />  {/* NEW PROFILE ROUTE */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  )
}
