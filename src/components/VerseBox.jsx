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
    background: 'rgba(30, 136, 229, 0.08)',
    borderLeft: '6px solid var(--accent-blue)',
    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
    borderRadius: '0 24px 24px 0',
    margin: '2rem 0',
    position: 'relative',
    overflow: 'hidden',
  },
  icon: {
    position: 'absolute',
    top: '0.5rem',
    left: '0.5rem',
    opacity: 0.15,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  text: {
    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
    fontStyle: 'italic',
    lineHeight: '1.7',
    color: 'var(--text)',
    marginBottom: '1.5rem',
    fontWeight: '500',
  },
  reference: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--light-blue)',
    textAlign: 'right',
  },
};

export default VerseBox;
