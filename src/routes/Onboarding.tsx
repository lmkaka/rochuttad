import type { FormEvent } from 'react'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthProvider'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  UserIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import { globalTheme } from './AuthPage'

type Device = 'iOS' | 'Android' | 'Desktop'
type Language = 'Hindi' | 'English'

// Enhanced particles for better visibility
const OnboardingParticles = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const particlesRef = useRef<any[]>([])
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      baseOpacity: number
      color: string
      life: number
      maxLife: number

      constructor(width: number, height: number) {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.size = Math.random() * 3 + 1
        this.baseOpacity = isDarkMode ? (Math.random() * 0.5 + 0.2) : (Math.random() * 0.3 + 0.1)
        this.opacity = this.baseOpacity
        
        const colors = isDarkMode 
          ? ['#60a5fa', '#a78bfa', '#34d399', '#f59e0b'] 
          : ['#2563eb', '#7c3aed', '#059669', '#d97706']
        this.color = colors[Math.floor(Math.random() * colors.length)]
        
        this.life = 0
        this.maxLife = Math.random() * 400 + 300
      }

      update(deltaTime: number, width: number, height: number) {
        this.x += this.vx * deltaTime * 0.02
        this.y += this.vy * deltaTime * 0.02
        this.life += deltaTime
        this.opacity = this.baseOpacity * (0.6 + 0.4 * Math.sin(this.life * 0.008))

        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0

        if (this.life > this.maxLife) {
          this.x = Math.random() * width
          this.y = Math.random() * height
          this.life = 0
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const initParticles = () => {
      particlesRef.current = []
      const count = window.innerWidth <= 768 ? 20 : 30
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height))
      }
    }

    const animate = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTimeRef.current, 16.67)
      lastTimeRef.current = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        particle.update(deltaTime, canvas.width, canvas.height)
        particle.draw(ctx)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resizeCanvas)
    initParticles()
    animate(0)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isDarkMode])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: 1 }}
    />
  )
}

