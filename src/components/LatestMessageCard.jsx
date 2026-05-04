import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, BookOpen, ChevronRight } from 'lucide-react';

const LatestMessageCard = ({ message }) => {
  if (!message) return null;

  const { id, title, speaker, service_date, main_verse_reference, summary } = message;

  return (
    <div className="card" style={styles.featuredCard}>
      <div style={styles.badge}>Latest Message</div>
      <div style={styles.content}>
        <div style={styles.mainInfo}>
          <h2 style={styles.title}>{title}</h2>
          <div style={styles.meta}>
            <div style={styles.metaItem}>
              <Calendar size={18} color="var(--accent-blue)" />
              <span>{new Date(service_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div style={styles.metaItem}>
              <User size={18} color="var(--accent-blue)" />
              <span>{speaker}</span>
            </div>
          </div>
          <div style={styles.verse}>
            <BookOpen size={18} color="var(--light-blue)" />
            <span>{main_verse_reference}</span>
          </div>
          <p style={styles.summary}>{summary}</p>
        </div>
        
        <div style={styles.actions}>
          <Link to={`/messages/${id}`} style={styles.primaryBtn}>
            Read Full Notes <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  featuredCard: {
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(142, 203, 255, 0.3)',
    background: 'linear-gradient(145deg, rgba(11, 31, 54, 0.95) 0%, rgba(7, 21, 39, 0.95) 100%)',
  },
  badge: {
    position: 'absolute',
    top: '2rem',
    right: '-2rem',
    background: 'var(--accent-blue)',
    color: 'white',
    padding: '0.5rem 3rem',
    transform: 'rotate(45deg)',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '1.5rem',
    lineHeight: '1.1',
  },
  meta: {
    display: 'flex',
    gap: '2.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.1rem',
    color: 'var(--text-soft)',
  },
  verse: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--light-blue)',
    marginBottom: '2rem',
    padding: '1rem',
    background: 'rgba(142, 203, 255, 0.05)',
    borderRadius: '12px',
    width: 'fit-content',
  },
  summary: {
    fontSize: '1.2rem',
    color: 'var(--muted)',
    lineHeight: '1.6',
    maxWidth: '800px',
  },
  actions: {
    marginTop: '1rem',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'var(--transition)',
    boxShadow: '0 8px 24px rgba(15, 95, 168, 0.4)',
  },
};

export default LatestMessageCard;
