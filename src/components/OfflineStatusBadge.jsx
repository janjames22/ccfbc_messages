import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useOfflineMessages } from '../hooks/useOfflineMessages';

const OfflineStatusBadge = ({ messageId, showLabel = true }) => {
  const { isDownloaded } = useOfflineMessages();

  if (!isDownloaded(messageId)) return null;

  return (
    <div style={styles.badge}>
      <CheckCircle size={16} color="#2e7d32" fill="#e8f5e9" />
      {showLabel && <span style={styles.label}>Available Offline</span>}
    </div>
  );
};

const styles = {
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#f0fdf4',
    color: '#166534',
    padding: '0.4rem 1rem',
    borderRadius: '100px',
    fontSize: 'var(--font-xs)',
    fontWeight: '900',
    border: '2px solid #bbf7d0',
    width: 'fit-content',
    boxShadow: '0 2px 8px rgba(22, 101, 52, 0.1)',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }
};

export default OfflineStatusBadge;
