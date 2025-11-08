
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import Breadcrumb from '@/components/ui/breadcrumb';
import { AuthGuard } from '@/components/auth-guard';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

export function AuthLayoutRenderer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/registro';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <AuthGuard>
              <Breadcrumb />
              {children}
            </AuthGuard>
          </div>
        </main>
      </SidebarInset>
      <BottomNavigation />
    </SidebarProvider>
  );
}
