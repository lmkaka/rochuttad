import { useEffect, useRef, useState, useCallback } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon, TvIcon, PlayIcon, BoltIcon } from '@heroicons/react/24/outline'
import { CheckIcon, ClockIcon } from '@heroicons/react/24/solid'

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

interface StreamPageProps {
  streamUrl?: string
  streamTitle?: string
  className?: string
  onError?: (error: any) => void
  onLoad?: () => void
}

export default function StreamPage({
  streamUrl = "https://d285kzy11wjv54.cloudfront.net/out/v1/0c63d485c6904eea88bb6f04e1b73c77/index.m3u8",
  streamTitle = "Live Cricket Stream",
  className = "",
  onError,
  onLoad
}: StreamPageProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const isInitializingRef = useRef(false)
  const mountedRef = useRef(true)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

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

    if (isInitializingRef.current) return
    isInitializingRef.current = true

    try {
      cleanupPlayer()

      safeSetState(() => {
        setLoading(true)
        setError(null)
      })

      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (!mountedRef.current) return

      const playerConfig = {
        key: '90f78acb-6226-4dc9-9ddd-7dda84143e50',
        analytics: {
          key: '8f54bbf3-e230-40fd-aecd-97d36a58585a',
          videoId: "Live-Cricket",
          title: streamTitle
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
        title: streamTitle
      }

      if (!mountedRef.current || !playerRef.current) return

      const player = new window.bitmovin.player.Player(playerRef.current, playerConfig)
      playerInstanceRef.current = player

      // Player event listeners
      player.on('play', () => {
        safeSetState(() => setIsPlaying(true))
      })

      player.on('pause', () => {
        safeSetState(() => setIsPlaying(false))
      })

      player.on('error', (event: any) => {
        console.error('Player error:', event)
        safeSetState(() => {
          setError(`Stream Error: ${event.message || 'Unknown error'}`)
          setLoading(false)
          setIsPlaying(false)
        })
        onError?.(event)
      })

      if (mountedRef.current) {
        await player.load(sourceConfig)
        
        safeSetState(() => {
          setLoading(false)
          setIsPlaying(true)
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
  }, [scriptLoaded, streamUrl, streamTitle, onError, onLoad, safeSetState, cleanupPlayer])

  // Initialize player when script is loaded
  useEffect(() => {
    if (scriptLoaded && playerRef.current && mountedRef.current) {
      initializePlayer()
    }

    return () => {
      cleanupPlayer()
    }
  }, [scriptLoaded, initializePlayer, cleanupPlayer])

  const handleRetry = useCallback(() => {
    if (mountedRef.current) {
      setError(null)
      setLoading(true)
      setTimeout(() => {
        if (mountedRef.current) {
          initializePlayer()
        }
      }, 500)
    }
  }, [initializePlayer])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg">
                <ExclamationTriangleIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Stream Unavailable
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                WatchWithRadar Live Stream
              </p>
            </div>

            {/* Error Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
              <div className="text-red-500 mb-4">
                <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Connection Error
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {error}
              </p>
              <button 
                onClick={handleRetry}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <TvIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    WatchWithRadar Live
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Premium Cricket Streaming
                  </p>
                </div>
              </div>

              {/* Live Status */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl shadow-lg">
                <div className={`w-2.5 h-2.5 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`}></div>
                <BoltIcon className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {isPlaying ? 'LIVE' : 'CONNECTING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Section */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            
            {/* Stream Header */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlayIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {streamTitle}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span>HD Quality</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4 text-blue-500" />
                    <span>24/7 Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Container */}
            <div 
              ref={containerRef}
              className="relative bg-black"
              style={{ aspectRatio: '16/9' }}
            >
              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
                  <div className="text-center text-white">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500 mx-auto mb-4"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TvIcon className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Loading Stream...</h3>
                    <p className="text-sm text-gray-400">Connecting to WatchWithRadar</p>
                  </div>
                </div>
              )}

              {/* Bitmovin Player Container */}
              <div 
                ref={playerRef} 
                className="w-full h-full absolute inset-0"
              />

              {/* Stream Overlay Info */}
              {!loading && !error && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">WatchWithRadar LIVE</span>
                  </div>
                </div>
              )}
            </div>

            {/* Player Footer */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Stream Active</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Powered by Bitmovin Player
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  © WatchWithRadar
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quality Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TvIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                HD Quality
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Premium streaming experience
              </p>
            </div>

            {/* Speed Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BoltIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Low Latency
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time streaming
              </p>
            </div>

            {/* Reliability Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                24/7 Available
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Always online streaming
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        :global(.bmpui-ui-watermark),
        :global(.bmpui-watermark),
        :global([class*="watermark"]) {
          display: none !important;
          visibility: hidden !important;
        }
        
        :global(.bmpui-ui-controlbar) {
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%) !important;
          border-radius: 0 0 24px 24px !important;
        }
        
        :global(.bmpui-ui-seekbar .bmpui-seekbar) {
          background: rgba(59, 130, 246, 0.3) !important;
        }
        
        :global(.bmpui-ui-seekbar .bmpui-seekbar-playbackposition) {
          background: rgb(59, 130, 246) !important;
        }

        :global(.bmpui-ui-volumeslider .bmpui-slider-track) {
          background: rgba(59, 130, 246, 0.3) !important;
        }
        
        :global(.bmpui-ui-volumeslider .bmpui-slider-track-playbackposition) {
          background: rgb(59, 130, 246) !important;
        }
      `}</style>
    </div>
  )
    }
          
