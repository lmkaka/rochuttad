import React, { useEffect, useRef, useState, useMemo } from 'react'
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
  FireIcon,
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { PlayIcon, StarIcon } from '@heroicons/react/24/solid'
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
  const { profile, session } = useAuth()
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

  // Modern 2025 Design System [web:322][web:325]
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-950',
    surface: 'bg-slate-900/60',
    surfaceHover: 'bg-slate-800/80',
    card: 'bg-slate-900/40',
    text: 'text-slate-50',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-800/50',
    gradient: 'from-blue-600/20 via-purple-600/20 to-pink-600/20',
    gradientText: 'from-blue-400 via-purple-400 to-pink-400',
    accent: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  } : {
    bg: 'bg-slate-50',
    surface: 'bg-white/80',
    surfaceHover: 'bg-white/90',
    card: 'bg-white/60',
    text: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    border: 'border-slate-200/60',
    gradient: 'from-blue-50/80 via-indigo-50/80 to-purple-50/80',
    gradientText: 'from-blue-600 via-indigo-600 to-purple-600',
    accent: 'text-blue-600',
    glow: 'shadow-blue-200/40',
  }, [isDarkMode])

  // Enhanced GSAP Animations with 2025 trends [web:328]
  useGSAP(() => {
    if (!containerRef.current || !heroRef.current || !statsRef.current || !gridRef.current) return

    const tl = gsap.timeline()

    // Hero section with modern stagger
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 40, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.hero-title', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4'
    )
    .fromTo('.hero-subtitle', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3'
    )

    // Stats cards with micro-interactions
    if (statsRef.current?.children) {
      tl.fromTo(Array.from(statsRef.current.children), 
        { opacity: 0, y: 30, rotateX: 15 }, 
        { 
          opacity: 1, 
          y: 0, 
          rotateX: 0,
          duration: 0.6, 
          stagger: 0.1, 
          ease: 'back.out(1.4)'
        }, '-=0.2'
      )
    }

    // Grid entrance
    tl.fromTo(gridRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3'
    )

    // Add floating animation to stats
    if (statsRef.current?.children) {
      Array.from(statsRef.current.children).forEach((card, i) => {
        gsap.to(card, {
          y: -5,
          duration: 2 + i * 0.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
        })
      })
    }
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
      }, (payload: any) => {
        console.log('Realtime update:', payload)
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

  // Enhanced stats calculations
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
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-500 relative overflow-hidden`}>
      {/* Modern Animated Background [web:325] */}
      <div className={`fixed inset-0 bg-gradient-to-br ${themeClasses.gradient} transition-all duration-700`} />
      <div className={`fixed inset-0 ${isDarkMode 
        ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]' 
        : 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]'
      }`} />
      
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${themeClasses.accent} rounded-full opacity-20 animate-pulse`}
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div ref={containerRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Modern Hero Section [web:322][web:326] */}
        <div ref={heroRef} className="mb-8 sm:mb-12">
          <div className={`${themeClasses.surface} ${themeClasses.border} border rounded-3xl backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl ${themeClasses.glow}`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl">
                      <PlayIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h1 className={`hero-title text-3xl sm:text-4xl lg:text-5xl font-bold ${themeClasses.text} tracking-tight`}>
                      <span className={`bg-gradient-to-r ${themeClasses.gradientText} bg-clip-text text-transparent`}>
                        WatchWithRadar
                      </span>
                    </h1>
                    <p className={`hero-subtitle text-lg ${themeClasses.textSecondary} mt-2 font-medium`}>
                      Your Premium Cricket Streaming Experience
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className={`text-sm ${themeClasses.textMuted} font-medium`}>Live Streaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    <span className={`text-sm ${themeClasses.textMuted} font-medium`}>HD Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BoltIcon className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm ${themeClasses.textMuted} font-medium`}>Real-time Updates</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={forceReload}
                  disabled={loading}
                  className={`${themeClasses.surface} ${themeClasses.surfaceHover} ${themeClasses.border} border px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-60 flex items-center gap-3 backdrop-blur-sm shadow-lg group`}
                >
                  <ArrowPathIcon className={`h-5 w-5 ${themeClasses.accent} ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                  <span className={`font-semibold ${themeClasses.textSecondary}`}>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard [web:325][web:328] */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-2xl backdrop-blur-xl p-4 sm:p-6 text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl ${themeClasses.glow} group cursor-pointer`}>
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{matches.length}</div>
            <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wide`}>Total Matches</div>
          </div>
          
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-2xl backdrop-blur-xl p-4 sm:p-6 text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl ${themeClasses.glow} group cursor-pointer`}>
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{upcomingMatches}</div>
            <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wide`}>Upcoming</div>
          </div>
          
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-2xl backdrop-blur-xl p-4 sm:p-6 text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl ${themeClasses.glow} group cursor-pointer`}>
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 relative">
                <TvIcon className="h-6 w-6 text-white" />
                {liveMatches > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                )}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{liveMatches}</div>
            <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wide`}>Live Now</div>
          </div>
          
          <div className={`${themeClasses.card} ${themeClasses.border} border rounded-2xl backdrop-blur-xl p-4 sm:p-6 text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl ${themeClasses.glow} group cursor-pointer`}>
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <FireIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{todayMatches}</div>
            <div className={`text-xs sm:text-sm ${themeClasses.textMuted} font-semibold uppercase tracking-wide`}>Today</div>
          </div>
        </div>

        {/* Enhanced Content Section [web:326] */}
        {loading ? (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className={`${themeClasses.card} rounded-3xl h-[320px] border ${themeClasses.border} animate-pulse backdrop-blur-sm`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse" />
                    <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded animate-pulse" />
                    <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className={`${themeClasses.surface} ${themeClasses.border} border rounded-3xl backdrop-blur-xl p-8 sm:p-12 max-w-lg mx-auto shadow-2xl ${themeClasses.glow}`}>
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 shadow-xl">
                  <TvIcon className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold ${themeClasses.text} mb-4`}>No Matches Available</h3>
              <p className={`${themeClasses.textMuted} mb-8 leading-relaxed`}>
                We're working hard to bring you the latest cricket matches. Check back soon for exciting content!
              </p>
              <button 
                className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl font-semibold flex items-center gap-3 mx-auto`}
                onClick={forceReload}
              >
                <RocketLaunchIcon className="h-5 w-5" />
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="space-y-6">
            {/* Featured Matches Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="h-6 w-6 text-yellow-500" />
                <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text}`}>
                  Featured Matches
                </h2>
              </div>
              <div className={`px-4 py-2 ${themeClasses.surface} ${themeClasses.border} border rounded-full backdrop-blur-sm`}>
                <span className={`text-sm font-semibold ${themeClasses.textSecondary}`}>
                  {matches.length} Available
                </span>
              </div>
            </div>

            {/* Matches Grid */}
            <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {matches.map((match, index) => (
                <div key={match.id} className="transform transition-all duration-500 hover:scale-[1.02]">
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
