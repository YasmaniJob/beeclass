# Instrucciones para Recuperar la Aplicación

## Situación Actual
La aplicación tiene un error fundamental: "Invalid hook call" que ocurre porque el `RootLayout` (Server Component) está renderizando providers con hooks directamente.

## Problema
Este error NO fue causado en esta sesión. El código actual (después del git reset) TAMBIÉN tiene el problema, lo que significa que el error existía antes.

## Solución: Encontrar un Commit Funcional Antiguo

### Paso 1: Ver el historial de commits
```bash
git log --oneline --all --graph -30
```

### Paso 2: Identificar un commit de cuando funcionaba
Busca un commit de hace varios días/semanas cuando la aplicación funcionaba correctamente.

### Paso 3: Resetear a ese commit
```bash
git reset --hard <commit-hash-funcional>
```

### Paso 4: Limpiar e instalar
```bash
rm -rf node_modules .next
npm install
npm run dev
```

## Alternativa: Verificar si hay una rama funcional

```bash
git branch -a
git checkout <rama-funcional>
```

## Si No Encuentras un Commit Funcional

El problema está en cómo Next.js 15 maneja Server Components con providers. La solución requiere refactorizar el layout para separar los providers en un componente cliente.

### Solución Técnica (Requiere Cambios de Código)

1. Crear `src/components/client-providers.tsx`:
```tsx
'use client';

import { ReactNode } from 'react';
import { AppConfigProvider, ThemeUpdater } from '@/hooks/use-app-config';
import { CurrentUserProvider } from '@/hooks/use-current-user';
import { MatriculaDataProvider } from '@/hooks/use-matricula-data';
import { MatriculaSupabaseHibridaProvider } from '@/infrastructure/hooks/useMatriculaSupabaseHibrida';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthLayoutRenderer } from '@/components/auth-layout-renderer';
import { Docente } from '@/domain/entities/Docente';

interface ClientProvidersProps {
  children: ReactNode;
  initialDocente: Docente | null;
}

export function ClientProviders({ children, initialDocente }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>
        <AppConfigProvider>
          <ThemeUpdater />
          <CurrentUserProvider initialDocente={initialDocente}>
            <MatriculaSupabaseHibridaProvider>
              <MatriculaDataProvider>
                <AuthLayoutRenderer>
                  {children}
                </AuthLayoutRenderer>
              </MatriculaDataProvider>
            </MatriculaSupabaseHibridaProvider>
          </CurrentUserProvider>
        </AppConfigProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}
```

2. Modificar `src/app/layout.tsx` para usar el componente cliente:
```tsx
import { ClientProviders } from '@/components/client-providers';
// ... otros imports

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentDocente = await getCurrentDocente();

  return (
    <html lang="es" className="h-full">
      <head>{/* ... */}</head>
      <body className={cn("font-body antialiased")}>
        <ClientProviders initialDocente={currentDocente}>
          {children}
        </ClientProviders>
        <Toaster />
        <PwaUpdateNotification />
      </body>
    </html>
  );
}
```

## Recomendación Final

**BUSCA UN COMMIT ANTIGUO FUNCIONAL** y resetea a ese punto. Es la solución más rápida y segura.

Si no encuentras uno, necesitarás aplicar la solución técnica de refactorización del layout.
