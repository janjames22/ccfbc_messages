import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Tag } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import { getGoogleCalendarUrl, getUpcomingEvents } from '../services/eventService';

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

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calendarMessage, setCalendarMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const upcoming = await getUpcomingEvents();
        if (isActive) setEvents(upcoming);
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Unable to load church events right now.');
          setEvents([]);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

  const handleAddToCalendar = (event) => {
    const url = getGoogleCalendarUrl(event);
    if (!url) {
      setCalendarMessage('This event needs a date and start time before it can be added to Google Calendar.');
      return;
    }

    setCalendarMessage('');
    window.open(url, '_blank', 'noopener,noreferrer');
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
          <CalendarDays size={34} />
        </div>
        <h1 style={styles.title}>Church Events</h1>
        <p style={styles.subtitle}>Stay updated with upcoming church activities and services.</p>
      </section>

      <div aria-live="polite">
        {calendarMessage && <div style={styles.notice}>{calendarMessage}</div>}
        {error && <div style={{ ...styles.notice, ...styles.errorNotice }}>{error}</div>}
      </div>

      {loading ? (
        <div className="card-light" style={styles.emptyCard}>
          <p style={styles.emptyText}>Loading upcoming events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card-light" style={styles.emptyCard}>
          <CalendarDays size={54} color="var(--primary-blue)" />
          <p style={styles.emptyText}>No upcoming events yet.</p>
        </div>
      ) : (
        <div style={styles.eventList}>
          {events.map(event => {
            const calendarUrl = getGoogleCalendarUrl(event);
            return (
              <article key={event.id || `${event.title}-${event.event_date}`} className="card-light events-page-card" style={styles.eventCard}>
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
                    <span style={styles.categoryPill}>
                      <Tag size={16} /> {event.category || 'Special Event'}
                    </span>
                  </div>

                  <h2 style={styles.eventTitle}>{event.title}</h2>

                  <div style={styles.detailList}>
                    <p style={styles.detailItem}>
                      <CalendarDays size={20} /> {formatDate(event.event_date)}
                    </p>
                    <p style={styles.detailItem}>
                      <Clock size={20} /> {event.start_time ? `${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}` : 'Time to be announced'}
                    </p>
                    <p style={styles.detailItem}>
                      <MapPin size={20} /> {event.location || 'Location to be announced'}
                    </p>
                  </div>

                  {event.description && <p style={styles.description}>{event.description}</p>}

                  <button
                    type="button"
                    className="btn-large"
                    style={{
                      ...styles.calendarButton,
                      ...(calendarUrl ? {} : styles.calendarButtonDisabled)
                    }}
                    onClick={() => handleAddToCalendar(event)}
                    disabled={!calendarUrl}
                  >
                    <ExternalLink size={20} />
                    Add to Calendar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
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
    background: 'rgba(156, 39, 176, 0.22)',
    color: '#f0abfc',
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
  notice: {
    background: '#eff6ff',
    color: '#1e3a8a',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '1rem',
    fontWeight: '800',
    marginBottom: '1rem',
    lineHeight: 1.45,
  },
  errorNotice: {
    background: '#fee2e2',
    color: '#991b1b',
    borderColor: '#fecaca',
  },
  emptyCard: {
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    textAlign: 'center',
  },
  emptyText: {
    color: '#475569',
    fontWeight: '850',
    fontSize: '1.1rem',
    margin: 0,
  },
  eventList: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.25rem',
    paddingBottom: '2rem',
  },
  eventCard: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    padding: 'clamp(1rem, 4vw, 1.5rem)',
  },
  dateBlock: {
    width: '86px',
    minHeight: '86px',
    borderRadius: '18px',
    background: 'var(--primary-blue)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(15, 95, 180, 0.25)',
  },
  dateMonth: {
    textTransform: 'uppercase',
    fontWeight: '900',
    fontSize: '0.9rem',
    letterSpacing: '0.8px',
  },
  dateDay: {
    fontWeight: '900',
    fontSize: '2rem',
    lineHeight: 1,
  },
  eventContent: {
    minWidth: 0,
  },
  categoryRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  categoryPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: '#f3e8ff',
    color: '#6b21a8',
    borderRadius: '999px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.9rem',
    fontWeight: '900',
  },
  eventTitle: {
    color: '#0f172a',
    margin: '0 0 1rem',
    fontSize: 'clamp(1.45rem, 6vw, 2rem)',
    lineHeight: 1.2,
  },
  detailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    color: '#334155',
    fontWeight: '800',
    fontSize: '1rem',
    lineHeight: 1.45,
    margin: 0,
  },
  description: {
    color: '#0f172a',
    fontSize: '1.05rem',
    lineHeight: 1.65,
    margin: '0 0 1.25rem',
    fontWeight: '600',
  },
  calendarButton: {
    width: '100%',
    minHeight: '54px',
    background: 'var(--primary-blue)',
    color: 'white',
    borderRadius: '16px',
  },
  calendarButtonDisabled: {
    background: '#94a3b8',
    color: '#f8fafc',
    cursor: 'not-allowed',
    opacity: 0.8,
  },
};

export default Events;
