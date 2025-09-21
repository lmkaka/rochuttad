import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { globalTheme } from '../routes/AuthPage'

gsap.registerPlugin(ScrollTrigger)

export default function Background() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode)

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode)
    }
    
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  // Parallax Animation Setup
  useGSAP(() => {
    if (!containerRef.current) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Create parallax elements
    const layers = containerRef.current.querySelectorAll('.parallax-layer')
    
    layers.forEach((layer, index) => {
      const speed = (index + 1) * 0.5 // Different speeds for different layers
      
      gsap.fromTo(layer, {
        yPercent: -50 * speed,
      }, {
        yPercent: 50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      })
    })

    // Floating animation for geometric shapes
    gsap.to('.floating-element', {
      y: '+=20',
      rotation: '+=5',
      duration: 4,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
      stagger: {
        each: 0.5,
        from: 'random'
      }
    })

    // Subtle pulse animation for orbs
    gsap.to('.pulse-orb', {
      scale: 1.1,
      opacity: 0.8,
      duration: 3,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.3
    })

  }, [isDarkMode]) // Re-run when theme changes

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{ willChange: 'transform' }}
    >
      {isDarkMode ? (
        /* 🌙 DARK MODE PARALLAX BACKGROUND */
        <>
          {/* Base Layer - Dark gradient */}
          <div className="parallax-layer absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          
          {/* Layer 1 - Animated stars */}
          <div className="parallax-layer absolute inset-0">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="floating-element absolute w-1 h-1 bg-white rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          {/* Layer 2 - Purple/Blue Orbs */}
          <div className="parallax-layer absolute inset-0">
            <div className="pulse-orb absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl"></div>
            <div className="pulse-orb absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-2xl"></div>
            <div className="pulse-orb absolute bottom-32 left-1/3 w-32 h-32 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-xl"></div>
            <div className="pulse-orb absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-2xl"></div>
          </div>

          {/* Layer 3 - Geometric shapes */}
          <div className="parallax-layer absolute inset-0">
            <div className="floating-element absolute top-1/4 left-3/4 w-6 h-6 border border-purple-400/30 rotate-45 opacity-40"></div>
            <div className="floating-element absolute top-2/3 left-1/4 w-4 h-4 bg-blue-400/20 rounded-full"></div>
            <div className="floating-element absolute top-1/2 right-1/3 w-8 h-8 border border-cyan-400/25 rotate-12 opacity-30"></div>
            <div className="floating-element absolute bottom-1/4 left-2/3 w-5 h-5 bg-purple-400/15 transform rotate-45"></div>
          </div>

          {/* Layer 4 - Subtle grid pattern */}
          <div className="parallax-layer absolute inset-0 opacity-5">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />
          </div>
        </>
      ) : (
        /* ☀️ LIGHT MODE PARALLAX BACKGROUND */
        <>
          {/* Base Layer - Light gradient */}
          <div className="parallax-layer absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
          
          {/* Layer 1 - Floating particles */}
          <div className="parallax-layer absolute inset-0">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="floating-element absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`
                }}
              />
            ))}
          </div>

          {/* Layer 2 - Soft Orbs */}
          <div className="parallax-layer absolute inset-0">
            <div className="pulse-orb absolute top-16 right-10 w-80 h-80 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
            <div className="pulse-orb absolute top-60 left-20 w-60 h-60 bg-gradient-to-r from-blue-200/25 to-cyan-200/25 rounded-full blur-2xl"></div>
            <div className="pulse-orb absolute bottom-40 right-1/3 w-40 h-40 bg-gradient-to-r from-purple-200/35 to-pink-200/35 rounded-full blur-xl"></div>
            <div className="pulse-orb absolute bottom-16 left-1/4 w-52 h-52 bg-gradient-to-r from-indigo-200/20 to-blue-200/20 rounded-full blur-2xl"></div>
          </div>

          {/* Layer 3 - Geometric elements */}
          <div className="parallax-layer absolute inset-0">
            <div className="floating-element absolute top-1/3 right-1/4 w-8 h-8 border-2 border-indigo-300/40 rotate-45 opacity-50"></div>
            <div className="floating-element absolute top-3/4 left-1/3 w-6 h-6 bg-purple-300/30 rounded-full"></div>
            <div className="floating-element absolute top-1/2 left-3/4 w-10 h-10 border-2 border-blue-300/35 rotate-12 opacity-40"></div>
            <div className="floating-element absolute bottom-1/3 right-2/3 w-7 h-7 bg-indigo-300/25 transform rotate-45"></div>
          </div>

          {/* Layer 4 - Subtle pattern */}
          <div className="parallax-layer absolute inset-0 opacity-8">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
                `,
                backgroundSize: '100px 100px'
              }}
            />
          </div>
        </>
      )}

      {/* Performance optimization - GPU acceleration hint */}
      <div className="absolute inset-0 transform-gpu" />
    </div>
  )
}
