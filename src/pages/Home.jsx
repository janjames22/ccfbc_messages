import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import LogoHeader from '../components/LogoHeader';
import LatestMessageCard from '../components/LatestMessageCard';
import { supabase } from '../lib/supabaseClient';
import { Library, BookOpen, PlusCircle, ArrowRight, Heart, Users, CalendarDays, Info } from 'lucide-react';
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
      <div style={styles.hero} className="animate-slide-up">
        <LogoHeader size="large" className="logo-glow" />
        <h1 style={styles.title}>Welcome to CCFBC</h1>
        <p style={styles.subtitle}>May God bless you today. Review, remember, and reflect on the Word of God.</p>
        
        {/* Quick Access Cards */}
        <div style={styles.quickLinksGrid} className="mobile-actions">
          <button onClick={() => navigate('/messages')} className="card-light btn-large" style={styles.quickLinkCard}>
            <div style={{ ...styles.iconCircle, background: 'rgba(37, 99, 235, 0.1)' }}>
              <Library size={32} color="var(--accent-blue)" />
            </div>
            <h3 style={styles.quickLinkTitle}>Messages</h3>
            <p style={styles.quickLinkDesc}>Browse our archive.</p>
          </button>

          <button onClick={() => navigate('/bible')} className="card-light btn-large" style={styles.quickLinkCard}>
            <div style={{ ...styles.iconCircle, background: 'rgba(212, 160, 23, 0.1)' }}>
              <BookOpen size={32} color="var(--gold)" />
            </div>
            <h3 style={styles.quickLinkTitle}>Bible</h3>
            <p style={styles.quickLinkDesc}>Read the Bible.</p>
          </button>

          <button onClick={() => navigate('/prayer')} className="card-light btn-large delay-100" style={styles.quickLinkCard}>
            <div style={{ ...styles.iconCircle, background: 'rgba(76, 175, 80, 0.1)' }}>
              <Users size={32} color="#4caf50" />
            </div>
            <h3 style={styles.quickLinkTitle}>Prayer</h3>
            <p style={styles.quickLinkDesc}>Submit a request.</p>
          </button>

          <button onClick={() => navigate('/events')} className="card-light btn-large delay-200" style={styles.quickLinkCard}>
            <div style={{ ...styles.iconCircle, background: 'rgba(156, 39, 176, 0.1)' }}>
              <CalendarDays size={32} color="#9c27b0" />
            </div>
            <h3 style={styles.quickLinkTitle}>Events</h3>
            <p style={styles.quickLinkDesc}>Church calendar.</p>
          </button>

          <button onClick={() => alert("Coming Soon!")} className="card-light btn-large delay-300" style={{ ...styles.quickLinkCard, ...styles.fullWidthAction }}>
            <div style={{ ...styles.iconCircle, background: 'rgba(158, 158, 158, 0.1)' }}>
              <Info size={32} color="#9e9e9e" />
            </div>
            <h3 style={styles.quickLinkTitle}>About</h3>
            <p style={styles.quickLinkDesc}>Who we are.</p>
          </button>
        </div>
      </div>

      {/* Verse of the Day */}
      <div style={styles.section} className="animate-slide-up delay-200">
        <div className="card-light" style={styles.votdCard}>
          <div style={styles.votdHeader}>
            <Heart size={24} color="#ef4444" />
            <h3 style={styles.votdTitle}>Verse of the Day</h3>
          </div>
          {verseLoading ? (
            <p style={styles.votdLoading}>Loading verse...</p>
          ) : verseOfDay ? (
            <div style={styles.votdContent} className="animate-fade-in">
              <p style={styles.votdText}>"{verseOfDay.text}"</p>
              <p style={styles.votdRef}>— {verseOfDay.reference} (KJV)</p>
            </div>
          ) : (
            <p style={styles.votdLoading}>Unable to load Verse of the Day.</p>
          )}
        </div>
      </div>

      <div style={styles.section} className="animate-slide-up delay-300">
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Latest Message</h2>
          <Link to="/messages" style={styles.viewAll}>
            View All <ArrowRight size={20} />
          </Link>
        </div>
        
        {loading ? (
          <div style={styles.loading}>Loading latest message...</div>
        ) : latestMessage ? (
          <div className="animate-fade-in">
            <LatestMessageCard message={latestMessage} />
          </div>
        ) : (
          <div className="card animate-fade-in" style={styles.emptyState}>
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
    padding: '0.5rem 0 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    maxWidth: '720px',
    fontSize: 'clamp(2.15rem, 12vw, var(--font-xxl))',
    fontWeight: '900',
    lineHeight: '1.1',
    margin: '0.5rem 0',
    padding: '0',
    letterSpacing: 0,
    overflowWrap: 'anywhere',
  },
  subtitle: {
    fontSize: 'var(--font-base)',
    color: 'var(--text-soft)',
    maxWidth: '700px',
    lineHeight: '1.55',
    padding: 0,
    fontWeight: '500',
    opacity: 0.9,
  },
  quickLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.875rem',
    width: '100%',
    padding: '0.5rem 0',
  },
  quickLinkCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 0.75rem',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1px solid var(--border-light)',
    textDecoration: 'none',
    width: '100%',
    minHeight: '132px',
    justifyContent: 'flex-start',
  },
  fullWidthAction: {
    gridColumn: '1 / -1',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.25rem',
  },
  quickLinkTitle: {
    fontSize: '1.05rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 0.25rem 0',
  },
  quickLinkDesc: {
    fontSize: '0.9rem',
    color: '#475569',
    margin: 0,
    lineHeight: '1.4',
    fontWeight: '500',
  },
  votdCard: {
    background: '#fefce8', // very light yellow/gold tint
    borderColor: '#fef08a',
    padding: '1.25rem',
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
    marginTop: '1.5rem',
    marginBottom: '2rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
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
    padding: 'clamp(3rem, 12vw, 8rem) 1rem',
    color: 'var(--muted)',
    fontSize: 'var(--font-md)',
    fontWeight: '800',
  },
  emptyState: {
    padding: 'clamp(3rem, 12vw, 6rem) 1rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3rem',
    borderRadius: '24px',
  },
  addFirst: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '1rem 1.25rem',
    borderRadius: '24px',
    fontWeight: '900',
    textDecoration: 'none',
    fontSize: 'var(--font-sm)',
    boxShadow: '0 12px 32px rgba(15, 95, 168, 0.4)',
  }
};

export default Home;
