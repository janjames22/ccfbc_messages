import React, { useState } from 'react';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import BibleVersionSelect from '../components/BibleVersionSelect';
import { Book, ExternalLink, Search } from 'lucide-react';

const Bible = () => {
  const [reference, setReference] = useState('');
  const [version, setVersion] = useState('ESV');

  const getBibleSearchLink = (ref, ver) => {
    return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=${ver}`;
  };

  const commonVerses = [
    { ref: 'John 3:16', label: 'God\'s Love' },
    { ref: 'Jeremiah 29:11', label: 'God\'s Plan' },
    { ref: 'Philippians 4:13', label: 'Strength' },
    { ref: 'Psalm 23', label: 'The Lord is my Shepherd' },
    { ref: 'Romans 8:28', label: 'All Things for Good' },
    { ref: 'Matthew 28:19-20', label: 'The Great Commission' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reference.trim()) {
      window.open(getBibleSearchLink(reference, version), '_blank');
    }
  };

  return (
    <PageContainer>
      <SectionTitle 
        title="Bible Search" 
        subtitle="Quickly access scripture references using Bible Gateway." 
      />

      <div style={styles.container}>
        <div className="card" style={styles.searchCard}>
          <div style={styles.iconCircle}>
            <Book size={48} color="white" />
          </div>
          <h2 style={styles.cardTitle}>Open Bible Reference</h2>
          <p style={styles.cardText}>Enter a book, chapter, and verse to read on Bible Gateway.</p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputWrapper}>
              <Search size={20} color="var(--muted)" style={styles.searchIcon} />
              <input 
                type="text" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., Romans 12:1-2"
                style={styles.input}
              />
            </div>
            
            <div style={styles.versionWrapper}>
              <BibleVersionSelect 
                value={version} 
                onChange={setVersion}
                label="Preferred Version"
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              Open Verse <ExternalLink size={18} />
            </button>
          </form>
        </div>

        <div style={styles.quickSection}>
          <h3 style={styles.sectionLabel}>Quick Links</h3>
          <div style={styles.quickGrid}>
            {commonVerses.map((item, i) => (
              <a 
                key={i} 
                href={getBibleSearchLink(item.ref, version)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="card" 
                style={styles.quickItem}
              >
                <span style={styles.itemRef}>{item.ref}</span>
                <span style={styles.itemLabel}>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

const styles = {
  container: { maxWidth: '700px', margin: '0 auto' },
  searchCard: { padding: '4rem 3rem', textAlign: 'center', marginBottom: '4rem' },
  iconCircle: { width: '96px', height: '96px', borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 8px 32px rgba(15, 95, 168, 0.4)' },
  cardTitle: { fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' },
  cardText: { color: 'var(--text-soft)', marginBottom: '2.5rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputWrapper: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' },
  input: { width: '100%', background: 'rgba(5, 7, 13, 0.5)', border: '2px solid var(--border)', borderRadius: '16px', padding: '1.25rem 1.25rem 1.25rem 3.5rem', color: 'white', fontSize: '1.2rem', outline: 'none', transition: 'var(--transition)' },
  versionWrapper: { textAlign: 'left', marginTop: '0.5rem' },
  submitBtn: { background: 'var(--primary-blue)', color: 'white', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 8px 24px rgba(15, 95, 168, 0.3)' },
  quickSection: {},
  sectionLabel: { fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--light-blue)', textTransform: 'uppercase', letterSpacing: '1px' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' },
  quickItem: { padding: '1.5rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'var(--transition)' },
  itemRef: { fontWeight: '700', fontSize: '1.1rem', color: 'white' },
  itemLabel: { fontSize: '0.9rem', color: 'var(--muted)' },
};

export default Bible;
