import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import VerseBox from '../components/VerseBox';
import BibleLinkButton from '../components/BibleLinkButton';
import BibleVersionSelect from '../components/BibleVersionSelect';
import DownloadOfflineButton from '../components/DownloadOfflineButton';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, User, ArrowLeft, BookOpen, HelpCircle, FileText, Bookmark, WifiOff, Smartphone, Edit, Trash2 } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';
import { useOfflineMessages } from '../hooks/useOfflineMessages';

const MessageDetail = () => {
  const isOffline = useOffline();
  const { isDownloaded } = useOfflineMessages();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState('ESV');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setMessage(data);
        if (data.bible_version) {
          setSelectedVersion(data.bible_version);
        }
      } catch (error) {
        console.error('Error fetching message:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Message deleted successfully.');
      navigate('/messages');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageContainer><div style={styles.loading}>Loading message details...</div></PageContainer>;
  
  if (!message) {
    if (isOffline && !isDownloaded(id)) {
      return (
        <PageContainer>
          <div style={styles.topBar}>
            <Link to="/messages" style={styles.backLink}>
              <ArrowLeft size={24} /> <span>Back to Archive</span>
            </Link>
          </div>
          <div style={styles.offlineErrorContainer}>
            <Smartphone size={80} color="var(--primary-blue)" style={{ opacity: 0.5, marginBottom: '2rem' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Message Not Downloaded</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--muted-dark)', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
              This message is not downloaded yet. Please connect to the internet to view it.
            </p>
            <Link to="/messages" className="btn-large" style={{ background: 'var(--primary-blue)', color: 'white' }}>
              View Saved Messages
            </Link>
          </div>
        </PageContainer>
      );
    }
    return <PageContainer><div style={styles.error}>Message not found.</div></PageContainer>;
  }

  return (
    <PageContainer>
      <div style={styles.topBar}>
        <Link to="/messages" style={styles.backLink}>
          <ArrowLeft size={24} /> <span>Back to Archive</span>
        </Link>
        <div style={styles.versionPicker}>
          <BibleVersionSelect 
            value={selectedVersion} 
            onChange={setSelectedVersion}
            label="Reading Version"
          />
        </div>
      </div>

      <header style={styles.header}>
        <div className="card-light" style={styles.headerCard}>
          <div style={styles.meta}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span style={styles.category}>{message.category}</span>
              {isOffline && (
                <span style={styles.offlineBadge}>
                  <WifiOff size={16} /> Available Offline
                </span>
              )}
            </div>
            
            <h1 style={styles.title}>{message.title}</h1>

            <div style={styles.metaRow}>
              <div style={styles.metaItem}>
                <Calendar size={24} color="var(--primary-blue)" />
                <span>{new Date(message.service_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
              </div>
              <div style={styles.metaItem}>
                <User size={24} color="var(--primary-blue)" />
                <span>{message.speaker}</span>
              </div>
            </div>

            <div style={styles.actionContainer}>
              <div style={{ flex: '1 1 300px' }}>
                <DownloadOfflineButton messageId={message.id} title={message.title} />
              </div>
              
              {user && !isOffline && (
                <div style={styles.adminActions}>
                  <Link to={`/messages/edit/${id}`} className="btn-large" style={styles.editBtn}>
                    <Edit size={24} /> <span>Edit</span>
                  </Link>
                  <button 
                    onClick={handleDelete} 
                    disabled={deleting}
                    className="btn-large" 
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={24} /> <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="message-content-layout" style={styles.contentGrid}>
        <div style={styles.mainContent}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <BookOpen size={32} color="var(--accent-blue)" />
              <h2>Main Bible Verse</h2>
            </div>
            <VerseBox 
              reference={message.main_verse_reference} 
              text={message.main_verse_text} 
            />
            <div style={styles.actionRow}>
              <BibleLinkButton 
                reference={message.main_verse_reference} 
                version={selectedVersion}
                className="btn-full"
              />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <Bookmark size={32} color="var(--primary-blue)" />
              <h2>Summary</h2>
            </div>
            <div className="card-light" style={styles.summaryCard}>
              <p style={styles.paragraphText}>{message.summary}</p>
            </div>
          </section>

          {message.key_points && message.key_points.length > 0 && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <Bookmark size={32} color="var(--primary-blue)" />
                <h2>Key Points</h2>
              </div>
              <ul style={styles.pointsList}>
                {message.key_points.map((point, index) => (
                  <li key={index} className="card-light" style={styles.pointItem}>
                    <span style={styles.pointNumber}>{index + 1}</span>
                    <p style={styles.pointText}>{point}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {message.full_notes && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <FileText size={32} color="var(--primary-blue)" />
                <h2>Full Notes</h2>
              </div>
              <div className="card-light" style={styles.notesContainer}>
                {message.full_notes.split('\n').map((para, i) => (
                  <p key={i} style={styles.noteParagraph}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {message.reflection_questions && message.reflection_questions.length > 0 && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <HelpCircle size={32} color="var(--primary-blue)" />
                <h2>Reflection Questions</h2>
              </div>
              <div className="card-light" style={styles.questionsCard}>
                <ul style={styles.questionsList}>
                  {message.reflection_questions.map((q, i) => (
                    <li key={i} style={styles.questionItem}>
                      <span style={styles.bullet} />
                      <p style={styles.questionText}>{q}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div style={{ marginTop: '2rem', marginBottom: '6rem' }}>
            <DownloadOfflineButton messageId={message.id} title={message.title} />
          </div>
        </div>

        <aside className="message-sidebar" style={styles.sidebar}>
          {message.related_verses && message.related_verses.length > 0 && (
            <div className="card-light" style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Related Verses</h3>
              <div style={styles.relatedList}>
                {message.related_verses.map((v, i) => (
                  <div key={i} style={styles.relatedItem}>
                    <p style={styles.relatedRef}>{v.reference}</p>
                    <p style={styles.relatedText}>"{v.text}"</p>
                    {v.note && <p style={styles.relatedNote}>{v.note}</p>}
                    <div style={styles.actionRow}>
                      <BibleLinkButton 
                        reference={v.reference} 
                        version={selectedVersion}
                        label="Read Verse" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  );
};

const styles = {
  loading: { textAlign: 'center', padding: '5rem', color: 'var(--muted)', fontSize: 'var(--font-md)' },
  error: { textAlign: 'center', padding: '5rem', color: 'var(--accent-blue)', fontSize: 'var(--font-md)' },
  offlineErrorContainer: {
    textAlign: 'center',
    padding: '5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-soft)',
    fontWeight: '800',
    fontSize: 'var(--font-sm)',
  },
  versionPicker: {
    flexShrink: 0,
    width: '100%',
    maxWidth: '300px',
  },
  header: { marginBottom: '4rem' },
  headerCard: {
    padding: 'clamp(1.5rem, 6vw, 4rem)',
  },
  meta: { marginBottom: 0 },
  category: {
    background: 'rgba(15, 95, 168, 0.12)',
    color: 'var(--primary-blue)',
    padding: '0.75rem 1.75rem',
    borderRadius: '100px',
    fontSize: 'var(--font-xs)',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    display: 'inline-block',
  },
  offlineBadge: {
    background: '#f1f5f9',
    color: '#475569',
    padding: '0.5rem 1.25rem',
    borderRadius: '100px',
    fontSize: 'var(--font-xs)',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid var(--border-light)',
  },
  metaRow: { display: 'flex', gap: '2.5rem', flexWrap: 'wrap', marginTop: '2rem' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--font-sm)', color: 'var(--text-dark)', fontWeight: '700' },
  title: { fontSize: 'clamp(2rem, 8vw, var(--font-xxl))', fontWeight: '900', lineHeight: '1.1', color: 'var(--text-dark)', margin: '0.5rem 0' },
  contentGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
    gap: '4rem',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  section: { marginBottom: '5rem' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' },
  summaryCard: { padding: 'clamp(1.5rem, 5vw, 3rem)' },
  paragraphText: { fontSize: 'var(--font-base)', color: 'var(--text-dark)', lineHeight: '1.8', fontWeight: '500' },
  pointsList: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  pointItem: { display: 'flex', gap: '1.5rem', padding: 'clamp(1.5rem, 4vw, 2.5rem)', alignItems: 'flex-start' },
  pointNumber: {
    background: 'var(--primary-blue)',
    color: 'white',
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: 'var(--font-md)',
    flexShrink: 0,
    boxShadow: '0 8px 16px rgba(15, 95, 168, 0.25)',
  },
  pointText: { fontSize: 'var(--font-base)', fontWeight: '600', lineHeight: '1.6', color: 'var(--text-dark)' },
  notesContainer: { padding: 'clamp(1.5rem, 6vw, 4rem)' },
  noteParagraph: { fontSize: 'var(--font-base)', color: 'var(--text-dark)', lineHeight: '1.9', marginBottom: '2.5rem', fontWeight: '600' },
  questionsCard: { padding: 'clamp(2rem, 6vw, 4rem)' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '3rem' },
  questionItem: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  questionText: { fontSize: 'var(--font-base)', color: 'var(--text-dark)', lineHeight: '1.7', fontWeight: '700' },
  bullet: { width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-blue)', marginTop: '0.75rem', flexShrink: 0, boxShadow: '0 0 10px rgba(15, 95, 168, 0.3)' },
  sidebar: {},
  sidebarCard: { padding: 'clamp(1.5rem, 4vw, 2.5rem)' },
  sidebarTitle: { fontSize: 'var(--font-md)', fontWeight: '900', marginBottom: '2rem', color: 'var(--primary-blue)', borderBottom: '3px solid var(--border-light)', paddingBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  relatedList: { display: 'flex', flexDirection: 'column', gap: '3rem' },
  relatedItem: { paddingBottom: '2rem', borderBottom: '1px solid var(--border-light)' },
  relatedRef: { fontWeight: '900', fontSize: 'var(--font-sm)', marginBottom: '1rem', color: 'var(--text-dark)' },
  relatedText: { fontSize: 'var(--font-sm)', fontStyle: 'italic', color: 'var(--muted-dark)', marginBottom: '1.5rem', lineHeight: '1.6', fontWeight: '500' },
  relatedNote: { fontSize: 'var(--font-xs)', color: 'var(--primary-blue)', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', fontWeight: '700', border: '1px solid var(--border-light)' },
  actionRow: { marginTop: '1.5rem' },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '2.5rem',
    flexWrap: 'wrap',
  },
  adminActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  editBtn: {
    background: '#f8fafc',
    color: 'var(--text-dark)',
    border: '2px solid var(--border-light)',
    padding: '0.75rem 1.5rem',
    minHeight: '60px',
  },
  deleteBtn: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '2px solid #fee2e2',
    padding: '0.75rem 1.5rem',
    minHeight: '60px',
  }
};

export default MessageDetail;
