import React from 'react';

const SectionTitle = ({ title, subtitle, centered = false }) => {
  return (
    <div style={{
      marginBottom: '2.5rem',
      textAlign: centered ? 'center' : 'left'
    }}>
      <h2 style={styles.title}>{title}</h2>
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      <div style={{
        width: '60px',
        height: '4px',
        background: 'var(--accent-blue)',
        borderRadius: '2px',
        margin: centered ? '1rem auto' : '1rem 0'
      }} />
    </div>
  );
};

const styles = {
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'var(--text)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'var(--muted)',
    maxWidth: '600px',
  }
};

export default SectionTitle;
