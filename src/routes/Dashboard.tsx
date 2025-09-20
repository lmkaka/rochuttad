import { useEffect, useRef, useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthProvider'
import MatchCard from '../components/MatchCard'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  ChartBarIcon,
  ClockIcon,
  ArrowPathIcon,
  TvIcon,
  FireIcon
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
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // Simple and sober design system
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-900',
    surface: 'bg-slate-800/50',
    card: 'bg-slate-800/30',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/50',
    accent: 'text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700',
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white/80',
    card: 'bg-white/60',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200/60',
    accent: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
  }, [isDarkMode])

  // Simple entrance animations
  useGSAP(() => {
    if (!containerRef.current || !heroRef.current || !statsRef.current || !gridRef.current) return

    const tl = gsap.timeline()
    
    // Simple fade in animations
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo(statsRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3'
    )
    .fromTo(gridRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3'
    )
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .order('match_time', { ascending: true })
          .limit(100)
        
        if (!error && data) {
          setMatches(data)
        }
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        setLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel('matches_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'matches' 
      }, () => {
        load() // Reload on changes
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const userDevice = profile?.device_preference || 'Android'
  const userLanguage = profile?.language_preference || 'English'

  const forceReload = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: true })
      
      if (!error && data) {
        setMatches(data)
      }
    } catch (error) {
      console.error('Error reloading:', error)
    } finally {
      setLoading(false)
    }
  }

  // Simple stats calculations
  const now = new Date()
  const upcomingMatches = matches.filter(m => new Date(m.match_time) > now).length
  const liveMatches = matches.filter(m => {
    const matchTime = new Date(m.match_time)
    const timeDiff = now.getTime() - matchTime.getTime()
    return timeDiff >= 0 && timeDiff <= 6 * 60 * 60 * 1000 // Within 6 hours
  }).length
  const todayMatches = matches.filter(m => {
    const matchDate = new Date(m.match_time).toDateString()
    return matchDate === now.toDateString()
  }).length

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-500`}>
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Simple Header */}
        <div ref={heroRef}>
          <div className={`${themeClasses.surface} ${themeClasses.border} border rounded-2xl backdrop-blur-sm p-4 sm:p-6`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
                  <PlayIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text}`}>
                    Cricket Matches
                  </h1>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                    Live streaming and updates
                  </p>
                </div>
              </div>
              
              <button 
                onClick={forceReload}
                disabled={loading}
                className={`${themeClasses.button} text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center gap-2 text-sm font-medium`}
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Simple Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-xl backdrop-blur-sm p-4 text-center`}>
            <div className="flex items-center justify-center mb-2">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{matches.length}</div>
            <div className={`text-xs ${themeClasses.textMuted} font-medium`}>Total</div>
          </div>
          
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-xl backdrop-blur-sm p-4 text-center`}>
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{upcomingMatches}</div>
            <div className={`text-xs ${themeClasses.textMuted} font-medium`}>Upcoming</div>
          </div>
          
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-xl backdrop-blur-sm p-4 text-center`}>
            <div className="flex items-center justify-center mb-2">
              <TvIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{liveMatches}</div>
            <div className={`text-xs ${themeClasses.textMuted} font-medium`}>Live</div>
          </div>
          
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-xl backdrop-blur-sm p-4 text-center`}>
            <div className="flex items-center justify-center mb-2">
              <FireIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{todayMatches}</div>
            <div className={`text-xs ${themeClasses.textMuted} font-medium`}>Today</div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div ref={gridRef} className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className={`${themeClasses.card} rounded-2xl h-[280px] border ${themeClasses.border} animate-pulse backdrop-blur-sm`}
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-300 rounded-full" />
                    <div className="w-12 h-12 bg-gray-300 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded" />
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div ref={gridRef} className="text-center py-12">
            <div className={`${themeClasses.surface} ${themeClasses.border} border rounded-2xl backdrop-blur-sm p-8 max-w-md mx-auto`}>
              <div className="flex items-center justify-center mb-4">
                <TvIcon className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                No Matches Available
              </h3>
              <p className={`${themeClasses.textMuted} mb-6 text-sm`}>
                Check back soon for exciting cricket matches!
              </p>
              <button 
                className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 font-medium`}
                onClick={forceReload}
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="space-y-6">
            {/* Simple Section Header */}
            <div className="flex items-center justify-between">
              <h2 className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}>
                Available Matches
              </h2>
              <div className={`px-3 py-1 ${themeClasses.surface} ${themeClasses.border} border rounded-full backdrop-blur-sm`}>
                <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                  {matches.length}
                </span>
              </div>
            </div>

            {/* Simple Matches Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((match, index) => (
                <div key={match.id} className="transition-all duration-200 hover:scale-[1.02]">
                  <MatchCard
                    match={match}
                    device={userDevice}
                    language={userLanguage}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
