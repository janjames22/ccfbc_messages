import React from 'react';
import { ExternalLink } from 'lucide-react';

const BibleLinkButton = ({ reference, version = 'ESV', label = 'Read in Bible' }) => {
  const getBibleSearchLink = (ref, ver) => {
    return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=${ver}`;
  };

  return (
    <a 
      href={getBibleSearchLink(reference, version)} 
      target="_blank" 
      rel="noopener noreferrer"
      style={styles.button}
    >
      <ExternalLink size={18} />
      <span>{label}</span>
    </a>
  );
};

const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--text)',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'var(--transition)',
    border: '1px solid var(--border)',
    textDecoration: 'none',
  },
};

export default BibleLinkButton;
