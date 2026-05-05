import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Bookmark } from 'lucide-react';
import OfflineStatusBadge from './OfflineStatusBadge';

const MessageCard = ({ message }) => {
  return (
    <div className="card-light" style={styles.card}>
      <div style={styles.content}>
        <div style={styles.metaRow}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={styles.category}>{message.category}</span>
            <OfflineStatusBadge messageId={message.id} showLabel={false} />
          </div>
          <div style={styles.dateRow}>
            <Calendar size={16} color="var(--primary-blue)" />
            <span>{new Date(message.service_date).toLocaleDateString()}</span>
          </div>
        </div>
        
        <h3 style={styles.title}>{message.title}</h3>
        
        <div style={styles.speakerRow}>
          <User size={18} color="var(--primary-blue)" />
          <span style={styles.speaker}>{message.speaker}</span>
        </div>

        <p style={styles.summary}>{message.summary}</p>
        
        <div style={styles.footer}>
          <div style={styles.verse}>
            <Bookmark size={18} color="var(--primary-blue)" />
            <span>{message.main_verse_reference}</span>
          </div>
          <Link to={`/messages/${message.id}`} className="btn-large" style={styles.viewBtn}>
            View <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxShadow: 'var(--shadow-md)',
  },
  content: {
    padding: 'clamp(2rem, 6vw, 3rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    flex: 1,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
  },
  category: {
    background: 'rgba(15, 95, 168, 0.12)',
    color: 'var(--primary-blue)',
    padding: '0.5rem 1.25rem',
    borderRadius: '100px',
    fontSize: 'var(--font-xs)',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: 'var(--font-xs)',
    color: 'var(--muted-dark)',
    fontWeight: '800',
  },
  title: {
    fontSize: 'var(--font-md)',
    fontWeight: '900',
    color: 'var(--text-dark)',
    lineHeight: '1.2',
    margin: '0.5rem 0',
    letterSpacing: '-0.02em',
  },
  speakerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-dark)',
    fontWeight: '800',
    marginBottom: '0.75rem',
  },
  speaker: {
    fontSize: 'var(--font-sm)',
  },
  summary: {
    fontSize: 'var(--font-sm)',
    color: 'var(--muted-dark)',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.7',
    flex: 1,
    marginTop: '0.5rem',
    fontWeight: '600',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '2px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.25rem',
    flexWrap: 'wrap',
  },
  verse: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '900',
    color: 'var(--primary-blue)',
    fontSize: 'var(--font-sm)',
  },
  viewBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '0.8rem 1.75rem',
    borderRadius: '20px',
    minHeight: '60px',
    fontSize: 'var(--font-sm)',
    fontWeight: '900',
    boxShadow: '0 8px 20px rgba(15, 95, 168, 0.3)',
  },
};

export default MessageCard;
