import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import LogoHeader from '../components/LogoHeader';
import LatestMessageCard from '../components/LatestMessageCard';
import { supabase } from '../lib/supabaseClient';
import { Library, BookOpen, PlusCircle, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [latestMessage, setLatestMessage] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <PageContainer>
      <div style={styles.hero}>
        <LogoHeader size="large" className="logo-glow" />
        <h1 style={styles.title}>Cabanatuan Community of Faith Baptist Church</h1>
        <p style={styles.subtitle}>Review, remember, and reflect on the Word of God shared every week.</p>
        
        <div style={styles.ctaGrid}>
          <button onClick={() => navigate('/messages')} className="btn-large" style={styles.primaryBtn}>
            <Library size={24} /> Browse Messages
          </button>
          <button onClick={() => navigate('/bible')} className="btn-large" style={styles.secondaryBtn}>
            <BookOpen size={24} /> Open Bible
          </button>
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
    padding: 'clamp(4rem, 15vw, 8rem) 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem',
  },
  title: {
    maxWidth: '1000px',
    fontSize: 'clamp(2.5rem, 10vw, var(--font-xxl))',
    fontWeight: '900',
    lineHeight: '1.1',
    margin: '0.5rem 0',
    padding: '0 1rem',
    letterSpacing: '-0.04em',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  },
  subtitle: {
    fontSize: 'clamp(1.25rem, 5vw, var(--font-md))',
    color: 'var(--text-soft)',
    maxWidth: '800px',
    lineHeight: '1.7',
    padding: '0 1.5rem',
    fontWeight: '600',
    opacity: 0.95,
  },
  ctaGrid: {
    display: 'flex',
    gap: '2rem',
    marginTop: '3.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    padding: '0 1.5rem',
  },
  primaryBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    flex: '1',
    minWidth: 'min(100%, 350px)',
    boxShadow: '0 16px 40px rgba(15, 95, 168, 0.5)',
    fontSize: 'var(--font-md)',
    fontWeight: '900',
    minHeight: '88px',
    borderRadius: '28px',
  },
  secondaryBtn: {
    background: 'white',
    color: 'var(--primary-blue)',
    border: '3px solid var(--border-light)',
    flex: '1',
    minWidth: 'min(100%, 350px)',
    boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)',
    fontSize: 'var(--font-md)',
    fontWeight: '900',
    minHeight: '88px',
    borderRadius: '28px',
  },
  section: {
    marginTop: 'clamp(4rem, 12vw, 7rem)',
    marginBottom: '8rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 8vw, var(--font-xl))',
    fontWeight: '900',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  viewAll: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontWeight: '900',
    color: 'var(--light-blue)',
    fontSize: 'var(--font-base)',
    textDecoration: 'underline',
    textUnderlineOffset: '8px',
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
