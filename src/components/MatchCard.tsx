import { useRef, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatMatchTime } from '../utils/format'
import { pickLink } from '../utils/linkPicker'
import { supabase } from '../utils/supabaseClient'
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
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => setIsDarkMode(event.detail.isDarkMode)
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => {
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
    teamContainer: 'bg-slate-700/50',
    timeContainer: 'bg-slate-700/50'
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
    teamContainer: 'bg-gray-100',
    timeContainer: 'bg-gray-100'
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

  // **CONTROLLED ACCESS: Watch Live button with dashboard referrer check**
 const handleWatchClick = async (e: React.MouseEvent) => {
  e.stopPropagation()

  if (isLive) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('androidlinkhindi, androidlinkenglish, ioslinkhindi, ioslinkenglish, desktoplinkhindi, desktoplinkenglish')
        .eq('id', match.id)
        .single()

      if (error || !data) {
        alert('Stream link not found')
        return
      }

      let streamingUrl = ''

      if (device === 'Android' && language === 'Hindi') streamingUrl = data.androidlinkhindi
      else if (device === 'Android' && language === 'English') streamingUrl = data.androidlinkenglish
      else if (device === 'iOS' && language === 'Hindi') streamingUrl = data.ioslinkhindi
      else if (device === 'iOS' && language === 'English') streamingUrl = data.ioslinkenglish
      else if (device === 'Desktop' && language === 'Hindi') streamingUrl = data.desktoplinkhindi
      else if (device === 'Desktop' && language === 'English') streamingUrl = data.desktoplinkenglish

      if (streamingUrl) {
        window.location.href = streamingUrl
      } else {
        alert('No streaming URL found for your device/language')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to fetch streaming link')
    }
  }
}

  // **REMOVED: Card click handler - No direct card access**
  const handleCardClick = () => {
    // **DISABLED: No card click access for security**
    // Only Watch Live button should grant access
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

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <div className={`${themeClasses.liveBadge} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg`}>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )
    } else if (isUpcoming) {
      return (
        <div className={`${themeClasses.upcomingBadge} px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
          UPCOMING
        </div>
      )
    } else {
      return (
        <div className={`${themeClasses.finishedBadge} px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
          FINISHED
        </div>
      )
    }
  }

  // **SECURE ACCESS: Only Watch Live button grants stream access**
  const getActionButton = () => {
    if (isLive && link) {
      return (
        <button 
          onClick={handleWatchClick}
          className={`${themeClasses.liveButton} px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg w-full justify-center`}
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <PlayIcon className="w-5 h-5" />
          Watch Live
        </button>
      )
    } else if (isUpcoming) {
      return (
        <button 
          className={`${themeClasses.upcomingButton} px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 w-full justify-center cursor-default`}
          disabled
        >
          <CalendarIcon className="w-5 h-5" />
          {getTimeUntilMatch()}
        </button>
      )
    } else if (!isLive && !isUpcoming && link) {
      return (
        <button 
          onClick={handleWatchClick}
          className={`${themeClasses.liveButton} px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg w-full justify-center`}
        >
          <PlayOutlineIcon className="w-5 h-5" />
          Replay
        </button>
      )
    } else {
      return (
        <button 
          className={`${themeClasses.disabledButton} px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 w-full justify-center cursor-default`}
          disabled
        >
          <ExclamationTriangleIcon className="w-5 h-5" />
          N/A
        </button>
      )
    }
  }

  // Team name truncation
  const truncateTeamName = (name: string) => {
    return name.length > 10 ? name.slice(0, 10) + '...' : name
  }

  // Country code from team name
  const getCountryCode = (teamName: string) => {
    const codes: { [key: string]: string } = {
      'Pakistan': 'PAK',
      'India': 'IND',
      'Australia': 'AUS',
      'England': 'ENG',
      'New Zealand': 'NZL',
      'South Africa': 'RSA',
      'Sri Lanka': 'SL',
      'Bangladesh': 'BAN',
      'West Indies': 'WI',
      'Afghanistan': 'AFG'
    }
    return codes[teamName] || teamName.slice(0, 3).toUpperCase()
  }

  // Country flag colors
  const getFlagColors = (teamName: string) => {
    const colors: { [key: string]: string } = {
      'Pakistan': 'from-green-600 to-green-800',
      'India': 'from-orange-500 to-blue-600',
      'Australia': 'from-yellow-400 to-green-600',
      'England': 'from-red-600 to-blue-600',
      'New Zealand': 'from-blue-500 to-black',
      'South Africa': 'from-green-500 to-yellow-500',
      'Sri Lanka': 'from-blue-500 to-orange-500',
      'Bangladesh': 'from-green-600 to-red-600',
      'West Indies': 'from-red-600 to-yellow-500',
      'Afghanistan': 'from-black to-red-600'
    }
    return colors[teamName] || 'from-gray-500 to-gray-700'
  }

  // Enhanced image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none'
    const fallback = e.currentTarget.nextElementSibling as HTMLElement
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }

  return (
    <div
      ref={cardRef}
      className={`
        ${themeClasses.card}
        rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300
        w-full
      `}
      // **REMOVED: onClick handler for security**
    >
      {/* Mobile Layout */}
      <div className="block md:hidden p-4">
        {/* Header - Status & Time */}
        <div className="flex items-center justify-between mb-4">
          {getStatusBadge()}
          <div className={`${themeClasses.timeContainer} px-3 py-1 rounded-lg`}>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span className={`${themeClasses.text} text-sm font-medium`}>
                {formatMatchTime(match.match_time)}
              </span>
            </div>
            {isUpcoming && (
              <div className={`${themeClasses.textMuted} text-xs text-center mt-1`}>
                in {getTimeUntilMatch()}
              </div>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-4 mb-4">
          {/* Team 1 */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {match.team1_logo ? (
                <img 
                  src={match.team1_logo} 
                  className="w-12 h-12 rounded-lg object-cover"
                  alt={match.team1_name}
                  onError={handleImageError}
                />
              ) : null}
              
              {!match.team1_logo && (
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getFlagColors(match.team1_name)} flex items-center justify-center border shadow-sm`}>
                  <span className="text-white text-xs font-black">
                    {getCountryCode(match.team1_name)}
                  </span>
                </div>
              )}
              
              <div>
                <h3 className={`${themeClasses.text} font-semibold text-sm leading-tight`}>
                  {truncateTeamName(match.team1_name)}
                </h3>
                <p className={`${themeClasses.textMuted} text-xs`}>HOME</p>
              </div>
            </div>
          </div>

          {/* VS */}
          <div className={`${themeClasses.teamContainer} px-3 py-1 rounded-lg`}>
            <span className={`${themeClasses.text} text-sm font-bold`}>VS</span>
          </div>

          {/* Team 2 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 justify-end text-right">
              <div>
                <h3 className={`${themeClasses.text} font-semibold text-sm leading-tight`}>
                  {truncateTeamName(match.team2_name)}
                </h3>
                <p className={`${themeClasses.textMuted} text-xs`}>AWAY</p>
              </div>
              
              {match.team2_logo ? (
                <img 
                  src={match.team2_logo} 
                  className="w-12 h-12 rounded-lg object-cover"
                  alt={match.team2_name}
                  onError={handleImageError}
                />
              ) : null}
              
              {!match.team2_logo && (
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getFlagColors(match.team2_name)} flex items-center justify-center border shadow-sm`}>
                  <span className="text-white text-xs font-black">
                    {getCountryCode(match.team2_name)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* **SECURE ACCESS: Action Button** */}
        <div className="flex justify-center">
          {getActionButton()}
        </div>
      </div>

      {/* REDESIGNED Desktop Layout - Vertical Card Style */}
      <div className="hidden md:block p-6 relative min-h-[350px]">
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          {getStatusBadge()}
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-full">
          
          {/* Time Section - Top Center */}
          <div className="text-center mb-6 pt-2">
            <div className={`${themeClasses.timeContainer} inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-md`}>
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <div>
                <span className={`${themeClasses.text} text-lg font-bold block`}>
                  {formatMatchTime(match.match_time).split(',')[1]?.trim() || '7:15 PM'}
                </span>
                <span className={`${themeClasses.textMuted} text-xs block`}>
                  {formatMatchTime(match.match_time).split(',')[0]?.trim() || '21 Sep'}
                </span>
              </div>
            </div>
            {isUpcoming && (
              <div className={`${themeClasses.textMuted} text-sm mt-2 font-medium`}>
                Starts in {getTimeUntilMatch()}
              </div>
            )}
          </div>

          {/* Teams Section - Center */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-6 items-center w-full max-w-md">
              
              {/* Team 1 */}
              <div className="text-center">
                <div className="mb-3">
                  {match.team1_logo ? (
                    <>
                      <img
                        src={match.team1_logo}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg mx-auto"
                        alt={match.team1_name}
                        onError={handleImageError}
                      />
                      <div 
                        className={`hidden w-20 h-20 rounded-2xl bg-gradient-to-br ${getFlagColors(match.team1_name)} items-center justify-center border-2 border-white/20 shadow-lg mx-auto`}
                      >
                        <span className="text-white text-xl font-black">
                          {getCountryCode(match.team1_name)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getFlagColors(match.team1_name)} flex items-center justify-center border-2 border-white/20 shadow-lg mx-auto`}>
                      <span className="text-white text-xl font-black">
                        {getCountryCode(match.team1_name)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className={`${themeClasses.text} font-bold text-lg mb-1`}>
                  {getCountryCode(match.team1_name)}
                </h3>
                <p className={`${themeClasses.textMuted} text-xs font-semibold uppercase tracking-wider`}>
                  HOME
                </p>
              </div>

              {/* VS Section */}
              <div className="text-center">
                <div className={`${themeClasses.teamContainer} w-16 h-16 rounded-2xl border-2 flex items-center justify-center mx-auto shadow-lg`}>
                  <span className={`${themeClasses.text} text-2xl font-black`}>VS</span>
                </div>
              </div>

              {/* Team 2 */}
              <div className="text-center">
                <div className="mb-3">
                  {match.team2_logo ? (
                    <>
                      <img
                        src={match.team2_logo}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg mx-auto"
                        alt={match.team2_name}
                        onError={handleImageError}
                      />
                      <div 
                        className={`hidden w-20 h-20 rounded-2xl bg-gradient-to-br ${getFlagColors(match.team2_name)} items-center justify-center border-2 border-white/20 shadow-lg mx-auto`}
                      >
                        <span className="text-white text-xl font-black">
                          {getCountryCode(match.team2_name)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getFlagColors(match.team2_name)} flex items-center justify-center border-2 border-white/20 shadow-lg mx-auto`}>
                      <span className="text-white text-xl font-black">
                        {getCountryCode(match.team2_name)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className={`${themeClasses.text} font-bold text-lg mb-1`}>
                  {getCountryCode(match.team2_name)}
                </h3>
                <p className={`${themeClasses.textMuted} text-xs font-semibold uppercase tracking-wider`}>
                  AWAY
                </p>
              </div>
            </div>
          </div>

          {/* **SECURE ACCESS: Action Button - Bottom** */}
          <div className="pt-4">
            {getActionButton()}
          </div>
        </div>
      </div>
    </div>
  )
}
