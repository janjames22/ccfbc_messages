import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import MessageCard from '../components/MessageCard';
import SearchBar from '../components/SearchBar';
import { supabase } from '../lib/supabaseClient';
import { Filter, X, WifiOff } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

const Messages = () => {
  const isOffline = useOffline();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('service_date', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
        
        const cats = ['All', ...new Set(data.map(m => m.category).filter(Boolean))];
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer>
      <SectionTitle 
        title="Message Archive" 
        subtitle="Explore our collection of Sunday worship messages and study notes." 
      />

      {isOffline && (
        <div className="card" style={styles.offlineNotice}>
          <WifiOff size={24} color="var(--light-blue)" />
          <div>
            <p style={styles.offlineText}>Viewing messages in <strong>Offline Mode</strong>.</p>
            <p style={styles.offlineSubtext}>Only previously viewed messages are available. Connect to the internet to see the latest updates.</p>
          </div>
        </div>
      )}

      <div style={styles.controls}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        
        <div style={styles.filterSection}>
          <div style={styles.filterHeader}>
            <Filter size={20} color="var(--light-blue)" />
            <span style={styles.filterLabel}>Filter by Category:</span>
          </div>
          <div style={styles.categoryList}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.categoryBtn,
                  background: selectedCategory === cat ? 'var(--primary-blue)' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedCategory === cat ? 'var(--light-blue)' : 'var(--border)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading messages...</div>
      ) : filteredMessages.length > 0 ? (
        <div style={styles.grid}>
          {filteredMessages.map(message => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <X size={48} color="var(--muted)" />
          <p>No messages found matching your criteria.</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} className="btn-large" style={styles.resetBtn}>
            Clear Filters
          </button>
        </div>
      )}
    </PageContainer>
  );
};

const styles = {
  offlineNotice: {
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '3rem',
    background: 'white',
    border: '1px solid var(--border-light)',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-md)',
  },
  offlineText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-dark)',
    marginBottom: '0.25rem',
  },
  offlineSubtext: {
    fontSize: '0.95rem',
    color: 'var(--muted-dark)',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
    marginBottom: '4rem',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  filterLabel: {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--silver)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  categoryList: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '100px',
    fontSize: '1rem',
    fontWeight: '700',
    color: 'white',
    border: '1px solid transparent',
    transition: 'var(--transition)',
    minHeight: '48px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 100%, 350px), 1fr))',
    gap: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '5rem',
    color: 'var(--muted)',
    fontSize: '1.5rem',
  },
  empty: {
    textAlign: 'center',
    padding: '5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    color: 'var(--muted)',
    fontSize: '1.2rem',
  },
  resetBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid var(--border)',
    marginTop: '1rem',
  }
};

export default Messages;
