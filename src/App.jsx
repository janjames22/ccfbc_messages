import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import OfflineBanner from './components/OfflineBanner';
import ReloadPrompt from './components/ReloadPrompt';
import Home from './pages/Home';
import Messages from './pages/Messages';
import MessageDetail from './pages/MessageDetail';
import AddMessage from './pages/AddMessage';
import EditMessage from './pages/EditMessage';
import Bible from './pages/Bible';
import Login from './pages/Login';
import Prayer from './pages/Prayer';
import Events from './pages/Events';

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
          <ReloadPrompt />
          <OfflineBanner />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:id" element={<MessageDetail />} />
              <Route path="/bible" element={<Bible />} />
              <Route path="/prayer" element={<Prayer />} />
              <Route path="/events" element={<Events />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/messages/add" 
                element={
                  <ProtectedRoute>
                    <AddMessage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages/edit/:id" 
                element={
                  <ProtectedRoute>
                    <EditMessage />
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
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  footer: {
    padding: '4rem 0',
    borderTop: '1px solid var(--border-light)',
    background: 'rgba(5, 7, 13, 0.8)',
    marginTop: '4rem',
  },
  footerContent: {
    textAlign: 'center',
    color: 'var(--silver)',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  footerSubtitle: {
    marginTop: '0.5rem',
    color: 'var(--muted)',
    opacity: 0.8,
  }
};

export default App;
