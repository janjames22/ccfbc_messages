import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import MessageCard from '../components/MessageCard';
import SearchBar from '../components/SearchBar';
import { supabase } from '../lib/supabaseClient';
import { Filter } from 'lucide-react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('service_date', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(messages.map(m => m.category).filter(Boolean))];

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                         m.speaker.toLowerCase().includes(search.toLowerCase()) ||
                         m.summary?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || m.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer>
      <SectionTitle 
        title="Message Archive" 
        subtitle="Search and browse through all our Sunday messages." 
      />

      <div style={styles.filterBar}>
        <SearchBar value={search} onChange={setSearch} />
        
        <div style={styles.categorySelect}>
          <Filter size={18} color="var(--muted)" />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={styles.select}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading archive...</div>
      ) : filteredMessages.length > 0 ? (
        <div style={styles.grid}>
          {filteredMessages.map(message => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <div style={styles.noResults}>
          <h3>No messages found</h3>
          <p>Try adjusting your search or category filter.</p>
        </div>
      )}
    </PageContainer>
  );
};

const styles = {
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  },
  categorySelect: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(11, 31, 54, 0.6)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '0 1.25rem',
    height: '52px',
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '5rem',
    color: 'var(--muted)',
    fontSize: '1.2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },
  noResults: {
    textAlign: 'center',
    padding: '5rem',
    color: 'var(--muted)',
  }
};

export default Messages;
