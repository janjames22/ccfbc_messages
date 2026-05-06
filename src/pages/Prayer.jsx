import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, HeartHandshake, Lock, Send, Users } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import { createPrayerRequest, getPublicPrayerRequests } from '../services/prayerService';

const categories = ['Healing', 'Family', 'Guidance', 'Thanksgiving', 'Salvation', 'Other'];

const initialForm = {
  name: '',
  contact: '',
  request: '',
  category: 'Healing',
  privacy: 'private'
};

const Prayer = () => {
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [publicRequests, setPublicRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const publicRequestCount = useMemo(() => publicRequests.length, [publicRequests]);

  const loadPublicRequests = async () => {
    setLoadingRequests(true);
    const requests = await getPublicPrayerRequests();
    setPublicRequests(requests);
    setLoadingRequests(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPublicRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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

      if (created.privacy === 'public') {
        setPublicRequests(prev => [
          {
            ...created,
            id: `local-${Date.now()}`
          },
          ...prev
        ]);
      }

      loadPublicRequests();
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error.message || 'Unable to submit your prayer request right now.'
      });
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
            <p style={styles.helpText}>Optional. This will never be shown publicly.</p>
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
            <p>Private requests and contact details are kept out of the public list.</p>
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
              <p style={styles.publicCount}>{publicRequestCount} request{publicRequestCount === 1 ? '' : 's'}</p>
            </div>
          </div>

          {loadingRequests ? (
            <p style={styles.emptyText}>Loading prayer requests...</p>
          ) : publicRequests.length === 0 ? (
            <p style={styles.emptyText}>No public prayer requests yet.</p>
          ) : (
            <div style={styles.requestList}>
              {publicRequests.map(request => (
                <article key={request.id || `${request.name}-${request.created_at}`} style={styles.requestItem}>
                  <div style={styles.requestMeta}>
                    <span style={styles.categoryPill}>{request.category || 'Other'}</span>
                    {request.is_answered && <span style={styles.answeredPill}>Answered</span>}
                  </div>
                  <p style={styles.requestText}>{request.request}</p>
                  <p style={styles.requestName}>Submitted by {request.name}</p>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  );
};

const styles = {
  topBar: {
    display: 'flex',
    marginBottom: '1rem',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    color: 'var(--light-blue)',
    fontWeight: '900',
    minHeight: '44px',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  heroIcon: {
    width: '58px',
    height: '58px',
    borderRadius: '18px',
    background: 'rgba(76, 175, 80, 0.18)',
    color: '#86efac',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 10vw, 3.5rem)',
  },
  subtitle: {
    maxWidth: '720px',
    color: 'var(--text-soft)',
    fontSize: 'var(--font-base)',
    lineHeight: 1.55,
    margin: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.25rem',
    width: '100%',
  },
  formCard: {
    padding: 'clamp(1rem, 4vw, 2rem)',
  },
  messageArea: {
    minHeight: '0.5rem',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '14px',
    fontWeight: '800',
    marginBottom: '1rem',
    fontSize: '1rem',
  },
  alertSuccess: {
    background: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
  },
  alertError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
    minWidth: 0,
  },
  label: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    minHeight: '52px',
    borderRadius: '14px',
    border: '2px solid #cbd5e1',
    background: 'white',
    color: '#0f172a',
    padding: '0.85rem 1rem',
    fontSize: '1.05rem',
    fontWeight: '650',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    minHeight: '150px',
    borderRadius: '14px',
    border: '2px solid #cbd5e1',
    background: 'white',
    color: '#0f172a',
    padding: '0.85rem 1rem',
    fontSize: '1.05rem',
    fontWeight: '650',
    lineHeight: 1.55,
    resize: 'vertical',
    outline: 'none',
  },
  inputError: {
    borderColor: '#ef4444',
    background: '#fff7f7',
  },
  fieldError: {
    color: '#b91c1c',
    fontSize: '0.95rem',
    fontWeight: '800',
    margin: 0,
  },
  helpText: {
    color: '#475569',
    fontSize: '0.95rem',
    lineHeight: 1.4,
    margin: 0,
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.25rem',
  },
  privacyNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    background: '#eff6ff',
    color: '#1e3a8a',
    border: '1px solid #bfdbfe',
    borderRadius: '14px',
    padding: '1rem',
    marginBottom: '1.25rem',
    fontWeight: '750',
    fontSize: '0.95rem',
    lineHeight: 1.45,
  },
  submitButton: {
    width: '100%',
    background: 'var(--primary-blue)',
    color: 'white',
    minHeight: '58px',
    borderRadius: '16px',
  },
  publicCard: {
    padding: 'clamp(1rem, 4vw, 1.5rem)',
    alignSelf: 'start',
  },
  publicHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  publicIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: '#dbeafe',
    color: 'var(--primary-blue)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  publicTitle: {
    color: '#0f172a',
    margin: 0,
    fontSize: '1.4rem',
  },
  publicCount: {
    margin: '0.25rem 0 0',
    color: '#475569',
    fontWeight: '750',
    fontSize: '0.95rem',
  },
  requestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestItem: {
    background: 'white',
    border: '1px solid #dbe3ef',
    borderRadius: '16px',
    padding: '1rem',
  },
  requestMeta: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
  },
  categoryPill: {
    background: '#e0f2fe',
    color: '#075985',
    borderRadius: '999px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.85rem',
    fontWeight: '900',
  },
  answeredPill: {
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '999px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.85rem',
    fontWeight: '900',
  },
  requestText: {
    color: '#0f172a',
    fontSize: '1.05rem',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: '650',
  },
  requestName: {
    margin: '0.75rem 0 0',
    color: '#64748b',
    fontSize: '0.95rem',
    fontWeight: '800',
  },
  emptyText: {
    color: '#475569',
    fontWeight: '750',
    lineHeight: 1.5,
    margin: 0,
  },
};

export default Prayer;
