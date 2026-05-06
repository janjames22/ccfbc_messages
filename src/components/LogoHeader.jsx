import React from 'react';
import logo from '../assets/logo-ccfbc.jpg';

const LogoHeader = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: '32px',
    navbar: 'clamp(36px, 10vw, 48px)',
    medium: 'clamp(80px, 20vw, 120px)',
    large: 'clamp(120px, 30vw, 160px)'
  };

  const pixelSize = sizes[size] || size;

  return (
    <div className={`logo-container ${className}`}>
      <img 
        src={logo} 
        alt="Cabanatuan Community of Faith Baptist Church Logo" 
        style={{ width: pixelSize, height: 'auto', objectFit: 'contain' }}
        className="logo-glow"
      />
    </div>
  );
};

export default LogoHeader;
