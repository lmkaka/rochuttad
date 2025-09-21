import { useEffect, useRef, useState } from 'react'
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
  streamUrl = "https://in-mc-fdlive.fancode.com/mumbai/136736_english_hls_9776118ee542689ta-di_h264/index.m3u8",
  className = "",
  onError,
  onLoad 
}: BitmovinPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load Bitmovin Player script
  useEffect(() => {
    const loadBitmovinScript = () => {
      if (window.bitmovin) {
        setScriptLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/bitmovin-player@8/bitmovinplayer.js'
      script.async = true
      script.onload = () => setScriptLoaded(true)
      script.onerror = () => setError('Failed to load Bitmovin Player')
      document.head.appendChild(script)

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }

    loadBitmovinScript()
  }, [])

  // Initialize player when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !playerRef.current) return

    const initializePlayer = async () => {
      try {
        setLoading(true)
        setError(null)

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

        // Cleanup existing player
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy()
          playerInstanceRef.current = null
        }

        // Create new player
        const player = new window.bitmovin.player.Player(playerRef.current, playerConfig)
        playerInstanceRef.current = player

        // Load stream
        await player.load(sourceConfig)
        
        setLoading(false)
        onLoad?.()
        
        console.log("Bitmovin Player: Stream loaded successfully")

      } catch (err: any) {
        console.error("Bitmovin Player Error:", err)
        setError(err.message || 'Failed to load stream')
        setLoading(false)
        onError?.(err)
      }
    }

    initializePlayer()

    // Cleanup on unmount
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
          playerInstanceRef.current = null
        } catch (err) {
          console.warn("Error destroying player:", err)
        }
      }
    }
  }, [scriptLoaded, streamUrl, onError, onLoad])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Re-trigger initialization
    if (scriptLoaded && playerRef.current) {
      const event = new Event('retry')
      playerRef.current.dispatchEvent(event)
    }
  }

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
        :global(.bmpui-ui-watermark) {
          display: none !important;
        }
        :global(.bmpui-watermark) {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
