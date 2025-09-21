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

  useEffect(() => {
    const manifestUri = "https://sundirectgo-live.pc.cdn.bitgravity.com/hd38/dth.mpd";

    const init = async () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const ui = video['ui'];
      const controls = ui.getControls();
      const player = controls.getPlayer();

      window.player = player;
      window.ui = ui;

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

      player.configure({
        drm: {
          "clearKeys": {
            "5e833f4019554aa394ff6de2eb19bf78": "f60e08a145804890492f315b61789ac5"
          }
        },
        abr: {
          enabled: true
        }
      });

      player.addEventListener('error', onPlayerErrorEvent);
      controls.addEventListener('error', onUIErrorEvent);

      try {
        await player.load(manifestUri);
        console.log('Stream loaded');

        const tracks = player.getVariantTracks();
        const track576 = tracks.find((t: any) => t.height === 576);
        if (track576) {
          await player.selectVariantTrack(track576, true);
          console.log("576p selected by default");
        }
      } catch (error) {
        onPlayerError(error);
      }
    };

    const onPlayerErrorEvent = (errorEvent: any) => {
      onPlayerError(errorEvent.detail);
    };

    const onPlayerError = (error: any) => {
      console.error('Error code', error.code, 'object', error);
    };

    const onUIErrorEvent = (errorEvent: any) => {
      onPlayerError(errorEvent.detail);
    };

    const initFailed = () => {
      console.error('Unable to load the UI library!');
    };

    // Wait for Shaka UI to load
    const handleShakaLoaded = () => {
      init();
    };

    const handleShakaLoadFailed = () => {
      initFailed();
    };

    document.addEventListener('shaka-ui-loaded', handleShakaLoaded);
    document.addEventListener('shaka-ui-load-failed', handleShakaLoadFailed);

    // Anti-iframe protection
    if (window.top !== window.self) {
      const ref = document.referrer;
      if (!ref.includes("watchwithradar.live")) {
        document.body.innerHTML = '<div id="message">Ab to copy mat kat chutiye</div>';
      }
    }

    return () => {
      document.removeEventListener('shaka-ui-loaded', handleShakaLoaded);
      document.removeEventListener('shaka-ui-load-failed', handleShakaLoadFailed);
    };
  }, []);

  return (
    <>
      {/* Add Shaka Player CSS */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css" 
        crossOrigin="anonymous"
      />
      <link 
        rel="stylesheet" 
        href="https://livecrichdofficial.pages.dev/livecrichd2.css"
      />
      
      <div 
        style={{
          margin: 0,
          background: '#000',
          color: 'white',
          fontFamily: 'sans-serif',
          height: '100vh',
          width: '100vw'
        }}
      >
        <div 
          id="player-container"
          style={{
            maxWidth: '100%',
            aspectRatio: '16/9',
            margin: '0 auto',
            position: 'relative'
          }}
        >
          {/* Injected Logo */}
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
            className="radarx-logo"
          />
          
          {/* Shaka Player Container */}
          <div data-shaka-player-container className="shaka-video-container">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              data-shaka-player 
              id="video" 
              poster="#"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        <div 
          id="message"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 1001
          }}
        >
          Ab to copy mat kat chutiye
        </div>
      </div>
    </>
  );
};

export default Android;
