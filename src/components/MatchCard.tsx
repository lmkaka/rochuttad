import { useRef, useEffect, useState, useMemo } from 'react'
import { formatMatchTime } from '../utils/format'
import { pickLink } from '../utils/linkPicker'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  ClockIcon, 
  PlayIcon as PlayOutlineIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import { globalTheme } from '../routes/AuthPage'

type Props = {
  match: any
  device: 'iOS' | 'Android' | 'Desktop'
  language: 'Hindi' | 'English'
  index: number
}

export default function MatchCard({ match, device, language, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    const handleThemeChange = (event: CustomEvent) => setIsDarkMode(event.detail.isDarkMode)
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('themeChange', handleThemeChange as EventListener)
    }
  }, [])

  const themeClasses = useMemo(() => isDarkMode ? {
    card: 'bg-slate-800/95 border-slate-700',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    liveBadge: 'bg-red-500 text-white',
    upcomingBadge: 'bg-orange-500 text-white',
    finishedBadge: 'bg-slate-600 text-slate-300',
    liveButton: 'bg-green-600 hover:bg-green-700 text-white',
    upcomingButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    disabledButton: 'bg-slate-700 text-slate-500 cursor-not-allowed',
    teamContainer: 'bg-slate-700/60 border-slate-600',
    timeContainer: 'bg-slate-700/60 border-slate-600'
  } : {
    card: 'bg-white border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-800',
    textMuted: 'text-gray-600',
    liveBadge: 'bg-red-500 text-white',
    upcomingBadge: 'bg-orange-500 text-white',
    finishedBadge: 'bg-gray-500 text-white',
    liveButton: 'bg-green-600 hover:bg-green-700 text-white',
    upcomingButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    disabledButton: 'bg-gray-300 text-gray-500 cursor-not-allowed',
    teamContainer: 'bg-slate-100 border-gray-300',
    timeContainer: 'bg-slate-100 border-gray-300'
  }, [isDarkMode])

  const currentTime = new Date()
  const matchTime = new Date(match.match_time)
  const isLive = matchTime <= currentTime
  const isUpcoming = matchTime > currentTime
  const link = pickLink(match, device, language)

  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, delay: index * 0.1 }
      )
    }
  }, [index])

  const handleClick = () => {
    if (isLive && link) {
      window.open(link, '_blank')
    }
  }

  const getTimeUntilMatch = () => {
    if (!isUpcoming) return null
    
    const timeDiff = matchTime.getTime() - currentTime.getTime()
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Country codes for teams
  const getTeamCode = (teamName: string) => {
    const codes: { [key: string]: string } = {
      'Pakistan': 'PAK',
      'India': 'IND',
      'Australia': 'AUS',
      'England': 'ENG',
      'New Zealand': 'NZ',
      'South Africa': 'SA',
      'Sri Lanka': 'SL',
      'Bangladesh': 'BAN',
      'West Indies': 'WI',
      'Afghanistan': 'AFG'
    }
    return codes[teamName] || teamName.slice(0, 3).toUpperCase()
  }

  // Team flag colors
  const getTeamColors = (teamName: string) => {
    const colors: { [key: string]: string } = {
      'Pakistan': 'from-green-600 to-green-800',
      'India': 'from-orange-500 via-white to-green-600',
      'Australia': 'from-yellow-400 to-green-600',
      'England': 'from-red-600 via-white to-blue-600',
      'New Zealand': 'from-black to-white',
      'South Africa': 'from-green-500 via-yellow-400 to-red-500',
      'Sri Lanka': 'from-blue-600 via-yellow-400 to-red-600',
      'Bangladesh': 'from-green-600 to-red-600',
      'West Indies': 'from-red-600 via-yellow-400 to-blue-600',
      'Afghanistan': 'from-black via-red-600 to-green-600'
    }
    return colors[teamName] || 'from-gray-600 to-gray-800'
  }

  return (
    <div 
      ref={cardRef}
      className={`${themeClasses.card} rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
      onClick={handleClick}
    >
      {isMobile ? (
        /* Mobile Layout - Same as before */
        <div className="p-4">
          {/* Status & Time */}
          <div className="flex items-center justify-between mb-4">
            <div className={`${isLive ? themeClasses.liveBadge : isUpcoming ? themeClasses.upcomingBadge : themeClasses.finishedBadge} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5`}>
              {isLive && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'FINISHED'}
            </div>
            <div className={`${themeClasses.timeContainer} px-3 py-2 rounded-lg border`}>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span className={`${themeClasses.text} text-sm font-medium`}>
                  {formatMatchTime(match.match_time)}
                </span>
              </div>
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTeamColors(match.team1_name)} flex items-center justify-center border-2 border-white/20 shadow-md`}>
                  <span className="text-white font-black text-xs">
                    {getTeamCode(match.team1_name)}
                  </span>
                </div>
                <div>
                  <h3 className={`${themeClasses.text} font-bold text-sm`}>
                    {match.team1_name.length > 10 ? match.team1_name.slice(0, 10) + '...' : match.team1_name}
                  </h3>
                  <p className={`${themeClasses.textMuted} text-xs`}>HOME</p>
                </div>
              </div>
            </div>

            <div className={`${themeClasses.teamContainer} px-3 py-2 rounded-lg border`}>
              <span className={`${themeClasses.text} text-sm font-black`}>VS</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 justify-end text-right">
                <div>
                  <h3 className={`${themeClasses.text} font-bold text-sm`}>
                    {match.team2_name.length > 10 ? match.team2_name.slice(0, 10) + '...' : match.team2_name}
                  </h3>
                  <p className={`${themeClasses.textMuted} text-xs`}>AWAY</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTeamColors(match.team2_name)} flex items-center justify-center border-2 border-white/20 shadow-md`}>
                  <span className="text-white font-black text-xs">
                    {getTeamCode(match.team2_name)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            {isLive && link ? (
              <button className={`${themeClasses.liveButton} px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:scale-105`}>
                <PlayIcon className="w-4 h-4" />
                Watch Live
              </button>
            ) : isUpcoming ? (
              <button className={`${themeClasses.upcomingButton} px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2`}>
                <CalendarIcon className="w-4 h-4" />
                {getTimeUntilMatch()}
              </button>
            ) : (
              <button className={`${themeClasses.disabledButton} px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2`}>
                <ExclamationTriangleIcon className="w-4 h-4" />
                N/A
              </button>
            )}
          </div>
        </div>
      ) : (
        /* DESKTOP LAYOUT - PROPER CRICKET CARD STYLE */
        <div className="relative">
          
          {/* Top Status Bar */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
            <div className={`${isLive ? themeClasses.liveBadge : isUpcoming ? themeClasses.upcomingBadge : themeClasses.finishedBadge} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg`}>
              {isLive && <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>}
              {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'FINISHED'}
            </div>
            
            <div className={`${themeClasses.timeContainer} px-4 py-2 rounded-xl border-2 shadow-lg backdrop-blur-sm`}>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-500" />
                <div className="text-center">
                  <div className={`${themeClasses.text} font-bold text-lg leading-tight`}>
                    12:45 PM
                  </div>
                  <div className={`${themeClasses.textMuted} text-xs font-medium`}>
                    21 Sep
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="pt-20 pb-6 px-8">
            
            {/* Teams Display */}
            <div className="flex items-center justify-center gap-12 mb-8">
              
              {/* Team 1 */}
              <div className="flex flex-col items-center space-y-4 min-w-[200px]">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getTeamColors(match.team1_name)} flex items-center justify-center shadow-2xl border-4 border-white/30 hover:scale-105 transition-transform`}>
                  <span className="text-white font-black text-2xl">
                    {getTeamCode(match.team1_name)}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className={`${themeClasses.text} text-2xl font-black mb-1`}>
                    {getTeamCode(match.team1_name)}
                  </h2>
                  <p className={`${themeClasses.textMuted} text-sm font-bold uppercase tracking-wider`}>
                    HOME
                  </p>
                </div>
              </div>

              {/* VS Section */}
              <div className="flex flex-col items-center">
                <div className={`${themeClasses.teamContainer} px-8 py-4 rounded-2xl border-4 shadow-xl hover:scale-110 transition-transform`}>
                  <span className={`${themeClasses.text} text-3xl font-black tracking-wider`}>
                    VS
                  </span>
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center space-y-4 min-w-[200px]">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getTeamColors(match.team2_name)} flex items-center justify-center shadow-2xl border-4 border-white/30 hover:scale-105 transition-transform`}>
                  <span className="text-white font-black text-2xl">
                    {getTeamCode(match.team2_name)}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className={`${themeClasses.text} text-2xl font-black mb-1`}>
                    {getTeamCode(match.team2_name)}
                  </h2>
                  <p className={`${themeClasses.textMuted} text-sm font-bold uppercase tracking-wider`}>
                    AWAY
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              {isLive && link ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(link, '_blank')
                  }}
                  className={`${themeClasses.liveButton} px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl hover:scale-105 transition-all`}
                >
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                  <PlayIcon className="w-6 h-6" />
                  WATCH LIVE
                </button>
              ) : isUpcoming ? (
                <button className={`${themeClasses.upcomingButton} px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl`}>
                  <CalendarIcon className="w-6 h-6" />
                  STARTS IN {getTimeUntilMatch()}
                </button>
              ) : (
                <button className={`${themeClasses.disabledButton} px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl`}>
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  MATCH ENDED
                </button>
              )}
            </div>
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
      )}
    </div>
  )
}
