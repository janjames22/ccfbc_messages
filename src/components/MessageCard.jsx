import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Bookmark } from 'lucide-react';

const MessageCard = ({ message }) => {
  return (
    <div className="card" style={styles.card}>
      <div style={styles.content}>
        <div style={styles.metaRow}>
          <span style={styles.category}>{message.category}</span>
          <div style={styles.dateRow}>
            <Calendar size={18} color="var(--accent-blue)" />
            <span>{new Date(message.service_date).toLocaleDateString()}</span>
          </div>
        </div>
        
        <h3 style={styles.title}>{message.title}</h3>
        
        <div style={styles.speakerRow}>
          <User size={18} color="var(--light-blue)" />
          <span style={styles.speaker}>{message.speaker}</span>
        </div>

        <p style={styles.summary}>{message.summary}</p>
        
        <div style={styles.footer}>
          <div style={styles.verse}>
            <Bookmark size={18} color="var(--accent-blue)" />
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
  },
  content: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  category: {
    background: 'rgba(30, 136, 229, 0.2)',
    color: 'var(--light-blue)',
    padding: '0.3rem 0.8rem',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: 'var(--muted)',
    fontWeight: '600',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'white',
    lineHeight: '1.2',
    margin: '0.5rem 0',
  },
  speakerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-soft)',
    fontWeight: '700',
  },
  speaker: {
    fontSize: '1.1rem',
  },
  summary: {
    fontSize: '1.05rem',
    color: 'var(--text-soft)',
    opacity: 0.85,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.6',
    flex: 1,
  },
  footer: {
    marginTop: '1rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  verse: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '700',
    color: 'var(--light-blue)',
    fontSize: '1rem',
  },
  viewBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border)',
    color: 'white',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    minHeight: '48px',
    fontSize: '1rem',
  },
};

export default MessageCard;
