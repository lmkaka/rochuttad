import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import { globalTheme } from './AuthPage'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const [tokenChecked, setTokenChecked] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Enhanced token validation
  useEffect(() => {
    const validateResetToken = async () => {
      try {
        console.log('Checking URL params:', window.location.href)
        
        // Get tokens from URL params
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')
        
        // Also check URL hash (some email providers might parse URL differently)
        const hash = window.location.hash
        let hashTokens = null
        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1))
          hashTokens = {
            access_token: hashParams.get('access_token'),
            refresh_token: hashParams.get('refresh_token'),
            type: hashParams.get('type')
          }
        }
        
        const tokens = {
          access_token: accessToken || hashTokens?.access_token,
          refresh_token: refreshToken || hashTokens?.refresh_token,
          type: type || hashTokens?.type
        }
        
        console.log('Found tokens:', {
          access_token: tokens.access_token ? 'Found' : 'Missing',
          refresh_token: tokens.refresh_token ? 'Found' : 'Missing',
          type: tokens.type
        })

        if (tokens.type === 'recovery' && tokens.access_token && tokens.refresh_token) {
          console.log('Valid reset tokens found')
          
          // Set session with tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
          })
          
          if (error) {
            console.error('Token validation error:', error)
            setError('Invalid or expired reset link. Please request a new password reset.')
          } else {
            console.log('Session established successfully')
            setValidToken(true)
            // Clear hash to clean up URL
            if (hash) {
              window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
            }
          }
        } else {
          console.log('Missing or invalid reset tokens')
          setError('Invalid reset link. Please request a new password reset.')
        }
      } catch (err) {
        console.error('Token validation failed:', err)
        setError('Failed to validate reset link. Please try again.')
      } finally {
        setTokenChecked(true)
      }
    }

    validateResetToken()
  }, [searchParams])

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // Theme classes
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800/60 border-slate-700/50 backdrop-blur-sm',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    input: 'bg-slate-700/60 border-slate-600/50 text-white focus:border-blue-500 placeholder-slate-400',
    iconColor: 'text-slate-400',
  } : {
    bg: 'bg-slate-50',
    cardBg: 'bg-white/80 border-slate-200/60 backdrop-blur-sm',
    text: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    input: 'bg-white/90 border-slate-200/60 text-slate-900 focus:border-indigo-500 placeholder-slate-500',
    iconColor: 'text-slate-500',
  }, [isDarkMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      console.log('Updating password...')
      
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        console.error('Password update error:', error)
        throw error
      }

      console.log('Password updated successfully')
      setSuccess('Password updated successfully! Redirecting to login...')
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut()
        navigate('/auth', { replace: true })
      }, 2000)

    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking token
  if (!tokenChecked) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={themeClasses.textMuted}>Validating reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 ${isDarkMode 
        ? 'bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-800/50' 
        : 'bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-purple-50/50'
      } pointer-events-none`}></div>

      <div className="w-full max-w-sm relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-6 shadow-xl">
            <PlayIcon className="h-8 w-8" />
          </div>
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
            Reset Password
          </h1>
          <p className={`text-sm ${themeClasses.textSecondary} text-center`}>
            {validToken ? 'Enter your new password below' : 'Reset link validation'}
          </p>
        </div>

        {/* Reset Card */}
        <div className={`${themeClasses.cardBg} rounded-2xl border p-6 shadow-xl`}>
          {validToken ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 mb-4">
                  <KeyIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                  Create New Password
                </h2>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  Choose a strong password for your account
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    New Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.iconColor}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className={`w-full pl-11 pr-12 py-3 ${themeClasses.input} border rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconColor} hover:text-blue-500 transition-colors p-1`}
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.iconColor}`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-11 pr-12 py-3 ${themeClasses.input} border rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconColor} hover:text-blue-500 transition-colors p-1`}
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'text-green-300 bg-green-900/20 border-green-700/30' : 'text-green-700 bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{success}</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'text-red-300 bg-red-900/20 border-red-700/30' : 'text-red-700 bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.password || !formData.confirmPassword}
                  className={`w-full py-3 px-6 ${themeClasses.button} font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 shadow-lg`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <KeyIcon className="h-5 w-5" />
                      <span>Update Password</span>
                    </div>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Invalid Token Message */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h2 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                  Invalid Reset Link
                </h2>
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'text-red-300 bg-red-900/20 border-red-700/30' : 'text-red-700 bg-red-50 border-red-200'} mb-6`}>
                  <span className="text-sm">{error}</span>
                </div>
                <button
                  onClick={() => navigate('/auth')}
                  className={`${themeClasses.button} px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg`}
                >
                  Request New Reset Link
                </button>
              </div>
            </>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/auth')}
              className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-indigo-600 hover:text-indigo-700'} transition-colors duration-200`}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
