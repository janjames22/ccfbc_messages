import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const PUBLIC_SELECT = 'id,name,request,category,privacy,is_answered,created_at';

const normalizePrivacy = (privacy) => (privacy === 'public' ? 'public' : 'private');

export const createPrayerRequest = async (data) => {
  if (!isSupabaseConfigured) {
    throw new Error('Prayer requests are not connected yet. Please configure Supabase and run the prayer_requests SQL setup.');
  }

  const payload = {
    name: String(data.name || '').trim(),
    contact: String(data.contact || '').trim() || null,
    request: String(data.request || '').trim(),
    category: data.category || 'Other',
    privacy: normalizePrivacy(data.privacy),
    is_answered: false
  };

  if (!payload.name || !payload.request) {
    throw new Error('Please enter your name and prayer request.');
  }

  const { error } = await supabase
    .from('prayer_requests')
    .insert(payload);

  if (error) {
    throw new Error(error.message || 'Unable to submit your prayer request right now.');
  }

  return {
    ...payload,
    contact: undefined,
    created_at: new Date().toISOString()
  };
};

export const getPublicPrayerRequests = async () => {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select(PUBLIC_SELECT)
      .eq('privacy', 'public')
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;

    return (data || []).map(request => {
      const safeRequest = { ...request };
      delete safeRequest.contact;
      return safeRequest;
    });
  } catch (error) {
    console.warn('Unable to load public prayer requests:', error.message);
    return [];
  }
};

export const getPrayerRequestsForAdmin = async () => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Unable to load prayer requests.');
  }

  return data || [];
};
