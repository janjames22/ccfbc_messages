import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Messages from './pages/Messages';
import MessageDetail from './pages/MessageDetail';
import AddMessage from './pages/AddMessage';
import Bible from './pages/Bible';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:id" element={<MessageDetail />} />
              <Route path="/bible" element={<Bible />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/messages/add" 
                element={
                  <ProtectedRoute>
                    <AddMessage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <footer style={styles.footer}>
            <div className="container" style={styles.footerContent}>
              <p>© {new Date().getFullYear()} Cabanatuan Community of Faith Baptist Church</p>
              <p style={styles.footerSubtitle}>Review, remember, and reflect on the Word of God.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  footer: {
    padding: '4rem 0',
    borderTop: '1px solid var(--border)',
    background: 'rgba(5, 7, 13, 0.5)',
    marginTop: '4rem',
  },
  footerContent: {
    textAlign: 'center',
    color: 'var(--muted)',
    fontSize: '0.9rem',
  },
  footerSubtitle: {
    marginTop: '0.5rem',
    opacity: 0.6,
  }
};

export default App;
