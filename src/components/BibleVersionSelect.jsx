import React, { useState } from 'react';
import { Globe, ChevronDown, X, Check, CloudOff, Lock, DownloadCloud } from 'lucide-react';
import { bibleVersions } from '../data/bibleVersions';

const BibleVersionSelect = ({ selectedVersionId, onSelect, downloadedIds = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const selectedVersion = bibleVersions.find(v => v.id === selectedVersionId) || bibleVersions[0];

  const filteredVersions = bibleVersions.filter(v => {
    if (filter === 'English') return v.language === 'English';
    if (filter === 'Tagalog') return v.language === 'Tagalog';
    if (filter === 'Offline Available') return v.offlineAllowed;
    return true; // 'All'
  });

  const getStatusBadge = (version) => {
    if (version.copyrightStatus === 'licensed') {
      return (
        <span style={{ ...styles.badge, ...styles.badgeLicensed }}>
          <Lock size={14} /> Licensed Access Required
        </span>
      );
    }
    
    const isDownloaded = downloadedIds.includes(version.id);
    if (isDownloaded) {
      return (
        <span style={{ ...styles.badge, ...styles.badgeDownloaded }}>
          <Check size={14} /> Downloaded
        </span>
      );
    }
    
    if (version.offlineAllowed) {
      return (
        <span style={{ ...styles.badge, ...styles.badgeOfflineAvailable }}>
          <DownloadCloud size={14} /> Available Offline
        </span>
      );
    }
    
    return (
      <span style={{ ...styles.badge, ...styles.badgeOnlineOnly }}>
        <CloudOff size={14} /> Online Only
      </span>
    );
  };

  const handleSelect = (id) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <div style={styles.container}>
        <label style={styles.label}>Bible Version</label>
        <button 
          onClick={() => setIsOpen(true)}
          style={styles.triggerButton}
          className="btn-large"
        >
          <div style={styles.triggerContent}>
            <Globe size={24} color="var(--primary-blue)" />
            <div style={styles.triggerTextContainer}>
              <span style={styles.triggerTitle}>{selectedVersion.name} ({selectedVersion.id})</span>
              <span style={styles.triggerSub}>{selectedVersion.language}</span>
            </div>
          </div>
          <ChevronDown size={24} color="var(--muted-dark)" />
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Select Bible Version</h2>
              <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={28} />
              </button>
            </div>

            {/* Filters */}
            <div style={styles.filterRow}>
              {['All', 'Offline Available', 'English', 'Tagalog'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...styles.filterPill,
                    ...(filter === f ? styles.filterPillActive : {})
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div style={styles.versionList}>
              {filteredVersions.map(v => (
                <button 
                  key={v.id} 
                  onClick={() => handleSelect(v.id)}
                  style={{
                    ...styles.versionItem,
                    ...(selectedVersionId === v.id ? styles.versionItemActive : {})
                  }}
                >
                  <div style={styles.versionInfo}>
                    <span style={styles.versionName}>{v.id} - {v.name}</span>
                    {getStatusBadge(v)}
                  </div>
                  {selectedVersionId === v.id && (
                    <Check size={24} color="var(--primary-blue)" />
                  )}
                </button>
              ))}
              {filteredVersions.length === 0 && (
                <p style={styles.emptyText}>No versions found for this filter.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    marginBottom: '1.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: 'var(--muted-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  triggerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'white',
    border: '2px solid var(--border-light)',
    borderRadius: '16px',
    padding: '1rem 1.25rem',
    width: '100%',
    textAlign: 'left',
    minHeight: '64px',
    cursor: 'pointer',
  },
  triggerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  triggerTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  triggerTitle: {
    fontSize: '1.15rem',
    fontWeight: '900',
    color: '#0f172a',
  },
  triggerSub: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(5, 7, 13, 0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-end', // Bottom sheet on mobile
  },
  modalContent: {
    background: '#f8fafc',
    width: '100%',
    maxHeight: '90vh',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#0f172a',
  },
  closeBtn: {
    background: '#e2e8f0',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#334155',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    scrollbarWidth: 'none', // Firefox
  },
  filterPill: {
    background: 'white',
    border: '2px solid #cbd5e1',
    color: '#475569',
    padding: '0.6rem 1.25rem',
    borderRadius: '100px',
    fontSize: '0.95rem',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    minHeight: '44px',
  },
  filterPillActive: {
    background: 'var(--primary-blue)',
    borderColor: 'var(--primary-blue)',
    color: 'white',
  },
  versionList: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    paddingBottom: '2rem',
  },
  versionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    border: '2px solid #e2e8f0',
    padding: '1.25rem',
    borderRadius: '16px',
    textAlign: 'left',
    cursor: 'pointer',
    minHeight: '80px',
    width: '100%',
  },
  versionItemActive: {
    borderColor: 'var(--primary-blue)',
    background: 'rgba(15, 95, 168, 0.03)',
  },
  versionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  versionName: {
    fontSize: '1.25rem',
    fontWeight: '900',
    color: '#0f172a',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '800',
    width: 'fit-content',
  },
  badgeOfflineAvailable: {
    background: '#dbeafe',
    color: '#1d4ed8',
  },
  badgeOnlineOnly: {
    background: '#f1f5f9',
    color: '#475569',
  },
  badgeLicensed: {
    background: '#fef3c7',
    color: '#b45309',
  },
  badgeDownloaded: {
    background: '#dcfce3',
    color: '#15803d',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    padding: '2rem',
    fontSize: '1.1rem',
  }
};

export default BibleVersionSelect;
