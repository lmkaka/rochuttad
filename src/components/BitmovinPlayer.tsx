import { useEffect, useRef, useState, useCallback } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

// Bitmovin Player types
declare global {
  interface Window {
    bitmovin: {
      player: {
        Player: new (container: HTMLElement, config: any) => {
          load: (source: any) => Promise<void>
          destroy: () => void
          play: () => Promise<void>
          pause: () => void
          mute: () => void
          unmute: () => void
          isDestroyed: () => boolean
        }
      }
    }
  }
}

interface BitmovinPlayerProps {
  streamUrl?: string
  className?: string
  onError?: (error: any) => void
  onLoad?: () => void
}

export default function BitmovinPlayer({ 
  streamUrl = "https://liveakdai.slivcdn.com/hls/live/2119921/cricacc12109/HIN/std_lrh-800300010.m3u8?hdnea=exp=1758505528~acl=/*~id=05027931411562148048170567398729~hmac=6183fa74949fb66a51756a6f9b0bc5377bfa8fdd697381fff670f34c03fcd633",
  className = "",
  onError,
  onLoad 
}: BitmovinPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const isInitializingRef = useRef(false)
  const mountedRef = useRef(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Safe state setter that checks if component is mounted
  const safeSetState = useCallback((setter: () => void) => {
    if (mountedRef.current) {
      setter()
    }
  }, [])

  // Load Bitmovin Player script
  useEffect(() => {
    if (window.bitmovin) {
      setScriptLoaded(true)
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="bitmovinplayer"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        safeSetState(() => setScriptLoaded(true))
      })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/bitmovin-player@8/bitmovinplayer.js'
    script.async = true
    script.onload = () => {
      safeSetState(() => setScriptLoaded(true))
    }
    script.onerror = () => {
      safeSetState(() => setError('Failed to load Bitmovin Player'))
    }
    document.head.appendChild(script)

    return () => {
      // Don't remove script on unmount as it may be used by other instances
    }
  }, [safeSetState])

  // Cleanup player function
  const cleanupPlayer = useCallback(() => {
    if (playerInstanceRef.current) {
      try {
        if (!playerInstanceRef.current.isDestroyed?.()) {
          playerInstanceRef.current.destroy()
        }
      } catch (err) {
        console.warn('Error destroying player:', err)
      }
      playerInstanceRef.current = null
    }
    isInitializingRef.current = false
  }, [])

  // Initialize player function
  const initializePlayer = useCallback(async () => {
    if (!scriptLoaded || !playerRef.current || !mountedRef.current) return
    
    // Prevent multiple initializations
    if (isInitializingRef.current) return
    isInitializingRef.current = true

    try {
      // Cleanup existing player first
      cleanupPlayer()

      safeSetState(() => {
        setLoading(true)
        setError(null)
      })

      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (!mountedRef.current) return

      const playerConfig = {
        key: '90f78acb-6226-4dc9-9ddd-7dda84143e50',
        analytics: {
          key: '8f54bbf3-e230-40fd-aecd-97d36a58585a',
          videoId: "Live-Cricket",
          title: "Live Cricket Stream"
        },
        playback: {
          autoplay: true,
          muted: false
        },
        style: {
          width: "100%",
          height: "100%"
        },
        ui: {
          watermark: {
            display: false
          }
        }
      }

      const sourceConfig = {
        hls: streamUrl,
        title: "Live Cricket Stream"
      }

      if (!mountedRef.current || !playerRef.current) return

      // Create new player
      const player = new window.bitmovin.player.Player(playerRef.current, playerConfig)
      playerInstanceRef.current = player

      // Load stream only if component is still mounted
      if (mountedRef.current) {
        await player.load(sourceConfig)
        
        safeSetState(() => {
          setLoading(false)
        })
        
        onLoad?.()
        console.log("Bitmovin Player: Stream loaded successfully")
      }

    } catch (err: any) {
      console.error("Bitmovin Player Error:", err)
      
      safeSetState(() => {
        setError(err.message || 'Failed to load stream')
        setLoading(false)
      })
      
      onError?.(err)
    } finally {
      isInitializingRef.current = false
    }
  }, [scriptLoaded, streamUrl, onError, onLoad, safeSetState, cleanupPlayer])

  // Initialize player when script is loaded
  useEffect(() => {
    if (scriptLoaded && playerRef.current && mountedRef.current) {
      initializePlayer()
    }

    // Cleanup on unmount or dependencies change
    return () => {
      cleanupPlayer()
    }
  }, [scriptLoaded, initializePlayer, cleanupPlayer])

  const handleRetry = useCallback(() => {
    if (mountedRef.current) {
      setError(null)
      setLoading(true)
      // Small delay before retrying
      setTimeout(() => {
        if (mountedRef.current) {
          initializePlayer()
        }
      }, 500)
    }
  }, [initializePlayer])

  if (error) {
    return (
      <div className={`bg-black flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-6">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Stream Error</h3>
          <p className="text-gray-300 text-sm mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-black ${className}`}>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Player Container */}
      <div 
        ref={playerRef} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />

      {/* Custom CSS for hiding watermark */}
      <style jsx>{`
        :global(.bmpui-ui-watermark),
        :global(.bmpui-watermark),
        :global([class*="watermark"]) {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>
    </div>
  )
}
