import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoHeader from './LogoHeader';
import { useAuth } from '../contexts/AuthContext';
import { Home, BookOpen, Library, PlusCircle, Menu, X, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={28} /> },
    { path: '/messages', label: 'Messages', icon: <Library size={28} /> },
    { path: '/bible', label: 'Bible', icon: <BookOpen size={28} /> },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logoLink} onClick={closeMenu}>
          <LogoHeader size="navbar" />
          <span style={styles.brandName}>CCFBC</span>
        </Link>
        
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? <X size={36} /> : <Menu size={36} />}
        </button>

        <ul className={`nav-list ${isMenuOpen ? 'open' : ''}`} style={styles.navList}>
          {navLinks.map((link) => (
            <li key={link.path} className={isMenuOpen ? 'nav-item-mobile' : ''}>
              <Link 
                to={link.path} 
                onClick={closeMenu}
                style={{
                  ...styles.navLink,
                  color: location.pathname === link.path ? 'var(--light-blue)' : 'var(--text-soft)',
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
          
          {user ? (
            <>
              <li className={isMenuOpen ? 'nav-item-mobile' : ''}>
                <Link 
                  to="/messages/add" 
                  onClick={closeMenu}
                  className="btn-large"
                  style={styles.addButton}
                >
                  <PlusCircle size={28} />
                  <span>Add Message</span>
                </Link>
              </li>
              <li className={isMenuOpen ? 'nav-item-mobile' : ''}>
                <button 
                  onClick={handleSignOut}
                  style={styles.logoutBtn}
                >
                  <LogOut size={28} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <li className={isMenuOpen ? 'nav-item-mobile' : ''}>
              <Link 
                to="/login" 
                onClick={closeMenu}
                style={styles.loginLink}
              >
                <LogIn size={24} />
                <span>Admin</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(5, 7, 13, 0.95)',
    backdropFilter: 'blur(12px)',
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
    position: 'relative',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text)',
    letterSpacing: '0.5px',
  },
  navList: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    margin: 0,
    padding: 0,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '700',
    fontSize: '1.1rem',
    padding: '0.5rem',
    transition: 'var(--transition)',
  },
  loginLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '1rem',
    color: 'var(--muted)',
    transition: 'var(--transition)',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'var(--primary-blue)',
    color: 'white',
    borderRadius: '16px',
    padding: '0.75rem 1.5rem',
    boxShadow: '0 4px 12px rgba(15, 95, 168, 0.3)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#ff4d4d',
    fontWeight: '700',
    fontSize: '1.1rem',
    padding: '0.5rem',
    transition: 'var(--transition)',
  }
};

export default Navbar;
