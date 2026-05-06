import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export const PRAYER_STATUSES = ['pending', 'praying', 'answered', 'archived'];
export const PRAYER_PRIVACY = ['public', 'private'];

const PUBLIC_SELECT = 'id,name,request_text,category,privacy,status,created_at,updated_at,archived_at';
const DASHBOARD_SELECT = 'id,name,contact,request_text,category,privacy,status,admin_notes,created_at,updated_at,archived_at,archived_by';

const normalizePrivacy = (privacy) => (privacy === 'public' ? 'public' : 'private');
const normalizeStatus = (status) => (PRAYER_STATUSES.includes(status) ? status : 'pending');

const friendlyPrayerError = (error, fallback) => {
  console.warn(fallback, error?.message || error);
  return new Error(fallback);
};

export const normalizePrayerRequest = (request) => ({
  ...request,
  request: request?.request_text || request?.request || '',
  request_text: request?.request_text || request?.request || '',
  category: request?.category || 'General',
  privacy: normalizePrivacy(request?.privacy),
  status: normalizeStatus(request?.status),
});

const stripPrivateFields = (request) => {
  const safeRequest = normalizePrayerRequest(request);
  delete safeRequest.contact;
  delete safeRequest.admin_notes;
  delete safeRequest.archived_by;
  return safeRequest;
};

export const createPrayerRequest = async (data) => {
  if (!isSupabaseConfigured) {
    throw new Error('Prayer requests are not connected yet. Please configure Supabase and run the prayer SQL setup.');
  }

  const payload = {
    name: String(data.name || '').trim(),
    contact: String(data.contact || '').trim() || null,
    request_text: String(data.request || data.request_text || '').trim(),
    category: data.category || 'General',
    privacy: normalizePrivacy(data.privacy)
  };

  if (!payload.name || !payload.request_text) {
    throw new Error('Please enter your name and prayer request.');
  }

  const { error } = await supabase
    .from('prayer_requests')
    .insert(payload);

  if (error) {
    throw friendlyPrayerError(error, 'Unable to submit your prayer request right now.');
  }

  return stripPrivateFields({
    ...payload,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};

export const getPublicPrayerRequests = async ({ archived = false, limit = 30 } = {}) => {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from('prayer_requests')
      .select(PUBLIC_SELECT)
      .eq('privacy', 'public')
      .order(archived ? 'archived_at' : 'created_at', { ascending: false })
      .limit(limit);

    query = archived
      ? query.eq('status', 'archived')
      : query.neq('status', 'archived');

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(stripPrivateFields);
  } catch (error) {
    console.warn('Unable to load public prayer requests:', error.message);
    return [];
  }
};

export const getPrayerRequestsForDashboard = async ({ privacy = 'all', status = 'all', search = '' } = {}) => {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from('prayer_requests')
      .select(DASHBOARD_SELECT)
      .order('created_at', { ascending: false });

    if (privacy !== 'all') query = query.eq('privacy', privacy);
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const normalizedSearch = search.trim().toLowerCase();
    const requests = (data || []).map(normalizePrayerRequest);

    if (!normalizedSearch) return requests;

    return requests.filter(request => {
      return [
        request.name,
        request.category,
        request.privacy,
        request.status,
        request.request_text,
        request.created_at
      ].some(value => String(value || '').toLowerCase().includes(normalizedSearch));
    });
  } catch (error) {
    throw friendlyPrayerError(error, 'Unable to load prayer requests for management.');
  }
};

export const updatePrayerRequest = async (id, data) => {
  if (!isSupabaseConfigured) {
    throw new Error('Prayer request management is not connected yet.');
  }

  const payload = {};
  if (data.status) payload.status = normalizeStatus(data.status);
  if (data.admin_notes !== undefined) payload.admin_notes = data.admin_notes || null;
  if (data.privacy) payload.privacy = normalizePrivacy(data.privacy);
  if (data.category) payload.category = data.category;
  if (data.request_text) payload.request_text = data.request_text;
  if (data.name) payload.name = data.name;
  if (data.contact !== undefined) payload.contact = data.contact || null;
  if (data.archived_at !== undefined) payload.archived_at = data.archived_at;
  if (data.archived_by !== undefined) payload.archived_by = data.archived_by;

  const { data: updated, error } = await supabase
    .from('prayer_requests')
    .update(payload)
    .eq('id', id)
    .select(DASHBOARD_SELECT)
    .single();

  if (error) {
    throw friendlyPrayerError(error, 'Unable to update this prayer request.');
  }

  return normalizePrayerRequest(updated);
};

export const archivePrayerRequest = async (id, userId) => {
  return updatePrayerRequest(id, {
    status: 'archived',
    archived_at: new Date().toISOString(),
    archived_by: userId || null
  });
};

export const unarchivePrayerRequest = async (id) => {
  return updatePrayerRequest(id, {
    status: 'pending',
    archived_at: null,
    archived_by: null
  });
};

export const deletePrayerRequest = async (id) => {
  if (!isSupabaseConfigured) {
    throw new Error('Prayer request management is not connected yet.');
  }

  const { error } = await supabase
    .from('prayer_requests')
    .delete()
    .eq('id', id);

  if (error) {
    throw friendlyPrayerError(error, 'Unable to delete this prayer request.');
  }

  return true;
};

export const getPrayerRequestsForAdmin = getPrayerRequestsForDashboard;
