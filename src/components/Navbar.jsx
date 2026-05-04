import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoHeader from './LogoHeader';
import { useAuth } from '../contexts/AuthContext';
import { Home, BookOpen, Library, PlusCircle, Menu, X, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={24} /> },
    { path: '/messages', label: 'Messages', icon: <Library size={24} /> },
    { path: '/bible', label: 'Bible', icon: <BookOpen size={24} /> },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    navigate('/');
  };

  return (
    <>
      <nav style={styles.nav}>
        <div className="container" style={styles.container}>
          <Link to="/" style={styles.logoLink} onClick={closeMenu}>
            <LogoHeader size="navbar" />
            <span style={styles.brandName}>CCFBC</span>
          </Link>
          
          {/* Desktop Nav (Visible via CSS) */}
          <ul className="desktop-nav">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
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
                <li>
                  <Link to="/messages/add" style={styles.addButton}>
                    <PlusCircle size={24} />
                    <span>Add Message</span>
                  </Link>
                </li>
                <li>
                  <button onClick={handleSignOut} style={styles.logoutBtn}>
                    <LogOut size={24} />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" style={styles.loginLink}>
                  <LogIn size={20} />
                  <span>Admin</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile Menu Button (Visible via CSS) */}
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
        <div style={styles.overlayHeader}>
          <LogoHeader size="navbar" />
          <button onClick={closeMenu} style={styles.closeBtn}>
            <X size={36} />
          </button>
        </div>

        <ul className="mobile-nav-list">
          {navLinks.map((link) => (
            <li key={link.path} className="mobile-nav-item">
              <Link 
                to={link.path} 
                onClick={closeMenu}
                className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {React.cloneElement(link.icon, { size: 28 })}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
          
          {user ? (
            <>
              <li className="mobile-nav-item">
                <Link 
                  to="/messages/add" 
                  onClick={closeMenu}
                  className="mobile-nav-link"
                  style={{ background: 'var(--primary-blue)', color: 'white' }}
                >
                  <PlusCircle size={28} />
                  <span>Add New Message</span>
                </Link>
              </li>
              <li className="mobile-nav-item">
                <button onClick={handleSignOut} className="mobile-nav-link" style={{ color: '#ff4d4d' }}>
                  <LogOut size={28} />
                  <span>Sign Out</span>
                </button>
              </li>
            </>
          ) : (
            <li className="mobile-nav-item">
              <Link to="/login" onClick={closeMenu} className="mobile-nav-link">
                <LogIn size={28} />
                <span>Admin Login</span>
              </Link>
            </li>
          )}
        </ul>
        
        <div style={styles.overlayFooter}>
          <p>© {new Date().getFullYear()} CCFBC Archive</p>
        </div>
      </div>
    </>
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
    height: 'var(--nav-height)',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '700',
    fontSize: '1rem',
    padding: '0.5rem',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '0.6rem 1.25rem',
    borderRadius: '12px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(15, 95, 168, 0.3)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ff4d4d',
    fontWeight: '700',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  loginLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: 'var(--muted)',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  overlayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  closeBtn: {
    color: 'var(--text)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  overlayFooter: {
    marginTop: 'auto',
    padding: '2rem 0',
    textAlign: 'center',
    color: 'var(--muted)',
    fontSize: '0.9rem',
  },
};

export default Navbar;
