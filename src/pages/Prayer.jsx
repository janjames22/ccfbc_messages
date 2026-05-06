import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  Lock,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../contexts/AuthContext';
import {
  PRAYER_STATUSES,
  archivePrayerRequest,
  createPrayerRequest,
  deletePrayerRequest,
  getPrayerRequestsForDashboard,
  getPublicPrayerRequests,
  unarchivePrayerRequest,
  updatePrayerRequest
} from '../services/prayerService';

const categories = ['Healing', 'Family', 'Guidance', 'Thanksgiving', 'Salvation', 'Other'];

const initialForm = {
  name: '',
  contact: '',
  request: '',
  category: 'Healing',
  privacy: 'private'
};

const dashboardTabs = [
  { id: 'public-active', label: 'Public Requests', privacy: 'public', archived: false, pastorOnly: false },
  { id: 'private-active', label: 'Private Requests', privacy: 'private', archived: false, pastorOnly: true },
  { id: 'public-archive', label: 'Public Archive', privacy: 'public', archived: true, pastorOnly: false },
  { id: 'private-archive', label: 'Private Archive', privacy: 'private', archived: true, pastorOnly: true }
];

const Prayer = () => {
  const { user, isAdmin, isPastor, role } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [publicTab, setPublicTab] = useState('active');
  const [publicRequests, setPublicRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [dashboardRequests, setDashboardRequests] = useState([]);
  const [dashboardTab, setDashboardTab] = useState('public-active');
  const [dashboardStatus, setDashboardStatus] = useState('all');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [dashboardMessage, setDashboardMessage] = useState('');
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const availableDashboardTabs = useMemo(
    () => dashboardTabs.filter(tab => !tab.pastorOnly || isPastor),
    [isPastor]
  );
  const activeDashboardTab = availableDashboardTabs.find(tab => tab.id === dashboardTab) || availableDashboardTabs[0];

  const loadPublicRequests = useCallback(async () => {
    setLoadingRequests(true);
    const requests = await getPublicPrayerRequests({ archived: publicTab === 'archive' });
    setPublicRequests(requests);
    setLoadingRequests(false);
  }, [publicTab]);

  const loadDashboardRequests = useCallback(async () => {
    if (!isAdmin || !activeDashboardTab) return;

    setLoadingDashboard(true);
    setDashboardMessage('');
    try {
      const requests = await getPrayerRequestsForDashboard({
        privacy: activeDashboardTab.privacy,
        status: activeDashboardTab.archived ? 'archived' : dashboardStatus,
        search: dashboardSearch
      });
      setDashboardRequests(
        activeDashboardTab.archived
          ? requests.filter(request => request.status === 'archived')
          : requests.filter(request => request.status !== 'archived')
      );
    } catch (error) {
      setDashboardMessage(error.message || 'Unable to load prayer requests.');
      setDashboardRequests([]);
    } finally {
      setLoadingDashboard(false);
    }
  }, [activeDashboardTab, dashboardSearch, dashboardStatus, isAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPublicRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPublicRequests]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboardRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboardRequests]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please enter your name.';
    if (!formData.request.trim()) errors.request = 'Please enter your prayer request.';
    return errors;
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    if (submitState.status === 'error') {
      setSubmitState({ status: 'idle', message: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitState.status === 'submitting') return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitState({ status: 'error', message: 'Please check the highlighted fields.' });
      return;
    }

    setSubmitState({ status: 'submitting', message: 'Submitting your prayer request...' });

    try {
      const created = await createPrayerRequest(formData);
      setSubmitState({ status: 'success', message: 'Your prayer request has been submitted.' });
      setFormData(initialForm);
      setFieldErrors({});

      if (created.privacy === 'public' && publicTab === 'active') {
        setPublicRequests(prev => [created, ...prev]);
      }

      loadPublicRequests();
      loadDashboardRequests();
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error.message || 'Unable to submit your prayer request right now.'
      });
    }
  };

  const updateDashboardRequest = async (id, data, successMessage) => {
    setSavingId(id);
    setDashboardMessage('');
    try {
      await updatePrayerRequest(id, data);
      setDashboardMessage(successMessage || 'Prayer request updated.');
      await loadDashboardRequests();
      await loadPublicRequests();
    } catch (error) {
      setDashboardMessage(error.message || 'Unable to update prayer request.');
    } finally {
      setSavingId(null);
    }
  };

  const handleArchive = async (request) => {
    setSavingId(request.id);
    setDashboardMessage('');
    try {
      await archivePrayerRequest(request.id, user?.id);
      setDashboardMessage('Prayer request archived.');
      await loadDashboardRequests();
      await loadPublicRequests();
    } catch (error) {
      setDashboardMessage(error.message || 'Unable to archive prayer request.');
    } finally {
      setSavingId(null);
    }
  };

  const handleUnarchive = async (request) => {
    setSavingId(request.id);
    setDashboardMessage('');
    try {
      await unarchivePrayerRequest(request.id);
      setDashboardMessage('Prayer request restored to pending.');
      await loadDashboardRequests();
      await loadPublicRequests();
    } catch (error) {
      setDashboardMessage(error.message || 'Unable to restore prayer request.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (request) => {
    if (!window.confirm('Delete this prayer request? This cannot be undone.')) return;

    setSavingId(request.id);
    setDashboardMessage('');
    try {
      await deletePrayerRequest(request.id);
      setDashboardMessage('Prayer request deleted.');
      await loadDashboardRequests();
      await loadPublicRequests();
    } catch (error) {
      setDashboardMessage(error.message || 'Unable to delete prayer request.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <PageContainer>
      <div style={styles.topBar}>
        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={22} /> Home
        </Link>
      </div>

      <section style={styles.hero} className="animate-slide-up">
        <div style={styles.heroIcon}>
          <HeartHandshake size={34} />
        </div>
        <h1 style={styles.title}>Prayer Request</h1>
        <p style={styles.subtitle}>Submit your prayer request. Our church family will pray with you.</p>
      </section>

      <div className="prayer-page-layout" style={styles.layout}>
        <form onSubmit={handleSubmit} className="card-light" style={styles.formCard} noValidate>
          <div aria-live="polite" style={styles.messageArea}>
            {submitState.message && (
              <div
                style={{
                  ...styles.alert,
                  ...(submitState.status === 'success' ? styles.alertSuccess : styles.alertError)
                }}
              >
                {submitState.status === 'success' && <CheckCircle2 size={22} />}
                <span>{submitState.message}</span>
              </div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="prayer-name" style={styles.label}>Name</label>
            <input
              id="prayer-name"
              type="text"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              style={{ ...styles.input, ...(fieldErrors.name ? styles.inputError : {}) }}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'prayer-name-error' : undefined}
            />
            {fieldErrors.name && <p id="prayer-name-error" style={styles.fieldError}>{fieldErrors.name}</p>}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="prayer-contact" style={styles.label}>Contact Number or Email</label>
            <input
              id="prayer-contact"
              type="text"
              value={formData.contact}
              onChange={(event) => updateField('contact', event.target.value)}
              style={styles.input}
            />
            <p style={styles.helpText}>Optional. This is only for church follow-up and is never shown publicly.</p>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="prayer-request" style={styles.label}>Prayer Request</label>
            <textarea
              id="prayer-request"
              value={formData.request}
              onChange={(event) => updateField('request', event.target.value)}
              rows={6}
              style={{ ...styles.textarea, ...(fieldErrors.request ? styles.inputError : {}) }}
              aria-invalid={Boolean(fieldErrors.request)}
              aria-describedby={fieldErrors.request ? 'prayer-request-error' : undefined}
            />
            {fieldErrors.request && <p id="prayer-request-error" style={styles.fieldError}>{fieldErrors.request}</p>}
          </div>

          <div className="prayer-form-two-column" style={styles.twoColumn}>
            <div style={styles.fieldGroup}>
              <label htmlFor="prayer-category" style={styles.label}>Category</label>
              <select
                id="prayer-category"
                value={formData.category}
                onChange={(event) => updateField('category', event.target.value)}
                style={styles.input}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="prayer-privacy" style={styles.label}>Privacy</label>
              <select
                id="prayer-privacy"
                value={formData.privacy}
                onChange={(event) => updateField('privacy', event.target.value)}
                style={styles.input}
              >
                <option value="public">Public prayer request</option>
                <option value="private">Private prayer request</option>
              </select>
            </div>
          </div>

          <div style={styles.privacyNote}>
            <Lock size={20} />
            <p>Public requests may appear below. Private requests are only visible to the pastor in the protected dashboard.</p>
          </div>

          <button
            type="submit"
            className="btn-large"
            style={styles.submitButton}
            disabled={submitState.status === 'submitting'}
          >
            <Send size={22} />
            {submitState.status === 'submitting' ? 'Submitting...' : 'Submit Prayer Request'}
          </button>
        </form>

        <aside className="card-light" style={styles.publicCard}>
          <div style={styles.publicHeader}>
            <div style={styles.publicIcon}>
              <Users size={26} />
            </div>
            <div>
              <h2 style={styles.publicTitle}>Public Prayer Requests</h2>
              <p style={styles.publicCount}>Contact information is never shown here.</p>
            </div>
          </div>

          <div style={styles.tabRow}>
            <button type="button" onClick={() => setPublicTab('active')} style={{ ...styles.tabButton, ...(publicTab === 'active' ? styles.tabButtonActive : {}) }}>
              Active
            </button>
            <button type="button" onClick={() => setPublicTab('archive')} style={{ ...styles.tabButton, ...(publicTab === 'archive' ? styles.tabButtonActive : {}) }}>
              Archive
            </button>
          </div>

          {loadingRequests ? (
            <p style={styles.emptyText}>Loading prayer requests...</p>
          ) : publicRequests.length === 0 ? (
            <p style={styles.emptyText}>{publicTab === 'archive' ? 'No archived public prayer requests yet.' : 'No active public prayer requests yet.'}</p>
          ) : (
            <div style={styles.requestList}>
              {publicRequests.map(request => (
                <article key={request.id || `${request.name}-${request.created_at}`} style={styles.requestItem}>
                  <div style={styles.requestMeta}>
                    <span style={styles.categoryPill}>{request.category || 'General'}</span>
                    <span style={styles.statusPill}>{request.status}</span>
                  </div>
                  <p style={styles.requestText}>{request.request_text}</p>
                  <p style={styles.requestName}>Submitted by {request.name}</p>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>

      {isAdmin && (
        <section className="card-light" style={styles.dashboardCard}>
          <div style={styles.dashboardHeader}>
            <div>
              <h2 style={styles.dashboardTitle}>Prayer Request Dashboard</h2>
              <p style={styles.dashboardSubtitle}>
                Signed in as {role}. Pastor role can access private requests and private archives.
              </p>
            </div>
            <div style={styles.dashboardBadge}>
              <ShieldCheck size={20} /> {role}
            </div>
          </div>

          <div style={styles.tabRow}>
            {availableDashboardTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDashboardTab(tab.id)}
                style={{ ...styles.tabButton, ...(dashboardTab === tab.id ? styles.tabButtonActive : {}) }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={styles.dashboardFilters}>
            <div style={styles.searchWrap}>
              <Search size={20} color="#64748b" />
              <input
                type="search"
                value={dashboardSearch}
                onChange={(event) => setDashboardSearch(event.target.value)}
                placeholder="Search by name, category, date..."
                style={styles.searchInput}
              />
            </div>
            {!activeDashboardTab?.archived && (
              <select value={dashboardStatus} onChange={(event) => setDashboardStatus(event.target.value)} style={styles.filterSelect}>
                <option value="all">All active statuses</option>
                {PRAYER_STATUSES.filter(status => status !== 'archived').map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            )}
          </div>

          <div aria-live="polite">
            {dashboardMessage && <div style={styles.dashboardNotice}>{dashboardMessage}</div>}
          </div>

          {loadingDashboard ? (
            <p style={styles.emptyText}>Loading dashboard...</p>
          ) : dashboardRequests.length === 0 ? (
            <p style={styles.emptyText}>No prayer requests found for this view.</p>
          ) : (
            <div style={styles.dashboardList}>
              {dashboardRequests.map(request => (
                <article key={request.id} style={styles.dashboardItem}>
                  <div style={styles.dashboardItemHeader}>
                    <div>
                      <h3 style={styles.dashboardItemTitle}>{request.name}</h3>
                      <p style={styles.dashboardItemMeta}>{request.privacy} • {request.category} • {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={styles.statusPill}>{request.status}</span>
                  </div>

                  <p style={styles.requestText}>{request.request_text}</p>
                  {request.contact && <p style={styles.privateContact}>Contact: {request.contact}</p>}

                  <div style={styles.dashboardControls}>
                    <label style={styles.inlineLabel}>
                      Status
                      <select
                        value={request.status}
                        onChange={(event) => updateDashboardRequest(request.id, { status: event.target.value }, 'Status updated.')}
                        style={styles.compactSelect}
                        disabled={savingId === request.id}
                      >
                        {PRAYER_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>

                    <label style={styles.notesLabel}>
                      Pastor/Admin Notes
                      <textarea
                        defaultValue={request.admin_notes || ''}
                        onBlur={(event) => {
                          if (event.target.value !== (request.admin_notes || '')) {
                            updateDashboardRequest(request.id, { admin_notes: event.target.value }, 'Notes saved.');
                          }
                        }}
                        rows={3}
                        style={styles.notesInput}
                        disabled={savingId === request.id}
                      />
                    </label>
                  </div>

                  <div style={styles.actionRow}>
                    {request.status === 'archived' ? (
                      <button type="button" onClick={() => handleUnarchive(request)} style={styles.secondaryButton} disabled={savingId === request.id}>
                        <RotateCcw size={18} /> Unarchive
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleArchive(request)} style={styles.secondaryButton} disabled={savingId === request.id}>
                        <Archive size={18} /> Archive
                      </button>
                    )}
                    <button type="button" onClick={() => updateDashboardRequest(request.id, { admin_notes: request.admin_notes || '' }, 'Prayer request saved.')} style={styles.secondaryButton} disabled={savingId === request.id}>
                      <Save size={18} /> Save
                    </button>
                    <button type="button" onClick={() => handleDelete(request)} style={styles.dangerButton} disabled={savingId === request.id}>
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </PageContainer>
  );
};

const styles = {
  topBar: { display: 'flex', marginBottom: '1rem' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'var(--light-blue)', fontWeight: '900', minHeight: '44px' },
  hero: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' },
  heroIcon: { width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(76, 175, 80, 0.18)', color: '#86efac', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { margin: 0, fontSize: 'clamp(2rem, 10vw, 3.5rem)' },
  subtitle: { maxWidth: '720px', color: 'var(--text-soft)', fontSize: 'var(--font-base)', lineHeight: 1.55, margin: 0 },
  layout: { display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', width: '100%' },
  formCard: { padding: 'clamp(1rem, 4vw, 2rem)' },
  messageArea: { minHeight: '0.5rem' },
  alert: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '14px', fontWeight: '800', marginBottom: '1rem', fontSize: '1rem' },
  alertSuccess: { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
  alertError: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', minWidth: 0 },
  label: { color: '#0f172a', fontWeight: '900', fontSize: '1rem' },
  input: { width: '100%', minHeight: '52px', borderRadius: '14px', border: '2px solid #cbd5e1', background: 'white', color: '#0f172a', padding: '0.85rem 1rem', fontSize: '1.05rem', fontWeight: '650', outline: 'none' },
  textarea: { width: '100%', minHeight: '150px', borderRadius: '14px', border: '2px solid #cbd5e1', background: 'white', color: '#0f172a', padding: '0.85rem 1rem', fontSize: '1.05rem', fontWeight: '650', lineHeight: 1.55, resize: 'vertical', outline: 'none' },
  inputError: { borderColor: '#ef4444', background: '#fff7f7' },
  fieldError: { color: '#b91c1c', fontSize: '0.95rem', fontWeight: '800', margin: 0 },
  helpText: { color: '#475569', fontSize: '0.95rem', lineHeight: 1.4, margin: 0 },
  twoColumn: { display: 'grid', gridTemplateColumns: '1fr', gap: '0.25rem' },
  privacyNote: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', fontWeight: '750', fontSize: '0.95rem', lineHeight: 1.45 },
  submitButton: { width: '100%', background: 'var(--primary-blue)', color: 'white', minHeight: '58px', borderRadius: '16px' },
  publicCard: { padding: 'clamp(1rem, 4vw, 1.5rem)', alignSelf: 'start' },
  publicHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' },
  publicIcon: { width: '52px', height: '52px', borderRadius: '16px', background: '#dbeafe', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  publicTitle: { color: '#0f172a', margin: 0, fontSize: '1.4rem' },
  publicCount: { margin: '0.25rem 0 0', color: '#475569', fontWeight: '750', fontSize: '0.95rem' },
  tabRow: { display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' },
  tabButton: { border: '2px solid #cbd5e1', background: 'white', color: '#334155', borderRadius: '999px', padding: '0.65rem 1rem', minHeight: '44px', fontWeight: '900', cursor: 'pointer' },
  tabButtonActive: { background: 'var(--primary-blue)', borderColor: 'var(--primary-blue)', color: 'white' },
  requestList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  requestItem: { background: 'white', border: '1px solid #dbe3ef', borderRadius: '16px', padding: '1rem' },
  requestMeta: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  categoryPill: { background: '#e0f2fe', color: '#075985', borderRadius: '999px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: '900' },
  statusPill: { background: '#f1f5f9', color: '#334155', borderRadius: '999px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: '900', textTransform: 'capitalize' },
  requestText: { color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.6, margin: 0, fontWeight: '650' },
  requestName: { margin: '0.75rem 0 0', color: '#64748b', fontSize: '0.95rem', fontWeight: '800' },
  emptyText: { color: '#475569', fontWeight: '750', lineHeight: 1.5, margin: 0 },
  dashboardCard: { padding: 'clamp(1rem, 4vw, 2rem)', marginTop: '1.5rem' },
  dashboardHeader: { display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  dashboardTitle: { color: '#0f172a', margin: 0, fontSize: '1.55rem' },
  dashboardSubtitle: { color: '#475569', fontSize: '1rem', margin: '0.4rem 0 0', fontWeight: '700', lineHeight: 1.45 },
  dashboardBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', background: '#dcfce7', color: '#166534', borderRadius: '999px', padding: '0.65rem 1rem', fontWeight: '900', textTransform: 'capitalize' },
  dashboardFilters: { display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1rem' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'white', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '0 0.85rem' },
  searchInput: { width: '100%', border: 'none', minHeight: '50px', fontSize: '1rem', color: '#0f172a', outline: 'none', fontWeight: '700' },
  filterSelect: { width: '100%', minHeight: '52px', borderRadius: '14px', border: '2px solid #cbd5e1', background: 'white', color: '#0f172a', padding: '0.85rem 1rem', fontSize: '1rem', fontWeight: '800' },
  dashboardNotice: { background: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '1rem', marginBottom: '1rem', fontWeight: '800' },
  dashboardList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  dashboardItem: { background: 'white', border: '1px solid #dbe3ef', borderRadius: '18px', padding: '1rem' },
  dashboardItemHeader: { display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  dashboardItemTitle: { color: '#0f172a', margin: 0, fontSize: '1.2rem' },
  dashboardItemMeta: { color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'capitalize' },
  privateContact: { margin: '0.75rem 0 0', color: '#1e3a8a', background: '#eff6ff', borderRadius: '12px', padding: '0.75rem', fontWeight: '850' },
  dashboardControls: { display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' },
  inlineLabel: { display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155', fontWeight: '900', fontSize: '0.95rem' },
  compactSelect: { minHeight: '48px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0.7rem', color: '#0f172a', fontWeight: '800' },
  notesLabel: { display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155', fontWeight: '900', fontSize: '0.95rem' },
  notesInput: { minHeight: '92px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0.75rem', color: '#0f172a', fontWeight: '700', fontSize: '1rem', resize: 'vertical' },
  actionRow: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' },
  secondaryButton: { minHeight: '48px', borderRadius: '12px', border: '2px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '900', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' },
  dangerButton: { minHeight: '48px', borderRadius: '12px', border: '2px solid #fecaca', background: '#fee2e2', color: '#991b1b', fontWeight: '900', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' },
};

export default Prayer;
