import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

type BackgroundProps = {
  particleCount?: number
}

export default function Background({ particleCount = 24 }: BackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const waveRefTop = useRef<SVGPathElement>(null)
  const waveRefBottom = useRef<SVGPathElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  const particles = useMemo(() => Array.from({ length: particleCount }, (_, i) => i), [particleCount])

  useGSAP(() => {
    // Subtle infinite wave motion on SVG paths
    if (waveRefTop.current) {
      gsap.to(waveRefTop.current, {
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        attr: { d: 'M0,64 C180,96 360,16 540,40 C720,64 900,120 1080,96 L1080,0 L0,0 Z' }
      })
    }
    if (waveRefBottom.current) {
      gsap.to(waveRefBottom.current, {
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        attr: { d: 'M0,80 C160,40 360,120 540,96 C760,64 920,24 1080,56 L1080,160 L0,160 Z' }
      })
    }

    // Floating particles
    if (particlesRef.current) {
      const dots = particlesRef.current.querySelectorAll('[data-particle]')
      dots.forEach((el, idx) => {
        const delay = (idx % 12) * 0.3
        const distance = 10 + (idx % 5) * 6
        gsap.to(el, {
          y: -distance,
          x: (idx % 2 === 0 ? 1 : -1) * (distance * 0.6),
          duration: 4 + (idx % 5),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay
        })
        gsap.to(el, {
          opacity: 0.35 + (idx % 4) * 0.1,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: delay * 0.5
        })
      })
    }
  }, {})

  useEffect(() => {
    // Ensure the background is non-interactive
    if (rootRef.current) {
      rootRef.current.setAttribute('aria-hidden', 'true')
    }
  }, [])

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Subtle radial glows */}
      <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.5), transparent 60%)' }} />
      <div className="absolute -bottom-28 -right-28 w-[520px] h-[520px] rounded-full blur-3xl opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(255,122,182,0.45), transparent 60%)' }} />

      {/* Waves (top) */}
      <svg className="absolute top-0 left-0 w-full h-40 opacity-30" viewBox="0 0 1080 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bg-wave-top" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6c5ce7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff7ab6" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path ref={waveRefTop} fill="url(#bg-wave-top)" d="M0,64 C200,96 360,32 540,56 C720,80 900,128 1080,112 L1080,0 L0,0 Z" />
      </svg>

      {/* Waves (bottom) */}
      <svg className="absolute bottom-0 left-0 w-full h-48 opacity-30" viewBox="0 0 1080 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bg-wave-bottom" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ff7ab6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6c5ce7" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path ref={waveRefBottom} fill="url(#bg-wave-bottom)" d="M0,96 C160,64 360,144 540,120 C760,88 920,48 1080,72 L1080,160 L0,160 Z" />
      </svg>

      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0">
        {particles.map((i) => (
          <span
            key={i}
            data-particle
            className="absolute block rounded-full"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: 'rgba(255,255,255,0.6)',
              opacity: 0.4,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>
    </div>
  )
}


