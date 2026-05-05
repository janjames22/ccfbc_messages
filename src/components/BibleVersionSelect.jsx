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
    gap: '0.75rem',
    width: '100%',
  },
  label: {
    fontSize: 'var(--font-xs)',
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    paddingLeft: '0.5rem',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '2px solid var(--border-light)',
    borderRadius: '20px',
    padding: '0 1.25rem',
    height: '64px',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-sm)',
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
    color: 'var(--text-dark)',
    fontSize: 'var(--font-sm)',
    fontWeight: '800',
    width: '100%',
    height: '100%',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    paddingRight: '2rem',
  },
  option: {
    background: 'white',
    color: 'var(--text-dark)',
    fontSize: 'var(--font-sm)',
    fontWeight: '700',
  }
};

export default BibleVersionSelect;
