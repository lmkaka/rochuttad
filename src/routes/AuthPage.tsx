import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'

// Global theme state
export const globalTheme = {
  isDarkMode: false,
  setIsDarkMode: (value: boolean) => {
    globalTheme.isDarkMode = value
    localStorage.setItem('watchWithRadar_theme', value ? 'dark' : 'light')
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDarkMode: value } }))
  }
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('watchWithRadar_theme')
if (savedTheme === 'dark') {
  globalTheme.isDarkMode = true
}

// Ultra-Optimized Particles Component
const OptimizedParticles = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const particlesRef = useRef<any[]>([])
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Highly optimized canvas setup
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Limit DPR for performance
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      
      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = false // Disable for better performance
    }

    resizeCanvas()

    // Ultra-lightweight particle class
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      baseOpacity: number
      color: string
      life: number
      maxLife: number

      constructor(width: number, height: number) {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 1
        this.baseOpacity = Math.random() * 0.3 + 0.1
        this.opacity = this.baseOpacity
        this.color = isDarkMode ? '#60a5fa' : '#6366f1'
        this.life = 0
        this.maxLife = Math.random() * 300 + 200
      }

      update(deltaTime: number, width: number, height: number) {
        this.x += this.vx * deltaTime
        this.y += this.vy * deltaTime
        this.life += deltaTime

        // Breathing effect
        this.opacity = this.baseOpacity * (0.5 + 0.5 * Math.sin(this.life * 0.01))

        // Wrap around screen
        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0

        // Respawn particle if life exceeded
        if (this.life > this.maxLife) {
          this.x = Math.random() * width
          this.y = Math.random() * height
          this.life = 0
          this.maxLife = Math.random() * 300 + 200
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create optimized particle count based on device capability
    const getParticleCount = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const area = width * height
      const isLowEnd = navigator.hardwareConcurrency <= 4 || area > 1000000
      
      if (width <= 480) return isLowEnd ? 8 : 12
      if (width <= 768) return isLowEnd ? 12 : 18
      return isLowEnd ? 18 : 25
    }

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      const count = getParticleCount()
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(canvas.clientWidth, canvas.clientHeight))
      }
    }

    // Ultra-optimized animation loop with 60fps cap
    const animate = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTimeRef.current, 16.67) // Cap at 60fps
      lastTimeRef.current = currentTime

      // Clear canvas efficiently
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      // Update and draw particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i]
        particle.update(deltaTime, canvas.clientWidth, canvas.clientHeight)
        particle.draw(ctx)
      }

      ctx.globalAlpha = 1
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        resizeCanvas()
        initParticles()
      }, 250)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    initParticles()
    animate(0)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      clearTimeout(resizeTimeout)
    }
  }, [isDarkMode])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: 1 }}
    />
  )
}

