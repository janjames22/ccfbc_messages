import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (activeUser) => {
    if (!activeUser || !isSupabaseConfigured) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id,email,role')
        .eq('user_id', activeUser.id)
        .single();

      if (error) throw error;
      setProfile(data || null);
      return data || null;
    } catch (error) {
      console.warn('Unable to load user role profile:', error.message);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      await loadProfile(activeUser);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      await loadProfile(activeUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();
  const role = profile?.role || (user ? 'admin' : 'public');
  const isAdmin = role === 'admin' || role === 'pastor';
  const isPastor = role === 'pastor';

  return (
    <AuthContext.Provider value={{ user, profile, role, isAdmin, isPastor, loading, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
