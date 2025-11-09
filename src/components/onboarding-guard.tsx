'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAppConfig } from '@/hooks/use-app-config';
import { Skeleton } from '@/components/ui/skeleton';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useCurrentUser();
  const { institutionName, isLoaded: isConfigLoaded } = useAppConfig();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  const isPublicPage = pathname === '/login' || pathname === '/registro';
  const isOnboardingPage = pathname === '/onboarding';

  useEffect(() => {
    // Solo verificar cuando todo esté cargado
    if (!isUserLoaded || !isConfigLoaded) {
      return;
    }

    // No verificar en páginas públicas
    if (isPublicPage) {
      setIsChecking(false);
      return;
    }

    // Si no hay usuario, dejar que AuthGuard maneje la redirección
    if (!user) {
      setIsChecking(false);
      return;
    }

    // Solo los admins necesitan completar el onboarding
    const isAdmin = user.rol?.toLowerCase() === 'admin';
    if (!isAdmin) {
      setIsChecking(false);
      return;
    }

    // Verificar si el onboarding está completado
    let onboardingCompleted = typeof window !== 'undefined' 
      ? localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true'
      : false;

    // Si hay un nombre de institución configurado, marcar onboarding como completado automáticamente
    // (para usuarios existentes que ya tienen configuración)
    if (!onboardingCompleted && institutionName && institutionName.trim() !== '' && typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      onboardingCompleted = true;
    }

    // Si no está completado y no está en la página de onboarding, redirigir
    if (!onboardingCompleted && !isOnboardingPage) {
      setShouldShowOnboarding(true);
      router.push('/onboarding');
      return;
    }

    // Si está completado y está en la página de onboarding, redirigir al dashboard
    if (onboardingCompleted && isOnboardingPage) {
      router.push('/');
      return;
    }

    setIsChecking(false);
  }, [user, isUserLoaded, isConfigLoaded, institutionName, router, pathname, isPublicPage, isOnboardingPage]);

  // Mostrar loading mientras verifica
  if (isChecking && !isPublicPage && !isOnboardingPage) {
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

  // Si debe mostrar onboarding pero aún no ha redirigido, mostrar loading
  if (shouldShowOnboarding && !isOnboardingPage) {
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

  return <>{children}</>;
}
