import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export const EVENT_STATUSES = ['upcoming', 'completed', 'archived', 'cancelled'];
export const EVENT_CATEGORIES = [
  'Worship Service',
  'Prayer Meeting',
  'Bible Study',
  'Youth Fellowship',
  'Outreach',
  'Special Event'
];

const pad = (value) => String(value).padStart(2, '0');

export const toDateInput = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const normalizeStatus = (status) => (EVENT_STATUSES.includes(status) ? status : 'upcoming');

const sampleEvents = () => {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));

  const prayerMeeting = new Date(now);
  prayerMeeting.setDate(now.getDate() + 3);

  return [
    {
      id: 'sample-sunday-service',
      title: 'Sunday Worship Service',
      description: 'Join us for worship, fellowship, and the preaching of God\'s Word.',
      event_date: toDateInput(sunday),
      start_time: '09:30',
      end_time: '11:30',
      location: 'CCFBC Sanctuary',
      category: 'Worship Service',
      is_published: true,
      status: 'upcoming'
    },
    {
      id: 'sample-prayer-meeting',
      title: 'Midweek Prayer Meeting',
      description: 'A quiet time to pray together for our church family and community.',
      event_date: toDateInput(prayerMeeting),
      start_time: '19:00',
      end_time: '20:00',
      location: 'CCFBC Prayer Room',
      category: 'Prayer Meeting',
      is_published: true,
      status: 'upcoming'
    }
  ];
};

const eventStartsAt = (event) => {
  return new Date(`${event.event_date}T${event.start_time || '00:00'}:00`);
};

const sortEvents = (events) => {
  return [...events].sort((a, b) => eventStartsAt(a) - eventStartsAt(b));
};

const normalizeEvent = (event) => ({
  ...event,
  status: normalizeStatus(event?.status),
  category: event?.category || 'Special Event',
  is_published: event?.is_published !== false
});

const friendlyEventError = (error, fallback) => {
  console.warn(fallback, error?.message || error);
  return new Error(fallback);
};

export const getUpcomingEvents = async () => {
  if (!isSupabaseConfigured) {
    return sortEvents(sampleEvents());
  }

  try {
    const today = toDateInput(new Date());
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'upcoming')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return sortEvents((data || []).map(normalizeEvent));
  } catch (error) {
    console.warn('Unable to load events from Supabase; using sample events:', error.message);
    return sortEvents(sampleEvents());
  }
};

export const getArchivedEvents = async () => {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .in('status', ['completed', 'archived'])
      .order('event_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeEvent);
  } catch (error) {
    console.warn('Unable to load archived events:', error.message);
    return [];
  }
};

export const getEventsForAdmin = async ({ status = 'all', search = '' } = {}) => {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const normalizedSearch = search.trim().toLowerCase();
    const events = (data || []).map(normalizeEvent);

    if (!normalizedSearch) return events;

    return events.filter(event => {
      return [
        event.title,
        event.description,
        event.location,
        event.category,
        event.status,
        event.event_date
      ].some(value => String(value || '').toLowerCase().includes(normalizedSearch));
    });
  } catch (error) {
    throw friendlyEventError(error, 'Unable to load events for management.');
  }
};

export const createEvent = async (data, userId) => {
  if (!isSupabaseConfigured) {
    throw new Error('Events are not connected yet. Please configure Supabase and run the events SQL setup.');
  }

  const payload = normalizeEvent({
    ...data,
    title: String(data.title || '').trim(),
    description: String(data.description || '').trim() || null,
    location: String(data.location || '').trim() || null,
    image_url: String(data.image_url || '').trim() || null,
    created_by: userId || null
  });

  if (!payload.title || !payload.event_date) {
    throw new Error('Please enter an event title and date.');
  }

  const { data: created, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single();

  if (error) throw friendlyEventError(error, 'Unable to create this event.');
  return normalizeEvent(created);
};

export const updateEvent = async (id, data) => {
  if (!isSupabaseConfigured) {
    throw new Error('Events are not connected yet.');
  }

  const payload = {};
  if (data.title !== undefined) payload.title = String(data.title || '').trim();
  if (data.description !== undefined) payload.description = String(data.description || '').trim() || null;
  if (data.event_date !== undefined) payload.event_date = data.event_date;
  if (data.start_time !== undefined) payload.start_time = data.start_time || null;
  if (data.end_time !== undefined) payload.end_time = data.end_time || null;
  if (data.location !== undefined) payload.location = String(data.location || '').trim() || null;
  if (data.category !== undefined) payload.category = data.category || 'Special Event';
  if (data.image_url !== undefined) payload.image_url = String(data.image_url || '').trim() || null;
  if (data.is_published !== undefined) payload.is_published = Boolean(data.is_published);
  if (data.status !== undefined) payload.status = normalizeStatus(data.status);

  const { data: updated, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw friendlyEventError(error, 'Unable to update this event.');
  return normalizeEvent(updated);
};

export const archiveEvent = async (id) => updateEvent(id, { status: 'archived' });

export const deleteEvent = async (id) => {
  if (!isSupabaseConfigured) {
    throw new Error('Events are not connected yet.');
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw friendlyEventError(error, 'Unable to delete this event.');
  return true;
};

const formatGoogleDate = (date) => date
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\.\d{3}Z$/, 'Z');

export const getGoogleCalendarUrl = (event) => {
  if (!event?.event_date) return null;

  let dates;

  if (event.start_time) {
    const start = new Date(`${event.event_date}T${event.start_time}:00`);
    if (Number.isNaN(start.getTime())) return null;

    const end = event.end_time
      ? new Date(`${event.event_date}T${event.end_time}:00`)
      : new Date(start.getTime() + 60 * 60 * 1000);

    if (Number.isNaN(end.getTime()) || end <= start) return null;
    dates = `${formatGoogleDate(start)}/${formatGoogleDate(end)}`;
  } else {
    const start = new Date(`${event.event_date}T00:00:00`);
    if (Number.isNaN(start.getTime())) return null;
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    dates = `${event.event_date.replace(/-/g, '')}/${toDateInput(end).replace(/-/g, '')}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Church Event',
    dates,
    details: event.description || '',
    location: event.location || ''
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
