import { useEffect, useState } from 'react'
import { TvIcon, PlayIcon, BoltIcon } from '@heroicons/react/24/solid'
import { ClockIcon, CheckIcon } from '@heroicons/react/24/outline'
import { globalTheme } from './AuthPage'
import BitmovinPlayer from '../components/BitmovinPlayer'

export default function StreamPage() {
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [playerLoaded, setPlayerLoaded] = useState(false)

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    
    // Show telegram modal after player loads
    const timer = setTimeout(() => {
      if (playerLoaded) {
        setShowTelegramModal(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener)
      clearTimeout(timer)
    }
  }, [playerLoaded])

  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-700',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    telegramButton: 'bg-blue-500 hover:bg-blue-600 text-white',
    closeButton: isDarkMode
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    modalBg: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
  }

  const handleTelegramJoin = () => {
    window.open('https://t.me/RadarxCricket', '_blank')
    setShowTelegramModal(false)
  }

  const handlePlayerLoad = () => {
    setPlayerLoaded(true)
  }

  const handlePlayerError = (error: any) => {
    console.error('Player error:', error)
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header Section */}
        <div className={`${themeClasses.cardBg} rounded-2xl border shadow-sm p-6 mb-6`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <TvIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text} mb-2`}>
              WatchWithRadar Live
            </h1>
            <p className={`${themeClasses.textMuted} text-sm sm:text-base`}>
              Premium Cricket Streaming Experience
            </p>
          </div>
        </div>

        {/* Stream Container */}
        <div className={`${themeClasses.cardBg} rounded-2xl border shadow-sm overflow-hidden`}>
          
          {/* Stream Header */}
          <div className="p-4 sm:p-6 border-b border-current border-opacity-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PlayIcon className="w-6 h-6 text-blue-600" />
                <h2 className={`text-lg sm:text-xl font-semibold ${themeClasses.text}`}>
                  Live Cricket Stream
                </h2>
              </div>
              
              <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <BoltIcon className="w-4 h-4" />
                <span className="text-sm font-medium">LIVE</span>
              </div>
            </div>
          </div>

          {/* Bitmovin Player */}
          <div className="relative">
            <BitmovinPlayer
              className="w-full aspect-video"
              style={{ minHeight: '300px', height: '70vh', maxHeight: '600px' }}
              onLoad={handlePlayerLoad}
              onError={handlePlayerError}
            />
          </div>

          {/* Stream Footer */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className={themeClasses.textMuted}>
                  HD Quality Stream
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="w-4 h-4 text-blue-500" />
                <span className={themeClasses.textMuted}>
                  24/7 Live Coverage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className={`${themeClasses.cardBg} rounded-xl border p-4 text-center`}>
            <TvIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className={`font-semibold ${themeClasses.text} mb-1`}>HD Quality</h3>
            <p className={`text-sm ${themeClasses.textMuted}`}>Bitmovin Player</p>
          </div>
          
          <div className={`${themeClasses.cardBg} rounded-xl border p-4 text-center`}>
            <BoltIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className={`font-semibold ${themeClasses.text} mb-1`}>Live Updates</h3>
            <p className={`text-sm ${themeClasses.textMuted}`}>Real-time streaming</p>
          </div>
          
          <div className={`${themeClasses.cardBg} rounded-xl border p-4 text-center`}>
            <CheckIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className={`font-semibold ${themeClasses.text} mb-1`}>Multi-Device</h3>
            <p className={`text-sm ${themeClasses.textMuted}`}>Works everywhere</p>
          </div>
        </div>
      </div>

      {/* Telegram Modal - Same as before */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.modalBg} rounded-2xl border p-6 max-w-sm w-full text-center`}>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TvIcon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
              Join Our Community!
            </h3>
            
            <p className={`${themeClasses.textMuted} mb-6`}>
              Get live updates, match highlights, and exclusive content
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleTelegramJoin}
                className={`${themeClasses.telegramButton} px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.569 2.846-1.527 9.99-2.166 13.15-.27 1.33-1.018 1.58-1.681 1.58-.632 0-1.071-.264-1.404-.623-.842-.888-2.442-2.142-3.33-2.777-1.218-.871-2.135-1.315-3.403-2.174-1.314-.89-1.639-1.31-.755-2.326 1.904-2.18 3.81-4.36 5.714-6.54.19-.218.363-.218.363 0 .05.116-.212.263-.212.379L9.2 12.15s-.225.188-.412.075c-1.45-.875-2.9-1.75-4.35-2.625-.45-.275-.45-.563 0-.838l13.8-5.625c.45-.188.9.075.675.825z"/>
                </svg>
                Join @RadarxCricket
              </button>
              
              <button
                onClick={() => setShowTelegramModal(false)}
                className={`${themeClasses.closeButton} px-6 py-3 rounded-xl font-medium transition-colors`}
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
