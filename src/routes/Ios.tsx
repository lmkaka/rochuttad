import React, { useEffect, useRef } from 'react';

const Ios: React.FC = () => {
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadIframe = () => {
      if (!playerContainerRef.current) return;

      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation');
      iframe.setAttribute('frameBorder', '0');
      iframe.setAttribute('gesture', 'media');
      iframe.setAttribute('allow', 'encrypted-media');
      iframe.setAttribute('allowFullScreen', 'true');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('src', 'https://tataplay.slivcdn.com/hls/live/2020591/TEN3HD/master_3500.m3u8');
      
      // Style the iframe
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      playerContainerRef.current.appendChild(iframe);
    };

    // Load iframe when component mounts
    loadIframe();

    // Cleanup function to remove iframe when component unmounts
    return () => {
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #242424, #3b5998)',
        color: '#fff',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      <div
        ref={playerContainerRef}
        className="player-container"
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default Ios;
