import { useEffect, useRef, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthProvider'
import { supabase } from '../supabaseClient'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  UserCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  CalendarIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import { globalTheme } from './AuthPage'
import { Link } from 'react-router-dom'

const Profile = () => {
  const { session, profile, refreshProfile } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    device_preference: '',
    language_preference: ''
  })
  const [saving, setSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // **MOBILE-OPTIMIZED: Clean and professional theme classes**
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-transparent',
    surface: 'bg-slate-800/80 backdrop-blur-xl',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/40',
    button: 'bg-slate-700/90 hover:bg-slate-600/90 text-slate-100 backdrop-blur-sm',
    buttonPrimary: 'bg-blue-600/95 hover:bg-blue-700/95 text-white backdrop-blur-sm',
    buttonSuccess: 'bg-green-600/95 hover:bg-green-700/95 text-white backdrop-blur-sm',
    input: 'bg-slate-800/70 border-slate-700/50 text-slate-100 backdrop-blur-sm',
  } : {
    bg: 'bg-transparent',
    surface: 'bg-white/85 backdrop-blur-xl',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200/50',
    button: 'bg-gray-100/90 hover:bg-gray-200/90 text-gray-700 backdrop-blur-sm',
    buttonPrimary: 'bg-blue-600/95 hover:bg-blue-700/95 text-white backdrop-blur-sm',
    buttonSuccess: 'bg-green-600/95 hover:bg-green-700/95 text-white backdrop-blur-sm',
    input: 'bg-white/95 border-gray-200/70 text-gray-900 backdrop-blur-sm',
  }, [isDarkMode])

  // **MOBILE-OPTIMIZED: Simplified animations**
  useGSAP(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Simple entrance animation
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

  }, [])

  // IST timezone formatting
  const formatDateIST = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'iOS': 
      case 'Android': 
        return DevicePhoneMobileIcon
      case 'Desktop': 
        return ComputerDesktopIcon
      default: 
        return DevicePhoneMobileIcon
    }
  }

  const handleEditStart = () => {
    setEditData({
      device_preference: profile?.device_preference || 'Android',
      language_preference: profile?.language_preference || 'English'
    })
    setIsEditing(true)
  }

  const handleEditSave = async () => {
    if (!session?.user) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          device_preference: editData.device_preference,
          language_preference: editData.language_preference,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (!error) {
        await refreshProfile()
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        alert('Error updating profile: ' + error.message)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditData({ device_preference: '', language_preference: '' })
  }

  const DeviceIconComponent = getDeviceIcon(profile?.device_preference || 'Android')

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-500 relative`}>
      {/* Subtle overlay for readability */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/15' : 'bg-white/5'} pointer-events-none`} />
      
      {/* **MOBILE-FIRST: Optimized container** */}
      <div ref={containerRef} className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* **MOBILE-OPTIMIZED: Clean header** */}
        <div ref={headerRef} className="mb-6 sm:mb-8">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.text} mb-1`}>
                  My Profile
                </h1>
                <p className={`text-sm sm:text-base ${themeClasses.textMuted}`}>
                  Manage account settings
                </p>
              </div>
            </div>
            
            {/* **MOBILE-FRIENDLY: Back button** */}
            <Link 
              to="/dashboard"
              className={`${themeClasses.button} px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg xs:ml-auto w-full xs:w-auto text-center`}
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* **MOBILE-OPTIMIZED: Content with minimal design** */}
        <div ref={contentRef} className="space-y-6 sm:space-y-8">
          
          {/* **CLEAN: User Information Card** */}
          <div className={`${themeClasses.surface} ${themeClasses.border} rounded-2xl sm:rounded-3xl border shadow-xl p-4 sm:p-6 lg:p-8`}>
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.text} mb-6 sm:mb-8`}>
              Account Information
            </h2>

            {/* **MOBILE-FRIENDLY: Profile header** */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-opacity-20">
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 shadow-lg">
                <UserCircleIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.text}`}>
                  {session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User'}
                </h3>
                <div className="flex items-center gap-2 sm:gap-3">
                  <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className={`${themeClasses.textSecondary} text-sm sm:text-base break-all`}>
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* **MOBILE-OPTIMIZED: Account details grid** */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Email */}
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${themeClasses.border} border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-sm sm:text-base`}>Email</span>
                </div>
                <p className={`${themeClasses.text} font-bold text-base sm:text-lg break-all`}>
                  {session?.user?.email}
                </p>
              </div>

              {/* Member Since */}
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${themeClasses.border} border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-sm sm:text-base`}>Member Since</span>
                </div>
                <p className={`${themeClasses.text} font-bold text-base sm:text-lg`}>
                  {session?.user?.created_at ? formatDateIST(session.user.created_at) : 'N/A'}
                </p>
              </div>

              {/* Last Updated */}
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${themeClasses.border} border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-sm sm:text-base`}>Last Updated</span>
                </div>
                <p className={`${themeClasses.text} font-bold text-base sm:text-lg`}>
                  {(profile as any)?.updated_at ? formatDateIST((profile as any).updated_at) : 'Never'}
                </p>
              </div>

              {/* User ID */}
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${themeClasses.border} border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-sm sm:text-base`}>User ID</span>
                </div>
                <p className={`${themeClasses.text} font-bold font-mono text-xs sm:text-sm break-all`}>
                  {session?.user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* **CLEAN: Preferences card** */}
          <div className={`${themeClasses.surface} ${themeClasses.border} rounded-2xl sm:rounded-3xl border shadow-xl p-4 sm:p-6 lg:p-8`}>
            
            {/* **MOBILE-FRIENDLY: Header with buttons** */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.text}`}>
                Preferences
              </h2>
              
              {!isEditing ? (
                <button
                  onClick={handleEditStart}
                  className={`${themeClasses.button} px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold w-full sm:w-auto justify-center shadow-lg`}
                >
                  <PencilSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleEditSave}
                    disabled={saving}
                    className={`${themeClasses.buttonSuccess} px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold shadow-lg`}
                  >
                    {saving ? (
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={saving}
                    className={`${themeClasses.button} px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold shadow-lg`}
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* **MOBILE-OPTIMIZED: Preferences grid** */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Device Preference */}
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${themeClasses.border} border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <DeviceIconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-sm sm:text-base`}>
                    Device
                  </span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-bold text-xl sm:text-2xl mb-1 sm:mb-2`}>
                      {profile?.device_preference || 'Not set'}
                    </p>
                    <p className={`text-xs sm:text-sm ${themeClasses.textMuted}`}>
                      Streaming device
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.device_preference}
                    onChange={(e) => setEditData({...editData, device_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-full text-sm sm:text-base font-semibold`}
                  >
                    <option value="iOS">📱 iOS</option>
                    <option value="Android">🤖 Android</option>
                    <option value="Desktop">💻 Desktop</option>
                  </select>
                )}
              </div>

              {/* Language Preference */}
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${themeClasses.border} border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <GlobeAltIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-sm sm:text-base`}>
                    Language
                  </span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-bold text-xl sm:text-2xl mb-1 sm:mb-2`}>
                      {profile?.language_preference || 'Not set'}
                    </p>
                    <p className={`text-xs sm:text-sm ${themeClasses.textMuted}`}>
                      Streaming language
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.language_preference}
                    onChange={(e) => setEditData({...editData, language_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-full text-sm sm:text-base font-semibold`}
                  >
                    <option value="English">🇬🇧 English</option>
                    <option value="Hindi">🇮🇳 हिंदी (Hindi)</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
