import React, { useRef, useEffect, useState, useMemo } from 'react'
import { formatMatchTime } from '../utils/format'
import { pickLink } from '../utils/linkPicker'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  ClockIcon, 
  SignalIcon,
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  const themeClasses = useMemo(() => isDarkMode ? {
    cardBg: 'bg-slate-800/90 border-slate-700/60',
    text: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    buttonUpcoming: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white',
    buttonDisabled: 'bg-slate-700/70 text-slate-400 border-slate-600/50',
    liveBg: 'bg-red-500/20 text-red-300 border-red-500/60',
    upcomingBg: 'bg-orange-500/20 text-orange-300 border-orange-500/60',
    pastBg: 'bg-slate-600/20 text-slate-400 border-slate-500/60',
    teamBg: 'bg-slate-700/50 border-slate-600/40',
    timeBg: 'bg-slate-700/60 border-slate-600/50'
  } : {
    cardBg: 'bg-white/95 border-slate-200/70',
    text: 'text-slate-900',
    textSecondary: 'text-slate-800',
    textMuted: 'text-slate-600',
    button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
    buttonUpcoming: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white',
    buttonDisabled: 'bg-slate-200/80 text-slate-500 border-slate-300/60',
    liveBg: 'bg-red-100 text-red-700 border-red-300',
    upcomingBg: 'bg-orange-100 text-orange-700 border-orange-300',
    pastBg: 'bg-slate-200 text-slate-600 border-slate-300',
    teamBg: 'bg-slate-100/90 border-slate-200/60',
    timeBg: 'bg-slate-100/90 border-slate-200/70'
  }, [isDarkMode])

  const currentTime = new Date()
  const matchTime = new Date(match.match_time)
  const isLive = matchTime <= currentTime
  const isUpcoming = matchTime > currentTime
  
  const link = pickLink(match, device, language)

  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { y: 30, autoAlpha: 0, scale: 0.98 }, 
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, delay: index * 0.05, ease: 'power2.out' }
      )
    }
  }, [index])

  const onEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        scale: 1.01, 
        y: -4,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
  }

  const onLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        scale: 1, 
        y: 0,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
  }

  const onClick = () => {
    if (isLive && link) {
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          scale: 0.99,
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
          scale: 0.99,
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
          match-card ${themeClasses.cardBg} rounded-2xl border-2 p-5 cursor-pointer 
          transition-all duration-200 hover:shadow-2xl backdrop-blur-xl
          w-full h-[200px] relative flex items-center shadow-xl overflow-hidden
        `}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
            isLive ? themeClasses.liveBg :
            isUpcoming ? themeClasses.upcomingBg :
            themeClasses.pastBg
          }`}>
            {isLive && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}
            {isUpcoming && 'UPCOMING'}
            {!isLive && !isUpcoming && 'FINISHED'}
          </div>
        </div>

        {/* Teams Section - Fixed width */}
        <div className="flex items-center justify-between flex-1 min-w-0">
          {/* Team 1 */}
          <div className="flex flex-col items-center space-y-2 w-20">
            {match.team1_logo ? (
              <img 
                src={match.team1_logo} 
                className="w-12 h-12 rounded-lg object-cover shadow-md border border-white/20" 
                alt={match.team1_name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${themeClasses.teamBg} border border-white/20 flex items-center justify-center shadow-md`}>
                <span className="text-lg font-bold">
                  {match.team1_name.charAt(0)}
                </span>
              </div>
            )}
            
            <div className="text-center w-full">
              <h3 className={`font-bold text-xs ${themeClasses.textSecondary} leading-tight truncate`}>
                {match.team1_name}
              </h3>
              <span className={`text-xs ${themeClasses.textMuted} font-medium`}>
                HOME
              </span>
            </div>
          </div>

          {/* VS Section */}
          <div className="flex flex-col items-center mx-4">
            <div className={`px-3 py-1.5 rounded-lg ${themeClasses.teamBg} border`}>
              <span className={`text-sm font-black ${themeClasses.text}`}>VS</span>
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center space-y-2 w-20">
            {match.team2_logo ? (
              <img 
                src={match.team2_logo} 
                className="w-12 h-12 rounded-lg object-cover shadow-md border border-white/20" 
                alt={match.team2_name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${themeClasses.teamBg} border border-white/20 flex items-center justify-center shadow-md`}>
                <span className="text-lg font-bold">
                  {match.team2_name.charAt(0)}
                </span>
              </div>
            )}
            
            <div className="text-center w-full">
              <h3 className={`font-bold text-xs ${themeClasses.textSecondary} leading-tight truncate`}>
                {match.team2_name}
              </h3>
              <span className={`text-xs ${themeClasses.textMuted} font-medium`}>
                AWAY
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Time & Button - Fixed width */}
        <div className="flex flex-col justify-center space-y-3 w-32 ml-4 flex-shrink-0">
          {/* Match Time */}
          <div className={`px-3 py-2 rounded-lg ${themeClasses.timeBg} border text-center`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <ClockIcon className="h-3 w-3" />
              <span className={`${themeClasses.text} font-bold text-xs`}>
                {formatMatchTime(match.match_time)}
              </span>
            </div>
            {isUpcoming && (
              <div className={`text-xs ${themeClasses.textMuted} font-medium`}>
                in {getTimeUntilMatch()}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            ref={buttonRef}
            className={`
              w-full py-2 px-3 rounded-lg font-bold text-xs
              transition-all duration-200 flex items-center justify-center gap-1.5
              shadow-md hover:shadow-lg border
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
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <SignalIcon className="h-3 w-3" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  <span>N/A</span>
                </>
              )
            ) : isUpcoming ? (
              <>
                <CalendarIcon className="h-3 w-3" />
                <span>{getTimeUntilMatch()}</span>
              </>
            ) : (
              link ? (
                <>
                  <PlayIcon className="h-3 w-3" />
                  <span>Replay</span>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  <span>N/A</span>
                </>
              )
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
