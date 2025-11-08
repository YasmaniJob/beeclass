
'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardInstitucional } from '@/components/dashboard/dashboard-institucional';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isLoaded } = useCurrentUser();
  const router = useRouter();

  if (!isLoaded || !user) {
    return (
        <div className="space-y-8">
            <div className='flex justify-between'>
                <Skeleton className="h-8 w-1/3" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Skeleton className="h-96 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }
  
  return <DashboardInstitucional />;
}
