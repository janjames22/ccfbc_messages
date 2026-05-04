import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search messages...' }) => {
  return (
    <div style={styles.container}>
      <Search size={20} color="var(--muted)" style={styles.icon} />
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
    maxWidth: '500px',
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
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1rem 1rem 1rem 3.5rem',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'var(--transition)',
  },
};

export default SearchBar;
