
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded, refreshProfile, isSigningOut } = useCurrentUser();
  const { isLoaded: isMatriculaLoaded } = useMatriculaData();
  const router = useRouter();
  const pathname = usePathname();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isPublicPage = pathname === '/login' || pathname === '/registro';

  useEffect(() => {
    if (isSigningOut) {
      return;
    }

    if (isUserLoaded && !user && !isPublicPage && !authError) {
      router.push('/login');
    }
  }, [user, isUserLoaded, router, pathname, isPublicPage, authError, isSigningOut]);

  const handleRefreshSession = useCallback(async () => {
    setAuthError(null);
    setIsRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Error refreshing auth profile', error);
      setAuthError('No pudimos recuperar tu sesión. Inicia sesión nuevamente.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfile]);

  const isLoading = useMemo(() => !isUserLoaded || !isMatriculaLoaded || isSigningOut, [isUserLoaded, isMatriculaLoaded, isSigningOut]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <Alert className="max-w-md border-destructive/40 bg-destructive/5">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle>Sesión no disponible</AlertTitle>
          <AlertDescription>
            {authError ?? 'Tu sesión expiró o no pudimos validar tus credenciales.'}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/login')}>
            Ir al inicio de sesión
          </Button>
          <Button onClick={handleRefreshSession} disabled={isRefreshing}>
            {isRefreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isRefreshing ? 'Reintentando…' : 'Reintentar'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
