import { useNavigate } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getExternalBibleUrl, getInternalBibleUrl } from '../services/bibleService';

const BibleLinkButton = ({ reference, version = 'KJV', label = 'Read in Bible', style }) => {
  const navigate = useNavigate();
  const internalUrl = getInternalBibleUrl(reference, version);
  const externalUrl = getExternalBibleUrl(reference, version);

  const handleClick = (event) => {
    if (internalUrl) {
      event.preventDefault();
      navigate(internalUrl);
    }
  };

  return (
    <a
      href={internalUrl || externalUrl}
      target={internalUrl ? undefined : '_blank'}
      rel={internalUrl ? undefined : 'noopener noreferrer'}
      onClick={handleClick}
      style={{ ...styles.button, ...style }}
      title={internalUrl ? 'Open in the CCFBC Bible reader' : 'Open external Bible link'}
    >
      {internalUrl ? <BookOpen size={18} /> : <ExternalLink size={18} />}
      <span>{label}</span>
    </a>
  );
};

const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--text)',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '800',
    transition: 'var(--transition)',
    border: '1px solid var(--border)',
    textDecoration: 'none',
    minHeight: '48px',
    width: '100%',
  },
};

export default BibleLinkButton;
