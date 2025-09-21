import { useEffect, useRef, useState, useCallback } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

// HLS.js types
declare global {
  interface Window {
    Hls: any
  }
}

interface HLSPlayerProps {
  streamUrl?: string
  className?: string
  onError?: (error: any) => void
  onLoad?: () => void
}

export default function HLSPlayer({ 
  streamUrl = "https://liveakdai.slivcdn.com/hls/live/2119921/cricacc12109/HIN/std_lrh-800300010.m3u8?hdnea=exp=1758505528~acl=/*~id=05027931411562148048170567398729~hmac=6183fa74949fb66a51756a6f9b0bc5377bfa8fdd697381fff670f34c03fcd633",
  className = "",
  onError,
  onLoad 
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const safeSetState = useCallback((setter: () => void) => {
    if (mountedRef.current) {
      setter()
    }
  }, [])

  // Load HLS.js script
  useEffect(() => {
    if (window.Hls) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
    script.async = true
    script.onload = () => {
      safeSetState(() => setScriptLoaded(true))
    }
    script.onerror = () => {
      safeSetState(() => setError('Failed to load HLS.js'))
    }
    document.head.appendChild(script)

    return () => {
      // Script cleanup handled by browser
    }
  }, [safeSetState])

  const cleanupHLS = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  const initializeHLS = useCallback(async () => {
    if (!scriptLoaded || !videoRef.current || !mountedRef.current) return

    try {
      cleanupHLS()
      
      safeSetState(() => {
        setLoading(true)
        setError(null)
      })

      const video = videoRef.current
      
      if (window.Hls.isSupported()) {
        const hls = new window.Hls({
          // CORS और performance के लिए configuration
          xhrSetup: (xhr: XMLHttpRequest, url: string) => {
            // Custom headers add कर सकते हैं यहाँ
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
            xhr.setRequestHeader('Access-Control-Allow-Headers', '*')
          },
          // Error recovery के लिए
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        })

        hlsRef.current = hls

        // HLS events
        hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS: Media attached')
        })

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS: Manifest parsed')
          safeSetState(() => setLoading(false))
          onLoad?.()
          
          // Auto play attempt
          video.play().catch((err) => {
            console.log('Auto play failed:', err)
          })
        })

        hls.on(window.Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data)
          
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error - attempting recovery')
                hls.startLoad()
                break
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error - attempting recovery')
                hls.recoverMediaError()
                break
              default:
                safeSetState(() => {
                  setError(`HLS Error: ${data.details}`)
                  setLoading(false)
                })
                onError?.(data)
                break
            }
          }
        })

        // Attach media and load source
        hls.attachMedia(video)
        hls.loadSource(streamUrl)

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = streamUrl
        video.addEventListener('loadedmetadata', () => {
          safeSetState(() => setLoading(false))
          onLoad?.()
        })
        video.addEventListener('error', (e) => {
          safeSetState(() => {
            setError('Video load error')
            setLoading(false)
          })
          onError?.(e)
        })
      } else {
        safeSetState(() => {
          setError('HLS not supported in this browser')
          setLoading(false)
        })
      }

    } catch (err: any) {
      console.error('HLS initialization error:', err)
      safeSetState(() => {
        setError(err.message || 'Failed to initialize player')
        setLoading(false)
      })
      onError?.(err)
    }
  }, [scriptLoaded, streamUrl, onError, onLoad, safeSetState, cleanupHLS])

  useEffect(() => {
    if (scriptLoaded && videoRef.current && mountedRef.current) {
      initializeHLS()
    }

    return () => {
      cleanupHLS()
    }
  }, [scriptLoaded, initializeHLS, cleanupHLS])

  const handleRetry = useCallback(() => {
    if (mountedRef.current) {
      setError(null)
      setLoading(true)
      setTimeout(() => {
        if (mountedRef.current) {
          initializeHLS()
        }
      }, 500)
    }
  }, [initializeHLS])

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
      {loading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        muted
        style={{ minHeight: '300px' }}
      />
    </div>
  )
          }
  
