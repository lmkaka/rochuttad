import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    shaka: any;
    player: any;
  }
}

const Android: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const manifestUri = "https://sundirectgo-live.pc.cdn.bitgravity.com/hd38/dth.mpd";

    const initPlayer = async () => {
      if (!window.shaka || !videoRef.current) return;

      // Install polyfills
      window.shaka.polyfill.installAll();
      
      // Check browser support
      if (!window.shaka.Player.isBrowserSupported()) {
        console.error('Browser not supported!');
        return;
      }

      try {
        // Create player directly without UI
        const player = new window.shaka.Player(videoRef.current);
        window.player = player;

        // Configure DRM
        player.configure({
          drm: {
            clearKeys: {
              "5e833f4019554aa394ff6de2eb19bf78": "f60e08a145804890492f315b61789ac5"
            }
          },
          abr: {
            enabled: true
          }
        });

        // Error handling
        player.addEventListener('error', (errorEvent: any) => {
          console.error('Player Error:', errorEvent.detail);
        });

        // Load manifest
        await player.load(manifestUri);
        console.log('Stream loaded successfully');

        // Auto-select 576p
        const tracks = player.getVariantTracks();
        const track576 = tracks.find((t: any) => t.height === 576);
        if (track576) {
          await player.selectVariantTrack(track576, true);
          console.log("576p selected by default");
        }

      } catch (error) {
        console.error('Failed to initialize player:', error);
      }
    };

    // Wait for Shaka to load
    const timer = setTimeout(initPlayer, 1000);
    
    return () => {
      clearTimeout(timer);
      if (window.player) {
        window.player.destroy();
      }
    };
  }, []);

  return (
    <div
      style={{
        margin: 0,
        background: '#000',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <img 
        src="https://radarxtv.site/" 
        alt="" 
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '80px',
          zIndex: 1000,
          filter: 'drop-shadow(0 0 8px #00f7ff)'
        }}
      />
      
      <video 
        ref={videoRef}
        controls
        autoPlay 
        muted 
        playsInline
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};

export default Android;
