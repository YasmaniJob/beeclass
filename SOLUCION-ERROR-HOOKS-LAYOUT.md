# Solución al Error de Hooks en Layout

## Problema
El error "Invalid hook call" ocurre porque `src/app/layout.tsx` es un **Server Component async** que está intentando renderizar providers con hooks de React directamente.

## Causa
En Next.js 15, los layouts son Server Components por defecto. No pueden usar hooks de React directamente ni renderizar componentes que usen hooks sin una capa de separación adecuada.

## Solución Recomendada

### Opción 1: Revertir a un commit anterior funcional
```bash
git log --oneline -10
# Encuentra el último commit funcional antes de los cambios
git reset --hard <commit-hash>
npm install
npm run dev
```

### Opción 2: Verificar que el layout NO tenga providers anidados directamente

El layout debe verse así (estructura correcta):

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { PwaUpdateNotification } from '@/components/pwa-update-notification';
import { getCurrentDocente } from '@/server/auth/get-current-docente';
import { ClientProviders } from '@/components/client-providers'; // Componente cliente separado

export const metadata: Metadata = {
  // ... metadata
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentDocente = await getCurrentDocente();

  return (
    <html lang="es" className="h-full">
      <head>
        {/* ... head content */}
      </head>
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

Y crear un componente cliente separado:

```tsx
// src/components/client-providers.tsx
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

## Archivos Modificados en Esta Sesión

1. `src/app/layout.tsx` - Modificado incorrectamente
2. `src/app/docentes/mis-clases/page.tsx` - Modificado para competencias transversales
3. `package.json` - Puerto cambiado a 9000

## Recomendación Final

**Hacer git reset al último commit funcional** es la solución más rápida y segura:

```bash
# Ver commits recientes
git log --oneline -10

# Resetear al commit antes de los cambios
git reset --hard <commit-hash-funcional>

# Reinstalar dependencias por si acaso
rm -rf node_modules .next
npm install

# Iniciar servidor
npm run dev
```

Luego, si necesitas las competencias transversales, hazlo en una sesión separada con un enfoque más cuidadoso.
