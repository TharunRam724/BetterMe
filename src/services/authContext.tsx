import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { validateEmailForAuth } from '../utils/validationUtils';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null; user: User | null; session: Session | null; requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch initial persistent session
    let isMounted = true;

    async function getInitialSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching Supabase session:', error.message);
        }
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    getInitialSession();

    // 2. Listen to real-time auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);

    const validation = validateEmailForAuth(email);
    if (!validation.isValid) {
      const errorMsg = validation.error || 'Please enter a valid email address.';
      setAuthError(errorMsg);
      return { error: { message: errorMsg, name: 'AuthError', status: 400 } as AuthError };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      setSession(data.session);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred during sign in.';
      setAuthError(message);
      return { error: err as AuthError };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setAuthError(null);

    // Guard: validate email syntax and prevent test/dummy domains from hitting Supabase
    const validation = validateEmailForAuth(email);
    if (!validation.isValid) {
      const errorMsg = validation.error || 'Please enter a valid email address.';
      setAuthError(errorMsg);
      return {
        error: { message: errorMsg, name: 'AuthError', status: 400 } as AuthError,
        user: null,
        session: null,
        requiresEmailConfirmation: false,
      };
    }

    if (!password || password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters.';
      setAuthError(errorMsg);
      return {
        error: { message: errorMsg, name: 'AuthError', status: 400 } as AuthError,
        user: null,
        session: null,
        requiresEmailConfirmation: false,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: name?.trim() || undefined,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { error, user: null, session: null, requiresEmailConfirmation: false };
      }

      const requiresEmailConfirmation = !data.session;
      setSession(data.session);
      setUser(data.user);
      return {
        error: null,
        user: data.user,
        session: data.session,
        requiresEmailConfirmation,
      };
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred during sign up.';
      setAuthError(message);
      return { error: err as AuthError, user: null, session: null, requiresEmailConfirmation: false };
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message);
        return { error };
      }
      setSession(null);
      setUser(null);
      return { error: null };
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred during sign out.';
      setAuthError(message);
      return { error: err as AuthError };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      authError,
      clearAuthError,
    }),
    [user, session, isLoading, signIn, signUp, signOut, authError, clearAuthError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
