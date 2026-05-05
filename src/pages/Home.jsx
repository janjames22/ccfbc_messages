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
    padding: 'clamp(2rem, 10vw, 4rem) 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  title: {
    maxWidth: '900px',
    fontSize: 'clamp(1.75rem, 6vw, 3.5rem)',
    fontWeight: '900',
    lineHeight: '1.1',
    margin: '0.5rem 0',
    padding: '0 0.5rem',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 3.5vw, 1.25rem)',
    color: 'var(--text-soft)',
    maxWidth: '600px',
    lineHeight: '1.6',
    padding: '0 1rem',
  },
  ctaGrid: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    padding: '0 1rem',
  },
  primaryBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    flex: '1',
    minWidth: 'min(100%, 280px)',
    boxShadow: '0 8px 24px rgba(15, 95, 168, 0.4)',
  },
  secondaryBtn: {
    background: 'white',
    color: 'var(--primary-blue)',
    border: '1px solid var(--border-light)',
    flex: '1',
    minWidth: 'min(100%, 280px)',
    boxShadow: 'var(--shadow-sm)',
  },
  section: {
    marginTop: 'clamp(2rem, 8vw, 4rem)',
    marginBottom: '4rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
    fontWeight: '800',
    margin: 0,
  },
  viewAll: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '700',
    color: 'var(--light-blue)',
    fontSize: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: 'var(--muted)',
  },
  emptyState: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  addFirst: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '16px',
    fontWeight: '700',
    textDecoration: 'none',
  }
};

export default Home;
