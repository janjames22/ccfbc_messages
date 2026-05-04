import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoHeader from './LogoHeader';
import { Home, BookOpen, Library, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/messages', label: 'Messages', icon: <Library size={20} /> },
    { path: '/bible', label: 'Bible', icon: <BookOpen size={20} /> },
  ];

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logoLink}>
          <LogoHeader size="navbar" />
          <span style={styles.brandName}>CCFBC Message Archive</span>
        </Link>
        
        <ul style={styles.navList}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link 
                to={link.path} 
                style={{
                  ...styles.navLink,
                  color: location.pathname === link.path ? 'var(--light-blue)' : 'var(--text-soft)'
                }}
              >
                {link.icon}
                <span className="nav-label">{link.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link 
              to="/messages/add" 
              style={styles.addButton}
            >
              <PlusCircle size={20} />
              <span className="nav-label">Add Message</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(5, 7, 13, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '0.75rem 0',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text)',
    letterSpacing: '0.5px',
  },
  navList: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'var(--transition)',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'var(--transition)',
    boxShadow: '0 4px 12px rgba(15, 95, 168, 0.3)',
  },
};

export default Navbar;
