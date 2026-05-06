import React, { useState, useEffect } from 'react';
import { Download, Check, Trash2, Smartphone, AlertCircle } from 'lucide-react';
import { useOfflineMessages } from '../hooks/useOfflineMessages';
import { useOffline } from '../hooks/useOffline';

const DownloadOfflineButton = ({ message, variant = 'large' }) => {
  const { isDownloaded, saveMessageOffline, removeMessageOffline } = useOfflineMessages();
  const isOffline = useOffline();
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const messageId = message?.id;
  const downloaded = isDownloaded(messageId);
  const displayStatus = status === 'downloading' || status === 'error'
    ? status
    : downloaded
      ? 'downloaded'
      : 'idle';

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
        setStatus(downloaded ? 'downloaded' : 'idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [downloaded, error]);

  const handleToggle = async () => {
    setError(null);
    setToast(null);

    if (!messageId || !message) {
      setStatus('error');
      setError('This message could not be prepared for offline reading.');
      return;
    }

    if (downloaded) {
      if (window.confirm('Remove this message from offline reading?')) {
        setStatus('downloading');
        const success = removeMessageOffline(messageId);
        if (success) {
          setStatus('idle');
          setToast('Removed from offline reading.');
        } else {
          setStatus('error');
          setError('Failed to remove message.');
        }
      }
    } else {
      if (isOffline) {
        setStatus('error');
        setError('Please connect to the internet to download this message.');
        return;
      }

      setStatus('downloading');
      await new Promise(resolve => window.setTimeout(resolve, 120));
      const success = saveMessageOffline(message);
      if (success) {
        setStatus('downloaded');
        setToast('Saved for offline reading.');
      } else {
        setStatus('error');
        setError('Failed to save message. Storage might be full.');
      }
    }
  };

  if (variant === 'icon') {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); handleToggle(); }}
          style={downloaded ? styles.iconBtnActive : styles.iconBtn}
          title={downloaded ? 'Remove Offline' : 'Download for Offline'}
          disabled={displayStatus === 'downloading'}
        >
          {downloaded ? <Check size={20} /> : <Download size={20} />}
        </button>
        {toast && <div style={styles.miniToast}>{toast}</div>}
        {error && <div style={{...styles.miniToast, background: '#ef4444'}}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button 
        type="button"
        onClick={handleToggle}
        style={{
          ...styles.btn,
          ...(downloaded ? styles.btnActive : styles.btnInactive),
          ...(displayStatus === 'error' ? styles.btnError : {}),
          opacity: (isOffline && !downloaded) || displayStatus === 'downloading' ? 0.65 : 1,
        }}
        disabled={(isOffline && !downloaded) || displayStatus === 'downloading'}
      >
        {displayStatus === 'downloading' ? (
          <>
            <Download size={24} />
            <span>{downloaded ? 'Removing...' : 'Downloading...'}</span>
          </>
        ) : displayStatus === 'downloaded' ? (
          <>
            <Check size={24} />
            <span>Saved Offline</span>
          </>
        ) : (
          <>
            <Download size={24} />
            <span>Download for Offline</span>
          </>
        )}
      </button>
      
      {downloaded && !isOffline && (
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); handleToggle(); }} 
          style={styles.removeLink}
          disabled={displayStatus === 'downloading'}
        >
          <Trash2 size={16} /> Remove from device
        </button>
      )}

      {toast && (
        <div style={styles.toast}>
          <Smartphone size={20} />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div style={{...styles.toast, background: '#ef4444', border: 'none'}}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    position: 'relative',
  },
  btn: {
    width: '100%',
    minHeight: '72px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    fontSize: 'var(--font-sm)',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'var(--transition)',
    border: 'none',
    boxShadow: 'var(--shadow-md)',
  },
  btnInactive: {
    background: 'white',
    color: 'var(--primary-blue)',
    border: '2px solid var(--border-light)',
  },
  btnActive: {
    background: '#f0fdf4',
    color: '#166534',
    border: '2px solid #bbf7d0',
  },
  btnError: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '2px solid #fecaca',
  },
  iconBtn: {
    background: 'white',
    border: '2px solid var(--border-light)',
    color: 'var(--primary-blue)',
    padding: '0.75rem',
    borderRadius: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  iconBtnActive: {
    background: '#f0fdf4',
    border: '2px solid #bbf7d0',
    color: '#166534',
    padding: '0.75rem',
    borderRadius: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLink: {
    background: 'none',
    border: 'none',
    color: 'var(--muted-dark)',
    fontSize: 'var(--font-xs)',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    padding: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  toast: {
    position: 'fixed',
    bottom: '2.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0f172a',
    color: 'white',
    padding: '1.25rem 2rem',
    borderRadius: '100px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    zIndex: 5000,
    fontWeight: '800',
    border: '2px solid var(--accent-blue)',
    animation: 'slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace: 'nowrap',
    fontSize: 'var(--font-sm)',
  },
  miniToast: {
    position: 'absolute',
    top: '110%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0f172a',
    color: 'white',
    padding: '0.6rem 1.25rem',
    borderRadius: '12px',
    fontSize: 'var(--font-xs)',
    fontWeight: '700',
    zIndex: 10,
    whiteSpace: 'nowrap',
    boxShadow: 'var(--shadow-lg)',
  }
};

export default DownloadOfflineButton;
