
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase-browser-client';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { Docente } from '@/domain/entities/Docente';
import { toast } from '@/hooks/use-toast';
import { deserializeDocente, resolveDocenteFromAuthUser, type SerializedDocente } from '@/services/personal/docente-profile';
import { DomainError } from '@/domain/shared/types';

const LOGOUT_TIMEOUT_MS = 8000;

interface CurrentUserContextType {
  user: Docente | null;
  isLoaded: boolean;
  isLoading: boolean;
  isSigningOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUser: (docente: Docente) => void;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

interface CurrentUserProviderProps {
  children: ReactNode;
  initialDocente?: SerializedDocente | null;
}

export function CurrentUserProvider({ children, initialDocente }: CurrentUserProviderProps) {
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (supabaseRef.current === null) {
    supabaseRef.current = createSupabaseBrowserClient();
  }
  const supabase = supabaseRef.current;

  const hasPrefetched = initialDocente !== undefined;
  const [user, setUser] = useState<Docente | null>(() => deserializeDocente(initialDocente));
  const [isLoaded, setIsLoaded] = useState(hasPrefetched);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const loadProfileFromSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    const docenteSerialized = await resolveDocenteFromAuthUser(session.user);
    setUser(deserializeDocente(docenteSerialized));
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw new DomainError(error.message);
      }

      await loadProfileFromSession(session);
    } catch (error) {
      console.error('Error loading Supabase session', error);
      setUser(null);
    }
  }, [loadProfileFromSession, supabase]);

  useEffect(() => {
    if (hasPrefetched) {
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    const initialSessionHandledRef = { current: false };

    const markInitialSessionHandled = () => {
      if (!initialSessionHandledRef.current && isMounted) {
        initialSessionHandledRef.current = true;
        setIsLoaded(true);
      }
    };

    loadProfile()
      .then(() => {
        // Si loadProfile encontró un usuario, marcamos inmediatamente.
        markInitialSessionHandled();
      })
      .catch(() => {
        markInitialSessionHandled();
      });

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      try {
        await loadProfileFromSession(session);
      } finally {
        markInitialSessionHandled();
      }
    });

    const fallbackTimer = setTimeout(() => {
      markInitialSessionHandled();
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      authListener.subscription.unsubscribe();
    };
  }, [hasPrefetched, loadProfile, loadProfileFromSession, supabase]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message ?? 'Credenciales inválidas o usuario no registrado.');
    }
  }, [supabase]);

  const signOutWithTimeout = useCallback(async (timeoutMs: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    });

    try {
      const result = await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise,
      ]);
      return result;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }, [supabase]);

  const logout = useCallback(async () => {
    setIsSigningOut(true);
    let remoteErrorMessage: string | null = null;

    try {
      const { error } = await signOutWithTimeout(LOGOUT_TIMEOUT_MS);
      if (error) {
        remoteErrorMessage = error.message;
        console.error('Error al cerrar sesión en Supabase:', error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al cerrar sesión.';
      remoteErrorMessage = message === 'timeout' ? 'Se agotó el tiempo de espera con Supabase.' : message;
      console.error('Fallo inesperado al cerrar sesión', error);
    }

    setUser(null);

    if (remoteErrorMessage) {
      toast({
        variant: 'destructive',
        title: 'Sesión cerrada localmente',
        description: `${remoteErrorMessage} Tu sesión en el dispositivo se cerró, pero podrías seguir conectada en el servidor.`,
      });
    }

    router.push('/login');
  }, [router, signOutWithTimeout]);

  useEffect(() => {
    if (pathname === '/login' || pathname === '/registro') {
      setIsSigningOut(false);
    }
  }, [pathname]);

  const register = useCallback(async (email: string, password: string, metadata: Record<string, any> = {}) => {
    const enrichedMetadata = {
      ...metadata,
      role: metadata.role ?? 'Admin',
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: enrichedMetadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Crear el registro en la tabla personal
    if (data.user) {
      const { error: insertError } = await supabase
        .from('personal')
        .insert({
          id: data.user.id,
          email: email,
          nombres: metadata.nombres || '',
          apellido_paterno: metadata.apellidoPaterno || '',
          apellido_materno: metadata.apellidoMaterno || '',
          tipo_documento: 'DNI',
          numero_documento: data.user.id.substring(0, 8), // Usar parte del UUID como número temporal
          rol: 'Admin', // Primer usuario registrado es administrador
          activo: true,
        });

      if (insertError) {
        console.error('Error al crear registro en personal:', insertError);
        // No lanzamos error aquí para no bloquear el registro
      }
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const updateUserState = useCallback((docente: Docente) => {
    setUser(docente);
  }, []);

  const contextValue = useMemo<CurrentUserContextType>(() => ({
    user,
    isLoaded,
    isLoading: !isLoaded,
    isSigningOut,
    login,
    logout,
    register,
    refreshProfile,
    updateUser: updateUserState,
  }), [isLoaded, isSigningOut, login, logout, register, refreshProfile, updateUserState, user]);

  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
}
