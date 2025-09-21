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

// Desktop-specific card component
const DesktopMatchCard = ({ match, device, language, themeClasses, handleClick, isLive, isUpcoming, link, getTimeUntilMatch }: any) => {
  const getStatusBadge = () => {
    if (isLive) {
      return (
        <div className={`${themeClasses.liveBadge} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 absolute top-4 right-4`}>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )
    } else if (isUpcoming) {
      return (
        <div className={`${themeClasses.upcomingBadge} px-3 py-1.5 rounded-full text-xs font-bold absolute top-4 right-4`}>
          UPCOMING
        </div>
      )
    } else {
      return (
        <div className={`${themeClasses.finishedBadge} px-3 py-1.5 rounded-full text-xs font-bold absolute top-4 right-4`}>
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
          className={`${themeClasses.liveButton} px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 absolute bottom-4 right-4`}
        >
          <PlayIcon className="w-4 h-4" />
          Watch
        </button>
      )
    } else if (isUpcoming) {
      return (
        <button 
          className={`${themeClasses.upcomingButton} px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 absolute bottom-4 right-4`}
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
          className={`${themeClasses.liveButton} px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 absolute bottom-4 right-4`}
        >
          <PlayOutlineIcon className="w-4 h-4" />
          Replay
        </button>
      )
    } else {
      return (
        <button 
          className={`${themeClasses.disabledButton} px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 absolute bottom-4 right-4`}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          N/A
        </button>
      )
    }
  }

  return (
    <div className="p-6 relative min-h-[140px]">
      {/* Status Badge */}
      {getStatusBadge()}
      
      {/* Main Content - Horizontal Layout */}
      <div className="flex items-center gap-8 pr-32">
        
        {/* Team 1 */}
        <div className="flex items-center gap-4 min-w-[180px]">
          {/* Team 1 Flag/Logo */}
          <div className="relative">
            {match.team1_logo ? (
              <img 
                src={match.team1_logo} 
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                alt={match.team1_name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'flex'
                }}
              />
            ) : (
              <div className={`w-16 h-16 rounded-xl ${themeClasses.teamContainer} border-2 border-white/20 flex items-center justify-center shadow-lg`}>
                <span className={`${themeClasses.text} text-2xl font-bold`}>
                  {match.team1_name.charAt(0)}
                </span>
              </div>
            )}
            {/* Flag fallback with country code style */}
            <div className="hidden w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-700 border-2 border-white/20 shadow-lg items-center justify-center">
              <span className="text-white text-lg font-black">
                {match.team1_name.slice(0, 3).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h3 className={`${themeClasses.text} text-xl font-bold leading-tight mb-1`}>
              {match.team1_name}
            </h3>
            <p className={`${themeClasses.textMuted} text-sm font-medium`}>HOME</p>
          </div>
        </div>

        {/* VS Section - Cricket Style */}
        <div className="flex items-center gap-4">
          <div className={`${themeClasses.teamContainer} px-6 py-3 rounded-xl border-2 border-opacity-50 shadow-md`}>
            <span className={`${themeClasses.text} text-xl font-black tracking-wider`}>VS</span>
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-4 min-w-[180px]">
          <div className="text-right">
            <h3 className={`${themeClasses.text} text-xl font-bold leading-tight mb-1`}>
              {match.team2_name}
            </h3>
            <p className={`${themeClasses.textMuted} text-sm font-medium`}>AWAY</p>
          </div>
          {/* Team 2 Flag/Logo */}
          <div className="relative">
            {match.team2_logo ? (
              <img 
                src={match.team2_logo} 
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                alt={match.team2_name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'flex'
                }}
              />
            ) : (
              <div className={`w-16 h-16 rounded-xl ${themeClasses.teamContainer} border-2 border-white/20 flex items-center justify-center shadow-lg`}>
                <span className={`${themeClasses.text} text-2xl font-bold`}>
                  {match.team2_name.charAt(0)}
                </span>
              </div>
            )}
            {/* Flag fallback with country code style */}
            <div className="hidden w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white/20 shadow-lg items-center justify-center">
              <span className="text-white text-lg font-black">
                {match.team2_name.slice(0, 3).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Match Time - Left Side */}
        <div className={`${themeClasses.timeContainer} px-5 py-3 rounded-xl border-2 border-opacity-50 shadow-md min-w-[200px] ml-8`}>
          <div className="flex items-center gap-3 justify-center">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            <div className="text-center">
              <span className={`${themeClasses.text} text-lg font-bold block leading-none`}>
                {formatMatchTime(match.match_time).split(',')[1]?.trim() || formatMatchTime(match.match_time)}
              </span>
              <span className={`${themeClasses.textMuted} text-xs font-medium block leading-none mt-1`}>
                {formatMatchTime(match.match_time).split(',')[0] || '21 Sep'}
              </span>
              {isUpcoming && (
                <span className={`${themeClasses.textMuted} text-xs font-bold block leading-none mt-1`}>
                  in {getTimeUntilMatch()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {getActionButton()}
    </div>
  )
}

// Mobile card component (existing)
const MobileMatchCard = ({ match, themeClasses, handleClick, isLive, isUpcoming, getTimeUntilMatch, getStatusBadge, getActionButton }: any) => {
  const truncateTeamName = (name: string) => {
    if (name.length > 12) {
      return name.slice(0, 12) + '...'
    }
    return name
  }

  return (
    <div className="p-4">
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
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${themeClasses.teamContainer} flex items-center justify-center`}>
                <span className={`${themeClasses.text} text-lg font-bold`}>
                  {match.team1_name.charAt(0)}
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
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${themeClasses.teamContainer} flex items-center justify-center`}>
                <span className={`${themeClasses.text} text-lg font-bold`}>
                  {match.team2_name.charAt(0)}
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
  )
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

  // Mobile functions
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
    const baseClasses = `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center`
    
    if (isLive && link) {
      return (
        <button 
          onClick={handleClick}
          className={`${themeClasses.liveButton} ${baseClasses}`}
        >
          <PlayIcon className="w-4 h-4" />
          Watch
        </button>
      )
    } else if (isUpcoming) {
      return (
        <button 
          className={`${themeClasses.upcomingButton} ${baseClasses}`}
        >
          <CalendarIcon className="w-4 h-4" />
          {getTimeUntilMatch()}
        </button>
      )
    } else if (!isLive && !isUpcoming && link) {
      return (
        <button 
          onClick={handleClick}
          className={`${themeClasses.liveButton} ${baseClasses}`}
        >
          <PlayOutlineIcon className="w-4 h-4" />
          Replay
        </button>
      )
    } else {
      return (
        <button 
          className={`${themeClasses.disabledButton} ${baseClasses}`}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          N/A
        </button>
      )
    }
  }

  return (
    <div 
      ref={cardRef}
      className={`${themeClasses.card} rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer`}
      onClick={handleClick}
    >
      {isMobile ? (
        <MobileMatchCard 
          match={match}
          themeClasses={themeClasses}
          handleClick={handleClick}
          isLive={isLive}
          isUpcoming={isUpcoming}
          getTimeUntilMatch={getTimeUntilMatch}
          getStatusBadge={getStatusBadge}
          getActionButton={getActionButton}
        />
      ) : (
        <DesktopMatchCard 
          match={match}
          device={device}
          language={language}
          themeClasses={themeClasses}
          handleClick={handleClick}
          isLive={isLive}
          isUpcoming={isUpcoming}
          link={link}
          getTimeUntilMatch={getTimeUntilMatch}
        />
      )}
    </div>
  )
}
