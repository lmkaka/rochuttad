import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TvIcon, PlayIcon, BoltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid'
import { ClockIcon, CheckIcon, SignalIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { globalTheme } from './AuthPage'
import { useAuth } from '../context/AuthProvider'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function StreamPage() {
  const { profile, session } = useAuth()
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [streamLoaded, setStreamLoaded] = useState(false)
  const [streamError, setStreamError] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get user device preference
  const userDevice = profile?.device_preference || 'Android'
  
  // **DASHBOARD REFERRER CHECK**
  useEffect(() => {
    const checkAccess = () => {
      // Check if user came from dashboard
      const referrer = document.referrer
      const sessionReferrer = sessionStorage.getItem('dashboardReferrer')
      
      // Check for dashboard referrer
      const validReferrer = referrer.includes('watchwithradar.live/dashboard') || 
                           referrer.includes('localhost') && referrer.includes('/dashboard') ||
                           sessionReferrer?.includes('/dashboard')
      
      // If no valid referrer, deny access
      if (!validReferrer) {
        setAccessDenied(true)
        setCheckingAccess(false)
        return
      }
      
      // Access granted
      setAccessDenied(false)
      setCheckingAccess(false)
    }
    
    // Small delay to ensure referrer is captured
    setTimeout(checkAccess, 100)
  }, [])

  // **DEVICE-BASED IFRAME URLs**
  const getStreamUrl = () => {
    if (userDevice === 'iOS') {
      return 'https://radarofc.onrender.com/ios.html'
    } else {
      return 'https://radarofc.onrender.com/android.html'
    }
  }

  const streamUrl = getStreamUrl()

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener)
    }
  }, [])

  // **THEME CLASSES**
  const themeClasses = useMemo(() => ({
    bg: 'bg-transparent',
    cardBg: isDarkMode 
      ? 'bg-slate-800/90 border-slate-700/50 backdrop-blur-xl' 
      : 'bg-white/90 border-gray-200/60 backdrop-blur-xl',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-700',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    telegramButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    authButton: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
  }), [isDarkMode])

  // **ANIMATIONS**
  useGSAP(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )

    gsap.to('.live-pulse', {
      scale: 1.1,
      duration: 1,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true
    })
  }, [])

  const handleTelegramJoin = () => {
    window.open('https://t.me/RadarxCricket', '_blank')
  }

  const handleStreamLoad = () => {
    setStreamLoaded(true)
    setStreamError(false)
  }

  const handleStreamError = () => {
    setStreamError(true)
    setStreamLoaded(false)
  }

  const handleGoToAuth = () => {
    navigate('/auth')
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  // Get device icon
  const getDeviceIcon = () => {
    if (userDevice === 'iOS' || userDevice === 'Android') {
      return DevicePhoneMobileIcon
    }
    return ComputerDesktopIcon
  }

  const DeviceIcon = getDeviceIcon()

  // **CHECKING ACCESS SCREEN**
  if (checkingAccess) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} transition-all duration-300 relative`}>
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/10' : 'bg-white/5'} pointer-events-none`} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className={`${themeClasses.text} text-base`}>Verifying access...</p>
          </div>
        </div>
      </div>
    )
  }

  // **ACCESS DENIED SCREEN**
  if (accessDenied) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} transition-all duration-300 relative`}>
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/10' : 'bg-white/5'} pointer-events-none`} />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className={`${themeClasses.cardBg} rounded-2xl border shadow-2xl p-8 max-w-md w-full text-center`}>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LockClosedIcon className="w-10 h-10 text-red-500" />
            </div>
            
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
              Stream Access Restricted
            </h2>
            
            <p className={`${themeClasses.textMuted} text-base mb-6 leading-relaxed`}>
              Please {session ? 'navigate through dashboard' : 'sign up or login'} to view live streams
            </p>
            
            <div className="space-y-3">
              {session ? (
                <button
                  onClick={handleGoToDashboard}
                  className={`${themeClasses.authButton} w-full px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2`}
                >
                  <TvIcon className="w-5 h-5" />
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={handleGoToAuth}
                  className={`${themeClasses.authButton} w-full px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  Sign Up / Login
                </button>
              )}
            </div>
            
            <p className={`${themeClasses.textMuted} text-sm mt-6`}>
              Access is only granted through proper navigation
            </p>
          </div>
        </div>
      </div>
    )
  }

  // **MAIN STREAM PAGE**
  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-300 relative`}>
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/10' : 'bg-white/5'} pointer-events-none`} />
      
      <div ref={containerRef} className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6">
        
        {/* Simple header */}
        <div className="mb-6">
          <div className={`${themeClasses.cardBg} rounded-2xl border shadow-lg p-6`}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-md">
                <TvIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text} mb-2`}>
                Live Cricket Stream
              </h1>
              <p className={`${themeClasses.textMuted} text-base mb-3`}>
                Watch your favorite matches live
              </p>
              
              <div className="flex items-center justify-center gap-2">
                <DeviceIcon className="w-4 h-4 text-blue-600" />
                <span className={`${themeClasses.textSecondary} text-sm`}>
                  Optimized for {userDevice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stream container */}
        <div className="mb-6">
          <div className={`${themeClasses.cardBg} rounded-2xl border shadow-lg overflow-hidden`}>
            
            <div className="p-4 border-b border-current border-opacity-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PlayIcon className="w-6 h-6 text-blue-600" />
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                    Live Stream
                  </h2>
                </div>
                
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm">
                  <div className="live-pulse w-2 h-2 bg-white rounded-full"></div>
                  <BoltIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">LIVE</span>
                </div>
              </div>
            </div>

            <div className="relative bg-black">
              {!streamError ? (
                <iframe
                  src={streamUrl}
                  className="w-full aspect-video border-0"
                  style={{ 
                    minHeight: '400px', 
                    height: '70vh', 
                    maxHeight: '600px'
                  }}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                  loading="eager"
                  onLoad={handleStreamLoad}
                  onError={handleStreamError}
                  title={`Cricket Live Stream - ${userDevice}`}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <SignalIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                      Stream Unavailable
                    </h3>
                    <p className={`${themeClasses.textMuted} text-base mb-4`}>
                      Please try again later
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reload Stream
                    </button>
                  </div>
                </div>
              )}
              
              {!streamLoaded && !streamError && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                    <p className="text-white text-base">Loading Stream...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  <span className={`${themeClasses.textMuted} text-sm`}>
                    HD Quality
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  <span className={`${themeClasses.textMuted} text-sm`}>
                    Live Coverage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Button */}
        <div className="text-center">
          <div className={`${themeClasses.cardBg} rounded-2xl border shadow-lg p-6`}>
            <h3 className={`text-lg font-bold ${themeClasses.text} mb-3`}>
              Stay Updated
            </h3>
            <p className={`${themeClasses.textMuted} text-base mb-6`}>
              Join our community for live updates and highlights
            </p>
            
            <button
              onClick={handleTelegramJoin}
              className={`${themeClasses.telegramButton} px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.569 2.846-1.527 9.99-2.166 13.15-.27 1.33-1.018 1.58-1.681 1.58-.632 0-1.071-.264-1.404-.623-.842-.888-2.442-2.142-3.33-2.777-1.218-.871-2.135-1.315-3.403-2.174-1.314-.89-1.639-1.31-.755-2.326 1.904-2.18 3.81-4.36 5.714-6.54.19-.218.363-.218.363 0 .05.116-.212.263-.212.379L9.2 12.15s-.225.188-.412.075c-1.45-.875-2.9-1.75-4.35-2.625-.45-.275-.45-.563 0-.838l13.8-5.625c.45-.188.9.075.675.825z"/>
              </svg>
              Join @RadarxCricket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
