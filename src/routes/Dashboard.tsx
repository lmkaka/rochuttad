import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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

type MatchStats = {
  total: number
  upcoming: number
  live: number
  today: number
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Optimized theme change handler
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // **MOBILE-OPTIMIZED: Professional theme classes**
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-transparent',
    surface: 'bg-slate-800/80 backdrop-blur-xl',
    card: 'bg-slate-800/70 backdrop-blur-lg',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/40',
    accent: 'text-blue-400',
    button: 'bg-blue-600/95 hover:bg-blue-700/95 backdrop-blur-sm',
    glass: 'bg-slate-800/50 backdrop-blur-2xl border-slate-700/30'
  } : {
    bg: 'bg-transparent',
    surface: 'bg-white/85 backdrop-blur-xl',
    card: 'bg-white/75 backdrop-blur-lg',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200/50',
    accent: 'text-blue-600',
    button: 'bg-blue-600/95 hover:bg-blue-700/95 backdrop-blur-sm',
    glass: 'bg-white/60 backdrop-blur-2xl border-gray-200/40'
  }, [isDarkMode])

  // Optimized stats calculation with useMemo
  const matchStats = useMemo((): MatchStats => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    let upcoming = 0
    let live = 0
    let today = 0
    
    matches.forEach(match => {
      const matchTime = new Date(match.match_time)
      
      // Today's matches
      if (matchTime >= todayStart && matchTime < todayEnd) {
        today++
      }
      
      // Live matches (started within last 6 hours)
      const timeDiff = now.getTime() - matchTime.getTime()
      if (timeDiff >= 0 && timeDiff <= 6 * 60 * 60 * 1000) {
        live++
      }
      
      // Upcoming matches
      if (matchTime > now) {
        upcoming++
      }
    })
    
    return {
      total: matches.length,
      upcoming,
      live,
      today
    }
  }, [matches])

  // Optimized data fetching
  const fetchMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: true })
        .limit(100)
      
      if (!error && data) {
        setMatches(data)
      } else {
        console.error('Error fetching matches:', error)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
    }
  }, [])

  // Initial load and real-time subscription
  useEffect(() => {
    fetchMatches()
    
    const channel = supabase
      .channel('matches_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'matches' 
      }, () => {
        setTimeout(() => fetchMatches(), 500)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMatches])

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

  }, [loading])

  // User preferences
  const userDevice = profile?.device_preference || 'Android'
  const userLanguage = profile?.language_preference || 'English'

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      fetchMatches(true)
    }
  }, [refreshing, fetchMatches])

  // **MOBILE-OPTIMIZED: Clean skeleton loader**
  const SkeletonLoader = useMemo(() => (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div 
          key={i} 
          className={`${themeClasses.glass} rounded-xl sm:rounded-2xl h-[300px] sm:h-[350px] border ${themeClasses.border} animate-pulse shadow-lg`}
        >
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300/50 rounded-xl sm:rounded-2xl" />
              <div className="w-16 h-6 sm:w-20 sm:h-8 bg-gray-300/50 rounded-lg" />
            </div>
            <div className="space-y-2 sm:space-y-3 text-center">
              <div className="h-4 sm:h-6 bg-gray-300/50 rounded mx-auto w-20 sm:w-24" />
              <div className="h-3 sm:h-4 bg-gray-300/50 rounded mx-auto w-12 sm:w-16" />
            </div>
            <div className="h-10 sm:h-12 bg-gray-300/50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  ), [themeClasses])

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-500 relative`}>
      {/* Subtle overlay for better readability */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/15' : 'bg-white/5'} pointer-events-none`} />
      
      {/* **MOBILE-FIRST: Optimized container** */}
      <div ref={containerRef} className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* **MOBILE-OPTIMIZED: Clean header** */}
        <div ref={heroRef} className="mb-6 sm:mb-8">
          <div className={`${themeClasses.surface} ${themeClasses.border} border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                  <PlayIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.text} mb-1`}>
                    Cricket Matches
                  </h1>
                  <p className={`text-sm sm:text-base ${themeClasses.textMuted}`}>
                    Live streaming • Welcome, {profile?.name}
                  </p>
                </div>
              </div>
              
              {/* **MOBILE-FRIENDLY: Refresh button** */}
              <div className="w-full sm:w-auto">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`${themeClasses.button} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold shadow-lg w-full sm:w-auto`}
                >
                  <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* **MOBILE-OPTIMIZED: Stats grid** */}
        <div ref={statsRef} className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}>
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <ChartBarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 mb-1">{matchStats.total}</div>
              <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Total</div>
            </div>
            
            <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}>
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <ClockIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-green-600 mb-1">{matchStats.upcoming}</div>
              <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Upcoming</div>
            </div>
            
            <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}>
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <TvIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-600 mb-1">{matchStats.live}</div>
              <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Live</div>
            </div>
            
            <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}>
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <FireIcon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600 mb-1">{matchStats.today}</div>
              <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Today</div>
            </div>
          </div>
        </div>

        {/* **MOBILE-OPTIMIZED: Content Section** */}
        {loading ? (
          <div ref={gridRef}>
            {SkeletonLoader}
          </div>
        ) : matches.length === 0 ? (
          <div ref={gridRef} className="text-center py-12 sm:py-16">
            <div className={`${themeClasses.surface} ${themeClasses.border} border rounded-2xl sm:rounded-3xl p-8 sm:p-12 max-w-md mx-auto shadow-xl`}>
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <TvIcon className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold ${themeClasses.text} mb-2 sm:mb-3`}>
                No Matches Available
              </h3>
              <p className={`${themeClasses.textMuted} mb-6 sm:mb-8 text-sm sm:text-base`}>
                Check back soon for exciting cricket matches!
              </p>
              <button 
                className={`${themeClasses.button} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 font-semibold shadow-lg`}
                onClick={handleRefresh}
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="space-y-6 sm:space-y-8">
            {/* **MOBILE-FRIENDLY: Section header** */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4">
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.text}`}>
                Available Matches
              </h2>
              <div className={`px-3 sm:px-4 py-1 sm:py-2 ${themeClasses.surface} ${themeClasses.border} border rounded-lg sm:rounded-2xl shadow-md`}>
                <span className={`text-sm sm:text-base font-bold ${themeClasses.textSecondary}`}>
                  {matches.length} matches
                </span>
              </div>
            </div>

            {/* **MOBILE-OPTIMIZED: Matches grid** */}
            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {matches.map((match, index) => (
                <div key={match.id} className="w-full">
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
