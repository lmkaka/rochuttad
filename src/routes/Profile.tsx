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

  // Mobile-friendly theme system
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-900',
    surface: 'bg-slate-800/50',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/40',
    button: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSuccess: 'bg-green-600 hover:bg-green-700 text-white',
    input: 'bg-slate-800/60 border-slate-700/40 text-slate-100'
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white/90',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200/60',
    button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSuccess: 'bg-green-600 hover:bg-green-700 text-white',
    input: 'bg-white/90 border-gray-200/60 text-gray-900'
  }, [isDarkMode])

  // Simple GSAP animations
  useGSAP(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(containerRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo(headerRef.current, 
      { opacity: 0, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3'
    )
    .fromTo(contentRef.current, 
      { opacity: 0, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2'
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
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      <div ref={containerRef} className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        
        {/* Mobile-Friendly Header */}
        <div ref={headerRef}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-600 shadow-sm">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text}`}>
                  My Profile
                </h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                  Manage your account
                </p>
              </div>
            </div>
            
            {/* Back Button */}
            <Link 
              to="/dashboard"
              className={`${themeClasses.button} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ml-auto`}
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="space-y-6">
          
          {/* User Information Card */}
          <div className={`${themeClasses.surface} ${themeClasses.border} rounded-2xl border backdrop-blur-sm p-4 sm:p-6`}>
            <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text} mb-6`}>
              Account Information
            </h2>

            {/* Profile Header - Mobile Stacked */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-opacity-20">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                <UserCircleIcon className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}>
                  {session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User'}
                </h3>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                  <span className={`${themeClasses.textSecondary} text-sm break-all`}>
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details - Mobile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Email */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                  <span className={`font-medium ${themeClasses.textSecondary} text-sm`}>Email</span>
                </div>
                <p className={`${themeClasses.text} font-semibold text-sm break-all`}>
                  {session?.user?.email}
                </p>
              </div>

              {/* Member Since */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-4 w-4 text-green-600" />
                  <span className={`font-medium ${themeClasses.textSecondary} text-sm`}>Member Since</span>
                </div>
                <p className={`${themeClasses.text} font-semibold text-sm`}>
                  {session?.user?.created_at ? formatDateIST(session.user.created_at) : 'N/A'}
                </p>
              </div>

              {/* Last Updated */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-4 w-4 text-purple-600" />
                  <span className={`font-medium ${themeClasses.textSecondary} text-sm`}>Last Updated</span>
                </div>
                <p className={`${themeClasses.text} font-semibold text-sm`}>
                  {(profile as any)?.updated_at ? formatDateIST((profile as any).updated_at) : 'Never'}
                </p>
              </div>

              {/* User ID */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <PlayIcon className="h-4 w-4 text-indigo-600" />
                  <span className={`font-medium ${themeClasses.textSecondary} text-sm`}>User ID</span>
                </div>
                <p className={`${themeClasses.text} font-semibold font-mono text-xs break-all`}>
                  {session?.user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Preferences Card - Mobile Optimized */}
          <div className={`${themeClasses.surface} ${themeClasses.border} rounded-2xl border backdrop-blur-sm p-4 sm:p-6`}>
            
            {/* Header with Mobile-Friendly Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>
                Preferences
              </h2>
              
              {!isEditing ? (
                <button
                  onClick={handleEditStart}
                  className={`${themeClasses.button} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm w-full sm:w-auto justify-center`}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleEditSave}
                    disabled={saving}
                    className={`${themeClasses.buttonSuccess} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-2 text-sm`}
                  >
                    {saving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={saving}
                    className={`${themeClasses.button} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-2 text-sm`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Preferences Grid - Mobile Stacked */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Device Preference */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-2 mb-3">
                  <DeviceIconComponent className="h-4 w-4 text-blue-600" />
                  <span className={`font-medium ${themeClasses.textSecondary} text-sm`}>
                    Device
                  </span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-bold text-lg`}>
                      {profile?.device_preference || 'Not set'}
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Streaming device
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.device_preference}
                    onChange={(e) => setEditData({...editData, device_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                  >
                    <option value="iOS">iOS</option>
                    <option value="Android">Android</option>
                    <option value="Desktop">Desktop</option>
                  </select>
                )}
              </div>

              {/* Language Preference */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-2 mb-3">
                  <GlobeAltIcon className="h-4 w-4 text-green-600" />
                  <span className={`font-medium ${themeClasses.textSecondary} text-sm`}>
                    Language
                  </span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-bold text-lg`}>
                      {profile?.language_preference || 'Not set'}
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Streaming language
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.language_preference}
                    onChange={(e) => setEditData({...editData, language_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
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
