// src/routes/AdminPanel.tsx - Mobile Optimized with Fixes
import { useEffect, useRef, useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthProvider'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import { globalTheme } from './AuthPage'

type Match = {
  id: number
  team1_name: string
  team1_logo: string | null
  team2_name: string
  team2_logo: string | null
  match_time: string
  androidlinkhindi: string | null
  androidlinkenglish: string | null
  ioslinkhindi: string | null
  ioslinkenglish: string | null
  desktoplinkhindi: string | null
  desktoplinkenglish: string | null
  created_at?: string
  updated_at?: string
}

const AdminPanel = () => {
  const { session } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  
  // States for matches
  const [matches, setMatches] = useState<Match[]>([])
  const [matchesLoading, setMatchesLoading] = useState(true)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchFormData, setMatchFormData] = useState<Partial<Match>>({})
  const [saving, setSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // Mobile-first admin theme
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-900',
    surface: 'bg-slate-800/60',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/40',
    button: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonDanger: 'bg-red-600 hover:bg-red-700 text-white',
    buttonSuccess: 'bg-green-600 hover:bg-green-700 text-white',
    input: 'bg-slate-800/60 border-slate-700/40 text-slate-100',
    modal: 'bg-slate-800/95 border-slate-700/50'
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white/90',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200/60',
    button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonDanger: 'bg-red-600 hover:bg-red-700 text-white',
    buttonSuccess: 'bg-green-600 hover:bg-green-700 text-white',
    input: 'bg-white/90 border-gray-200/60 text-gray-900',
    modal: 'bg-white/95 border-gray-200/60'
  }, [isDarkMode])

  // GSAP animations
  useGSAP(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(containerRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
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
      year: '2-digit',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Load matches
  const loadMatches = async () => {
    setMatchesLoading(true)
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: false })
      
      if (!error && data) {
        setMatches(data)
      } else {
        console.error('Error loading matches:', error)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setMatchesLoading(false)
    }
  }

  // Fixed closeModal function
  const closeModal = () => {
    setShowMatchModal(false)
    setEditingMatch(null)
    setMatchFormData({})
    setSaving(false)
  }

  // FIXED CRUD operations
  const createMatch = async () => {
    if (!matchFormData.team1_name || !matchFormData.team2_name || !matchFormData.match_time) {
      alert('Please fill in required fields')
      return
    }

    setSaving(true)
    setIsUpdating(true)
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchFormData])
        .select()
      
      if (!error && data) {
        closeModal()
        await loadMatches() // Reload fresh data
        alert('Match created successfully!')
      } else {
        alert('Error creating match: ' + error?.message)
      }
    } catch (error) {
      console.error('Error creating match:', error)
      alert('Error creating match')
    } finally {
      setSaving(false)
      setIsUpdating(false)
    }
  }

  const updateMatch = async () => {
    if (!editingMatch) return
    
    if (!matchFormData.team1_name || !matchFormData.team2_name || !matchFormData.match_time) {
      alert('Please fill in required fields')
      return
    }

    setSaving(true)
    setIsUpdating(true)
    try {
      const { data, error } = await supabase
        .from('matches')
        .update(matchFormData)
        .eq('id', editingMatch.id)
        .select()
      
      if (!error && data) {
        closeModal()
        await loadMatches() // Reload fresh data
        alert('Match updated successfully!')
      } else {
        alert('Error updating match: ' + error?.message)
      }
    } catch (error) {
      console.error('Error updating match:', error)
      alert('Error updating match')
    } finally {
      setSaving(false)
      setIsUpdating(false)
    }
  }

  const deleteMatch = async (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match?')) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
      
      if (!error) {
        await loadMatches() // Reload fresh data
        alert('Match deleted successfully!')
      } else {
        alert('Error deleting match: ' + error.message)
      }
    } catch (error) {
      console.error('Error deleting match:', error)
      alert('Error deleting match')
    } finally {
      setIsUpdating(false)
    }
  }

  const openMatchModal = (match?: Match) => {
    if (match) {
      setEditingMatch(match)
      setMatchFormData({
        team1_name: match.team1_name,
        team2_name: match.team2_name,
        team1_logo: match.team1_logo,
        team2_logo: match.team2_logo,
        match_time: match.match_time,
        androidlinkhindi: match.androidlinkhindi,
        androidlinkenglish: match.androidlinkenglish,
        ioslinkhindi: match.ioslinkhindi,
        ioslinkenglish: match.ioslinkenglish,
        desktoplinkhindi: match.desktoplinkhindi,
        desktoplinkenglish: match.desktoplinkenglish
      })
    } else {
      setEditingMatch(null)
      setMatchFormData({})
    }
    setShowMatchModal(true)
  }

  // Load matches on component mount
  useEffect(() => {
    loadMatches()
  }, [])
