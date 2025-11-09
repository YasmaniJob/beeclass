
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import Breadcrumb from '@/components/ui/breadcrumb';
import { AppConfigProvider, ThemeUpdater } from '@/hooks/use-app-config';
import { CurrentUserProvider } from '@/hooks/use-current-user';
import { AuthGuard } from '@/components/auth-guard';
import { AuthLayoutRenderer } from '@/components/auth-layout-renderer';
import { MatriculaDataProvider } from '@/hooks/use-matricula-data';
import { MatriculaSupabaseHibridaProvider } from '@/infrastructure/hooks/useMatriculaSupabaseHibrida';
import { PwaUpdateNotification } from '@/components/pwa-update-notification';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { getCurrentDocente } from '@/server/auth/get-current-docente';

export const metadata: Metadata = {
  title: {
    default: 'Beeclass - Gestión Educativa',
    template: '%s | Beeclass'
  },
  description: 'Sistema completo de gestión educativa para control de asistencia, estudiantes, docentes y reportes. Solución integral para instituciones educativas.',
  keywords: [
    'asistencia escolar',
    'gestión educativa',
    'control de asistencia',
    'estudiantes',
    'docentes',
    'reportes educativos',
    'sistema escolar',
    'asistencia digital',
    'gestión estudiantil'
  ],
  authors: [{ name: 'Beeclass Team' }],
  creator: 'Beeclass',
  publisher: 'Beeclass',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://beeclass.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://beeclass.app',
    title: 'Beeclass - Gestión Educativa',
    description: 'Sistema completo de gestión educativa para control de asistencia y reportes',
    siteName: 'Beeclass',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Beeclass - Gestión Educativa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beeclass - Gestión Educativa',
    description: 'Sistema completo de gestión educativa para control de asistencia',
    images: ['/og-image.jpg'],
    creator: '@beeclass_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'education',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#59AB45" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
      </head>
      <body className={cn(
        "font-body antialiased",
      )}>
        <ErrorBoundary>
          <AnalyticsProvider>
            <AppConfigProvider>
              <ThemeUpdater />
              <CurrentUserProvider initialDocente={currentDocente}>
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
        <Toaster />
        <PwaUpdateNotification />
      </body>
    </html>
  );
}
