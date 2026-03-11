import type { Session, User as AuthUser } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import type { Business, User } from '@/lib/domain/models';
import { getSupabaseClient } from '@/lib/supabase/client';
import { hasSupabaseConfig } from '@/lib/supabase/config';
import {
  getAuthSnapshot,
  getAuthErrorMessage,
  getCurrentSession,
  signOut as signOutRequest,
} from '@/features/auth/services/auth-service';

type AuthStatus = 'loading' | 'signed_out' | 'needs_onboarding' | 'ready';

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  authUser: AuthUser | null;
  appUser: User | null;
  business: Business | null;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveSnapshot(session: Session | null) {
  if (!session?.user) {
    return {
      status: 'signed_out' as const,
      authUser: null,
      appUser: null,
      business: null,
      errorMessage: null,
    };
  }

  const snapshot = await getAuthSnapshot(session.user.id);

  return {
    status: snapshot.isOnboarded ? ('ready' as const) : ('needs_onboarding' as const),
    authUser: session.user,
    appUser: snapshot.appUser,
    business: snapshot.business,
    errorMessage: null,
  };
}

function getMissingConfigMessage() {
  return 'Supabase is not configured yet. Add your project URL and publishable key to continue with authentication.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const syncSession = async (nextSession: Session | null) => {
    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setSession(nextSession);

    try {
      const snapshot = await resolveSnapshot(nextSession);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setStatus(snapshot.status);
      setAuthUser(snapshot.authUser);
      setAppUser(snapshot.appUser);
      setBusiness(snapshot.business);
      setErrorMessage(snapshot.errorMessage);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setStatus(nextSession?.user ? 'needs_onboarding' : 'signed_out');
      setAuthUser(nextSession?.user ?? null);
      setAppUser(null);
      setBusiness(null);
      setErrorMessage(getAuthErrorMessage(error as Error));
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!hasSupabaseConfig) {
      setStatus('signed_out');
      setErrorMessage(getMissingConfigMessage());
      return () => {
        isMounted = false;
      };
    }

    const supabase = getSupabaseClient();

    getCurrentSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        void syncSession(data.session);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStatus('signed_out');
        setErrorMessage(getAuthErrorMessage(error as Error));
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    if (!hasSupabaseConfig) {
      setStatus('signed_out');
      setErrorMessage(getMissingConfigMessage());
      return;
    }

    const { data } = await getCurrentSession();
    await syncSession(data.session);
  };

  const signOut = async () => {
    if (!hasSupabaseConfig) {
      setStatus('signed_out');
      setErrorMessage(getMissingConfigMessage());
      return;
    }

    await signOutRequest();
    await syncSession(null);
  };

  return (
    <AuthContext.Provider value={{ status, session, authUser, appUser, business, errorMessage, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
