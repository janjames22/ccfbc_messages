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
  },
  content: {
    padding: 'clamp(1.25rem, 4vw, 2rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flex: 1,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  category: {
    background: 'var(--border-light)',
    color: 'var(--primary-blue)',
    padding: '0.3rem 0.6rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--muted-dark)',
    fontWeight: '600',
  },
  title: {
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    fontWeight: '800',
    color: 'var(--text-dark)',
    lineHeight: '1.2',
    margin: '0.25rem 0',
  },
  speakerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-dark)',
    fontWeight: '700',
  },
  speaker: {
    fontSize: '1rem',
  },
  summary: {
    fontSize: '1rem',
    color: 'var(--muted-dark)',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.5',
    flex: 1,
    marginTop: '0.25rem',
  },
  footer: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  verse: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '700',
    color: 'var(--primary-blue)',
    fontSize: '0.9rem',
  },
  viewBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    minHeight: '44px',
    fontSize: '0.9rem',
    boxShadow: 'var(--shadow-sm)',
  },
};

export default MessageCard;
