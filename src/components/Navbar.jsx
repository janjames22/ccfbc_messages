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
    background: 'rgba(5, 7, 13, 0.98)',
    backdropFilter: 'blur(30px)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
    position: 'sticky',
    top: 0,
    zIndices: 1000,
    height: 'var(--nav-height)',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
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
    gap: '1.25rem',
    textDecoration: 'none',
  },
  brandName: {
    fontSize: 'var(--font-md)',
    fontWeight: '900',
    color: 'white',
    letterSpacing: '0.75px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '900',
    fontSize: 'var(--font-sm)',
    padding: '0.85rem 1.25rem',
    transition: 'var(--transition)',
    borderRadius: '16px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'white',
    color: 'var(--primary-blue)',
    padding: '0.85rem 1.75rem',
    borderRadius: '18px',
    fontWeight: '900',
    boxShadow: '0 8px 20px rgba(255, 255, 255, 0.25)',
    transition: 'var(--transition)',
    fontSize: 'var(--font-sm)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#ff8080',
    fontWeight: '900',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.85rem',
    fontSize: 'var(--font-sm)',
  },
  loginLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    color: 'white',
    fontSize: 'var(--font-xs)',
    fontWeight: '900',
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '0.75rem 1.5rem',
    borderRadius: '100px',
    border: '2.5px solid rgba(255, 255, 255, 0.25)',
    transition: 'var(--transition)',
    letterSpacing: '0.5px',
  },
  overlayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    padding: '1rem 0',
  },
  closeBtn: {
    color: 'white',
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'none',
    cursor: 'pointer',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayFooter: {
    marginTop: 'auto',
    padding: '4rem 0',
    textAlign: 'center',
    color: 'var(--muted)',
    fontSize: 'var(--font-xs)',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
};

export default Navbar;
