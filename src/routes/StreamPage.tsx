import { useEffect, useState, useRef, useMemo } from 'react'
import { TvIcon, PlayIcon, BoltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid'
import { ClockIcon, CheckIcon, SignalIcon } from '@heroicons/react/24/outline'
import { globalTheme } from './AuthPage'
import { useAuth } from '../context/AuthProvider'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function StreamPage() {
  const { profile } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [streamLoaded, setStreamLoaded] = useState(false)
  const [streamError, setStreamError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  // Get user device preference
  const userDevice = profile?.device_preference || 'Android'
  
  // **DEVICE-BASED IFRAME URLs**
  const getStreamUrl = () => {
    if (userDevice === 'iOS') {
      return 'https://radarofc.onrender.com/ios'
    } else {
      // Android or Desktop
      return 'https://radarofc.onrender.com/android'
    }
  }

  const streamUrl = getStreamUrl()

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    
    // Show telegram modal after stream loads
    const timer = setTimeout(() => {
      if (streamLoaded) {
        setShowTelegramModal(true)
      }
    }, 5000) // 5 seconds delay

    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener)
      clearTimeout(timer)
    }
  }, [streamLoaded])

  // **MOBILE-OPTIMIZED: Clean theme classes**
  const themeClasses = useMemo(() => ({
    bg: 'bg-transparent',
    cardBg: isDarkMode 
      ? 'bg-slate-800/80 border-slate-700/40 backdrop-blur-xl' 
      : 'bg-white/85 border-gray-200/50 backdrop-blur-xl',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-700',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    telegramButton: 'bg-blue-500/95 hover:bg-blue-600/95 text-white backdrop-blur-sm',
    closeButton: isDarkMode
      ? 'bg-slate-700/90 hover:bg-slate-600/90 text-slate-300 backdrop-blur-sm'
      : 'bg-gray-200/90 hover:bg-gray-300/90 text-gray-700 backdrop-blur-sm',
    modalBg: isDarkMode 
      ? 'bg-slate-800/95 border-slate-700/50 backdrop-blur-2xl' 
      : 'bg-white/95 border-gray-200/50 backdrop-blur-2xl',
  }), [isDarkMode])

  // **MOBILE-OPTIMIZED: Simple animations**
  useGSAP(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Simple entrance animation
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    // Live pulse animation
    gsap.to('.live-pulse', {
      scale: 1.2,
      duration: 1.5,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true
    })

  }, [])

  const handleTelegramJoin = () => {
    window.open('https://t.me/RadarxCricket', '_blank')
    setShowTelegramModal(false)
  }

  const handleStreamLoad = () => {
    setStreamLoaded(true)
    setStreamError(false)
  }

  const handleStreamError = () => {
    setStreamError(true)
    setStreamLoaded(false)
  }

  // Get device icon
  const getDeviceIcon = () => {
    if (userDevice === 'iOS' || userDevice === 'Android') {
      return DevicePhoneMobileIcon
    }
    return ComputerDesktopIcon
  }

  const DeviceIcon = getDeviceIcon()

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-500 relative`}>
      {/* Subtle overlay for better readability */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/15' : 'bg-white/5'} pointer-events-none`} />
      
      {/* **MOBILE-FIRST: Optimized container** */}
      <div ref={containerRef} className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* **MOBILE-OPTIMIZED: Header** */}
        <div ref={headerRef} className="mb-4 sm:mb-6">
          <div className={`${themeClasses.cardBg} rounded-2xl sm:rounded-3xl border shadow-xl p-4 sm:p-6 lg:p-8`}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-xl sm:rounded-2xl lg:rounded-3xl mb-3 sm:mb-4 lg:mb-6 shadow-lg">
                <TvIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h1 className={`text-xl sm:text-2xl lg:text-4xl font-bold ${themeClasses.text} mb-1 sm:mb-2 lg:mb-3`}>
                WatchWithRadar Live
              </h1>
              <p className={`${themeClasses.textMuted} text-sm sm:text-base lg:text-xl mb-2 sm:mb-3`}>
                Premium Cricket Streaming
              </p>
              
              {/* **DEVICE INDICATOR** */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <DeviceIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className={`${themeClasses.textSecondary} text-xs sm:text-sm font-semibold`}>
                  Optimized for {userDevice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* **MAIN FEATURE: Device-based iframe container** */}
        <div ref={streamRef} className="mb-4 sm:mb-6">
          <div className={`${themeClasses.cardBg} rounded-2xl sm:rounded-3xl border shadow-xl overflow-hidden`}>
            
            {/* Stream Header */}
            <div className="p-3 sm:p-4 lg:p-6 border-b border-current border-opacity-20">
              <div className="flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
                  <h2 className={`text-lg sm:text-xl lg:text-3xl font-bold ${themeClasses.text}`}>
                    Live Cricket Stream
                  </h2>
                </div>
                
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl shadow-lg">
                  <div className="live-pulse w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                  <BoltIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="text-xs sm:text-sm lg:text-base font-bold">LIVE</span>
                </div>
              </div>
            </div>

            {/* **DEVICE-BASED IFRAME STREAM** */}
            <div className="relative bg-black">
              {!streamError ? (
                <iframe
                  src={streamUrl}
                  className="w-full aspect-video border-0"
                  style={{ 
                    minHeight: '300px', 
                    height: window.innerWidth < 640 ? '50vh' : '70vh', 
                    maxHeight: window.innerWidth < 640 ? '400px' : '700px' 
                  }}
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  loading="lazy"
                  onLoad={handleStreamLoad}
                  onError={handleStreamError}
                  title={`Cricket Stream - ${userDevice}`}
                />
              ) : (
                <div className="flex items-center justify-center h-80 sm:h-96">
                  <div className="text-center">
                    <SignalIcon className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto mb-4" />
                    <h3 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                      Stream Unavailable
                    </h3>
                    <p className={`${themeClasses.textMuted} text-sm sm:text-base`}>
                      Please try again later or check your connection
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      className={`mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                    >
                      Reload Stream
                    </button>
                  </div>
                </div>
              )}
              
              {/* Loading Overlay */}
              {!streamLoaded && !streamError && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-white text-sm sm:text-base">Loading {userDevice} Stream...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Footer */}
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500" />
                  <span className={`${themeClasses.textMuted} font-medium`}>
                    HD Quality Stream
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500" />
                  <span className={`${themeClasses.textMuted} font-medium`}>
                    24/7 Coverage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* **MOBILE-OPTIMIZED: Features section** */}
        <div ref={featuresRef}>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className={`${themeClasses.cardBg} rounded-xl sm:rounded-2xl border p-4 sm:p-5 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <DeviceIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-600 mx-auto mb-2 sm:mb-3 lg:mb-4" />
              <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${themeClasses.text} mb-1 sm:mb-2`}>
                {userDevice} Optimized
              </h3>
              <p className={`text-xs sm:text-sm lg:text-base ${themeClasses.textMuted}`}>
                Best experience for your device
              </p>
            </div>
            
            <div className={`${themeClasses.cardBg} rounded-xl sm:rounded-2xl border p-4 sm:p-5 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <BoltIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-600 mx-auto mb-2 sm:mb-3 lg:mb-4" />
              <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${themeClasses.text} mb-1 sm:mb-2`}>Live Updates</h3>
              <p className={`text-xs sm:text-sm lg:text-base ${themeClasses.textMuted}`}>Real-time streaming</p>
            </div>
            
            <div className={`${themeClasses.cardBg} rounded-xl sm:rounded-2xl border p-4 sm:p-5 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 xs:col-span-2 lg:col-span-1`}>
              <CheckIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-600 mx-auto mb-2 sm:mb-3 lg:mb-4" />
              <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${themeClasses.text} mb-1 sm:mb-2`}>HD Quality</h3>
              <p className={`text-xs sm:text-sm lg:text-base ${themeClasses.textMuted}`}>Crystal clear</p>
            </div>
          </div>
        </div>
      </div>

      {/* **MOBILE-OPTIMIZED: Telegram Modal** */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className={`${themeClasses.modalBg} rounded-2xl sm:rounded-3xl border shadow-2xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full text-center`}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <TvIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <h3 className={`text-lg sm:text-2xl font-bold ${themeClasses.text} mb-2 sm:mb-3`}>
              Join Our Community!
            </h3>
            
            <p className={`${themeClasses.textMuted} mb-6 sm:mb-8 text-sm sm:text-lg`}>
              Get live updates, highlights, and exclusive content
            </p>
            
            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={handleTelegramJoin}
                className={`${themeClasses.telegramButton} px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 sm:gap-3`}
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.569 2.846-1.527 9.99-2.166 13.15-.27 1.33-1.018 1.58-1.681 1.58-.632 0-1.071-.264-1.404-.623-.842-.888-2.442-2.142-3.33-2.777-1.218-.871-2.135-1.315-3.403-2.174-1.314-.89-1.639-1.31-.755-2.326 1.904-2.18 3.81-4.36 5.714-6.54.19-.218.363-.218.363 0 .05.116-.212.263-.212.379L9.2 12.15s-.225.188-.412.075c-1.45-.875-2.9-1.75-4.35-2.625-.45-.275-.45-.563 0-.838l13.8-5.625c.45-.188.9.075.675.825z"/>
                </svg>
                Join @RadarxCricket
              </button>
              
              <button
                onClick={() => setShowTelegramModal(false)}
                className={`${themeClasses.closeButton} px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all hover:scale-105 shadow-lg`}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
