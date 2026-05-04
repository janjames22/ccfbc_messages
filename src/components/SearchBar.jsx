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
    maxWidth: '600px',
  },
  icon: {
    position: 'absolute',
    left: '1.25rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    background: 'rgba(11, 31, 54, 0.6)',
    border: '2px solid var(--border)',
    borderRadius: '20px',
    padding: '1.25rem 1.25rem 1.25rem 3.5rem',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600',
    outline: 'none',
    transition: 'var(--transition)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
};

export default SearchBar;
