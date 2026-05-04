import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Book } from 'lucide-react';

const MessageCard = ({ message }) => {
  const { id, title, speaker, service_date, main_verse_reference, summary, category } = message;

  return (
    <Link to={`/messages/${id}`} className="card" style={styles.card}>
      <div style={styles.header}>
        {category && <span style={styles.category}>{category}</span>}
        <h3 style={styles.title}>{title}</h3>
      </div>
      
      <div style={styles.info}>
        <div style={styles.infoItem}>
          <Calendar size={16} color="var(--accent-blue)" />
          <span>{new Date(service_date).toLocaleDateString()}</span>
        </div>
        <div style={styles.infoItem}>
          <User size={16} color="var(--accent-blue)" />
          <span>{speaker}</span>
        </div>
      </div>

      <div style={styles.verse}>
        <Book size={16} color="var(--light-blue)" />
        <span>{main_verse_reference}</span>
      </div>

      <p style={styles.summary}>{summary}</p>
      
      <div style={styles.footer}>
        <span style={styles.readMore}>View Details →</span>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    textDecoration: 'none',
  },
  header: {
    marginBottom: '1rem',
  },
  category: {
    display: 'inline-block',
    background: 'rgba(30, 136, 229, 0.15)',
    color: 'var(--light-blue)',
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    lineHeight: '1.3',
  },
  info: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-soft)',
  },
  verse: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--light-blue)',
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  summary: {
    fontSize: '0.95rem',
    color: 'var(--muted)',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: '1.5rem',
    flexGrow: 1,
  },
  footer: {
    marginTop: 'auto',
  },
  readMore: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--accent-blue)',
  }
};

export default MessageCard;
