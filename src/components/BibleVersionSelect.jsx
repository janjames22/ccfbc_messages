import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, CloudOff, DownloadCloud, Globe, Lock } from 'lucide-react';
import { bibleVersions } from '../data/bibleVersions';

const FILTERS = ['All', 'Offline Available', 'English', 'Tagalog'];
const MENU_GAP = 8;
const VIEWPORT_PADDING = 12;

const BibleVersionSelect = ({
  selectedVersionId,
  value,
  onSelect,
  onChange,
  downloadedIds = [],
  label = 'Bible Version'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [menuPosition, setMenuPosition] = useState(null);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selectId = useId();
  const triggerId = `${selectId}-trigger`;
  const menuId = `${selectId}-menu`;

  const selectedId = selectedVersionId || value || 'KJV';
  const selectedVersion = bibleVersions.find(v => v.id === selectedId) || bibleVersions[0];
  const downloadedIdSet = useMemo(() => new Set(downloadedIds), [downloadedIds]);

  const filteredVersions = useMemo(() => {
    return bibleVersions.filter(version => {
      if (filter === 'English') return version.language === 'English';
      if (filter === 'Tagalog') return version.language === 'Tagalog';
      if (filter === 'Offline Available') return version.offlineAllowed;
      return true;
    });
  }, [filter]);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const availableBelow = viewportHeight - rect.bottom - MENU_GAP - VIEWPORT_PADDING;
    const availableAbove = rect.top - MENU_GAP - VIEWPORT_PADDING;
    const placeAbove = availableBelow < 260 && availableAbove > availableBelow;
    const width = Math.min(rect.width, viewportWidth - VIEWPORT_PADDING * 2);
    const maxHeight = Math.max(
      120,
      Math.min(320, Math.floor(viewportHeight * 0.6), placeAbove ? availableAbove : availableBelow)
    );
    const top = placeAbove
      ? Math.max(VIEWPORT_PADDING, rect.top - MENU_GAP - maxHeight)
      : Math.min(rect.bottom + MENU_GAP, viewportHeight - maxHeight - VIEWPORT_PADDING);

    setMenuPosition({
      top,
      left: Math.min(Math.max(VIEWPORT_PADDING, rect.left), viewportWidth - width - VIEWPORT_PADDING),
      width,
      maxHeight
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    updateMenuPosition();
    const handlePointerDown = (event) => {
      const target = event.target;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const handleToggle = () => {
    setIsOpen(open => !open);
  };

  const handleSelect = (id) => {
    onSelect?.(id);
    onChange?.(id);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const getStatusBadge = (version) => {
    if (version.copyrightStatus === 'licensed') {
      return (
        <span style={{ ...styles.badge, ...styles.badgeLicensed }}>
          <Lock size={14} /> Licensed Access Required
        </span>
      );
    }

    if (downloadedIdSet.has(version.id)) {
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

  const menu = isOpen && menuPosition ? (
    <div
      ref={menuRef}
      id={menuId}
      role="listbox"
      aria-label="Bible versions"
      style={{
        ...styles.menu,
        top: menuPosition.top,
        left: menuPosition.left,
        width: menuPosition.width,
        maxHeight: menuPosition.maxHeight
      }}
    >
      <div style={styles.filterRow}>
        {FILTERS.map(filterName => (
          <button
            key={filterName}
            type="button"
            onClick={() => setFilter(filterName)}
            style={{
              ...styles.filterPill,
              ...(filter === filterName ? styles.filterPillActive : {})
            }}
          >
            {filterName}
          </button>
        ))}
      </div>

      <div style={styles.versionList}>
        {filteredVersions.map(version => {
          const isSelected = selectedId === version.id;

          return (
            <button
              key={version.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(version.id)}
              style={{
                ...styles.versionItem,
                ...(isSelected ? styles.versionItemActive : {})
              }}
            >
              <div style={styles.versionInfo}>
                <span style={styles.versionName}>{version.id} - {version.name}</span>
                {getStatusBadge(version)}
              </div>
              {isSelected && <Check size={24} color="var(--primary-blue)" />}
            </button>
          );
        })}

        {filteredVersions.length === 0 && (
          <p style={styles.emptyText}>No versions found for this filter.</p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={containerRef} style={styles.container}>
      <label htmlFor={triggerId} style={styles.label}>{label}</label>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={menuId}
        style={{
          ...styles.triggerButton,
          ...(isOpen ? styles.triggerButtonOpen : {})
        }}
        className="btn-large"
      >
        <div style={styles.triggerContent}>
          <Globe size={24} color="var(--primary-blue)" />
          <div style={styles.triggerTextContainer}>
            <span style={styles.triggerTitle}>{selectedVersion.name} ({selectedVersion.id})</span>
            <span style={styles.triggerSub}>
              {downloadedIdSet.has(selectedVersion.id) ? 'Available offline' : selectedVersion.language}
            </span>
          </div>
        </div>
        <ChevronDown
          size={24}
          color="var(--muted-dark)"
          style={{
            ...styles.chevron,
            ...(isOpen ? styles.chevronOpen : {})
          }}
        />
      </button>

      {typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    marginBottom: 0,
    position: 'relative',
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
    padding: '1rem',
    width: '100%',
    textAlign: 'left',
    minHeight: '64px',
    cursor: 'pointer',
  },
  triggerButtonOpen: {
    borderColor: 'var(--primary-blue)',
    boxShadow: '0 0 0 4px rgba(15, 95, 180, 0.12)',
  },
  triggerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minWidth: 0,
  },
  triggerTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  triggerTitle: {
    fontSize: '1.05rem',
    fontWeight: '900',
    color: '#0f172a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    lineHeight: 1.25,
  },
  triggerSub: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
  },
  chevron: {
    flexShrink: 0,
    transition: 'transform 0.18s ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  menu: {
    position: 'fixed',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    background: '#ffffff',
    border: '2px solid #cbd5e1',
    borderRadius: '16px',
    boxShadow: '0 24px 64px rgba(15, 23, 42, 0.32)',
    padding: '0.875rem',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  filterRow: {
    display: 'flex',
    gap: '0.65rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
    scrollbarWidth: 'none',
    flexShrink: 0,
  },
  filterPill: {
    background: 'white',
    border: '2px solid #cbd5e1',
    color: '#475569',
    padding: '0.55rem 1rem',
    borderRadius: '999px',
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
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  versionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    border: '2px solid #e2e8f0',
    padding: '1rem',
    borderRadius: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    minHeight: '76px',
    width: '100%',
    gap: '1rem',
  },
  versionItemActive: {
    borderColor: 'var(--primary-blue)',
    background: 'rgba(15, 95, 168, 0.05)',
  },
  versionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    minWidth: 0,
  },
  versionName: {
    fontSize: '1.05rem',
    fontWeight: '900',
    color: '#0f172a',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.7rem',
    borderRadius: '8px',
    fontSize: '0.82rem',
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
    padding: '1.5rem',
    fontSize: '1.05rem',
  },
};

export default BibleVersionSelect;
