import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

const LatestMessageCard = ({ message }) => {
  return (
    <div className="card" style={styles.card}>
      <div style={styles.grid}>
        <div style={styles.content}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>Featured Message</span>
            <span style={styles.categoryBadge}>{message.category}</span>
          </div>
          
          <h2 style={styles.title}>{message.title}</h2>
          
          <div style={styles.meta}>
            <div style={styles.metaItem}>
              <User size={20} color="var(--accent-blue)" />
              <span>{message.speaker}</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={20} color="var(--accent-blue)" />
              <span>{new Date(message.service_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
          </div>

          <p style={styles.summary}>{message.summary}</p>
          
          <div style={styles.footer}>
            <div style={styles.verseBox}>
              <BookOpen size={24} color="var(--light-blue)" />
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
    background: 'linear-gradient(145deg, rgba(11, 31, 54, 0.9) 0%, rgba(7, 21, 39, 0.95) 100%)',
    border: '1px solid rgba(142, 203, 255, 0.25)',
    width: '100%',
  },
  grid: {
    padding: 'clamp(1.25rem, 5vw, 3rem)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(1rem, 4vw, 2rem)',
  },
  badgeRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  badge: {
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  categoryBadge: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--light-blue)',
    padding: '0.4rem 0.8rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
    fontWeight: '900',
    lineHeight: '1.2',
    margin: 0,
  },
  meta: {
    display: 'flex',
    gap: 'clamp(1rem, 5vw, 2rem)',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-soft)',
  },
  summary: {
    fontSize: 'clamp(1rem, 3.5vw, 1.15rem)',
    lineHeight: '1.7',
    color: 'var(--text-soft)',
    maxWidth: '800px',
    opacity: 0.9,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  verseBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  verseLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  verseRef: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--light-blue)',
  },
  ctaBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    boxShadow: '0 8px 24px rgba(15, 95, 168, 0.3)',
    flex: '1',
    minWidth: 'min(100%, 250px)',
    maxWidth: '100%',
  },
};

export default LatestMessageCard;
