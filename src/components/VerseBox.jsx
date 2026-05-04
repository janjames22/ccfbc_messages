import React from 'react';
import { Quote } from 'lucide-react';

const VerseBox = ({ reference, text }) => {
  return (
    <div style={styles.container}>
      <Quote size={32} color="var(--accent-blue)" style={styles.icon} />
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
    borderLeft: '4px solid var(--accent-blue)',
    padding: '2rem',
    borderRadius: '0 16px 16px 0',
    margin: '2rem 0',
    position: 'relative',
    overflow: 'hidden',
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
    fontSize: '1.25rem',
    fontStyle: 'italic',
    lineHeight: '1.7',
    color: 'var(--text)',
    marginBottom: '1rem',
  },
  reference: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--light-blue)',
    textAlign: 'right',
  },
};

export default VerseBox;
