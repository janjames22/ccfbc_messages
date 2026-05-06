import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { 
  Book, Download, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  Copy, WifiOff, AlertTriangle, CheckCircle2, Globe, Share2, Bookmark
} from 'lucide-react';
import { 
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
import BibleVersionSelect from '../components/BibleVersionSelect';

const getInitialBibleSelection = (search) => {
  const params = new URLSearchParams(search);
  const versionParam = params.get('version');
  const refParam = params.get('reference');
  const selectedVersion = bibleVersions.find(v => v.id === versionParam) || bibleVersions.find(v => v.id === 'KJV') || bibleVersions[0];
  const match = refParam?.match(/^(\d?\s?[a-zA-Z]+(?:\s+of\s+[a-zA-Z]+)?)\s+(\d+)/);
  const normalizedBook = match?.[1].trim().toLowerCase();
  const matchedBook = match
    ? bibleBooks.find(b => {
      if (b.name.toLowerCase() === normalizedBook) return true;
      if (b.name === 'Psalms' && normalizedBook === 'psalm') return true;
      if (b.name === 'Revelation' && normalizedBook === 'revelations') return true;
      return false;
    })
    : null;
  const chapter = matchedBook ? Number(match[2]) : 1;
  const book = matchedBook?.name || bibleBooks[39].name;

  return {
    version: selectedVersion?.id || 'KJV',
    book,
    chapter,
    reference: `${book} ${chapter}`
  };
};

const Bible = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialSelection] = useState(() => getInitialBibleSelection(location.search));
  
  const [version, setVersion] = useState(initialSelection.version);
  
  const [book, setBook] = useState(initialSelection.book);
  const [chapter, setChapter] = useState(initialSelection.chapter);
  
  const [passageText, setPassageText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Offline State
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadedList, setDownloadedList] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const currentVersionConfig = bibleVersions.find(v => v.id === version);
  const needsLicense = requiresLicensedApi(version);
  const availableChapters = bibleBooks.find(b => b.name === book)?.chapters || 1;

  const fetchPassageData = useCallback(async (refStr, verId) => {
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
  }, []);

  const refreshDownloadedState = useCallback(async () => {
    const [downloaded, list] = await Promise.all([
      isVersionDownloaded(version),
      listDownloadedVersions()
    ]);
    setIsDownloaded(downloaded);
    setDownloadedList(list);
  }, [version]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshDownloadedState();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshDownloadedState]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPassageData(initialSelection.reference, initialSelection.version);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchPassageData, initialSelection.reference, initialSelection.version]);

  const handleVersionSelect = (id) => {
    setVersion(id);
  };

  const handleBookSelect = (nextBookName) => {
    const nextBook = bibleBooks.find(b => b.name === nextBookName);
    setBook(nextBookName);
    if (nextBook && chapter > nextBook.chapters) {
      setChapter(1);
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
    setDownloadProgress({ stage: 'Starting download...', percent: 1 });
    setError('');
    try {
      await downloadVersion(version, setDownloadProgress);
      await refreshDownloadedState();
      if (passageText?.version === version) {
        await fetchPassageData(passageText.reference, version);
      }
    } catch (err) {
      setError(err.message || 'Failed to download version.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveDownload = async (idToRemove) => {
    try {
      await deleteDownloadedVersion(idToRemove);
      await refreshDownloadedState();
    } catch (err) {
      console.error(err);
    }
  };

  const getDisplayedPassageText = () => {
    if (!passageText) return '';

    const verseText = passageText.verses?.length
      ? passageText.verses.map(v => `${v.verse}. ${v.text}`).join('\n')
      : passageText.text || '';

    return `${passageText.reference} (${passageText.version})\n${verseText}`.trim();
  };

  const copyToClipboard = () => {
    if (passageText) {
      navigator.clipboard.writeText(getDisplayedPassageText());
      alert('Copied to clipboard!');
    }
  };

  const handleShare = () => {
    if (navigator.share && passageText) {
      navigator.share({
        title: passageText.reference,
        text: getDisplayedPassageText(),
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
          <BibleVersionSelect 
            selectedVersionId={version} 
            onSelect={handleVersionSelect} 
            downloadedIds={downloadedList.map(item => item.id)} 
          />
          </div>
          
          <div style={styles.controlsGrid}>
            <div style={{ ...styles.formGroup, flex: 2 }}>
              <label style={styles.label}>Book</label>
              <select style={styles.select} value={book} onChange={(e) => handleBookSelect(e.target.value)}>
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
                  <span style={styles.versionBadge}>
                    {passageText.isLocal ? `${passageText.version} Offline` : passageText.version}
                  </span>
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
                      ? 'Download the full Bible text for reading even without internet.' 
                      : currentVersionConfig?.copyrightStatus === 'licensed'
                        ? 'Licensed access required for offline download.'
                        : 'Offline download is not available for this version yet.'}
                </p>
              </div>
              
              {currentVersionConfig?.canDownload && !isDownloaded && (
                <button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="btn-large"
                  style={{
                    ...styles.downloadBtn,
                    ...(isDownloading ? styles.downloadBtnDisabled : {})
                  }}
                >
                  <Download size={18} /> {isDownloading ? 'Downloading...' : `Download ${version}`}
                </button>
              )}
              {isDownloaded && (
                <div style={styles.downloadedBadge} className="animate-fade-in">
                  <CheckCircle2 size={18} /> Downloaded
                </div>
              )}
            </div>
            {isDownloading && downloadProgress && (
              <div style={styles.progressWrap} aria-live="polite">
                <div style={styles.progressText}>
                  <span>{downloadProgress.stage}</span>
                  {typeof downloadProgress.percent === 'number' && (
                    <span>{downloadProgress.percent}%</span>
                  )}
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${downloadProgress.percent || 8}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {downloadedList.length > 0 && (
            <div style={styles.downloadedListContainer} className="animate-fade-in">
              <h4 style={{ color: 'var(--silver)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Downloaded Versions</h4>
              {downloadedList.map(item => (
                <div key={item.id} style={styles.downloadedItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Book size={20} color="var(--primary-blue)" />
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.id}</span>
                      {item.verseCount && (
                        <p style={styles.downloadedMeta}>{item.verseCount.toLocaleString()} verses saved</p>
                      )}
                    </div>
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
  downloadBtnDisabled: { opacity: 0.75, cursor: 'wait' },
  downloadedBadge: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: '800', background: '#dcfce3', padding: '0.6rem 1.2rem', borderRadius: '12px' },
  progressWrap: { marginTop: '1.25rem' },
  progressText: { display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#334155', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' },
  progressTrack: { height: '12px', background: '#dbeafe', borderRadius: '999px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--primary-blue)', borderRadius: '999px', transition: 'width 0.2s ease' },
  downloadedListContainer: { background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-light)' },
  downloadedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '0.75rem' },
  downloadedMeta: { margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', lineHeight: 1.3 },
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
