import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Messages from './pages/Messages';
import MessageDetail from './pages/MessageDetail';
import AddMessage from './pages/AddMessage';
import Bible from './pages/Bible';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<MessageDetail />} />
            <Route path="/messages/add" element={<AddMessage />} />
            <Route path="/bible" element={<Bible />} />
          </Routes>
        </main>
        <footer style={styles.footer}>
          <div className="container" style={styles.footerContent}>
            <p>© {new Date().getFullYear()} CCFBC Sunday Message Archive</p>
            <p style={styles.footerSubtitle}>Review, remember, and reflect.</p>
          </div>
        </footer>
      </div>
    </Router>
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
