import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

const LatestMessageCard = ({ message }) => {
  return (
    <div className="card-light" style={styles.card}>
      <div style={styles.grid}>
        <div style={styles.content}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>Featured Message</span>
            <span style={styles.categoryBadge}>{message.category}</span>
          </div>
          
          <h2 style={styles.title}>{message.title}</h2>
          
          <div style={styles.meta}>
            <div style={styles.metaItem}>
              <User size={20} color="var(--primary-blue)" />
              <span>{message.speaker}</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={20} color="var(--primary-blue)" />
              <span>{new Date(message.service_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
          </div>

          <p style={styles.summary}>{message.summary}</p>
          
          <div style={styles.footer}>
            <div style={styles.verseBox}>
              <BookOpen size={24} color="var(--primary-blue)" />
              <div>
                <div style={styles.verseLabel}>Main Passage</div>
                <div style={styles.verseRef}>{message.main_verse_reference}</div>
              </div>
            </div>
            <Link to={`/messages/${message.id}`} className="btn-large" style={styles.ctaBtn}>
              Read Full Notes <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: '100%',
    boxShadow: 'var(--shadow-lg)',
  },
  grid: {
    padding: 'clamp(1rem, 6vw, 5rem)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(2rem, 6vw, 3rem)',
  },
  badgeRow: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
  },
  badge: {
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '0.6rem 1.5rem',
    borderRadius: '100px',
    fontSize: 'var(--font-xs)',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    boxShadow: '0 8px 20px rgba(15, 95, 168, 0.35)',
  },
  categoryBadge: {
    background: '#f8fafc',
    color: 'var(--primary-blue)',
    padding: '0.6rem 1.5rem',
    borderRadius: '100px',
    fontSize: 'var(--font-xs)',
    fontWeight: '900',
    textTransform: 'uppercase',
    border: '2px solid var(--border-light)',
    letterSpacing: '1px',
  },
  title: {
    fontSize: 'clamp(1.75rem, 8vw, var(--font-xxl))',
    fontWeight: '900',
    lineHeight: '1.1',
    margin: 0,
    color: 'var(--text-dark)',
    letterSpacing: 0,
    overflowWrap: 'anywhere',
  },
  meta: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: 'var(--font-sm)',
    fontWeight: '800',
    color: 'var(--text-dark)',
    minWidth: 0,
  },
  summary: {
    fontSize: 'var(--font-base)',
    lineHeight: '1.8',
    color: 'var(--text-dark)',
    maxWidth: '900px',
    fontWeight: '600',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.25rem',
    flexWrap: 'wrap',
    marginTop: '1.5rem',
    paddingTop: '2rem',
    borderTop: '3px solid var(--border-light)',
  },
  verseBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  verseLabel: {
    fontSize: 'var(--font-xs)',
    textTransform: 'uppercase',
    color: 'var(--muted-dark)',
    fontWeight: '900',
    letterSpacing: '1.5px',
    marginBottom: '0.5rem',
  },
  verseRef: {
    fontSize: 'var(--font-md)',
    fontWeight: '900',
    color: 'var(--primary-blue)',
    letterSpacing: '-0.01em',
  },
  ctaBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    boxShadow: '0 12px 32px rgba(15, 95, 168, 0.4)',
    flex: '1',
    minWidth: 'min(100%, 350px)',
    maxWidth: '100%',
    minHeight: '80px',
    fontSize: 'var(--font-md)',
    fontWeight: '900',
  },
};

export default LatestMessageCard;
