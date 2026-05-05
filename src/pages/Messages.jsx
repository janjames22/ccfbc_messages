import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import MessageCard from '../components/MessageCard';
import SearchBar from '../components/SearchBar';
import { supabase } from '../lib/supabaseClient';
import { Filter, X, WifiOff } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';
import { useOfflineMessages } from '../hooks/useOfflineMessages';
import { Check } from 'lucide-react';

const Messages = () => {
  const isOffline = useOffline();
  const { downloadedIds } = useOfflineMessages();
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
        
        const cats = ['All', 'Saved Offline', ...new Set(data.map(m => m.category).filter(Boolean))];
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
    // Search filter
    const titleMatch = (m.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const speakerMatch = (m.speaker || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || speakerMatch;
    
    // Category/Offline filter
    let matchesCategory = true;
    if (isOffline) {
      // If offline, only show what's in downloadedIds
      matchesCategory = downloadedIds.includes(m.id);
    } else if (selectedCategory === 'Saved Offline') {
      matchesCategory = downloadedIds.includes(m.id);
    } else if (selectedCategory !== 'All') {
      matchesCategory = m.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer>
      <SectionTitle 
        title="Message Archive" 
        subtitle="Explore our collection of Sunday worship messages and study notes." 
      />

      {isOffline && (
        <div className="card-light" style={styles.offlineNotice}>
          <WifiOff size={24} color="var(--primary-blue)" />
          <div>
            <p style={styles.offlineText}>You are offline. Showing downloaded messages only.</p>
            <p style={styles.offlineSubtext}>Connect to the internet to see all messages.</p>
          </div>
        </div>
      )}

      <div style={styles.controls}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        
        {!isOffline && (
          <div style={styles.filterSection}>
            <div style={styles.filterHeader}>
              <Filter size={20} color="var(--primary-blue)" />
              <span style={styles.filterLabel}>Filter by Category:</span>
            </div>
            <div style={styles.categoryList}>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...styles.categoryBtn,
                    background: selectedCategory === cat ? 'var(--primary-blue)' : 'white',
                    color: selectedCategory === cat ? 'white' : 'var(--primary-blue)',
                    borderColor: selectedCategory === cat ? 'var(--primary-blue)' : 'var(--border-light)',
                    boxShadow: selectedCategory === cat ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  }}
                >
                  {cat === 'Saved Offline' && <Check size={16} style={{ marginRight: '0.5rem' }} />}
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
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
          {isOffline ? (
            <p style={{ maxWidth: '400px' }}>No messages are saved for offline reading yet. Connect to the internet and tap <strong>Download for Offline</strong> on any message.</p>
          ) : (
            <p>No messages found matching your criteria.</p>
          )}
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
