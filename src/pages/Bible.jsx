import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import { Book, Download, Trash2, ExternalLink, ChevronLeft, ChevronRight, Copy, Share2, Search, WifiOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

const Bible = () => {
  const [languages] = useState(getAvailableLanguages());
  const [language, setLanguage] = useState('English');
  const [versions, setVersions] = useState(getVersionsByLanguage('English'));
  const [version, setVersion] = useState(versions[0]?.id || 'KJV');
  
  const [reference, setReference] = useState('John 3');
  const [passageText, setPassageText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Offline State
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadedList, setDownloadedList] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleFetchPassage = async (e) => {
    if (e) e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError('');
    setPassageText(null);

    try {
      const data = await getPassage(reference, version);
      setPassageText(data);
    } catch (err) {
      setError(err.message || 'Failed to load passage. Please check your connection or try again.');
    } finally {
      setLoading(false);
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
      navigator.clipboard.writeText(`${passageText.reference}\n${passageText.text}`);
    }
  };

  const openExternal = () => {
    window.open(getExternalBibleUrl(reference, version), '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer>
      <SectionTitle 
        title="Bible Reader" 
        subtitle="Read the Word, offline and online." 
      />

      <div style={styles.container}>
        {/* Controls Section */}
        <div className="card-light" style={styles.controlsCard}>
          <div style={styles.row}>
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

          <form onSubmit={handleFetchPassage} style={styles.searchRow}>
            <div style={styles.inputWrapper}>
              <Search size={20} color="var(--muted-dark)" style={styles.searchIcon} />
              <input 
                type="text" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., John 3 or Romans 12:1-2"
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.readBtn} disabled={loading}>
              {loading ? 'Loading...' : 'Read'}
            </button>
          </form>
        </div>

        {/* Fallback Message for Licensed API */}
        {needsLicense && !isDownloaded && (
          <div style={styles.warningBanner}>
            <AlertTriangle size={24} style={{ color: '#ffb84d' }} />
            <div>
              <p style={{ fontWeight: '700', marginBottom: '4px' }}>Licensed Version</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                This Bible version requires licensed access. You can open it externally for now.
              </p>
            </div>
            <button onClick={openExternal} style={styles.externalBtnSmall}>
              Open <ExternalLink size={16} />
            </button>
          </div>
        )}

        {/* Reader Display */}
        <div className="card-light" style={styles.readerCard}>
          {error && (
            <div style={styles.errorBanner}>
              <WifiOff size={24} />
              <p>{error}</p>
            </div>
          )}

          {!passageText && !error && !loading && (
            <div style={styles.emptyState}>
              <Book size={64} style={{ color: 'var(--muted-dark)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ color: 'var(--silver)' }}>Select a passage to start reading</h3>
            </div>
          )}

          {passageText && !error && (
            <div style={styles.readerContent}>
              <div style={styles.readerHeader}>
                <h2 style={styles.passageTitle}>{passageText.reference}</h2>
                <span style={styles.versionBadge}>{passageText.version} {passageText.isLocal && '(Offline)'}</span>
              </div>
              
              <div style={styles.passageText}>
                {passageText.verses && passageText.verses.length > 0 ? (
                  passageText.verses.map(v => (
                    <p key={v.verse} style={styles.verseP}>
                      <sup style={styles.verseNum}>{v.verse}</sup> {v.text}
                    </p>
                  ))
                ) : (
                  <p style={styles.verseP}>{passageText.text}</p>
                )}
              </div>

              <div style={styles.readerActions}>
                <button onClick={copyToClipboard} style={styles.iconBtn} title="Copy">
                  <Copy size={20} /> Copy
                </button>
                <button onClick={openExternal} style={styles.iconBtn} title="Open Externally">
                  <ExternalLink size={20} /> Open
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Offline Management */}
        <div style={styles.offlineSection}>
          <h3 style={styles.sectionTitle}>Offline Bible Storage</h3>
          
          <div className="card-light" style={styles.offlineCard}>
            <div style={styles.offlineHeader}>
              <div>
                <h4 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{currentVersionConfig?.name} ({version})</h4>
                <p style={{ color: 'var(--muted-dark)', fontSize: '0.9rem' }}>
                  {isDownloaded 
                    ? 'Available offline on this device.' 
                    : currentVersionConfig?.canDownload 
                      ? 'Download for offline use.' 
                      : 'Offline download not supported for this version.'}
                </p>
              </div>
              
              {currentVersionConfig?.canDownload && !isDownloaded && (
                <button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  style={styles.downloadBtn}
                >
                  <Download size={18} /> {isDownloading ? 'Downloading...' : 'Download'}
                </button>
              )}
              {isDownloaded && (
                <div style={styles.downloadedBadge}>
                  <CheckCircle2 size={18} /> Downloaded
                </div>
              )}
            </div>
          </div>

          {downloadedList.length > 0 && (
            <div style={styles.downloadedListContainer}>
              <h4 style={{ color: 'var(--silver)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Downloaded Versions</h4>
              {downloadedList.map(item => (
                <div key={item.id} style={styles.downloadedItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Book size={20} color="var(--primary-blue)" />
                    <span style={{ fontWeight: '700', color: 'var(--silver)' }}>{item.id}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveDownload(item.id)}
                    style={styles.removeBtn}
                    title="Remove Download"
                  >
                    <Trash2 size={18} />
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
  container: { maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' },
  controlsCard: { padding: '1.5rem', marginBottom: '1.5rem' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  formGroup: { flex: 1, minWidth: '150px' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: { width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid var(--border-light)', background: 'var(--bg-dark)', color: 'var(--silver)', fontSize: '1rem', outline: 'none' },
  searchRow: { display: 'flex', gap: '1rem' },
  inputWrapper: { flex: 1, position: 'relative' },
  searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' },
  input: { width: '100%', background: 'var(--bg-dark)', border: '2px solid var(--border-light)', borderRadius: '12px', padding: '1rem 1rem 1rem 3rem', color: 'white', fontSize: '1.1rem', outline: 'none' },
  readBtn: { background: 'var(--primary-blue)', color: 'white', padding: '0 2rem', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', border: 'none' },
  warningBanner: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 184, 77, 0.1)', border: '1px solid rgba(255, 184, 77, 0.3)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem' },
  externalBtnSmall: { marginLeft: 'auto', background: 'white', color: 'var(--bg-dark)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  readerCard: { padding: '2.5rem', minHeight: '300px', marginBottom: '3rem', position: 'relative' },
  emptyState: { height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  errorBanner: { background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', padding: '1rem', borderRadius: '12px', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '500', marginBottom: '1.5rem' },
  readerContent: { animation: 'fadeIn 0.5s ease' },
  readerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' },
  passageTitle: { fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)' },
  versionBadge: { background: 'var(--primary-blue)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' },
  passageText: { fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-soft)', marginBottom: '2rem' },
  verseP: { marginBottom: '0.5rem' },
  verseNum: { fontWeight: '800', color: 'var(--primary-blue)', marginRight: '0.3rem', fontSize: '0.8em' },
  readerActions: { display: 'flex', gap: '1rem', borderTop: '2px solid var(--border-light)', paddingTop: '1.5rem' },
  iconBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '2px solid var(--border-light)', color: 'var(--silver)', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'var(--transition)' },
  offlineSection: {},
  sectionTitle: { fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '1rem' },
  offlineCard: { padding: '1.5rem', marginBottom: '1.5rem' },
  offlineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  downloadBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-dark)', border: '2px solid var(--primary-blue)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },
  downloadedBadge: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4caf50', fontWeight: '800', background: 'rgba(76, 175, 80, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' },
  downloadedListContainer: { background: 'rgba(5, 7, 13, 0.5)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' },
  downloadedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '0.5rem' },
  removeBtn: { background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' },
};

export default Bible;
