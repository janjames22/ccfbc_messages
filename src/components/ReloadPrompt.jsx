import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Smartphone } from 'lucide-react';

function ReloadPrompt() {
  const sw = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const offlineReadyArray = sw?.offlineReady || [false, () => {}];
  const needUpdateArray = sw?.needUpdate || [false, () => {}];
  
  const [offlineReady, setOfflineReady] = offlineReadyArray;
  const [needUpdate, setNeedUpdate] = needUpdateArray;
  const updateServiceWorker = sw?.updateServiceWorker || (() => Promise.resolve());

  const close = () => {
    setOfflineReady(false);
    setNeedUpdate(false);
  };

  if (!offlineReady && !needUpdate) return null;

  return (
    <div style={styles.container}>
      <div className="card-light" style={styles.card}>
        <div style={styles.iconWrapper}>
          <Smartphone size={32} color="var(--primary-blue)" />
        </div>
        
        <div style={styles.content}>
          <p style={styles.message}>
            {offlineReady 
              ? 'App is ready for offline use.' 
              : 'A new version is available. Tap to update.'}
          </p>
          
          <div style={styles.actions}>
            {needUpdate && (
              <button 
                onClick={() => updateServiceWorker(true)} 
                style={styles.updateBtn}
              >
                <RefreshCw size={20} />
                <span>Update App</span>
              </button>
            )}
            <button onClick={close} style={styles.closeBtn}>
              <X size={20} />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 9999,
    maxWidth: '400px',
    width: 'calc(100% - 4rem)',
    animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.5rem 2rem',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    background: 'white',
    border: '2px solid var(--accent-blue)',
    borderRadius: '24px',
  },
  iconWrapper: {
    flexShrink: 0,
    background: 'rgba(30, 136, 229, 0.1)',
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-dark)',
    margin: 0,
    lineHeight: '1.4',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  updateBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(15, 95, 168, 0.3)',
  },
  closeBtn: {
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    fontWeight: '800',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }
};

// Add keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export default ReloadPrompt;
