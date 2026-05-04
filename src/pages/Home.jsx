import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import LatestMessageCard from '../components/LatestMessageCard';
import SectionTitle from '../components/SectionTitle';
import LogoHeader from '../components/LogoHeader';
import { supabase } from '../lib/supabaseClient';
import { Library, BookOpen, PlusCircle, ArrowRight } from 'lucide-react';

const Home = () => {
  const [latestMessage, setLatestMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('service_date', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setLatestMessage(data);
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
        <h1 style={styles.title}>CCFBC Sunday Message Archive</h1>
        <p style={styles.subtitle}>Review, remember, and reflect on the Word of God shared every week.</p>
      </div>

      <div style={styles.content}>
        <SectionTitle title="Featured Message" subtitle="Catch up on the latest word shared with our community." />
        
        {loading ? (
          <div style={styles.loading}>Loading latest message...</div>
        ) : latestMessage ? (
          <LatestMessageCard message={latestMessage} />
        ) : (
          <div className="card" style={styles.noData}>
            <p>No messages found in the archive yet.</p>
            <Link to="/messages/add" style={styles.noDataLink}>Add the first message</Link>
          </div>
        )}

        <div style={styles.quickLinks}>
          <Link to="/messages" style={styles.linkCard} className="card">
            <Library size={32} color="var(--accent-blue)" />
            <h3>Browse Archive</h3>
            <p>Explore all previous Sunday messages by date or topic.</p>
            <span style={styles.linkAction}>View All <ArrowRight size={16} /></span>
          </Link>

          <Link to="/bible" style={styles.linkCard} className="card">
            <BookOpen size={32} color="var(--accent-blue)" />
            <h3>Bible Access</h3>
            <p>Quickly search and read scripture references online.</p>
            <span style={styles.linkAction}>Open Bible <ArrowRight size={16} /></span>
          </Link>

          <Link to="/messages/add" style={styles.linkCard} className="card">
            <PlusCircle size={32} color="var(--accent-blue)" />
            <h3>Add New</h3>
            <p>Contribution area for message notes and summaries.</p>
            <span style={styles.linkAction}>Add Message <ArrowRight size={16} /></span>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

const styles = {
  hero: {
    textAlign: 'center',
    marginBottom: '5rem',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '900',
    color: 'white',
    marginTop: '2rem',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-soft)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: 'var(--muted)',
    fontSize: '1.2rem',
  },
  noData: {
    textAlign: 'center',
    padding: '3rem',
  },
  noDataLink: {
    display: 'inline-block',
    marginTop: '1rem',
    color: 'var(--accent-blue)',
    fontWeight: '600',
  },
  quickLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    marginTop: '4rem',
  },
  linkCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '2rem',
    textDecoration: 'none',
    transition: 'var(--transition)',
  },
  linkAction: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--accent-blue)',
    fontWeight: '700',
    fontSize: '0.9rem',
  }
};

export default Home;
