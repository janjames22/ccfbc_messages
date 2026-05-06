import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  PlusCircle,
  Save,
  Search,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../contexts/AuthContext';
import {
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  archiveEvent,
  createEvent,
  deleteEvent,
  getArchivedEvents,
  getEventsForAdmin,
  getGoogleCalendarUrl,
  getUpcomingEvents,
  updateEvent
} from '../services/eventService';

const initialEventForm = {
  title: '',
  description: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location: '',
  category: 'Worship Service',
  image_url: '',
  is_published: true,
  status: 'upcoming'
};

const formatDate = (dateString) => {
  if (!dateString) return 'Date to be announced';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hour, minute] = timeString.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute || 0), 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });
};

const EventCard = ({ event, archived = false, onAddToCalendar }) => {
  const calendarUrl = getGoogleCalendarUrl(event);

  return (
    <article className="card-light events-page-card" style={styles.eventCard}>
      {event.image_url && <img src={event.image_url} alt="" style={styles.eventImage} />}
      <div style={styles.dateBlock}>
        <span style={styles.dateMonth}>
          {new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}
        </span>
        <span style={styles.dateDay}>
          {new Date(`${event.event_date}T00:00:00`).getDate()}
        </span>
      </div>

      <div style={styles.eventContent}>
        <div style={styles.categoryRow}>
          <span style={styles.categoryPill}><Tag size={16} /> {event.category || 'Special Event'}</span>
          {archived && <span style={styles.statusPill}>{event.status}</span>}
        </div>

        <h2 style={styles.eventTitle}>{event.title}</h2>
        <div style={styles.detailList}>
          <p style={styles.detailItem}><CalendarDays size={20} /> {formatDate(event.event_date)}</p>
          <p style={styles.detailItem}><Clock size={20} /> {event.start_time ? `${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}` : 'All-day event'}</p>
          <p style={styles.detailItem}><MapPin size={20} /> {event.location || 'Location to be announced'}</p>
        </div>

        {event.description && <p style={styles.description}>{event.description}</p>}

        <button
          type="button"
          className="btn-large"
          style={{ ...styles.calendarButton, ...(calendarUrl ? {} : styles.calendarButtonDisabled) }}
          onClick={() => onAddToCalendar(event)}
          disabled={!calendarUrl}
        >
          <ExternalLink size={20} />
          Add to Google Calendar
        </button>
      </div>
    </article>
  );
};

