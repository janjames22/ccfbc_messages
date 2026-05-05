import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.overlay}>
          <div style={styles.container}>
            <div style={styles.iconWrapper}>
              <AlertCircle size={80} color="#ef4444" />
            </div>
            
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              We encountered an unexpected error while loading this page. 
              Please try refreshing or returning to the home page.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <pre style={styles.errorDetail}>
                {this.state.error && this.state.error.toString()}
              </pre>
            )}

            <div style={styles.actions}>
              <button 
                onClick={() => window.location.reload()} 
                style={styles.primaryBtn}
              >
                <RefreshCw size={24} />
                <span>Refresh Page</span>
              </button>
              
              <button 
                onClick={this.handleReset} 
                style={styles.secondaryBtn}
              >
                <Home size={24} />
                <span>Go to Home</span>
              </button>
            </div>

            <p style={styles.footer}>
              If this continues, please contact the church administration.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #05070d 0%, #071527 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem',
  },
  container: {
    maxWidth: '600px',
    width: '100%',
    background: 'white',
    padding: '4rem 3rem',
    borderRadius: '40px',
    textAlign: 'center',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
  },
  iconWrapper: {
    marginBottom: '1rem',
  },
  title: {
    fontSize: 'var(--font-xl)',
    fontWeight: '900',
    color: 'var(--text-dark)',
    margin: 0,
  },
  message: {
    fontSize: 'var(--font-base)',
    color: 'var(--muted-dark)',
    lineHeight: '1.6',
    fontWeight: '600',
  },
  errorDetail: {
    width: '100%',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '16px',
    fontSize: 'var(--font-xs)',
    color: '#ef4444',
    textAlign: 'left',
    overflowX: 'auto',
    border: '1px solid #fee2e2',
  },
  actions: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    width: '100%',
    marginTop: '1rem',
  },
  primaryBtn: {
    flex: 1,
    minWidth: '240px',
    background: 'var(--primary-blue)',
    color: 'white',
    padding: '1.25rem 2rem',
    borderRadius: '20px',
    border: 'none',
    fontWeight: '900',
    fontSize: 'var(--font-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(15, 95, 168, 0.3)',
  },
  secondaryBtn: {
    flex: 1,
    minWidth: '240px',
    background: 'white',
    color: 'var(--primary-blue)',
    padding: '1.25rem 2rem',
    borderRadius: '20px',
    border: '2px solid var(--border-light)',
    fontWeight: '900',
    fontSize: 'var(--font-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  footer: {
    fontSize: 'var(--font-xs)',
    color: 'var(--muted-dark)',
    marginTop: '2rem',
    fontWeight: '700',
    opacity: 0.8,
  }
};

export default ErrorBoundary;
