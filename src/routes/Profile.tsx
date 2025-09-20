// src/routes/Profile.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react'
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

  // Professional theme [web:181][web:183]
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-900',
    surface: 'bg-slate-800/60',
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

  // GSAP animations
  useGSAP(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(containerRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo(headerRef.current, 
      { opacity: 0, x: -30 }, 
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3'
    )
    .fromTo(contentRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2'
    )
  }, [])

  // IST timezone formatting
  const formatDateIST = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
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
      {/* Professional background */}
      <div className={`fixed inset-0 ${isDarkMode 
        ? 'bg-gradient-to-br from-slate-900/98 to-slate-800/95' 
        : 'bg-gradient-to-br from-gray-50/98 to-white/95'
      } transition-colors duration-300`} />

      <div ref={containerRef} className="relative max-w-4xl mx-auto px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-blue-600 shadow-sm">
              <UserCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-semibold ${themeClasses.text} tracking-tight`}>
                My Profile
              </h1>
              <p className={`text-base ${themeClasses.textMuted} mt-1`}>
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="space-y-8">
          
          {/* User Information Card */}
          <div className={`${themeClasses.surface} ${themeClasses.border} rounded-2xl border backdrop-blur-sm p-8 shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Account Information</h2>
              <Link 
                to="/dashboard"
                className={`${themeClasses.button} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] text-sm`}
              >
                ← Back to Dashboard
              </Link>
            </div>

            <div className="grid gap-6">
              {/* Profile Picture & Basic Info */}
              <div className="flex items-center gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <UserCircleIcon className="h-16 w-16 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-bold ${themeClasses.text}`}>
                    {session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                    <span className={`${themeClasses.textSecondary} font-medium`}>
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                
                {/* Email */}
                <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                  <div className="flex items-center gap-3 mb-2">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                    <span className={`font-medium ${themeClasses.textSecondary}`}>Email Address</span>
                  </div>
                  <p className={`${themeClasses.text} font-semibold`}>
                    {session?.user?.email}
                  </p>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                    Your primary email address
                  </p>
                </div>

                {/* Account Created */}
                <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                    <span className={`font-medium ${themeClasses.textSecondary}`}>Member Since</span>
                  </div>
                  <p className={`${themeClasses.text} font-semibold`}>
               {session?.user?.created_at ? formatDateIST(session.user.created_at) : 'N/A'}
                  </p>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                    Account creation date (IST)
                  </p>
                </div>

                {/* Last Updated */}
                <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                  <div className="flex items-center gap-3 mb-2">
                    <ClockIcon className="h-5 w-5 text-purple-600" />
                    <span className={`font-medium ${themeClasses.textSecondary}`}>Last Updated</span>
                  </div>
                  <p className={`${themeClasses.text} font-semibold`}>
                    {profile?.updated_at ? formatDateIST(profile.updated_at) : 'Never'}
                  </p>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                    Profile last modified (IST)
                  </p>
                </div>

               {/* User ID - UPDATED TO SHOW FULL ID */}
<div className={`p-4 rounded-xl ${themeClasses.border} border`}>
  <div className="flex items-center gap-3 mb-2">
    <PlayIcon className="h-5 w-5 text-indigo-600" />
    <span className={`font-medium ${themeClasses.textSecondary}`}>User ID</span>
  </div>
  <p className={`${themeClasses.text} font-semibold font-mono text-sm break-all`}>
    {session?.user?.id || 'N/A'}
  </p>
  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
    Your unique identifier
  </p>
</div>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className={`${themeClasses.surface} ${themeClasses.border} rounded-2xl border backdrop-blur-sm p-8 shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Your Preferences</h2>
              
              {!isEditing ? (
                <button
                  onClick={handleEditStart}
                  className={`${themeClasses.button} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center gap-2`}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleEditSave}
                    disabled={saving}
                    className={`${themeClasses.buttonSuccess} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 flex items-center gap-2`}
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
                    className={`${themeClasses.button} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 flex items-center gap-2`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Device Preference */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-3 mb-3">
                  <DeviceIconComponent className="h-5 w-5 text-blue-600" />
                  <span className={`font-medium ${themeClasses.textSecondary}`}>Device Preference</span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-semibold text-lg`}>
                      {profile?.device_preference || 'Not set'}
                    </p>
                    <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                      Your preferred streaming device
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.device_preference}
                    onChange={(e) => setEditData({...editData, device_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full`}
                  >
                    <option value="iOS">iOS</option>
                    <option value="Android">Android</option>
                    <option value="Desktop">Desktop</option>
                  </select>
                )}
              </div>

              {/* Language Preference */}
              <div className={`p-4 rounded-xl ${themeClasses.border} border`}>
                <div className="flex items-center gap-3 mb-3">
                  <GlobeAltIcon className="h-5 w-5 text-green-600" />
                  <span className={`font-medium ${themeClasses.textSecondary}`}>Language Preference</span>
                </div>
                
                {!isEditing ? (
                  <div>
                    <p className={`${themeClasses.text} font-semibold text-lg`}>
                      {profile?.language_preference || 'Not set'}
                    </p>
                    <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                      Your preferred streaming language
                    </p>
                  </div>
                ) : (
                  <select
                    value={editData.language_preference}
                    onChange={(e) => setEditData({...editData, language_preference: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full`}
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
