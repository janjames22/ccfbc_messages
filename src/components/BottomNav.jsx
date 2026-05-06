import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Library, BookOpen } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/messages', label: 'Messages', icon: Library },
    { path: '/bible', label: 'Bible', icon: BookOpen },
  ];

  return (
    <div style={styles.navContainer} className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            style={{ ...styles.navItem, color: isActive ? 'var(--light-blue)' : 'var(--muted)' }}
          >
            <div style={{ ...styles.iconWrapper, background: isActive ? 'rgba(30, 136, 229, 0.15)' : 'transparent' }}>
              <Icon size={24} color={isActive ? 'var(--light-blue)' : 'var(--muted)'} />
            </div>
            <span style={{ ...styles.label, fontWeight: isActive ? '900' : '600' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 'var(--bottom-nav-height)',
    background: 'rgba(5, 7, 13, 0.98)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0.5rem 1rem calc(0.5rem + env(safe-area-inset-bottom))',
    zIndex: 1000,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    textDecoration: 'none',
    minWidth: '64px',
    padding: '0.25rem',
  },
  iconWrapper: {
    padding: '0.4rem 1rem',
    borderRadius: '16px',
    transition: 'var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    transition: 'var(--transition)',
  }
};

export default BottomNav;