export default function AuthPage() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Smart redirect URL detection
  const getRedirectUrl = useCallback(() => {
    const hostname = window.location.hostname
    const origin = window.location.origin
    
    console.log('Current hostname:', hostname)
    console.log('Current origin:', origin)
    
    // Always use auth/callback for Google OAuth
    return `${origin}/auth/callback`
  }, [])

  // Optimized theme classes
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800/60 border-slate-700/50 backdrop-blur-sm',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    input: 'bg-slate-700/60 border-slate-600/50 text-white focus:border-blue-500 placeholder-slate-400',
    googleButton: 'bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50',
    iconColor: 'text-slate-400',
    tabActive: 'bg-blue-600 text-white shadow-lg',
    tabInactive: 'bg-slate-700/40 text-slate-400 hover:text-slate-300 hover:bg-slate-700/60',
    linkText: 'text-blue-400 hover:text-blue-300'
  } : {
    bg: 'bg-slate-50',
    cardBg: 'bg-white/80 border-slate-200/60 backdrop-blur-sm',
    text: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    input: 'bg-white/90 border-slate-200/60 text-slate-900 focus:border-indigo-500 placeholder-slate-500',
    googleButton: 'bg-white/90 hover:bg-white text-slate-700 border-slate-200/60',
    iconColor: 'text-slate-500',
    tabActive: 'bg-indigo-600 text-white shadow-lg',
    tabInactive: 'bg-slate-100/80 text-slate-600 hover:text-slate-700 hover:bg-slate-200/80',
    linkText: 'text-indigo-600 hover:text-indigo-700'
  }, [isDarkMode])

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // Clear form when switching tabs
  const handleTabSwitch = useCallback((tab: 'signin' | 'signup' | 'forgot') => {
    setActiveTab(tab)
    setFormData({ email: '', password: '', confirmPassword: '' })
    setError('')
    setSuccess('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [])

  // Optimized input handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }, [])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (activeTab === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { 
            emailRedirectTo: `${window.location.origin}/dashboard` 
          }
        })
        
        if (error) throw error
        
        if (data.user && !data.session) {
          setSuccess('Account created! Please check your email and click the confirmation link.')
          setFormData({ email: '', password: '', confirmPassword: '' })
        } else if (data.session) {
          setSuccess('Account created and signed in successfully!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (error) throw error
        setSuccess('Signed in successfully!')
      }
    } catch (err: any) {
      console.error('Email auth error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      
      setSuccess('Password reset link sent to your email!')
      setFormData({ email: '', password: '', confirmPassword: '' })
    } catch (err: any) {
      console.error('Forgot password error:', err)
      setError(err.message || 'Failed to send reset email')
    } finally {
      setForgotLoading(false)
    }
  }

  // Fixed Google OAuth - Always use direct redirect
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    
    try {
      const redirectUrl = getRedirectUrl()
      console.log('Starting Google OAuth with redirect:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
        throw error
      }

      if (data?.url) {
        console.log('Redirecting to Google OAuth:', data.url)
        // Direct redirect for both production and development
        window.location.href = data.url
      }
      
    } catch (err: any) {
      console.error('Google OAuth failed:', err)
      setError(err.message || 'Google sign in failed')
      setGoogleLoading(false)
    }
  }

  // Redirect logic for authenticated users
  useEffect(() => {
    if (session?.user && !loading && !googleLoading) {
      console.log('Session detected, checking for redirect:', { 
        session: !!session, 
        profile: !!profile,
        currentPath: window.location.pathname 
      })
      
      if (window.location.pathname === '/auth') {
        navigate(profile ? '/dashboard' : '/onboarding', { replace: true })
      }
    }
  }, [session, profile, navigate, loading, googleLoading])

  // Optimized Google Icon
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Ultra-Optimized Particles Background */}
      <OptimizedParticles isDarkMode={isDarkMode} />
      
      {/* Subtle background gradient overlay */}
      <div className={`absolute inset-0 ${isDarkMode 
        ? 'bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-800/50' 
        : 'bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-purple-50/50'
      } pointer-events-none`} style={{ zIndex: 2 }}></div>

      {/* Single centered container */}
      <div className="w-full max-w-sm relative" style={{ zIndex: 10 }}>
        {/* Header - Center aligned */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-6 shadow-xl">
            <PlayIcon className="h-8 w-8" />
          </div>
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
            WatchWithRadar
          </h1>
          <p className={`text-sm ${themeClasses.textSecondary} text-center`}>
            Your premium streaming experience
          </p>
        </div>

        {/* Auth Card */}
        <div className={`${themeClasses.cardBg} rounded-2xl border p-6 shadow-xl`}>
          
          {/* Forgot Password View */}
          {activeTab === 'forgot' ? (
            <>
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => handleTabSwitch('signin')}
                  className={`flex items-center gap-2 ${themeClasses.linkText} text-sm font-medium transition-colors duration-200`}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Sign In
                </button>
              </div>

              {/* Forgot Password Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 mb-4">
                  <KeyIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                  Reset Password
                </h2>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {/* Forgot Password Form */}
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.iconColor}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-11 pr-4 py-3 ${themeClasses.input} border rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'text-green-300 bg-green-900/20 border-green-700/30' : 'text-green-700 bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{success}</span>
                    </div>
                  </div>
                )}

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
                  disabled={forgotLoading}
                  className={`w-full py-3 px-6 ${themeClasses.button} font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 shadow-lg`}
                >
                  {forgotLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <KeyIcon className="h-5 w-5" />
                      <span>Send Reset Link</span>
                    </div>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex mb-6 bg-slate-500/10 rounded-xl p-1">
                <button
                  onClick={() => handleTabSwitch('signin')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'signin' ? themeClasses.tabActive : themeClasses.tabInactive
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sign In
                </button>
                <button
                  onClick={() => handleTabSwitch('signup')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'signup' ? themeClasses.tabActive : themeClasses.tabInactive
                  }`}
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.iconColor}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-11 pr-4 py-3 ${themeClasses.input} border rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${themeClasses.text}`}>
                      Password
                    </label>
                    {activeTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('forgot')}
                        className={`text-sm ${themeClasses.linkText} transition-colors duration-200`}
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <LockClosedIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.iconColor}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-11 pr-12 py-3 ${themeClasses.input} border rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Enter your password"
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

                {/* Confirm Password - Sign Up Only */}
                {activeTab === 'signup' && (
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
                        placeholder="Confirm your password"
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
                )}

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
                  disabled={loading}
                  className={`w-full py-3 px-6 ${themeClasses.button} font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 shadow-lg`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{activeTab === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {activeTab === 'signup' ? <UserPlusIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                      <span>{activeTab === 'signup' ? 'Create Account' : 'Sign In'}</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Enhanced Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-slate-600/50' : 'border-slate-200/60'}`}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className={`
                    px-4 py-1.5 text-sm font-medium
                    ${themeClasses.textMuted} 
                    ${isDarkMode 
                      ? 'bg-slate-800/90 border border-slate-700/50' 
                      : 'bg-white/95 border border-slate-200/60'
                    } 
                    rounded-full shadow-sm
                  `}>
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`}></span>
                      or continue with
                      <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`}></span>
                    </span>
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 ${themeClasses.googleButton} border rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 shadow-lg`}
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{activeTab === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
              </button>
            </>
          )}
        </div>

        {/* Footer - Center aligned */}
        <div className="text-center mt-6">
          <div className={`text-xs ${themeClasses.textMuted} flex items-center justify-center gap-2`}>
            <LockClosedIcon className="h-4 w-4" />
            <span>Secure • Encrypted • Private</span>
          </div>
        </div>
      </div>
    </div>
  )
}
