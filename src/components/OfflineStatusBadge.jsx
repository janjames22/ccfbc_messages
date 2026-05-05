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
    gap: '0.4rem',
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '800',
    border: '1px solid #a5d6a7',
    width: 'fit-content',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }
};

export default OfflineStatusBadge;
