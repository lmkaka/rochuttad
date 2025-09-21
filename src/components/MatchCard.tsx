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
  FireIcon,
  TvIcon
} from '@heroicons/react/24/outline'
import { PlayIcon, BoltIcon } from '@heroicons/react/24/solid'
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
  const glowRef = useRef<HTMLDivElement>(null)
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
    cardBg: 'bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-900/90 border-slate-700/60',
    cardGlow: 'shadow-2xl shadow-blue-500/10',
    text: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    button: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg',
    buttonUpcoming: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg',
    buttonDisabled: 'bg-slate-700/60 text-slate-500 border border-slate-600/40',
    liveBg: 'bg-gradient-to-r from-red-500/20 via-pink-500/20 to-red-600/20 text-red-300 border border-red-500/50',
    upcomingBg: 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/50',
    pastBg: 'bg-gradient-to-r from-slate-600/20 via-slate-500/20 to-slate-600/20 text-slate-400 border border-slate-500/40',
    teamBg: 'bg-gradient-to-br from-slate-700/80 to-slate-800/80 border-slate-600/60',
    timeBg: 'bg-gradient-to-br from-slate-700/90 to-slate-800/90 border-slate-600/70',
    vsBg: 'bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-indigo-600/30 border-blue-500/50',
    liveGlow: 'shadow-red-500/30',
    upcomingGlow: 'shadow-amber-500/20'
  } : {
    cardBg: 'bg-gradient-to-br from-white via-gray-50/95 to-white border-gray-300/70',
    cardGlow: 'shadow-xl shadow-indigo-500/5',
    text: 'text-gray-900',
    textSecondary: 'text-gray-800',
    textMuted: 'text-gray-600',
    button: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg',
    buttonUpcoming: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg',
    buttonDisabled: 'bg-gray-200/80 text-gray-500 border border-gray-300/60',
    liveBg: 'bg-gradient-to-r from-red-100 via-pink-100 to-red-100 text-red-700 border border-red-300/80',
    upcomingBg: 'bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 text-amber-700 border border-amber-300/80',
    pastBg: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 text-gray-600 border border-gray-300/80',
    teamBg: 'bg-gradient-to-br from-gray-100/90 to-gray-200/90 border-gray-300/80',
    timeBg: 'bg-gradient-to-br from-gray-100/95 to-gray-200/95 border-gray-300/90',
    vsBg: 'bg-gradient-to-r from-indigo-100/80 via-purple-100/80 to-blue-100/80 border-indigo-300/70',
    liveGlow: 'shadow-red-500/10',
    upcomingGlow: 'shadow-amber-500/10'
  }, [isDarkMode])

  const currentTime = new Date()
  const matchTime = new Date(match.match_time)
  const isLive = matchTime <= currentTime
  const isUpcoming = matchTime > currentTime
  const link = pickLink(match, device, language)

  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { y: 40, autoAlpha: 0, scale: 0.94, rotateX: 15 }, 
        { y: 0, autoAlpha: 1, scale: 1, rotateX: 0, duration: 0.8, delay: index * 0.1, ease: 'back.out(1.4)' }
      )
    }
  }, [index])

  const onEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        scale: isMobile ? 1.01 : 1.03, 
        y: isMobile ? -2 : -8,
        duration: 0.4,
        ease: 'power2.out'
      })
      
      if (glowRef.current && isLive) {
        gsap.to(glowRef.current, {
          opacity: 0.6,
          duration: 0.3
        })
      }
    }
  }

  const onLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        scale: 1, 
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      })
      
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0,
          duration: 0.3
        })
      }
    }
  }

  const onClick = () => {
    if (isLive && link) {
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          scale: 0.96,
          duration: 0.1,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Success ripple effect
            gsap.fromTo(cardRef.current, 
              { boxShadow: '0 0 0 0px rgba(34, 197, 94, 0.7)' },
              { boxShadow: '0 0 0 20px rgba(34, 197, 94, 0)', duration: 0.6, ease: 'power2.out' }
            )
            window.open(link, '_blank')
          }
        })
      }
    } else if (isUpcoming || !link) {
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          x: [0, -5, 5, -3, 3, 0],
          duration: 0.5,
          ease: 'power2.out'
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

  const truncateTeamName = (name: string) => {
    if (isMobile && name.length > 10) {
      return name.slice(0, 10) + '...'
    }
    return name
  }

  return (
    <div className="relative w-full group">
      {/* Glow effect for live matches */}
      {isLive && (
        <div 
          ref={glowRef}
          className={`absolute inset-0 rounded-2xl blur-xl ${themeClasses.liveGlow} opacity-0 transition-opacity duration-300`}
        />
      )}
      
      <div 
        ref={cardRef}
        data-id={match.id}
        className={`
          relative ${themeClasses.cardBg} ${themeClasses.cardGlow}
          rounded-2xl border-2 cursor-pointer backdrop-blur-xl
          transition-all duration-400 hover:shadow-2xl
          w-full overflow-hidden touch-manipulation
          ${isMobile ? 'p-4 min-h-[200px]' : 'p-6 h-[220px]'}
          ${isLive ? 'ring-2 ring-red-500/20 ring-offset-2 ring-offset-transparent' : ''}
        `}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        {/* Enhanced Status Badge */}
        <div className="absolute top-3 right-3 z-20">
          <div className={`px-3 py-2 rounded-2xl text-xs font-black border-2 backdrop-blur-md ${
            isLive ? themeClasses.liveBg :
            isUpcoming ? themeClasses.upcomingBg :
            themeClasses.pastBg
          } transition-all duration-300 hover:scale-105`}>
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                </div>
                <BoltIcon className="w-3 h-3" />
                <span className="tracking-wide">LIVE</span>
              </div>
            )}
            {isUpcoming && (
              <div className="flex items-center gap-1.5">
                <ClockIcon className="w-3 h-3" />
                <span className="tracking-wide">UPCOMING</span>
              </div>
            )}
            {!isLive && !isUpcoming && (
              <div className="flex items-center gap-1.5">
                <CheckIcon className="w-3 h-3" />
                <span className="tracking-wide">FINISHED</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex ${isMobile ? 'flex-col h-full' : 'flex-row items-center h-full'} gap-4`}>
          
          {/* Teams Section */}
          <div className={`flex items-center justify-center ${isMobile ? 'flex-1' : 'flex-1'} gap-4`}>
            {/* Team 1 */}
            <div className="flex flex-col items-center space-y-3 flex-1">
              <div className="relative group/team">
                {match.team1_logo ? (
                  <img 
                    src={match.team1_logo} 
                    className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-2xl object-cover shadow-xl border-3 border-white/40 transition-all duration-300 group-hover/team:scale-110 group-hover/team:rotate-3`}
                    alt={match.team1_name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-2xl ${themeClasses.teamBg} border-3 border-white/40 flex items-center justify-center shadow-xl transition-all duration-300 group-hover/team:scale-110`}>
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-black`}>
                      {match.team1_name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Team glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-lg opacity-0 group-hover/team:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              
              <div className="text-center space-y-1">
                <h3 className={`font-black ${isMobile ? 'text-sm' : 'text-base'} ${themeClasses.textSecondary} leading-tight`}>
                  {truncateTeamName(match.team1_name)}
                </h3>
                <div className={`px-2 py-1 rounded-lg ${themeClasses.timeBg} border`}>
                  <span className={`text-xs font-bold ${themeClasses.textMuted} tracking-wider`}>
                    HOME
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced VS Section */}
            <div className="flex flex-col items-center space-y-2 px-2">
              <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} rounded-2xl ${themeClasses.vsBg} border-2 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:rotate-12 group`}>
                <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-black ${themeClasses.text} tracking-wider group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300`}>
                  VS
                </span>
              </div>
              {/* Connecting line effect */}
              <div className={`w-12 h-0.5 ${isLive ? 'bg-gradient-to-r from-red-400 to-pink-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'} rounded-full opacity-50`}></div>
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-center space-y-3 flex-1">
              <div className="relative group/team">
                {match.team2_logo ? (
                  <img 
                    src={match.team2_logo} 
                    className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-2xl object-cover shadow-xl border-3 border-white/40 transition-all duration-300 group-hover/team:scale-110 group-hover/team:-rotate-3`}
                    alt={match.team2_name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-2xl ${themeClasses.teamBg} border-3 border-white/40 flex items-center justify-center shadow-xl transition-all duration-300 group-hover/team:scale-110`}>
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-black`}>
                      {match.team2_name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Team glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-lg opacity-0 group-hover/team:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              
              <div className="text-center space-y-1">
                <h3 className={`font-black ${isMobile ? 'text-sm' : 'text-base'} ${themeClasses.textSecondary} leading-tight`}>
                  {truncateTeamName(match.team2_name)}
                </h3>
                <div className={`px-2 py-1 rounded-lg ${themeClasses.timeBg} border`}>
                  <span className={`text-xs font-bold ${themeClasses.textMuted} tracking-wider`}>
                    AWAY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Time & Action */}
          <div className={`${isMobile ? 'w-full' : 'w-44'} flex ${isMobile ? 'flex-row gap-3' : 'flex-col gap-4'} ${isMobile ? '' : 'ml-6'}`}>
            
            {/* Enhanced Match Time */}
            <div className={`${isMobile ? 'flex-1' : 'w-full'} ${themeClasses.timeBg} rounded-2xl border-2 p-3 text-center backdrop-blur-md shadow-lg`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={`p-1 rounded-full ${isLive ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                  <ClockIcon className="h-4 w-4" />
                </div>
                <span className={`${themeClasses.text} font-black text-sm tracking-wide`}>
                  {formatMatchTime(match.match_time)}
                </span>
              </div>
              {isUpcoming && (
                <div className={`text-xs ${themeClasses.textMuted} font-bold tracking-wider uppercase`}>
                  in {getTimeUntilMatch()}
                </div>
              )}
            </div>

            {/* Enhanced Action Button */}
            <button
              ref={buttonRef}
              className={`
                ${isMobile ? 'px-4 py-3' : 'w-full py-3 px-4'} rounded-2xl font-black text-sm
                transition-all duration-300 flex items-center justify-center gap-2
                shadow-xl hover:shadow-2xl border-2 backdrop-blur-md
                ${isLive && link ? `${themeClasses.button} hover:scale-105 active:scale-95` :
                  isUpcoming ? `${themeClasses.buttonUpcoming} hover:scale-105 active:scale-95` :
                  !link ? `${themeClasses.buttonDisabled} cursor-not-allowed` :
                  `${themeClasses.button} hover:scale-105 active:scale-95`
                }
                relative overflow-hidden group/btn
              `}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-pulse transition-opacity duration-300"></div>
              
              {isLive ? (
                link ? (
                  <>
                    <div className="relative">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-white/60 rounded-full animate-ping"></div>
                    </div>
                    <TvIcon className="h-4 w-4" />
                    <span className="tracking-wider relative z-10">WATCH</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span className="tracking-wider relative z-10">N/A</span>
                  </>
                )
              ) : isUpcoming ? (
                <>
                  <CalendarIcon className="h-4 w-4" />
                  <span className="tracking-wider relative z-10">{getTimeUntilMatch()}</span>
                </>
              ) : (
                link ? (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    <span className="tracking-wider relative z-10">REPLAY</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span className="tracking-wider relative z-10">N/A</span>
                  </>
                )
              )}
            </button>
          </div>
        </div>

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/10"></div>
        </div>
      </div>
    </div>
  )
}