// AdminPanel.tsx mein add kar
useEffect(() => {
  console.log('Admin Panel - Session:', session);
  console.log('Admin Panel - User:', session?.user);
  console.log('Admin Panel - JWT:', session?.access_token);
  
  if (!session) {
    alert('Not authenticated! Redirecting to login...');
    // Redirect to auth page
    window.location.href = '/auth';
  }
}, [session]);

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Clean background */}
      <div className={`fixed inset-0 ${isDarkMode 
        ? 'bg-gradient-to-br from-slate-900/98 to-slate-800/95' 
        : 'bg-gradient-to-br from-gray-50/98 to-white/95'
      } transition-colors duration-300`} />

      {/* Loading overlay during updates */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-60 flex items-center justify-center">
          <div className={`${themeClasses.surface} rounded-2xl p-6 flex items-center gap-4 shadow-2xl`}>
            <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className={`${themeClasses.text} font-medium`}>Processing...</span>
          </div>
        </div>
      )}

      <div ref={containerRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Mobile-Optimized Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-red-600 shadow-sm">
              <PlayIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl sm:text-3xl font-semibold ${themeClasses.text} tracking-tight`}>
                Admin Panel
              </h1>
              <p className={`text-sm sm:text-base ${themeClasses.textMuted} mt-1`}>
                Manage Cricket Matches • IST Timezone
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div ref={contentRef}>
          <div className="space-y-4 sm:space-y-6">
            {/* Mobile-First Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className={`text-xl sm:text-2xl font-semibold ${themeClasses.text}`}>
                Matches Management
              </h2>
              <button
                onClick={() => openMatchModal()}
                className={`${themeClasses.buttonPrimary} px-4 py-3 sm:px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-3 shadow-sm text-sm sm:text-base w-full sm:w-auto`}
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Match</span>
              </button>
            </div>

            {/* Mobile-Responsive Matches Display */}
            <div className={`${themeClasses.surface} ${themeClasses.border} rounded-2xl border backdrop-blur-sm overflow-hidden shadow-sm`}>
              {matchesLoading ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className={themeClasses.textMuted}>Loading matches...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>No matches found</h3>
                  <p className={themeClasses.textMuted}>Create your first match to get started</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${themeClasses.border} border-b`}>
                        <tr>
                          <th className={`text-left p-4 font-semibold ${themeClasses.text}`}>Teams</th>
                          <th className={`text-left p-4 font-semibold ${themeClasses.text}`}>Match Time (IST)</th>
                          <th className={`text-left p-4 font-semibold ${themeClasses.text}`}>Created</th>
                          <th className={`text-left p-4 font-semibold ${themeClasses.text}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((match) => (
                          <tr key={match.id} className={`${themeClasses.border} border-b hover:bg-opacity-50 transition-colors`}>
                            <td className="p-4">
                              <div className={`font-medium ${themeClasses.textSecondary}`}>
                                {match.team1_name} vs {match.team2_name}
                              </div>
                              <div className={`text-sm ${themeClasses.textMuted}`}>
                                ID: {match.id}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className={`${themeClasses.textSecondary}`}>
                                {formatDateIST(match.match_time)}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className={`text-sm ${themeClasses.textMuted}`}>
                                {match.created_at ? formatDateIST(match.created_at) : 'N/A'}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openMatchModal(match)}
                                  className={`${themeClasses.button} p-2 rounded-lg transition-all duration-200 hover:scale-105`}
                                  title="Edit Match"
                                  disabled={isUpdating}
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteMatch(match.id)}
                                  className={`${themeClasses.buttonDanger} p-2 rounded-lg transition-all duration-200 hover:scale-105`}
                                  title="Delete Match"
                                  disabled={isUpdating}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4 p-4">
                    {matches.map((match) => (
                      <div key={match.id} className={`${themeClasses.border} border rounded-xl p-4 space-y-3`}>
                        {/* Match Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${themeClasses.textSecondary} text-sm leading-tight`}>
                              {match.team1_name} vs {match.team2_name}
                            </h3>
                            <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                              ID: {match.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => openMatchModal(match)}
                              className={`${themeClasses.button} p-2 rounded-lg transition-all duration-200 hover:scale-105`}
                              title="Edit Match"
                              disabled={isUpdating}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteMatch(match.id)}
                              className={`${themeClasses.buttonDanger} p-2 rounded-lg transition-all duration-200 hover:scale-105`}
                              title="Delete Match"
                              disabled={isUpdating}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className={`text-sm ${themeClasses.textSecondary}`}>
                              {formatDateIST(match.match_time)}
                            </span>
                          </div>
                          {match.created_at && (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 flex-shrink-0" />
                              <span className={`text-xs ${themeClasses.textMuted}`}>
                                Created: {formatDateIST(match.created_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className={`${themeClasses.modal} ${themeClasses.border} border rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-opacity-20">
              <h3 className={`text-lg sm:text-xl font-semibold ${themeClasses.text}`}>
                {editingMatch ? 'Edit Match' : 'Add New Match'}
              </h3>
              <button
                onClick={closeModal}
                className={`${themeClasses.button} p-2 rounded-lg transition-all duration-200 hover:scale-105`}
                disabled={saving}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Team 1 Name *
                  </label>
                  <input
                    type="text"
                    value={matchFormData.team1_name || ''}
                    onChange={(e) => setMatchFormData({...matchFormData, team1_name: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm sm:text-base`}
                    placeholder="Enter team 1 name"
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Team 2 Name *
                  </label>
                  <input
                    type="text"
                    value={matchFormData.team2_name || ''}
                    onChange={(e) => setMatchFormData({...matchFormData, team2_name: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm sm:text-base`}
                    placeholder="Enter team 2 name"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Team 1 Logo URL
                  </label>
                  <input
                    type="url"
                    value={matchFormData.team1_logo || ''}
                    onChange={(e) => setMatchFormData({...matchFormData, team1_logo: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm sm:text-base`}
                    placeholder="https://example.com/logo1.png"
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Team 2 Logo URL
                  </label>
                  <input
                    type="url"
                    value={matchFormData.team2_logo || ''}
                    onChange={(e) => setMatchFormData({...matchFormData, team2_logo: e.target.value})}
                    className={`${themeClasses.input} ${themeClasses.border} border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm sm:text-base`}
                    placeholder="https://example.com/logo2.png"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                  Match Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  value={matchFormData.match_time ? new Date(matchFormData.match_time).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setMatchFormData({...matchFormData, match_time: new Date(e.target.value).toISOString()})}
                  className={`${themeClasses.input} ${themeClasses.border} border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm sm:text-base`}
                  disabled={saving}
                />
              </div>

              {/* Streaming Links - Collapsible on Mobile */}
              <details className="group">
                <summary className={`cursor-pointer font-medium ${themeClasses.text} text-sm sm:text-base py-2 flex items-center justify-between`}>
                  Streaming Links (Optional)
                  <Bars3Icon className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                
                <div className="space-y-4 mt-4 pl-0 sm:pl-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${themeClasses.text} mb-2`}>
                        Android Hindi Link
                      </label>
                      <input
                        type="url"
                        value={matchFormData.androidlinkhindi || ''}
                        onChange={(e) => setMatchFormData({...matchFormData, androidlinkhindi: e.target.value})}
                        className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                        placeholder="https://stream-android-hindi.com"
                        disabled={saving}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium ${themeClasses.text} mb-2`}>
                        Android English Link
                      </label>
                      <input
                        type="url"
                        value={matchFormData.androidlinkenglish || ''}
                        onChange={(e) => setMatchFormData({...matchFormData, androidlinkenglish: e.target.value})}
                        className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                        placeholder="https://stream-android-english.com"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${themeClasses.text} mb-2`}>
                        iOS Hindi Link
                      </label>
                      <input
                        type="url"
                        value={matchFormData.ioslinkhindi || ''}
                        onChange={(e) => setMatchFormData({...matchFormData, ioslinkhindi: e.target.value})}
                        className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                        placeholder="https://stream-ios-hindi.com"
                        disabled={saving}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium ${themeClasses.text} mb-2`}>
                        iOS English Link
                      </label>
                      <input
                        type="url"
                        value={matchFormData.ioslinkenglish || ''}
                        onChange={(e) => setMatchFormData({...matchFormData, ioslinkenglish: e.target.value})}
                        className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                        placeholder="https://stream-ios-english.com"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${themeClasses.text} mb-2`}>
                        Desktop Hindi Link
                      </label>
                      <input
                        type="url"
                        value={matchFormData.desktoplinkhindi || ''}
                        onChange={(e) => setMatchFormData({...matchFormData, desktoplinkhindi: e.target.value})}
                        className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                        placeholder="https://stream-desktop-hindi.com"
                        disabled={saving}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium ${themeClasses.text} mb-2`}>
                        Desktop English Link
                      </label>
                      <input
                        type="url"
                        value={matchFormData.desktoplinkenglish || ''}
                        onChange={(e) => setMatchFormData({...matchFormData, desktoplinkenglish: e.target.value})}
                        className={`${themeClasses.input} ${themeClasses.border} border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-full text-sm`}
                        placeholder="https://stream-desktop-english.com"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-opacity-20">
              <button
                onClick={closeModal}
                disabled={saving}
                className={`${themeClasses.button} px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 w-full sm:w-auto order-2 sm:order-1`}
              >
                Cancel
              </button>
              <button
                onClick={editingMatch ? updateMatch : createMatch}
                disabled={!matchFormData.team1_name || !matchFormData.team2_name || !matchFormData.match_time || saving}
                className={`${themeClasses.buttonPrimary} px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    <span>{editingMatch ? 'Update Match' : 'Create Match'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
