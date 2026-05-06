import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import OfflineStatusBadge from './OfflineStatusBadge';

const MessageCard = ({ message }) => {
  const navigate = useNavigate();

  const handleBibleLink = (e) => {
    e.preventDefault();
    if (message.main_verse_reference) {
      navigate(`/bible?reference=${encodeURIComponent(message.main_verse_reference)}&version=KJV`);
    }
  };

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
          {message.main_verse_reference && (
            <button onClick={handleBibleLink} className="btn-large" style={styles.bibleBtn}>
              <BookOpen size={18} /> {message.main_verse_reference}
            </button>
          )}
          <Link to={`/messages/${message.id}`} className="btn-large" style={styles.viewBtn}>
            Read Message <ArrowRight size={20} />
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
    padding: 'clamp(1rem, 5vw, 2.5rem)',
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
    marginBottom: '0.5rem',
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
    fontSize: 'clamp(1.2rem, 5vw, 1.4rem)',
    fontWeight: '900',
    color: 'var(--text-dark)',
    lineHeight: '1.2',
    margin: 0,
    letterSpacing: 0,
    overflowWrap: 'anywhere',
  },
  speakerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-dark)',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  speaker: {
    fontSize: 'var(--font-sm)',
  },
  summary: {
    fontSize: '1.05rem',
    color: 'var(--muted-dark)',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.6',
    flex: 1,
    marginTop: '0.5rem',
    fontWeight: '600',
  },
  footer: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  bibleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    fontWeight: '800',
    color: 'var(--primary-blue)',
    background: 'rgba(37, 99, 235, 0.1)',
    border: '2px solid rgba(37, 99, 235, 0.2)',
    padding: '0.85rem 1rem',
    borderRadius: '16px',
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
    transition: 'var(--transition)',
  },
  viewBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '0.85rem 1rem',
    borderRadius: '16px',
    minHeight: '54px',
    fontSize: '1rem',
    fontWeight: '900',
    boxShadow: '0 8px 20px rgba(15, 95, 168, 0.3)',
    width: '100%',
    justifyContent: 'center',
  },
};

export default MessageCard;
