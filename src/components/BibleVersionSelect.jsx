import React from 'react';
import { Globe } from 'lucide-react';

export const BIBLE_VERSIONS = [
  { label: "English — ESV", value: "ESV" },
  { label: "English — NIV", value: "NIV" },
  { label: "English — KJV", value: "KJV" },
  { label: "Tagalog — MBBTAG", value: "MBBTAG" },
  { label: "Tagalog — RTPV05", value: "RTPV05" },
  { label: "Cebuano — APSD-CEB", value: "APSD-CEB" },
  { label: "Ilocano — NPV", value: "NPV" }
];

const BibleVersionSelect = ({ value, onChange, label = "Bible Version" }) => {
  return (
    <div style={styles.container}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.selectWrapper}>
        <Globe size={18} color="var(--muted)" style={styles.icon} />
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          style={styles.select}
        >
          {BIBLE_VERSIONS.map(version => (
            <option key={version.value} value={version.value} style={styles.option}>
              {version.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '200px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--light-blue)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(11, 31, 54, 0.6)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '0 1rem',
    height: '48px',
    transition: 'var(--transition)',
  },
  icon: {
    marginRight: '0.75rem',
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    width: '100%',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
  },
  option: {
    background: 'var(--bg-navy)',
    color: 'white',
  }
};

export default BibleVersionSelect;
