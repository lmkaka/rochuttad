import React from 'react';

const Android: React.FC = () => {
  return (
    <div
      style={{
        margin: 0,
        background: '#000',
        height: '100vh',
        width: '100vw',
        position: 'relative'
      }}
    >
      <img 
        src="" 
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
      
      <iframe
        src="https://radarofc.onrender.com/both.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#000'
        }}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        title="Cricket Stream Channel 14"
        referrerPolicy="no-referrer"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock allow-top-navigation"
      />
    </div>
  );
};

export default Android;
