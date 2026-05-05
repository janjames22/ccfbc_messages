import React from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

const OfflineBanner = () => {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <WifiOff size={20} />
        <span>You are currently offline. Some features may be limited.</span>
      </div>
      <div style={styles.hint}>
        <AlertCircle size={16} />
        <span>Previously viewed messages are still available.</span>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: 'rgba(30, 136, 229, 0.95)',
    color: 'white',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    position: 'sticky',
    top: 0,
    zIndex: 3000,
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    opacity: 0.9,
  }
};

export default OfflineBanner;
