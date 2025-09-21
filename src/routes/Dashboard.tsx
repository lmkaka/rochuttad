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

  // **UPDATED: Enhanced theme classes with transparency for parallax background**
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-transparent', // ✅ Changed from bg-slate-900 to transparent
    surface: 'bg-slate-800/70 backdrop-blur-xl', // ✅ Added backdrop-blur for glass effect
    card: 'bg-slate-800/60 backdrop-blur-lg', // ✅ Enhanced transparency + blur
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/30', // ✅ More transparent borders
    accent: 'text-blue-400',
    button: 'bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm', // ✅ Semi-transparent buttons
    glass: 'bg-slate-800/40 backdrop-blur-2xl border-slate-700/20' // ✅ New glass effect class
  } : {
    bg: 'bg-transparent', // ✅ Changed from bg-gray-50 to transparent
    surface: 'bg-white/80 backdrop-blur-xl', // ✅ Added backdrop-blur for glass effect
    card: 'bg-white/70 backdrop-blur-lg', // ✅ Enhanced transparency + blur
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200/40', // ✅ More transparent borders
    accent: 'text-blue-600',
    button: 'bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm', // ✅ Semi-transparent buttons
    glass: 'bg-white/50 backdrop-blur-2xl border-gray-200/30' // ✅ New glass effect class
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
    
    // Real-time subscription with throttling
    const channel = supabase
      .channel('matches_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'matches' 
      }, () => {
        // Debounce updates to prevent excessive re-renders
        setTimeout(() => fetchMatches(), 500)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMatches])

  // **ENHANCED: Parallax-aware animations**
  useGSAP(() => {
    if (!containerRef.current || !heroRef.current || !statsRef.current || !gridRef.current) return
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      return
    }
    
    const tl = gsap.timeline()
    
    // Enhanced entrance animations with parallax consideration
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 30, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo(statsRef.current, 
      { opacity: 0, y: 20, rotationX: -15 }, 
      { opacity: 1, y: 0, rotationX: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3'
    )
    .fromTo(gridRef.current, 
      { opacity: 0, y: 25 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2'
    )
    
    // Add subtle floating animation to stats cards
    gsap.to('.stat-card', {
      y: '+=5',
      duration: 2,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.2
    })

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

  // **UPDATED: Enhanced skeleton loader with glass effect**
  const SkeletonLoader = useMemo(() => (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div 
          key={i} 
          className={`${themeClasses.glass} rounded-2xl h-[350px] border ${themeClasses.border} animate-pulse shadow-xl`}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 bg-gray-300/50 rounded-2xl" />
              <div className="w-20 h-8 bg-gray-300/50 rounded-lg" />
            </div>
            <div className="space-y-3 text-center">
              <div className="h-6 bg-gray-300/50 rounded mx-auto w-24" />
              <div className="h-4 bg-gray-300/50 rounded mx-auto w-16" />
            </div>
            <div className="h-12 bg-gray-300/50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  ), [themeClasses])

  return (
    {/* **UPDATED: Transparent container to show parallax background** */}
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-500 relative`}>
      {/* **NEW: Subtle overlay for better readability** */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/20' : 'bg-white/10'} pointer-events-none`} />
      
      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* **UPDATED: Enhanced header with glass effect** */}
        <div ref={heroRef}>
          <div className={`${themeClasses.surface} ${themeClasses.border} border-2 rounded-3xl p-6 shadow-2xl`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl">
                  <PlayIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text} mb-1`}>
                    Cricket Matches
                  </h1>
                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    Live streaming and updates • Welcome, {profile?.name}
                  </p>
                </div>
              </div>
              
              {/* **UPDATED: Enhanced refresh button** */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`${themeClasses.button} text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold shadow-lg`}
                >
                  <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* **UPDATED: Enhanced stats grid with glass effect** */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border-2 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl`}>
            <div className="flex items-center justify-center mb-3">
              <ChartBarIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-1">{matchStats.total}</div>
            <div className={`text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Total</div>
          </div>
          
          <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border-2 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl`}>
            <div className="flex items-center justify-center mb-3">
              <ClockIcon className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-green-600 mb-1">{matchStats.upcoming}</div>
            <div className={`text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Upcoming</div>
          </div>
          
          <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border-2 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl`}>
            <div className="flex items-center justify-center mb-3">
              <TvIcon className="h-10 w-10 text-red-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600 mb-1">{matchStats.live}</div>
            <div className={`text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Live</div>
          </div>
          
          <div className={`stat-card ${themeClasses.card} ${themeClasses.border} border-2 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl`}>
            <div className="flex items-center justify-center mb-3">
              <FireIcon className="h-10 w-10 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 mb-1">{matchStats.today}</div>
            <div className={`text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wider`}>Today</div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div ref={gridRef}>
            {SkeletonLoader}
          </div>
        ) : matches.length === 0 ? (
          <div ref={gridRef} className="text-center py-16">
            <div className={`${themeClasses.surface} ${themeClasses.border} border-2 rounded-3xl p-12 max-w-md mx-auto shadow-2xl`}>
              <div className="flex items-center justify-center mb-6">
                <TvIcon className="h-20 w-20 text-gray-400" />
              </div>
              <h3 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
                No Matches Available
              </h3>
              <p className={`${themeClasses.textMuted} mb-8 text-base`}>
                Check back soon for exciting cricket matches!
              </p>
              <button 
                className={`${themeClasses.button} text-white px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 font-semibold shadow-lg`}
                onClick={handleRefresh}
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="space-y-8">
            {/* **UPDATED: Enhanced section header** */}
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text}`}>
                Available Matches
              </h2>
              <div className={`px-4 py-2 ${themeClasses.surface} ${themeClasses.border} border rounded-2xl shadow-lg`}>
                <span className={`text-base font-bold ${themeClasses.textSecondary}`}>
                  {matches.length}
                </span>
              </div>
            </div>

            {/* **UPDATED: Enhanced matches grid** */}
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