export default function Onboarding() {
  const { session, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)
  const container = useRef<HTMLDivElement>(null)
  const cardA = useRef<HTMLDivElement>(null)
  const cardB = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [device, setDevice] = useState<Device>('Android')
  const [language, setLanguage] = useState<Language>('English')
  const [saving, setSaving] = useState(false)

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // Fixed theme classes with better visibility
  const themeClasses = useMemo(() => isDarkMode ? {
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800/90 border-slate-700/80 backdrop-blur-xl shadow-2xl',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    input: 'bg-slate-700/90 border-slate-600/80 text-white focus:border-blue-500 placeholder-slate-400',
    buttonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    buttonSecondary: 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 border border-slate-600/80',
    deviceCard: 'bg-slate-700/60 border-slate-600/60 hover:bg-slate-600/70 hover:border-slate-500/70',
    deviceCardActive: 'bg-blue-600/30 border-blue-500/80 text-blue-300 shadow-lg',
    iconColor: 'text-slate-400',
    progressBg: 'bg-slate-700/60',
    progressFill: 'bg-gradient-to-r from-blue-500 to-purple-500',
    gradientOverlay: 'bg-gradient-to-br from-slate-900/60 via-transparent to-slate-800/40'
  } : {
    bg: 'bg-gray-100',
    cardBg: 'bg-white/95 border-gray-300/80 backdrop-blur-xl shadow-2xl',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-600',
    input: 'bg-white/95 border-gray-300/80 text-gray-900 focus:border-indigo-500 placeholder-gray-500',
    buttonPrimary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    buttonSecondary: 'bg-gray-200/90 hover:bg-gray-300/90 text-gray-700 border border-gray-300/80',
    deviceCard: 'bg-gray-50/90 border-gray-300/70 hover:bg-gray-100/90 hover:border-gray-400/70',
    deviceCardActive: 'bg-indigo-100/90 border-indigo-400/80 text-indigo-700 shadow-lg',
    iconColor: 'text-gray-600',
    progressBg: 'bg-gray-200/80',
    progressFill: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    gradientOverlay: 'bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30'
  }, [isDarkMode])

  useGSAP(() => {
    gsap.fromTo(container.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    gsap.fromTo(cardA.current, { x: 30, autoAlpha: 0, scale: 0.95 }, { x: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.2)' })
  }, [])

  const next = () => {
    if (step === 0 && name.trim()) {
      gsap.to(cardA.current, { 
        x: -60, 
        autoAlpha: 0, 
        scale: 0.95, 
        duration: 0.5, 
        ease: 'power2.in',
        onComplete: () => {
          setStep(1)
          gsap.fromTo(cardB.current, 
            { x: 60, autoAlpha: 0, scale: 0.95 }, 
            { x: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.2)' }
          )
        }
      })
    }
  }

  const back = () => {
    if (step === 1) {
      gsap.to(cardB.current, { 
        x: 60, 
        autoAlpha: 0, 
        scale: 0.95, 
        duration: 0.5, 
        ease: 'power2.in',
        onComplete: () => {
          setStep(0)
          gsap.fromTo(cardA.current, 
            { x: -60, autoAlpha: 0, scale: 0.95 }, 
            { x: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.2)' }
          )
        }
      })
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!session?.user) return

    setSaving(true)
    
    try {
      const payload = {
        id: session.user.id,
        name: name.trim(),
        device_preference: device,
        language_preference: language
      }
      
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
      
      if (!error) {
        await refreshProfile()
        // Success animation before navigation
        gsap.to(container.current, {
          scale: 0.95,
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => navigate('/dashboard', { replace: true })
        })
      }
    } catch (error) {
      console.error('Profile creation failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const deviceOptions = [
    { value: 'iOS' as Device, icon: DevicePhoneMobileIcon, label: 'iOS' },
    { value: 'Android' as Device, icon: DevicePhoneMobileIcon, label: 'Android' },
    { value: 'Desktop' as Device, icon: ComputerDesktopIcon, label: 'Desktop' }
  ]

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Enhanced particles background */}
      <OnboardingParticles isDarkMode={isDarkMode} />
      
      {/* Better background overlay */}
      <div className={`absolute inset-0 ${themeClasses.gradientOverlay} pointer-events-none`} style={{ zIndex: 2 }}></div>

      <div ref={container} className="w-full max-w-md relative" style={{ zIndex: 10 }}>
        {/* Header with better contrast */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-6 shadow-2xl">
            <PlayIcon className="h-8 w-8" />
          </div>
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
            Complete Your Profile
          </h1>
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Just a few more steps to get started
          </p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className={`h-2 ${themeClasses.progressBg} rounded-full overflow-hidden border ${isDarkMode ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
            <div 
              className={`h-full ${themeClasses.progressFill} transition-all duration-500 ease-out`}
              style={{ width: step === 0 ? '50%' : '100%' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs font-medium ${step === 0 ? themeClasses.text : themeClasses.textMuted}`}>
              Personal Info
            </span>
            <span className={`text-xs font-medium ${step === 1 ? themeClasses.text : themeClasses.textMuted}`}>
              Preferences
            </span>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 0 && (
          <div ref={cardA} className={`${themeClasses.cardBg} rounded-2xl border p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-200'}`}>
                <UserIcon className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
                  Tell us about you
                </h2>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  What should we call you?
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 ${themeClasses.input} border rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={next}
                disabled={!name.trim()}
                className={`px-6 py-3 ${themeClasses.buttonPrimary} rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105`}
              >
                <span>Continue</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 1 && (
          <div ref={cardB} className={`${themeClasses.cardBg} rounded-2xl border p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100 border border-purple-200'}`}>
                <SparklesIcon className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
                  Set your preferences
                </h2>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  Customize your experience
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Device Preference */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text} mb-3`}>
                  Primary Device
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {deviceOptions.map((option) => {
                    const IconComponent = option.icon
                    const isActive = device === option.value
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDevice(option.value)}
                        className={`${
                          isActive ? themeClasses.deviceCardActive : themeClasses.deviceCard
                        } border rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-md`}
                      >
                        <IconComponent className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                  <GlobeAltIcon className="h-5 w-5 inline mr-2" />
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={`w-full px-4 py-3 ${themeClasses.input} border rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-8">
              <button
                onClick={back}
                className={`px-6 py-3 ${themeClasses.buttonSecondary} rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105`}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back</span>
              </button>
              
              <button
                onClick={submit}
                disabled={saving}
                className={`px-6 py-3 ${themeClasses.buttonPrimary} rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2 hover:scale-105`}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    <span>Complete Setup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