const Events = () => {
  const { user, isAdmin, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calendarMessage, setCalendarMessage] = useState('');
  const [adminEvents, setAdminEvents] = useState([]);
  const [adminStatus, setAdminStatus] = useState('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [eventForm, setEventForm] = useState(initialEventForm);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [upcoming, archived] = await Promise.all([
        getUpcomingEvents(),
        getArchivedEvents()
      ]);
      setEvents(upcoming);
      setArchivedEvents(archived);
    } catch (err) {
      setError(err.message || 'Unable to load church events right now.');
      setEvents([]);
      setArchivedEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdminEvents = useCallback(async () => {
    if (!isAdmin) return;

    setLoadingAdmin(true);
    setAdminMessage('');
    try {
      const loaded = await getEventsForAdmin({ status: adminStatus, search: adminSearch });
      setAdminEvents(loaded);
    } catch (err) {
      setAdminMessage(err.message || 'Unable to load events for management.');
      setAdminEvents([]);
    } finally {
      setLoadingAdmin(false);
    }
  }, [adminSearch, adminStatus, isAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadEvents();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAdminEvents();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAdminEvents]);

  const handleAddToCalendar = (event) => {
    const url = getGoogleCalendarUrl(event);
    if (!url) {
      setCalendarMessage('This event needs a valid date before it can be added to Google Calendar.');
      return;
    }

    setCalendarMessage('');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const updateForm = (field, value) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setEventForm(initialEventForm);
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date || '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      category: event.category || 'Worship Service',
      image_url: event.image_url || '',
      is_published: event.is_published !== false,
      status: event.status || 'upcoming'
    });
  };

  const handleSubmitEvent = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (!eventForm.title.trim() || !eventForm.event_date) {
      setAdminMessage('Please enter an event title and date.');
      return;
    }

    setSaving(true);
    setAdminMessage('');
    try {
      if (editingId) {
        await updateEvent(editingId, eventForm);
        setAdminMessage('Event updated.');
      } else {
        await createEvent(eventForm, user?.id);
        setAdminMessage('Event created.');
      }
      resetForm();
      await loadEvents();
      await loadAdminEvents();
    } catch (err) {
      setAdminMessage(err.message || 'Unable to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (event) => {
    setAdminMessage('');
    try {
      await archiveEvent(event.id);
      setAdminMessage('Event archived.');
      await loadEvents();
      await loadAdminEvents();
    } catch (err) {
      setAdminMessage(err.message || 'Unable to archive event.');
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;

    setAdminMessage('');
    try {
      await deleteEvent(event.id);
      setAdminMessage('Event deleted.');
      await loadEvents();
      await loadAdminEvents();
    } catch (err) {
      setAdminMessage(err.message || 'Unable to delete event.');
    }
  };

  const handlePublishToggle = async (event) => {
    setAdminMessage('');
    try {
      await updateEvent(event.id, { is_published: !event.is_published });
      setAdminMessage(event.is_published ? 'Event unpublished.' : 'Event published.');
      await loadAdminEvents();
      await loadEvents();
    } catch (err) {
      setAdminMessage(err.message || 'Unable to update publish status.');
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
        <div style={styles.heroIcon}><CalendarDays size={34} /></div>
        <h1 style={styles.title}>Church Events</h1>
        <p style={styles.subtitle}>Stay updated with upcoming church activities and services.</p>
      </section>

      <div aria-live="polite">
        {calendarMessage && <div style={styles.notice}>{calendarMessage}</div>}
        {error && <div style={{ ...styles.notice, ...styles.errorNotice }}>{error}</div>}
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Upcoming Events</h2>
        {loading ? (
          <div className="card-light" style={styles.emptyCard}><p style={styles.emptyText}>Loading upcoming events...</p></div>
        ) : events.length === 0 ? (
          <div className="card-light" style={styles.emptyCard}><CalendarDays size={54} color="var(--primary-blue)" /><p style={styles.emptyText}>No upcoming events yet.</p></div>
        ) : (
          <div style={styles.eventList}>
            {events.map(event => <EventCard key={event.id} event={event} onAddToCalendar={handleAddToCalendar} />)}
          </div>
        )}
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Past / Archived Events</h2>
        {loading ? (
          <div className="card-light" style={styles.emptyCard}><p style={styles.emptyText}>Loading archived events...</p></div>
        ) : archivedEvents.length === 0 ? (
          <div className="card-light" style={styles.emptyCard}><p style={styles.emptyText}>No archived events yet.</p></div>
        ) : (
          <div style={styles.eventList}>
            {archivedEvents.map(event => <EventCard key={event.id} event={event} archived onAddToCalendar={handleAddToCalendar} />)}
          </div>
        )}
      </section>

      {isAdmin && (
        <section className="card-light" style={styles.adminCard}>
          <div style={styles.adminHeader}>
            <div>
              <h2 style={styles.adminTitle}>Event Management</h2>
              <p style={styles.adminSubtitle}>Signed in as {role}. Admin and pastor accounts can manage events.</p>
            </div>
          </div>

          <form onSubmit={handleSubmitEvent} style={styles.eventForm}>
            <div className="event-admin-grid" style={styles.formGrid}>
              <label style={styles.label}>Title
                <input value={eventForm.title} onChange={(event) => updateForm('title', event.target.value)} style={styles.input} />
              </label>
              <label style={styles.label}>Date
                <input type="date" value={eventForm.event_date} onChange={(event) => updateForm('event_date', event.target.value)} style={styles.input} />
              </label>
              <label style={styles.label}>Start Time
                <input type="time" value={eventForm.start_time} onChange={(event) => updateForm('start_time', event.target.value)} style={styles.input} />
              </label>
              <label style={styles.label}>End Time
                <input type="time" value={eventForm.end_time} onChange={(event) => updateForm('end_time', event.target.value)} style={styles.input} />
              </label>
              <label style={styles.label}>Location
                <input value={eventForm.location} onChange={(event) => updateForm('location', event.target.value)} style={styles.input} />
              </label>
              <label style={styles.label}>Category
                <select value={eventForm.category} onChange={(event) => updateForm('category', event.target.value)} style={styles.input}>
                  {EVENT_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label style={styles.label}>Status
                <select value={eventForm.status} onChange={(event) => updateForm('status', event.target.value)} style={styles.input}>
                  {EVENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label style={styles.label}>Image URL
                <input value={eventForm.image_url} onChange={(event) => updateForm('image_url', event.target.value)} style={styles.input} />
              </label>
            </div>

            <label style={styles.label}>Description
              <textarea value={eventForm.description} onChange={(event) => updateForm('description', event.target.value)} rows={4} style={styles.textarea} />
            </label>

            <label style={styles.publishToggle}>
              <input type="checkbox" checked={eventForm.is_published} onChange={(event) => updateForm('is_published', event.target.checked)} />
              <span>{eventForm.is_published ? <Eye size={20} /> : <EyeOff size={20} />} Published publicly</span>
            </label>

            <div style={styles.formActions}>
              <button type="submit" className="btn-large" style={styles.saveButton} disabled={saving}>
                {editingId ? <Save size={20} /> : <PlusCircle size={20} />}
                {saving ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={styles.cancelButton}>
                  <X size={20} /> Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div style={styles.adminFilters}>
            <div style={styles.searchWrap}>
              <Search size={20} color="#64748b" />
              <input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search events..." style={styles.searchInput} />
            </div>
            <select value={adminStatus} onChange={(event) => setAdminStatus(event.target.value)} style={styles.input}>
              <option value="all">All statuses</option>
              {EVENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          <div aria-live="polite">{adminMessage && <div style={styles.notice}>{adminMessage}</div>}</div>

          {loadingAdmin ? (
            <p style={styles.emptyText}>Loading admin events...</p>
          ) : adminEvents.length === 0 ? (
            <p style={styles.emptyText}>No events found for this view.</p>
          ) : (
            <div style={styles.adminList}>
              {adminEvents.map(event => (
                <article key={event.id} style={styles.adminItem}>
                  <div style={styles.adminItemHeader}>
                    <div>
                      <h3 style={styles.adminItemTitle}>{event.title}</h3>
                      <p style={styles.adminItemMeta}>{formatDate(event.event_date)} • {event.status} • {event.is_published ? 'Published' : 'Hidden'}</p>
                    </div>
                    <span style={styles.statusPill}>{event.category}</span>
                  </div>
                  <div style={styles.adminActions}>
                    <button type="button" onClick={() => handleEdit(event)} style={styles.secondaryButton}><Edit size={18} /> Edit</button>
                    <button type="button" onClick={() => handleArchive(event)} style={styles.secondaryButton}><Archive size={18} /> Archive</button>
                    <button type="button" onClick={() => handlePublishToggle(event)} style={styles.secondaryButton}>
                      {event.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                      {event.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button type="button" onClick={() => handleDelete(event)} style={styles.dangerButton}><Trash2 size={18} /> Delete</button>
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
  heroIcon: { width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(156, 39, 176, 0.22)', color: '#f0abfc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { margin: 0, fontSize: 'clamp(2rem, 10vw, 3.5rem)' },
  subtitle: { maxWidth: '720px', color: 'var(--text-soft)', fontSize: 'var(--font-base)', lineHeight: 1.55, margin: 0 },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: 'clamp(1.5rem, 7vw, 2.2rem)', marginBottom: '1rem' },
  notice: { background: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '1rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.45 },
  errorNotice: { background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' },
  emptyCard: { padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' },
  emptyText: { color: '#475569', fontWeight: '850', fontSize: '1.1rem', margin: 0 },
  eventList: { display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', paddingBottom: '1rem' },
  eventCard: { display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', padding: 'clamp(1rem, 4vw, 1.5rem)' },
  eventImage: { width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: '16px', gridColumn: '1 / -1' },
  dateBlock: { width: '86px', minHeight: '86px', borderRadius: '18px', background: 'var(--primary-blue)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(15, 95, 180, 0.25)' },
  dateMonth: { textTransform: 'uppercase', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.8px' },
  dateDay: { fontWeight: '900', fontSize: '2rem', lineHeight: 1 },
  eventContent: { minWidth: 0 },
  categoryRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' },
  categoryPill: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f3e8ff', color: '#6b21a8', borderRadius: '999px', padding: '0.4rem 0.75rem', fontSize: '0.9rem', fontWeight: '900' },
  statusPill: { display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', color: '#334155', borderRadius: '999px', padding: '0.4rem 0.75rem', fontSize: '0.9rem', fontWeight: '900', textTransform: 'capitalize' },
  eventTitle: { color: '#0f172a', margin: '0 0 1rem', fontSize: 'clamp(1.45rem, 6vw, 2rem)', lineHeight: 1.2 },
  detailList: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' },
  detailItem: { display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: '#334155', fontWeight: '800', fontSize: '1rem', lineHeight: 1.45, margin: 0 },
  description: { color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.65, margin: '0 0 1.25rem', fontWeight: '600' },
  calendarButton: { width: '100%', minHeight: '54px', background: 'var(--primary-blue)', color: 'white', borderRadius: '16px' },
  calendarButtonDisabled: { background: '#94a3b8', color: '#f8fafc', cursor: 'not-allowed', opacity: 0.8 },
  adminCard: { padding: 'clamp(1rem, 4vw, 2rem)', marginTop: '1rem' },
  adminHeader: { display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' },
  adminTitle: { color: '#0f172a', margin: 0, fontSize: '1.55rem' },
  adminSubtitle: { color: '#475569', margin: '0.4rem 0 0', fontWeight: '750', lineHeight: 1.45 },
  eventForm: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.45rem', color: '#0f172a', fontWeight: '900', fontSize: '0.98rem' },
  input: { width: '100%', minHeight: '52px', borderRadius: '14px', border: '2px solid #cbd5e1', background: 'white', color: '#0f172a', padding: '0.85rem 1rem', fontSize: '1rem', fontWeight: '750', outline: 'none' },
  textarea: { width: '100%', minHeight: '120px', borderRadius: '14px', border: '2px solid #cbd5e1', background: 'white', color: '#0f172a', padding: '0.85rem 1rem', fontSize: '1rem', fontWeight: '700', lineHeight: 1.55, resize: 'vertical' },
  publishToggle: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontWeight: '900' },
  formActions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  saveButton: { background: 'var(--primary-blue)', color: 'white', width: '100%', borderRadius: '16px' },
  cancelButton: { minHeight: '54px', borderRadius: '16px', border: '2px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '900', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  adminFilters: { display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1rem' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'white', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '0 0.85rem' },
  searchInput: { width: '100%', border: 'none', minHeight: '50px', fontSize: '1rem', color: '#0f172a', outline: 'none', fontWeight: '700' },
  adminList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  adminItem: { background: 'white', border: '1px solid #dbe3ef', borderRadius: '18px', padding: '1rem' },
  adminItemHeader: { display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  adminItemTitle: { color: '#0f172a', margin: 0, fontSize: '1.2rem' },
  adminItemMeta: { color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'capitalize' },
  adminActions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  secondaryButton: { minHeight: '48px', borderRadius: '12px', border: '2px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '900', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' },
  dangerButton: { minHeight: '48px', borderRadius: '12px', border: '2px solid #fecaca', background: '#fee2e2', color: '#991b1b', fontWeight: '900', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' },
};

export default Events;
