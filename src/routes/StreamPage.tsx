import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TvIcon, PlayIcon, BoltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid'
import { ClockIcon, CheckIcon, SignalIcon } from '@heroicons/react/24/outline'
import { globalTheme } from './AuthPage'
import { useAuth } from '../context/AuthProvider'

export default function StreamPage() {
  const { profile, session } = useAuth()
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [streamLoaded, setStreamLoaded] = useState(false)
  const [streamError, setStreamError] = useState(false)

  const userDevice = profile?.device_preference || 'Android'

  // Theme change listener
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener)
    }
  }, [])

  // Device-based iframe URL
  const getStreamUrl = () => {
    if (userDevice === 'iOS') {
      return 'https://radarofc.onrender.com/g.html'
    } else {
      return 'https://radarofc.onrender.com/android.html'
    }
  }
  const streamUrl = getStreamUrl()

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

  const getDeviceIcon = () => {
    if (userDevice === 'iOS' || userDevice === 'Android') {
      return DevicePhoneMobileIcon
    }
    return ComputerDesktopIcon
  }

  const DeviceIcon = getDeviceIcon()

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <TvIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Live Cricket Stream
            </h1>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-700'} text-base mb-3`}>
              Watch matches live
            </p>
            <div className="flex items-center justify-center gap-2">
              <DeviceIcon className="w-4 h-4 text-blue-600" />
              <span className={`${isDarkMode ? 'text-slate-300' : 'text-gray-700'} text-sm`}>
                {userDevice} optimized
              </span>
            </div>
          </div>
        </div>

        {/* Stream Container */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden mb-6`}>
          <div className="p-4 border-b border-current border-opacity-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PlayIcon className="w-5 h-5 text-blue-600" />
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Live Stream
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <BoltIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">LIVE</span>
            </div>
          </div>

          <div className="relative bg-black">
            {!streamError ? (
              <iframe
                src={streamUrl}
                className="w-full aspect-video border-0"
                style={{ minHeight: '350px', height: '60vh', maxHeight: '500px' }}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                loading="eager"
                onLoad={handleStreamLoad}
                onError={handleStreamError}
                title={`Cricket Stream - ${userDevice}`}
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <SignalIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Stream Unavailable
                  </h3>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-700'} text-base mb-4`}>
                    Please try again later
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Reload
                  </button>
                </div>
              </div>
            )}

            {!streamLoaded && !streamError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-3 animate-spin"></div>
                  <p className="text-white text-sm">Loading...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className={`${isDarkMode ? 'text-slate-400' : 'text-gray-700'} text-sm`}>HD Quality</span>
            </div>

            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span className={`${isDarkMode ? 'text-slate-400' : 'text-gray-700'} text-sm`}>Live Coverage</span>
            </div>
          </div>
        </div>

        {/* Simple Telegram Button */}
        <div className="text-center">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
              Stay Updated
            </h3>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-700'} text-base mb-6`}>
              Join our community for updates
            </p>

            <button
              onClick={handleTelegramJoin}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
