import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import VerseBox from '../components/VerseBox';
import BibleLinkButton from '../components/BibleLinkButton';
import BibleVersionSelect from '../components/BibleVersionSelect';
import DownloadOfflineButton from '../components/DownloadOfflineButton';
import { supabase } from '../lib/supabaseClient';
import { Calendar, User, ArrowLeft, BookOpen, HelpCircle, FileText, Bookmark, WifiOff, Smartphone } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';
import { useOfflineMessages } from '../hooks/useOfflineMessages';

const MessageDetail = () => {
  const isOffline = useOffline();
  const { isDownloaded } = useOfflineMessages();
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState('ESV');

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
        <div style={styles.meta}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={styles.category}>{message.category}</span>
            {isOffline && (
              <span style={styles.offlineBadge}>
                <WifiOff size={14} /> Offline Mode
              </span>
            )}
            <div style={{ width: '100%', maxWidth: '300px', margin: '1rem 0' }}>
              <DownloadOfflineButton messageId={message.id} title={message.title} />
            </div>
          </div>
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <Calendar size={20} color="var(--accent-blue)" />
              <span>{new Date(message.service_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
            </div>
            <div style={styles.metaItem}>
              <User size={20} color="var(--accent-blue)" />
              <span>{message.speaker}</span>
            </div>
          </div>
        </div>
        <h1 style={styles.title}>{message.title}</h1>
      </header>

      <div className="message-content-layout" style={styles.contentGrid}>
        <div style={styles.mainContent}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <BookOpen size={28} color="var(--accent-blue)" />
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
              <Bookmark size={28} color="var(--primary-blue)" />
              <h2>Summary</h2>
            </div>
            <div className="card-light" style={styles.summaryCard}>
              <p>{message.summary}</p>
            </div>
          </section>

          {message.key_points && message.key_points.length > 0 && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <Bookmark size={28} color="var(--primary-blue)" />
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
                <FileText size={28} color="var(--primary-blue)" />
                <h2>Full Notes</h2>
              </div>
              <div className="card-light" style={styles.notesContainer}>
                {message.full_notes.split('\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: para ? '1.5rem' : '0.75rem' }}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {message.reflection_questions && message.reflection_questions.length > 0 && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <HelpCircle size={28} color="var(--primary-blue)" />
                <h2>Reflection Questions</h2>
              </div>
              <div className="card-light" style={styles.questionsCard}>
                <ul style={styles.questionsList}>
                  {message.reflection_questions.map((q, i) => (
                    <li key={i} style={styles.questionItem}>
                      <span style={styles.bullet} />
                      <p>{q}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div style={{ marginTop: '2rem', marginBottom: '4rem' }}>
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
  loading: { textAlign: 'center', padding: '5rem', color: 'var(--muted)', fontSize: '1.5rem' },
  error: { textAlign: 'center', padding: '5rem', color: 'var(--accent-blue)', fontSize: '1.5rem' },
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
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--muted)',
    fontWeight: '800',
    fontSize: '1.1rem',
  },
  versionPicker: {
    flexShrink: 0,
    width: '100%',
    maxWidth: '300px',
  },
  header: { marginBottom: '4rem' },
  meta: { marginBottom: '1.5rem' },
  category: {
    background: 'rgba(30, 136, 229, 0.2)',
    color: 'var(--primary-blue)',
    padding: '0.5rem 1.25rem',
    borderRadius: '100px',
    fontSize: '0.9rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'inline-block',
  },
  offlineBadge: {
    background: 'rgba(5, 7, 13, 0.05)',
    color: 'var(--muted-dark)',
    padding: '0.4rem 1rem',
    borderRadius: '100px',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid var(--border-light)',
  },
  metaRow: { display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1.5rem' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '600' },
  title: { fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '900', lineHeight: '1.1', color: 'var(--text-dark)' },
  contentGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr', 
    gap: '3rem',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  section: { marginBottom: '5rem' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' },
  summaryCard: { padding: '2.5rem', fontSize: '1.2rem', color: 'var(--text-dark)', lineHeight: '1.7' },
  pointsList: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  pointItem: { display: 'flex', gap: '1.5rem', padding: '2rem', alignItems: 'flex-start' },
  pointNumber: {
    background: 'var(--primary-blue)',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '1.2rem',
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(15, 95, 168, 0.3)',
  },
  pointText: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.5', color: 'var(--text-dark)' },
  notesContainer: { padding: 'clamp(1.5rem, 5vw, 3rem)', fontSize: '1.2rem', color: 'var(--text-dark)', lineHeight: '1.8' },
  questionsCard: { padding: '2.5rem' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  questionItem: { display: 'flex', gap: '1.25rem', alignItems: 'flex-start', color: 'var(--text-dark)' },
  bullet: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-blue)', marginTop: '0.75rem', flexShrink: 0 },
  sidebar: {},
  sidebarCard: { padding: '2rem' },
  sidebarTitle: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--primary-blue)', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.75rem' },
  relatedList: { display: 'flex', flexDirection: 'column', gap: '3rem' },
  relatedItem: { paddingBottom: '2rem', borderBottom: '1px solid var(--border-light)' },
  relatedRef: { fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-dark)' },
  relatedText: { fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--muted-dark)', marginBottom: '1.25rem', lineHeight: '1.6' },
  relatedNote: { fontSize: '1rem', color: 'var(--primary-blue)', marginBottom: '1.5rem', background: 'rgba(142, 203, 255, 0.1)', padding: '1rem', borderRadius: '8px' },
  actionRow: { marginTop: '1rem' },
};

export default MessageDetail;
