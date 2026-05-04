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
        <div className="card" style={styles.loginCard}>
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
              <Mail size={24} color="var(--muted)" style={styles.icon} />
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
              <Lock size={24} color="var(--muted)" style={styles.icon} />
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
    maxWidth: '500px',
    margin: '4rem auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    padding: 'clamp(2rem, 8vw, 4rem)',
    textAlign: 'center',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '900',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--text-soft)',
    marginBottom: '2.5rem',
    fontSize: '1.1rem',
  },
  errorBox: {
    background: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid #ff4d4d',
    color: '#ff4d4d',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '1.25rem',
  },
  input: {
    width: '100%',
    background: 'rgba(5, 7, 13, 0.6)',
    border: '2px solid var(--border)',
    borderRadius: '16px',
    padding: '1.25rem 1.25rem 1.25rem 3.5rem',
    color: 'white',
    fontSize: '1.1rem',
    outline: 'none',
    transition: 'var(--transition)',
  },
  loginBtn: {
    background: 'var(--primary-blue)',
    color: 'white',
    width: '100%',
    boxShadow: '0 8px 24px rgba(15, 95, 168, 0.3)',
    marginTop: '1rem',
  },
  helpText: {
    marginTop: '2.5rem',
    fontSize: '0.9rem',
    color: 'var(--muted)',
    lineHeight: '1.5',
  }
};

export default Login;
