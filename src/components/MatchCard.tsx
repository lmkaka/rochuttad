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

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <div className={`${themeClasses.liveBadge} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )
    } else if (isUpcoming) {
      return (
        <div className={`${themeClasses.upcomingBadge} px-2 py-1 rounded-full text-xs font-medium`}>
          UPCOMING
        </div>
      )
    } else {
      return (
        <div className={`${themeClasses.finishedBadge} px-2 py-1 rounded-full text-xs font-medium`}>
          FINISHED
        </div>
      )
    }
  }

  const getActionButton = () => {
    if (isLive && link) {
      return (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            window.open(link, '_blank')
          }}
          className={`${themeClasses.liveButton} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
        >
          <PlayIcon className="w-4 h-4" />
          Watch
        </button>
      )
    } else if (isUpcoming) {
      return (
        <button 
          className={`${themeClasses.upcomingButton} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}
        >
          <CalendarIcon className="w-4 h-4" />
          {getTimeUntilMatch()}
        </button>
      )
    } else if (!isLive && !isUpcoming && link) {
      return (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            window.open(link, '_blank')
          }}
          className={`${themeClasses.liveButton} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
        >
          <PlayOutlineIcon className="w-4 h-4" />
          Replay
        </button>
      )
    } else {
      return (
        <button 
          className={`${themeClasses.disabledButton} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          N/A
        </button>
      )
    }
  }

  // Team name truncation
  const truncateTeamName = (name: string) => {
    if (name.length > 12) {
      return name.slice(0, 12) + '...'
    }
    return name
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
        rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
        w-full max-w-2xl mx-auto
      `}
      onClick={handleClick}
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

        {/* Action Button */}
        <div className="flex justify-center">
          {getActionButton()}
        </div>
      </div>

      {/* Desktop & Tablet Layout */}
      <div className="hidden md:flex p-6 gap-6 items-center w-full max-w-5xl mx-auto min-h-[120px]">
        {/* Team 1 */}
        <div className="flex flex-col items-center min-w-[120px] flex-1">
          <div className="relative w-16 h-16">
            {match.team1_logo ? (
              <>
                <img
                  src={match.team1_logo}
                  className="w-16 h-16 rounded-lg object-cover border shadow-sm"
                  alt={match.team1_name}
                  onError={handleImageError}
                />
                <div 
                  className={`absolute top-0 left-0 w-16 h-16 rounded-lg bg-gradient-to-br ${getFlagColors(match.team1_name)} hidden items-center justify-center border shadow-sm`}
                >
                  <span className="text-white text-lg font-black">
                    {getCountryCode(match.team1_name)}
                  </span>
                </div>
              </>
            ) : (
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getFlagColors(match.team1_name)} flex items-center justify-center border shadow-sm`}>
                <span className="text-white text-lg font-black">
                  {getCountryCode(match.team1_name)}
                </span>
              </div>
            )}
          </div>
          <h3 className={`${themeClasses.text} font-bold text-base mt-2 text-center`}>
            {truncateTeamName(match.team1_name)}
          </h3>
          <p className={`${themeClasses.textMuted} text-xs font-medium`}>HOME</p>
        </div>

        {/* VS Section */}
        <div className="flex-shrink-0 flex items-center justify-center px-6">
          <span className={`${themeClasses.text} text-2xl font-black`}>VS</span>
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center min-w-[120px] flex-1">
          <div className="relative w-16 h-16">
            {match.team2_logo ? (
              <>
                <img
                  src={match.team2_logo}
                  className="w-16 h-16 rounded-lg object-cover border shadow-sm"
                  alt={match.team2_name}
                  onError={handleImageError}
                />
                <div 
                  className={`absolute top-0 left-0 w-16 h-16 rounded-lg bg-gradient-to-br ${getFlagColors(match.team2_name)} hidden items-center justify-center border shadow-sm`}
                >
                  <span className="text-white text-lg font-black">
                    {getCountryCode(match.team2_name)}
                  </span>
                </div>
              </>
            ) : (
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getFlagColors(match.team2_name)} flex items-center justify-center border shadow-sm`}>
                <span className="text-white text-lg font-black">
                  {getCountryCode(match.team2_name)}
                </span>
              </div>
            )}
          </div>
          <h3 className={`${themeClasses.text} font-bold text-base mt-2 text-center`}>
            {truncateTeamName(match.team2_name)}
          </h3>
          <p className={`${themeClasses.textMuted} text-xs font-medium`}>AWAY</p>
        </div>

        {/* Time Section */}
        <div className={`${themeClasses.timeContainer} px-4 py-2 rounded-xl border flex flex-col items-center min-w-[140px]`}>
          <ClockIcon className="w-5 h-5 text-blue-500 mb-1" />
          <span className={`${themeClasses.text} text-lg font-bold`}>
            {formatMatchTime(match.match_time).split(',')[1]?.trim() || '12:45 PM'}
          </span>
          <span className={`${themeClasses.textMuted} text-xs mt-1`}>
            {formatMatchTime(match.match_time).split(',')[0]?.trim() || '21 Sep'}
          </span>
        </div>

        {/* Status & Action */}
        <div className="flex flex-col items-center gap-2 ml-auto">
          {getStatusBadge()}
          {getActionButton()}
        </div>
      </div>
    </div>
  )
}
