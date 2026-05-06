import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search messages...' }) => {
  return (
    <div style={styles.container}>
      <Search size={24} color="var(--muted)" style={styles.icon} />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '700px',
  },
  icon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  input: {
    width: '100%',
    background: 'white',
    border: '3px solid var(--border-light)',
    borderRadius: '20px',
    padding: '1rem 1rem 1rem 3.25rem',
    color: 'var(--text-dark)',
    fontSize: 'var(--font-base)',
    fontWeight: '800',
    outline: 'none',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-md)',
    minHeight: '60px',
  },
};

export default SearchBar;
