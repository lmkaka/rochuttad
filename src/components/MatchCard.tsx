import { useRef, useEffect, useState, useMemo } from 'react'
import { formatMatchTime } from '../utils/format'
import { pickLink } from '../utils/linkPicker'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  ClockIcon, 
  SignalIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  PlayIcon as PlayOutlineIcon
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('themeChange', handleThemeChange as EventListener)
    }
  }, [])

  const themeClasses = useMemo(() => isDarkMode ? {
    cardBg: 'bg-slate-800/95 border-slate-700/70 shadow-2xl',
    text: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg',
    buttonUpcoming: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg',
    buttonDisabled: 'bg-slate-700/80 text-slate-400 border-slate-600/60',
    liveBg: 'bg-red-500/25 text-red-300 border-red-500/70 shadow-md',
    upcomingBg: 'bg-orange-500/25 text-orange-300 border-orange-500/70 shadow-md',
    pastBg: 'bg-slate-600/25 text-slate-400 border-slate-500/70 shadow-md',
    teamBg: 'bg-slate-700/60 border-slate-600/50',
    timeBg: 'bg-slate-700/70 border-slate-600/60 shadow-md',
    vsBg: 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/40'
  } : {
    cardBg: 'bg-white/98 border-gray-300/80 shadow-xl',
    text: 'text-gray-900',
    textSecondary: 'text-gray-800',
    textMuted: 'text-gray-600',
    button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg',
    buttonUpcoming: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg',
    buttonDisabled: 'bg-gray-200/90 text-gray-500 border-gray-300/70',
    liveBg: 'bg-red-100/90 text-red-700 border-red-300/80 shadow-md',
    upcomingBg: 'bg-orange-100/90 text-orange-700 border-orange-300/80 shadow-md',
    pastBg: 'bg-gray-200/90 text-gray-600 border-gray-300/80 shadow-md',
    teamBg: 'bg-gray-100/95 border-gray-200/80',
    timeBg: 'bg-gray-100/95 border-gray-200/80 shadow-md',
    vsBg: 'bg-gradient-to-r from-indigo-100/80 to-purple-100/80 border-indigo-300/60'
  }, [isDarkMode])

  const currentTime = new Date()
  const matchTime = new Date(match.match_time)
  const isLive = matchTime <= currentTime
  const isUpcoming = matchTime > currentTime
  const link = pickLink(match, device, language)

  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { y: 30, autoAlpha: 0, scale: 0.96 }, 
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, delay: index * 0.08, ease: 'power2.out' }
      )
    }
  }, [index])

  const onEnter = () => {
    if (!isMobile && cardRef.current) {
      gsap.to(cardRef.current, { 
        scale: 1.02, 
        y: -6,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  }

  const onLeave = () => {
    if (!isMobile && cardRef.current) {
      gsap.to(cardRef.current, { 
        scale: 1, 
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  }

  const onClick = () => {
    if (isLive && link) {
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          scale: 0.98,
          duration: 0.1,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onComplete: () => window.open(link, '_blank')
        })
      }
    } else if (isUpcoming) {
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          scale: 0.98,
          duration: 0.1,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        })
      }
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

  return (
    <div className="relative w-full">
      <div 
        ref={cardRef}
        data-id={match.id}
        className={`
          match-card ${themeClasses.cardBg} rounded-2xl border-2 p-4 sm:p-6 cursor-pointer 
          transition-all duration-300 hover:shadow-2xl backdrop-blur-xl
          w-full relative flex flex-col sm:flex-row items-center gap-4 sm:gap-0
          min-h-[180px] sm:h-[200px] overflow-hidden
          active:scale-95 touch-manipulation
        `}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-2.5 py-1.5 rounded-full text-xs font-bold border-2 ${
            isLive ? themeClasses.liveBg :
            isUpcoming ? themeClasses.upcomingBg :
            themeClasses.pastBg
          } backdrop-blur-sm`}>
            {isLive && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-black">LIVE</span>
              </div>
            )}
            {isUpcoming && <span className="font-black">UPCOMING</span>}
            {!isLive && !isUpcoming && <span className="font-black">FINISHED</span>}
          </div>
        </div>

        {/* Mobile Layout */}
        {isMobile ? (
          <>
            {/* Teams Section - Stacked */}
            <div className="flex items-center justify-between w-full px-4 mb-3">
              {/* Team 1 */}
              <div className="flex flex-col items-center space-y-2 flex-1">
                {match.team1_logo ? (
                  <img 
                    src={match.team1_logo} 
                    className="w-14 h-14 rounded-xl object-cover shadow-lg border-2 border-white/30" 
                    alt={match.team1_name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-xl ${themeClasses.teamBg} border-2 border-white/30 flex items-center justify-center shadow-lg`}>
                    <span className="text-xl font-black">
                      {match.team1_name.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className={`font-bold text-sm ${themeClasses.textSecondary} leading-tight`}>
                    {match.team1_name.length > 8 ? match.team1_name.slice(0, 8) + '...' : match.team1_name}
                  </h3>
                  <span className={`text-xs ${themeClasses.textMuted} font-bold`}>
                    HOME
                  </span>
                </div>
              </div>

              {/* VS Section */}
              <div className="flex flex-col items-center mx-4 flex-shrink-0">
                <div className={`px-4 py-2 rounded-xl ${themeClasses.vsBg} border-2 shadow-md`}>
                  <span className={`text-lg font-black ${themeClasses.text}`}>VS</span>
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center space-y-2 flex-1">
                {match.team2_logo ? (
                  <img 
                    src={match.team2_logo} 
                    className="w-14 h-14 rounded-xl object-cover shadow-lg border-2 border-white/30" 
                    alt={match.team2_name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-xl ${themeClasses.teamBg} border-2 border-white/30 flex items-center justify-center shadow-lg`}>
                    <span className="text-xl font-black">
                      {match.team2_name.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className={`font-bold text-sm ${themeClasses.textSecondary} leading-tight`}>
                    {match.team2_name.length > 8 ? match.team2_name.slice(0, 8) + '...' : match.team2_name}
                  </h3>
                  <span className={`text-xs ${themeClasses.textMuted} font-bold`}>
                    AWAY
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section - Time & Button */}
            <div className="flex items-center justify-between w-full gap-3">
              {/* Match Time */}
              <div className={`px-4 py-2.5 rounded-xl ${themeClasses.timeBg} border-2 flex-1 text-center`}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <ClockIcon className="h-4 w-4" />
                  <span className={`${themeClasses.text} font-bold text-sm`}>
                    {formatMatchTime(match.match_time)}
                  </span>
                </div>
                {isUpcoming && (
                  <div className={`text-xs ${themeClasses.textMuted} font-bold`}>
                    in {getTimeUntilMatch()}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                ref={buttonRef}
                className={`
                  px-6 py-2.5 rounded-xl font-bold text-sm flex-shrink-0
                  transition-all duration-200 flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl border-2 active:scale-95
                  ${isLive && link ? themeClasses.button :
                    isUpcoming ? themeClasses.buttonUpcoming :
                    !link ? themeClasses.buttonDisabled :
                    themeClasses.button
                  }
                `}
              >
                {isLive ? (
                  link ? (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <SignalIcon className="h-4 w-4" />
                      <span>Watch</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>N/A</span>
                    </>
                  )
                ) : isUpcoming ? (
                  <>
                    <CalendarIcon className="h-4 w-4" />
                    <span>{getTimeUntilMatch()}</span>
                  </>
                ) : (
                  link ? (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      <span>Replay</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>N/A</span>
                    </>
                  )
                )}
              </button>
            </div>
          </>
        ) : (
          /* Desktop Layout */
          <>
            {/* Teams Section - Horizontal */}
            <div className="flex items-center justify-between flex-1 min-w-0">
              {/* Team 1 */}
              <div className="flex flex-col items-center space-y-2 w-24">
                {match.team1_logo ? (
                  <img 
                    src={match.team1_logo} 
                    className="w-16 h-16 rounded-xl object-cover shadow-lg border-2 border-white/30" 
                    alt={match.team1_name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-xl ${themeClasses.teamBg} border-2 border-white/30 flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-black">
                      {match.team1_name.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="text-center w-full">
                  <h3 className={`font-bold text-sm ${themeClasses.textSecondary} leading-tight truncate`}>
                    {match.team1_name}
                  </h3>
                  <span className={`text-xs ${themeClasses.textMuted} font-bold`}>
                    HOME
                  </span>
                </div>
              </div>

              {/* VS Section */}
              <div className="flex flex-col items-center mx-6">
                <div className={`px-4 py-2 rounded-xl ${themeClasses.vsBg} border-2 shadow-md`}>
                  <span className={`text-lg font-black ${themeClasses.text}`}>VS</span>
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center space-y-2 w-24">
                {match.team2_logo ? (
                  <img 
                    src={match.team2_logo} 
                    className="w-16 h-16 rounded-xl object-cover shadow-lg border-2 border-white/30" 
                    alt={match.team2_name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-xl ${themeClasses.teamBg} border-2 border-white/30 flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-black">
                      {match.team2_name.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="text-center w-full">
                  <h3 className={`font-bold text-sm ${themeClasses.textSecondary} leading-tight truncate`}>
                    {match.team2_name}
                  </h3>
                  <span className={`text-xs ${themeClasses.textMuted} font-bold`}>
                    AWAY
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Time & Button */}
            <div className="flex flex-col justify-center space-y-3 w-36 ml-6 flex-shrink-0">
              {/* Match Time */}
              <div className={`px-4 py-2.5 rounded-xl ${themeClasses.timeBg} border-2 text-center`}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <ClockIcon className="h-4 w-4" />
                  <span className={`${themeClasses.text} font-bold text-sm`}>
                    {formatMatchTime(match.match_time)}
                  </span>
                </div>
                {isUpcoming && (
                  <div className={`text-xs ${themeClasses.textMuted} font-bold`}>
                    in {getTimeUntilMatch()}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                ref={buttonRef}
                className={`
                  w-full py-2.5 px-4 rounded-xl font-bold text-sm
                  transition-all duration-200 flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl border-2
                  ${isLive && link ? themeClasses.button :
                    isUpcoming ? themeClasses.buttonUpcoming :
                    !link ? themeClasses.buttonDisabled :
                    themeClasses.button
                  }
                `}
              >
                {isLive ? (
                  link ? (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <SignalIcon className="h-4 w-4" />
                      <span>Watch</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>N/A</span>
                    </>
                  )
                ) : isUpcoming ? (
                  <>
                    <CalendarIcon className="h-4 w-4" />
                    <span>{getTimeUntilMatch()}</span>
                  </>
                ) : (
                  link ? (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      <span>Replay</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>N/A</span>
                    </>
                  )
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
