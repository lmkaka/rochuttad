import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    shaka: any;
    player: any;
    ui: any;
  }
}

const Android: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const manifestUri = "https://sundirectgo-live.pc.cdn.bitgravity.com/hd38/dth.mpd";

    const initPlayer = async () => {
      // Check if Shaka is loaded
      if (!window.shaka) {
        console.error('Shaka Player not loaded');
        return;
      }

      // Install polyfills
      window.shaka.polyfill.installAll();

      // Check browser support
      if (!window.shaka.Player.isBrowserSupported()) {
        console.error('Browser not supported!');
        return;
      }

      if (!videoRef.current || !containerRef.current) {
        console.error('Video element not found');
        return;
      }

      try {
        // Initialize Shaka UI
        const ui = new window.shaka.ui.Overlay(
          videoRef.current,
          containerRef.current,
          videoRef.current
        );

        const controls = ui.getControls();
        const player = controls.getPlayer();

        // Store references globally
        window.player = player;
        window.ui = ui;

        // Configure UI
        const uiConfig = {
          controlPanelElements: [
            'play_pause',
            'mute',
            'volume',
            'quality',
            'fullscreen',
            'time_and_duration'
          ],
          addBigPlayButton: false,
          addSeekBar: true
        };
        ui.configure(uiConfig);

        // Configure player
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

        // Add error listeners
        player.addEventListener('error', (errorEvent: any) => {
          console.error('Player Error:', errorEvent.detail);
        });

        controls.addEventListener('error', (errorEvent: any) => {
          console.error('UI Error:', errorEvent.detail);
        });

        // Load the manifest
        await player.load(manifestUri);
        console.log('Stream loaded successfully');

        // Select 576p by default
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

    // Wait for Shaka to be available
    const checkShaka = () => {
      if (window.shaka) {
        initPlayer();
      } else {
        // Wait a bit more and try again
        setTimeout(checkShaka, 100);
      }
    };

    // Start checking for Shaka
    checkShaka();

    // Cleanup function
    return () => {
      if (window.player) {
        try {
          window.player.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
      if (window.ui) {
        try {
          window.ui.destroy();
        } catch (error) {
          console.error('Error destroying UI:', error);
        }
      }
    };
  }, []);

  return (
    <div
      style={{
        margin: 0,
        background: '#000',
        color: 'white',
        fontFamily: 'sans-serif',
        height: '100vh',
        width: '100vw',
        position: 'relative'
      }}
    >
      <div 
        ref={containerRef}
        data-shaka-player-container
        style={{
          maxWidth: '100%',
          height: '100vh',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        {/* Logo */}
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
        
        {/* Video Element */}
        <video 
          ref={videoRef}
          data-shaka-player
          autoPlay 
          muted 
          style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: '#000'
          }}
        />
      </div>
    </div>
  );
};

export default Android;
