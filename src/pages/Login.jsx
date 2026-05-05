import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/PageContainer';
import LogoHeader from '../components/LogoHeader';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/messages/add');
    } catch (err) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div style={styles.container}>
        <div className="card-light" style={styles.loginCard}>
          <LogoHeader size="large" className="logo-glow" />
          <h1 style={styles.title}>Admin Login</h1>
          <p style={styles.subtitle}>Sign in to contribute new messages to the archive.</p>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <Mail size={24} color="var(--muted-dark)" style={styles.icon} />
              <input 
                type="email" 
                placeholder="Admin Email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <Lock size={24} color="var(--muted-dark)" style={styles.icon} />
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-large" style={styles.loginBtn}>
              {loading ? 'Signing in...' : <><LogIn size={24} /> Sign In</>}
            </button>
          </form>
          
          <p style={styles.helpText}>
            Authorized church staff only. If you need access, please contact the IT team.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

const styles = {
  container: {
    maxWidth: '520px',
    margin: 'clamp(2rem, 10vw, 6rem) auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '0 1rem',
  },
  loginCard: {
    padding: 'clamp(2rem, 8vw, 5rem)',
    textAlign: 'center',
    width: '100%',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontSize: 'var(--font-xl)',
    fontWeight: '900',
    marginTop: '2rem',
    marginBottom: '0.75rem',
    color: 'var(--text-dark)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: 'var(--muted-dark)',
    marginBottom: '3rem',
    fontSize: 'var(--font-sm)',
    fontWeight: '500',
    lineHeight: '1.5',
  },
  errorBox: {
    background: '#fef2f2',
    border: '2px solid #ef4444',
    color: '#b91c1c',
    padding: '1.25rem',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2.5rem',
    textAlign: 'left',
    fontSize: 'var(--font-sm)',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '1.5rem',
    zIndex: 2,
  },
  input: {
    width: '100%',
    background: 'white',
    border: '2px solid var(--border-light)',
    borderRadius: '20px',
    padding: '1.25rem 1.5rem 1.25rem 4rem',
    color: 'var(--text-dark)',
    fontSize: 'var(--font-base)',
    fontWeight: '700',
    outline: 'none',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-sm)',
  },
  loginBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    width: '100%',
    boxShadow: '0 12px 32px rgba(15, 95, 168, 0.4)',
    marginTop: '1.5rem',
    fontSize: 'var(--font-md)',
    fontWeight: '900',
    minHeight: '72px',
  },
  helpText: {
    marginTop: '3.5rem',
    fontSize: 'var(--font-xs)',
    color: 'var(--muted-dark)',
    lineHeight: '1.6',
    fontWeight: '600',
  }
};

export default Login;
