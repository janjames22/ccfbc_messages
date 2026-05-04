import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';

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
        <Globe size={20} color="var(--accent-blue)" style={styles.icon} />
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
        <ChevronDown size={20} color="var(--muted)" style={styles.chevron} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: '100%',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: 'var(--light-blue)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingLeft: '0.25rem',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(5, 7, 13, 0.6)',
    border: '2px solid var(--border)',
    borderRadius: '16px',
    padding: '0 1rem',
    height: '56px',
    transition: 'var(--transition)',
  },
  icon: {
    marginRight: '0.75rem',
    flexShrink: 0,
  },
  chevron: {
    marginLeft: 'auto',
    pointerEvents: 'none',
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '700',
    width: '100%',
    height: '100%',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    paddingRight: '2rem',
  },
  option: {
    background: 'var(--bg-navy)',
    color: 'white',
    fontSize: '1rem',
  }
};

export default BibleVersionSelect;
