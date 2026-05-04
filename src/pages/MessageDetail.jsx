import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import VerseBox from '../components/VerseBox';
import BibleLinkButton from '../components/BibleLinkButton';
import BibleVersionSelect from '../components/BibleVersionSelect';
import { supabase } from '../lib/supabaseClient';
import { Calendar, User, ArrowLeft, BookOpen, HelpCircle, FileText, Bookmark } from 'lucide-react';

const MessageDetail = () => {
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
  if (!message) return <PageContainer><div style={styles.error}>Message not found.</div></PageContainer>;

  return (
    <PageContainer>
      <div style={styles.topBar}>
        <Link to="/messages" style={styles.backLink}>
          <ArrowLeft size={18} /> Back to Archive
        </Link>
        <BibleVersionSelect 
          value={selectedVersion} 
          onChange={setSelectedVersion}
          label="Reading Version"
        />
      </div>

      <div style={styles.header}>
        <div style={styles.meta}>
          <span style={styles.category}>{message.category}</span>
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <Calendar size={18} color="var(--accent-blue)" />
              <span>{new Date(message.service_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
            </div>
            <div style={styles.metaItem}>
              <User size={18} color="var(--accent-blue)" />
              <span>{message.speaker}</span>
            </div>
          </div>
        </div>
        <h1 style={styles.title}>{message.title}</h1>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.mainContent}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <BookOpen size={24} color="var(--accent-blue)" />
              <h2>Main Bible Verse</h2>
            </div>
            <VerseBox 
              reference={message.main_verse_reference} 
              text={message.main_verse_text} 
            />
            <BibleLinkButton 
              reference={message.main_verse_reference} 
              version={selectedVersion}
            />
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <Bookmark size={24} color="var(--accent-blue)" />
              <h2>Summary</h2>
            </div>
            <div className="card" style={styles.summaryCard}>
              <p>{message.summary}</p>
            </div>
          </section>

          {message.key_points && message.key_points.length > 0 && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <Bookmark size={24} color="var(--accent-blue)" />
                <h2>Key Points</h2>
              </div>
              <ul style={styles.pointsList}>
                {message.key_points.map((point, index) => (
                  <li key={index} className="card" style={styles.pointItem}>
                    <span style={styles.pointNumber}>{index + 1}</span>
                    <p>{point}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {message.full_notes && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <FileText size={24} color="var(--accent-blue)" />
                <h2>Full Notes</h2>
              </div>
              <div className="card" style={styles.notesContainer}>
                {message.full_notes.split('\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: para ? '1rem' : '0.5rem' }}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {message.reflection_questions && message.reflection_questions.length > 0 && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <HelpCircle size={24} color="var(--accent-blue)" />
                <h2>Reflection Questions</h2>
              </div>
              <div className="card" style={styles.questionsCard}>
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
        </div>

        <aside style={styles.sidebar}>
          {message.related_verses && message.related_verses.length > 0 && (
            <div className="card" style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Related Verses</h3>
              <div style={styles.relatedList}>
                {message.related_verses.map((v, i) => (
                  <div key={i} style={styles.relatedItem}>
                    <p style={styles.relatedRef}>{v.reference}</p>
                    <p style={styles.relatedText}>"{v.text}"</p>
                    {v.note && <p style={styles.relatedNote}>{v.note}</p>}
                    <BibleLinkButton 
                      reference={v.reference} 
                      version={selectedVersion}
                      label="Read Verse" 
                    />
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
  loading: { textAlign: 'center', padding: '5rem', color: 'var(--muted)' },
  error: { textAlign: 'center', padding: '5rem', color: 'var(--accent-blue)' },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--muted)',
    fontWeight: '600',
    paddingTop: '0.5rem',
  },
  header: { marginBottom: '3rem' },
  meta: { marginBottom: '1.5rem' },
  category: {
    background: 'rgba(30, 136, 229, 0.2)',
    color: 'var(--light-blue)',
    padding: '0.4rem 1rem',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'inline-block',
    marginBottom: '1rem',
  },
  metaRow: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'var(--text-soft)' },
  title: { fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' },
  section: { marginBottom: '4rem' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  summaryCard: { padding: '2rem', fontSize: '1.1rem', color: 'var(--text-soft)' },
  pointsList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  pointItem: { display: 'flex', gap: '1.5rem', padding: '1.5rem', alignItems: 'flex-start' },
  pointNumber: {
    background: 'var(--primary-blue)',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    flexShrink: 0,
  },
  notesContainer: { padding: '2.5rem', fontSize: '1.05rem', color: 'var(--text-soft)', whiteSpace: 'pre-wrap' },
  questionsCard: { padding: '2rem', background: 'rgba(11, 31, 54, 0.4)' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  questionItem: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  bullet: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', marginTop: '0.6rem', flexShrink: 0 },
  sidebar: {},
  sidebarCard: { padding: '1.5rem' },
  sidebarTitle: { marginBottom: '1.5rem', color: 'var(--light-blue)' },
  relatedList: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  relatedItem: { borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' },
  relatedRef: { fontWeight: '700', marginBottom: '0.5rem' },
  relatedText: { fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--muted)', marginBottom: '0.75rem' },
  relatedNote: { fontSize: '0.85rem', color: 'var(--light-blue)', marginBottom: '1rem' },
};

export default MessageDetail;
