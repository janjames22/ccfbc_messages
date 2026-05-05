import React, { useState, useEffect } from 'react';
import { Download, Check, Trash2, Smartphone } from 'lucide-react';
import { useOfflineMessages } from '../hooks/useOfflineMessages';
import { useOffline } from '../hooks/useOffline';

const DownloadOfflineButton = ({ messageId, title, variant = 'large' }) => {
  const { isDownloaded, toggleDownload } = useOfflineMessages();
  const isOffline = useOffline();
  const [toast, setToast] = useState(null);

  const downloaded = isDownloaded(messageId);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggle = () => {
    if (isOffline && !downloaded) {
      setToast('Please connect to the internet to download.');
      return;
    }

    const result = toggleDownload(messageId);
    if (result === 'saved') {
      setToast('Saved for offline reading.');
    } else if (result === 'removed') {
      setToast('Removed from offline reading.');
    }
  };

  if (variant === 'icon') {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={(e) => { e.preventDefault(); handleToggle(); }}
          style={downloaded ? styles.iconBtnActive : styles.iconBtn}
          title={downloaded ? 'Remove Offline' : 'Download for Offline'}
        >
          {downloaded ? <Check size={20} /> : <Download size={20} />}
        </button>
        {toast && <div style={styles.miniToast}>{toast}</div>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button 
        onClick={handleToggle}
        style={{
          ...styles.btn,
          ...(downloaded ? styles.btnActive : styles.btnInactive),
          opacity: isOffline && !downloaded ? 0.5 : 1,
        }}
        disabled={isOffline && !downloaded}
      >
        {downloaded ? (
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
          onClick={(e) => { e.stopPropagation(); handleToggle(); }} 
          style={styles.removeLink}
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
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    position: 'relative',
  },
  btn: {
    width: '100%',
    minHeight: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'var(--transition)',
    border: 'none',
  },
  btnInactive: {
    background: 'white',
    color: 'var(--primary-blue)',
    border: '2px solid var(--border-light)',
    boxShadow: 'var(--shadow-sm)',
  },
  btnActive: {
    background: '#e8f5e9',
    color: '#2e7d32',
    border: '2px solid #a5d6a7',
  },
  iconBtn: {
    background: 'white',
    border: '1px solid var(--border-light)',
    color: 'var(--primary-blue)',
    padding: '0.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    background: '#e8f5e9',
    border: '1px solid #a5d6a7',
    color: '#2e7d32',
    padding: '0.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLink: {
    background: 'none',
    border: 'none',
    color: 'var(--muted-dark)',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  toast: {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg-navy)',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '100px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    zIndex: 5000,
    fontWeight: '700',
    border: '1px solid var(--accent-blue)',
    animation: 'slideUp 0.3s ease-out',
    whiteSpace: 'nowrap',
  },
  miniToast: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg-navy)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    marginTop: '0.5rem',
    zIndex: 10,
    whiteSpace: 'nowrap',
  }
};

// Add keyframes to head
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes slideUp {
    from { transform: translate(-50%, 20px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
`;
document.head.appendChild(styleTag);

export default DownloadOfflineButton;
