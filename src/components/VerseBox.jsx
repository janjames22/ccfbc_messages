import React from 'react';
import { Quote } from 'lucide-react';

const VerseBox = ({ reference, text }) => {
  return (
    <div style={styles.container}>
      <Quote size={48} color="var(--accent-blue)" style={styles.icon} />
      <div style={styles.content}>
        <p style={styles.text}>"{text}"</p>
        <p style={styles.reference}>{reference}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderLeft: '8px solid var(--light-blue)',
    padding: 'clamp(2rem, 5vw, 3.5rem)',
    borderRadius: '0 24px 24px 0',
    margin: '3rem 0',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 40px rgba(30, 136, 229, 0.05)',
  },
  icon: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    opacity: 0.2,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  text: {
    fontSize: 'var(--font-lg)',
    fontStyle: 'italic',
    lineHeight: '1.6',
    color: 'white',
    marginBottom: '2rem',
    fontWeight: '600',
    letterSpacing: '0.01em',
  },
  reference: {
    fontSize: 'var(--font-md)',
    fontWeight: '900',
    color: 'var(--light-blue)',
    textAlign: 'right',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
};

export default VerseBox;
