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

  // **UPDATED: Enhanced theme classes with transparency for parallax background**
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-transparent', // ✅ Changed from bg-slate-900 to transparent
    surface: 'bg-slate-800/70 backdrop-blur-xl', // ✅ Added backdrop-blur for glass effect
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/30', // ✅ More transparent borders
    button: 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-100 backdrop-blur-sm',
    buttonPrimary: 'bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm',
    buttonSuccess: 'bg-green-600/90 hover:bg-green-700/90 text-white backdrop-blur-sm',
    input: 'bg-slate-800/60 border-slate-700/40 text-slate-100 backdrop-blur-sm',
    glass: 'bg-slate-800/40 backdrop-blur-2xl border-slate-700/20' // ✅ New glass effect class
  } : {
    bg: 'bg-transparent', // ✅ Changed from bg-gray-50 to transparent
    surface: 'bg-white/80 backdrop-blur-xl', // ✅ Added backdrop-blur for glass effect
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200/40', // ✅ More transparent borders
    button: 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 backdrop-blur-sm',
    buttonPrimary: 'bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm',
    buttonSuccess: 'bg-green-600/90 hover:bg-green-700/90 text-white backdrop-blur-sm',
    input: 'bg-white/90 border-gray-200/60 text-gray-900 backdrop-blur-sm',
    glass: 'bg-white/50 backdrop-blur-2xl border-gray-200/30' // ✅ New glass effect class
  }, [isDarkMode])

  // **ENHANCED: Parallax-aware animations**
  useGSAP(() => {
    if (!containerRef.current || !headerRef.current || !contentRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tl = gsap.timeline()
    
    // Enhanced entrance animations with parallax consideration
    tl.fromTo(containerRef.current, 
      { opacity: 0, y: 30, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo(headerRef.current, 
      { opacity: 0, y: 20, rotationX: -10 }, 
      { opacity: 1, y: 0, rotationX: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3'
    )
    .fromTo(contentRef.current, 
      { opacity: 0, y: 25 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2'
    )

    // Add subtle floating animation to cards
    gsap.to('.profile-card', {
      y: '+=3',
      duration: 3,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.3
    })

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
      {/* **NEW: Subtle overlay for better readability** */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/20' : 'bg-white/10'} pointer-events-none`} />
      
      <div ref={containerRef} className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-8">
        
        {/* **UPDATED: Enhanced header with glass effect** */}
        <div ref={headerRef}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl">
                <UserCircleIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text} mb-1`}>
                  My Profile
                </h1>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  Manage your account settings
                </p>
              </div>
            </div>
            
            {/* **UPDATED: Enhanced back button** */}
            <Link 
              to="/dashboard"
              className={`${themeClasses.button} px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg ml-auto`}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* **UPDATED: Enhanced content with glass effects** */}
        <div ref={contentRef} className="space-y-8">
          
          {/* **UPDATED: User Information Card with enhanced glass effect** */}
          <div className={`profile-card ${themeClasses.surface} ${themeClasses.border} rounded-3xl border-2 p-6 sm:p-8 shadow-2xl`}>
            <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text} mb-8`}>
              Account Information
            </h2>

            {/* **UPDATED: Enhanced profile header** */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-opacity-20">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 shadow-xl">
                <UserCircleIcon className="h-16 w-16 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text}`}>
                  {session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User'}
                </h3>
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  <span className={`${themeClasses.textSecondary} text-base break-all`}>
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* **UPDATED: Enhanced account details grid** */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Email */}
              <div className={`p-6 rounded-2xl ${themeClasses.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-3 mb-3">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-base`}>Email</span>
                </div>
                <p className={`${themeClasses.text} font-bold text-lg break-all`}>
                  {session?.user?.email}
                </p>
              </div>

              {/* Member Since */}
              <div className={`p-6 rounded-2xl ${themeClasses.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-3 mb-3">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-base`}>Member Since</span>
                </div>
                <p className={`${themeClasses.text} font-bold text-lg`}>
                  {session?.user?.created_at ? formatDateIST(session.user.created_at) : 'N/A'}
                </p>
              </div>

              {/* Last Updated */}
              <div className={`p-6 rounded-2xl ${themeClasses.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-3 mb-3">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-base`}>Last Updated</span>
                </div>
                <p className={`${themeClasses.text} font-bold text-lg`}>
                  {(profile as any)?.updated_at ? formatDateIST((profile as any).updated_at) : 'Never'}
                </p>
              </div>

              {/* User ID */}
              <div className={`p-6 rounded-2xl ${themeClasses.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-3 mb-3">
                  <PlayIcon className="h-6 w-6 text-indigo-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-base`}>User ID</span>
                </div>
                <p className={`${themeClasses.text} font-bold font-mono text-sm break-all`}>
                  {session?.user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* **UPDATED: Enhanced preferences card** */}
          <div className={`profile-card ${themeClasses.surface} ${themeClasses.border} rounded-3xl border-2 p-6 sm:p-8 shadow-2xl`}>
            
            {/* **UPDATED: Enhanced header with mobile-friendly buttons** */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
              <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text}`}>
                Preferences
              </h2>
              
              {!isEditing ? (
                <button
                  onClick={handleEditStart}
                  className={`${themeClasses.button} px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-3 text-base font-semibold w-full sm:w-auto justify-center shadow-lg`}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  <span>Edit Preferences</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleEditSave}
                    disabled={saving}
                    className={`${themeClasses.buttonSuccess} px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-3 text-base font-semibold shadow-lg`}
                  >
                    {saving ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <CheckIcon className="h-5 w-5" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={saving}
                    className={`${themeClasses.button} px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-3 text-base font-semibold shadow-lg`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* **UPDATED: Enhanced preferences grid** */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Device Preference */}
              <div className={`p-6 rounded-2xl ${themeClasses.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-3 mb-4">
                  <DeviceIconComponent className="h-6 w-6 text-blue-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-base`}>
                    Streaming Device
                  </span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-bold text-2xl mb-2`}>
                      {profile?.device_preference || 'Not set'}
                    </p>
                    <p className={`text-sm ${themeClasses.textMuted}`}>
                      Your preferred streaming device
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.device_preference}
                    onChange={(e) => setEditData({...editData, device_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border-2 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-full text-base font-semibold`}
                  >
                    <option value="iOS">📱 iOS</option>
                    <option value="Android">🤖 Android</option>
                    <option value="Desktop">💻 Desktop</option>
                  </select>
                )}
              </div>

              {/* Language Preference */}
              <div className={`p-6 rounded-2xl ${themeClasses.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-3 mb-4">
                  <GlobeAltIcon className="h-6 w-6 text-green-600" />
                  <span className={`font-bold ${themeClasses.textSecondary} text-base`}>
                    Streaming Language
                  </span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-bold text-2xl mb-2`}>
                      {profile?.language_preference || 'Not set'}
                    </p>
                    <p className={`text-sm ${themeClasses.textMuted}`}>
                      Your preferred streaming language
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.language_preference}
                    onChange={(e) => setEditData({...editData, language_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border-2 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-full text-base font-semibold`}
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
