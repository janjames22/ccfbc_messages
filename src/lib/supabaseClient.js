import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

// Mock supabase client to prevent crashes when environment variables are missing
const mockSupabase = {
  from: () => ({
    select: () => ({
      order: () => ({
        limit: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          then: (cb) => Promise.resolve({ data: [], error: null }).then(cb)
        }),
        then: (cb) => Promise.resolve({ data: [], error: null }).then(cb)
      }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    insert: () => Promise.resolve({ error: null })
  })
};

// Robust check for Supabase credentials
const isValidUrl = supabaseUrl && typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');
const isValidKey = supabaseAnonKey && typeof supabaseAnonKey === 'string';

export const supabase = (isValidUrl && isValidKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;
