import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const pad = (value) => String(value).padStart(2, '0');

const toDateInput = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

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
      category: 'Worship Service'
    },
    {
      id: 'sample-prayer-meeting',
      title: 'Midweek Prayer Meeting',
      description: 'A quiet time to pray together for our church family and community.',
      event_date: toDateInput(prayerMeeting),
      start_time: '19:00',
      end_time: '20:00',
      location: 'CCFBC Prayer Room',
      category: 'Prayer Meeting'
    }
  ];
};

const eventStartsAt = (event) => {
  return new Date(`${event.event_date}T${event.start_time || '00:00'}:00`);
};

const sortUpcoming = (events) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...events]
    .filter(event => event.event_date && eventStartsAt(event) >= today)
    .sort((a, b) => eventStartsAt(a) - eventStartsAt(b));
};

export const getUpcomingEvents = async () => {
  if (!isSupabaseConfigured) {
    return sortUpcoming(sampleEvents());
  }

  try {
    const today = toDateInput(new Date());
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return sortUpcoming(data || []);
  } catch (error) {
    console.warn('Unable to load events from Supabase; using sample events:', error.message);
    return sortUpcoming(sampleEvents());
  }
};

export const createEvent = async (data) => {
  if (!isSupabaseConfigured) {
    throw new Error('Events are not connected yet. Please configure Supabase and run the events SQL setup.');
  }

  const { data: created, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message || 'Unable to create event.');
  return created;
};

export const updateEvent = async (id, data) => {
  if (!isSupabaseConfigured) {
    throw new Error('Events are not connected yet.');
  }

  const { data: updated, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message || 'Unable to update event.');
  return updated;
};

export const deleteEvent = async (id) => {
  if (!isSupabaseConfigured) {
    throw new Error('Events are not connected yet.');
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message || 'Unable to delete event.');
  return true;
};

export const getGoogleCalendarUrl = (event) => {
  if (!event?.event_date || !event?.start_time) return null;

  const start = new Date(`${event.event_date}T${event.start_time}:00`);
  if (Number.isNaN(start.getTime())) return null;

  const end = event.end_time
    ? new Date(`${event.event_date}T${event.end_time}:00`)
    : new Date(start.getTime() + 60 * 60 * 1000);

  if (Number.isNaN(end.getTime()) || end <= start) return null;

  const formatGoogleDate = (date) => date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Church Event',
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: event.description || '',
    location: event.location || ''
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
