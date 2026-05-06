import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import LogoHeader from '../components/LogoHeader';
import LatestMessageCard from '../components/LatestMessageCard';
import { supabase } from '../lib/supabaseClient';
import { Library, BookOpen, PlusCircle, ArrowRight, Heart } from 'lucide-react';
import { getPassage } from '../services/bibleService';

const Home = () => {
  const navigate = useNavigate();
  const [latestMessage, setLatestMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verse of the Day state
  const [verseOfDay, setVerseOfDay] = useState(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('service_date', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setLatestMessage(data[0]);
        }
      } catch (error) {
        console.error('Error fetching latest message:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  useEffect(() => {
    // Fetch a fixed "Verse of the Day" using KJV
    // In a real app, this could rotate daily based on date.
    const fetchVOTD = async () => {
      try {
        const data = await getPassage('Psalm 118:24', 'KJV');
        setVerseOfDay(data);
      } catch (error) {
        console.error('Error fetching VOTD:', error);
      } finally {
        setVerseLoading(false);
      }
    };
    
    fetchVOTD();
  }, []);

  return (
    <PageContainer>
      <div style={styles.hero}>
        <LogoHeader size="large" className="logo-glow" />
        <h1 style={styles.title}>Welcome to CCFBC</h1>
        <p style={styles.subtitle}>May the grace of the Lord Jesus Christ, and the love of God, and the fellowship of the Holy Spirit be with you.</p>
        
        {/* Quick Access Cards */}
        <div style={styles.quickLinksGrid}>
          <button onClick={() => navigate('/messages')} className="card-light" style={styles.quickLinkCard}>
            <div style={{ ...styles.iconCircle, background: 'rgba(37, 99, 235, 0.1)' }}>
              <Library size={32} color="var(--accent-blue)" />
            </div>
            <h3 style={styles.quickLinkTitle}>Messages</h3>
            <p style={styles.quickLinkDesc}>Browse our archive of Sunday messages.</p>
          </button>

          <button onClick={() => navigate('/bible')} className="card-light" style={styles.quickLinkCard}>
            <div style={{ ...styles.iconCircle, background: 'rgba(212, 160, 23, 0.1)' }}>
              <BookOpen size={32} color="var(--gold)" />
            </div>
            <h3 style={styles.quickLinkTitle}>Bible</h3>
            <p style={styles.quickLinkDesc}>Read the Bible online and offline.</p>
          </button>
        </div>
      </div>

      {/* Verse of the Day */}
      <div style={styles.section}>
        <div className="card-light" style={styles.votdCard}>
          <div style={styles.votdHeader}>
            <Heart size={24} color="#ef4444" />
            <h3 style={styles.votdTitle}>Verse of the Day</h3>
          </div>
          {verseLoading ? (
            <p style={styles.votdLoading}>Loading verse...</p>
          ) : verseOfDay ? (
            <div style={styles.votdContent}>
              <p style={styles.votdText}>"{verseOfDay.text}"</p>
              <p style={styles.votdRef}>— {verseOfDay.reference}</p>
            </div>
          ) : (
            <p style={styles.votdLoading}>Unable to load Verse of the Day.</p>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Latest Message</h2>
          <Link to="/messages" style={styles.viewAll}>
            View All <ArrowRight size={20} />
          </Link>
        </div>
        
        {loading ? (
          <div style={styles.loading}>Loading latest message...</div>
        ) : latestMessage ? (
          <LatestMessageCard message={latestMessage} />
        ) : (
          <div className="card" style={styles.emptyState}>
            <p>No messages found. Be the first to add one!</p>
            <Link to="/messages/add" style={styles.addFirst}>
              <PlusCircle size={24} /> Add Message
            </Link>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

const styles = {
  hero: {
    textAlign: 'center',
    padding: 'clamp(2rem, 8vw, 5rem) 0 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
  },
  title: {
    maxWidth: '1000px',
    fontSize: 'clamp(2.5rem, 8vw, var(--font-xl))',
    fontWeight: '900',
    lineHeight: '1.1',
    margin: '0.5rem 0',
    padding: '0 1rem',
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: 'clamp(1.15rem, 4vw, var(--font-sm))',
    color: 'var(--text-soft)',
    maxWidth: '700px',
    lineHeight: '1.7',
    padding: '0 1.5rem',
    fontWeight: '500',
    opacity: 0.9,
  },
  quickLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    padding: '2rem 0',
  },
  quickLinkCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '2rem',
    textAlign: 'left',
    cursor: 'pointer',
    border: '1px solid var(--border-light)',
    textDecoration: 'none',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  quickLinkTitle: {
    fontSize: '1.5rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  quickLinkDesc: {
    fontSize: '1rem',
    color: '#475569',
    margin: 0,
    lineHeight: '1.6',
    fontWeight: '500',
  },
  votdCard: {
    background: '#fefce8', // very light yellow/gold tint
    borderColor: '#fef08a',
    padding: 'clamp(2rem, 5vw, 3rem)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  votdHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  votdTitle: {
    color: '#854d0e',
    margin: 0,
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },
  votdContent: {
    maxWidth: '800px',
  },
  votdText: {
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    color: '#1e293b',
    fontWeight: '800',
    lineHeight: '1.6',
    fontStyle: 'italic',
    marginBottom: '1.5rem',
  },
  votdRef: {
    fontSize: '1.15rem',
    fontWeight: '900',
    color: 'var(--accent-blue)',
  },
  votdLoading: {
    color: '#94a3b8',
    fontSize: '1.15rem',
    fontWeight: '600',
  },
  section: {
    marginTop: 'clamp(3rem, 8vw, 5rem)',
    marginBottom: '4rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem, 6vw, var(--font-lg))',
    fontWeight: '900',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  viewAll: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '900',
    color: 'var(--light-blue)',
    fontSize: 'var(--font-sm)',
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
  },
  loading: {
    textAlign: 'center',
    padding: '8rem',
    color: 'var(--muted)',
    fontSize: 'var(--font-md)',
    fontWeight: '800',
  },
  emptyState: {
    padding: '6rem 3rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3rem',
    borderRadius: '40px',
  },
  addFirst: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '1.5rem 3rem',
    borderRadius: '24px',
    fontWeight: '900',
    textDecoration: 'none',
    fontSize: 'var(--font-md)',
    boxShadow: '0 12px 32px rgba(15, 95, 168, 0.4)',
  }
};

export default Home;
