import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { 
  Book, Download, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  Copy, WifiOff, AlertTriangle, CheckCircle2, Globe, Share2, Bookmark
} from 'lucide-react';
import { 
  getAvailableLanguages, 
  getVersionsByLanguage, 
  getPassage, 
  getExternalBibleUrl, 
  downloadVersion, 
  deleteDownloadedVersion, 
  listDownloadedVersions, 
  isVersionDownloaded,
  requiresLicensedApi
} from '../services/bibleService';
import { bibleVersions } from '../data/bibleVersions';
import { bibleBooks } from '../data/bibleBooks';

const Bible = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [languages] = useState(getAvailableLanguages());
  const [language, setLanguage] = useState('English');
  const [versions, setVersions] = useState(getVersionsByLanguage('English'));
  const [version, setVersion] = useState(versions[0]?.id || 'KJV');
  
  const [book, setBook] = useState(bibleBooks[39].name); // Matthew
  const [chapter, setChapter] = useState(1);
  const [availableChapters, setAvailableChapters] = useState(28);
  
  const [passageText, setPassageText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Offline State
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadedList, setDownloadedList] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Parse Query Params on Mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refParam = params.get('reference');
    const versionParam = params.get('version');
    
    if (versionParam && bibleVersions.find(v => v.id === versionParam)) {
      setVersion(versionParam);
      const targetLang = bibleVersions.find(v => v.id === versionParam).language;
      if (targetLang !== language) setLanguage(targetLang);
    }
    
    if (refParam) {
      // Basic parsing: split by space, pop last as chapter, rest as book (e.g., "1 John 3" or "John 3:16")
      // We will simplify to just finding the book and chapter if possible.
      const match = refParam.match(/^(\d?\s?[a-zA-Z]+)\s+(\d+)/);
      if (match) {
        const parsedBook = match[1].trim();
        const parsedChapter = parseInt(match[2], 10);
        const bookObj = bibleBooks.find(b => b.name.toLowerCase() === parsedBook.toLowerCase());
        
        if (bookObj) {
          setBook(bookObj.name);
          setChapter(parsedChapter);
          // Auto-fetch if query param is present
          fetchPassageData(`${bookObj.name} ${parsedChapter}`, versionParam || version);
        }
      }
    }
  }, []);

  const currentVersionConfig = bibleVersions.find(v => v.id === version);
  const needsLicense = requiresLicensedApi(version);

  useEffect(() => {
    const vers = getVersionsByLanguage(language);
    setVersions(vers);
    if (vers.length > 0 && !vers.find(v => v.id === version)) {
      setVersion(vers[0].id);
    }
  }, [language]);

  useEffect(() => {
    const selectedBook = bibleBooks.find(b => b.name === book);
    if (selectedBook) {
      setAvailableChapters(selectedBook.chapters);
      if (chapter > selectedBook.chapters) {
        setChapter(1);
      }
    }
  }, [book]);

  useEffect(() => {
    checkDownloadStatus();
    loadDownloadedList();
  }, [version]);

  const checkDownloadStatus = async () => {
    const downloaded = await isVersionDownloaded(version);
    setIsDownloaded(downloaded);
  };

  const loadDownloadedList = async () => {
    const list = await listDownloadedVersions();
    setDownloadedList(list);
  };

  const fetchPassageData = async (refStr, verId) => {
    setLoading(true);
    setError('');
    setPassageText(null);

    try {
      const data = await getPassage(refStr, verId);
      setPassageText(data);
    } catch (err) {
      setError(err.message || 'Failed to load passage. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPassage = (e) => {
    if (e) e.preventDefault();
    const reference = `${book} ${chapter}`;
    fetchPassageData(reference, version);
  };

  const handleNextChapter = () => {
    if (chapter < availableChapters) {
      setChapter(prev => prev + 1);
      fetchPassageData(`${book} ${chapter + 1}`, version);
    } else {
      // Find next book
      const bookIndex = bibleBooks.findIndex(b => b.name === book);
      if (bookIndex < bibleBooks.length - 1) {
        const nextBook = bibleBooks[bookIndex + 1];
        setBook(nextBook.name);
        setChapter(1);
        fetchPassageData(`${nextBook.name} 1`, version);
      }
    }
  };

  const handlePrevChapter = () => {
    if (chapter > 1) {
      setChapter(prev => prev - 1);
      fetchPassageData(`${book} ${chapter - 1}`, version);
    } else {
      // Find prev book
      const bookIndex = bibleBooks.findIndex(b => b.name === book);
      if (bookIndex > 0) {
        const prevBook = bibleBooks[bookIndex - 1];
        setBook(prevBook.name);
        setChapter(prevBook.chapters);
        fetchPassageData(`${prevBook.name} ${prevBook.chapters}`, version);
      }
    }
  };

  const handleDownload = async () => {
    if (!currentVersionConfig?.canDownload) return;
    
    setIsDownloading(true);
    setError('');
    try {
      await downloadVersion(version);
      await checkDownloadStatus();
      await loadDownloadedList();
    } catch (err) {
      setError(err.message || 'Failed to download version.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveDownload = async (idToRemove) => {
    try {
      await deleteDownloadedVersion(idToRemove);
      if (idToRemove === version) await checkDownloadStatus();
      await loadDownloadedList();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (passageText) {
      navigator.clipboard.writeText(`${passageText.reference}\n${passageText.text || passageText.verses?.map(v=>v.text).join(' ')}`);
      alert('Copied to clipboard!');
    }
  };

  const handleShare = () => {
    if (navigator.share && passageText) {
      navigator.share({
        title: passageText.reference,
        text: `Read ${passageText.reference} in the CCFBC App`,
        url: window.location.href
      }).catch(console.error);
    } else {
      copyToClipboard();
    }
  };

  const openExternal = () => {
    const reference = passageText ? passageText.reference : `${book} ${chapter}`;
    window.open(getExternalBibleUrl(reference, version), '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer>
      {/* Top Header */}
      <div style={styles.topHeader} className="animate-fade-in">
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <ChevronLeft size={24} /> Home
        </button>
        <h1 style={styles.pageTitle}>Bible</h1>
        <div style={navigator.onLine ? styles.badgeOnline : styles.badgeOffline}>
          {navigator.onLine ? <Globe size={14} /> : <WifiOff size={14} />}
          {navigator.onLine ? 'Online' : 'Offline'}
        </div>
      </div>

      <div style={styles.container} className="animate-slide-up delay-100">
        {/* Control Panel */}
        <div className="card-light" style={styles.controlsCard}>
          <div style={styles.controlsGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Language</label>
              <select style={styles.select} value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Version</label>
              <select style={styles.select} value={version} onChange={(e) => setVersion(e.target.value)}>
                {versions.map(v => <option key={v.id} value={v.id}>{v.id} - {v.name}</option>)}
              </select>
            </div>
          </div>
          
          <div style={styles.controlsGrid}>
            <div style={{ ...styles.formGroup, flex: 2 }}>
              <label style={styles.label}>Book</label>
              <select style={styles.select} value={book} onChange={(e) => setBook(e.target.value)}>
                {bibleBooks.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Chapter</label>
              <select style={styles.select} value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>
                {Array.from({ length: availableChapters }, (_, i) => i + 1).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={handleFetchPassage} className="btn-large" style={styles.readBtn} disabled={loading}>
            {loading ? 'Loading...' : `Read ${book} ${chapter}`}
          </button>
        </div>

        {/* Fallback Message for Licensed API */}
        {needsLicense && !isDownloaded && (
          <div style={styles.warningBanner} className="animate-fade-in">
            <AlertTriangle size={28} style={{ color: '#d4a017' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '800', marginBottom: '4px', color: '#0f172a' }}>Licensed Version Required</p>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.4' }}>
                This Bible version requires licensed access. You can open it securely in an external tab.
              </p>
            </div>
            <button onClick={openExternal} className="btn-large" style={styles.externalBtnSmall}>
              Open <ExternalLink size={16} />
            </button>
          </div>
        )}

        {/* Reader Display */}
        <div className="card-light" style={styles.readerCard}>
          {error && (
            <div style={styles.errorBanner} className="animate-fade-in">
              <WifiOff size={24} />
              <p>{error}</p>
            </div>
          )}

          {!passageText && !error && !loading && (
            <div style={styles.emptyState} className="animate-fade-in">
              <Book size={64} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={{ color: '#64748b' }}>Select a chapter and click Read</h3>
            </div>
          )}

          {loading && (
            <div style={styles.emptyState} className="animate-fade-in">
              <div style={styles.spinner}></div>
              <h3 style={{ color: '#64748b', marginTop: '1rem' }}>Loading Bible passage...</h3>
            </div>
          )}

          {passageText && !error && !loading && (
            <div style={styles.readerContent} className="animate-fade-in">
              <div style={styles.readerHeader}>
                <div>
                  <h2 style={styles.passageTitle}>{passageText.reference}</h2>
                  <span style={styles.versionBadge}>{passageText.version} {passageText.isLocal && '(Offline)'}</span>
                </div>
                <div style={styles.headerActions}>
                  <button onClick={() => alert("Bookmarked!")} style={styles.iconBtnOnly} title="Bookmark">
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
              
              <div style={styles.passageText}>
                {passageText.verses && passageText.verses.length > 0 ? (
                  passageText.verses.map(v => (
                    <p key={v.verse} style={styles.verseP}>
                      <sup style={styles.verseNum}>{v.verse}</sup> 
                      <span style={styles.verseContent}>{v.text}</span>
                    </p>
                  ))
                ) : (
                  <p style={styles.verseP}><span style={styles.verseContent}>{passageText.text}</span></p>
                )}
              </div>

              <div style={styles.readerNav}>
                <button onClick={handlePrevChapter} className="btn-large" style={styles.navBtn}>
                  <ChevronLeft size={20} /> Prev
                </button>
                <button onClick={handleNextChapter} className="btn-large" style={styles.navBtn}>
                  Next <ChevronRight size={20} />
                </button>
              </div>

              <div style={styles.readerActions}>
                <button onClick={copyToClipboard} className="btn-large" style={styles.iconBtn} title="Copy text">
                  <Copy size={20} /> Copy
                </button>
                <button onClick={handleShare} className="btn-large" style={styles.iconBtn} title="Share">
                  <Share2 size={20} /> Share
                </button>
                <button onClick={openExternal} className="btn-large" style={styles.iconBtn} title="Open Externally">
                  <ExternalLink size={20} /> External
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Offline Management */}
        <div style={styles.offlineSection} className="animate-slide-up delay-200">
          <h3 style={styles.sectionTitle}>Offline Bible Storage</h3>
          
          <div className="card-light" style={styles.offlineCard}>
            <div style={styles.offlineHeader}>
              <div>
                <h4 style={{ color: 'var(--text-dark)', fontSize: '1.15rem', marginBottom: '0.25rem' }}>{currentVersionConfig?.name} ({version})</h4>
                <p style={{ color: 'var(--muted-dark)', fontSize: '0.95rem' }}>
                  {isDownloaded 
                    ? 'Available offline on this device.' 
                    : currentVersionConfig?.canDownload 
                      ? 'Download for offline reading even without internet.' 
                      : 'Licensed access required for offline download.'}
                </p>
              </div>
              
              {currentVersionConfig?.canDownload && !isDownloaded && (
                <button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="btn-large"
                  style={styles.downloadBtn}
                >
                  <Download size={18} /> {isDownloading ? 'Downloading...' : 'Download for Offline'}
                </button>
              )}
              {isDownloaded && (
                <div style={styles.downloadedBadge} className="animate-fade-in">
                  <CheckCircle2 size={18} /> Downloaded
                </div>
              )}
            </div>
          </div>

          {downloadedList.length > 0 && (
            <div style={styles.downloadedListContainer} className="animate-fade-in">
              <h4 style={{ color: 'var(--silver)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Downloaded Versions</h4>
              {downloadedList.map(item => (
                <div key={item.id} style={styles.downloadedItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Book size={20} color="var(--primary-blue)" />
                    <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.id}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveDownload(item.id)}
                    style={styles.removeBtn}
                    title="Remove Download"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

const styles = {
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '1rem',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--light-blue)',
    fontWeight: '800',
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.5rem',
  },
  badgeOnline: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(76, 175, 80, 0.2)',
    color: '#4caf50',
    padding: '0.4rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '800',
  },
  badgeOffline: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(255, 184, 77, 0.2)',
    color: '#ffb84d',
    padding: '0.4rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '800',
  },
  container: { maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' },
  controlsCard: { padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  controlsGrid: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  formGroup: { flex: 1, minWidth: '120px' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: '800', color: 'var(--muted-dark)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: { width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid var(--border-light)', background: '#fff', color: '#0f172a', fontSize: '1.1rem', outline: 'none', fontWeight: '600' },
  readBtn: { width: '100%', background: 'var(--primary-blue)', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: '800', fontSize: '1.15rem', cursor: 'pointer', border: 'none', marginTop: '0.5rem', minHeight: '54px' },
  warningBanner: { display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#fef3c7', border: '1px solid #fde68a', padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem' },
  externalBtnSmall: { background: 'white', color: '#0f172a', border: '2px solid #e2e8f0', padding: '0.6rem 1rem', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexShrink: 0, minHeight: '44px' },
  readerCard: { padding: 'clamp(1.5rem, 5vw, 3rem)', minHeight: '300px', marginBottom: '3rem', position: 'relative' },
  emptyState: { height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid var(--primary-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorBanner: { background: '#fee2e2', border: '1px solid #fecaca', padding: '1.25rem', borderRadius: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '700', marginBottom: '1.5rem' },
  readerContent: { width: '100%' },
  readerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '2rem' },
  headerActions: { display: 'flex', gap: '0.5rem' },
  iconBtnOnly: { background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', transition: 'var(--transition)' },
  passageTitle: { fontSize: 'clamp(2rem, 6vw, 2.75rem)', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' },
  versionBadge: { display: 'inline-block', background: 'var(--primary-blue)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' },
  passageText: { fontSize: 'clamp(1.15rem, 4vw, 1.35rem)', lineHeight: '1.75', color: '#0f172a', marginBottom: '2rem' },
  verseP: { marginBottom: '1.25rem' },
  verseNum: { fontWeight: '900', color: '#2563eb', marginRight: '0.4rem', fontSize: '0.75em' },
  verseContent: { color: '#0f172a' },
  readerNav: { display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' },
  navBtn: { flex: 1, background: '#f8fafc', border: '2px solid #cbd5e1', color: '#334155', padding: '1rem', borderRadius: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minHeight: '54px' },
  readerActions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', borderTop: '2px solid var(--border-light)', paddingTop: '1.5rem' },
  iconBtn: { background: 'white', border: '2px solid #cbd5e1', color: '#0f172a', padding: '0.75rem', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minHeight: '48px' },
  offlineSection: {},
  sectionTitle: { fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '1rem' },
  offlineCard: { padding: '1.5rem', marginBottom: '1.5rem' },
  offlineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' },
  downloadBtn: { background: 'var(--primary-blue)', border: 'none', color: 'white', padding: '0.85rem 1.5rem', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '48px' },
  downloadedBadge: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: '800', background: '#dcfce3', padding: '0.6rem 1.2rem', borderRadius: '12px' },
  downloadedListContainer: { background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-light)' },
  downloadedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '0.75rem' },
  removeBtn: { background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

// Add spinner keyframes globally or within index.css, here added just in case
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

export default Bible;

