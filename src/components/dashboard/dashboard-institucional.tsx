
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { IncidentesRecientes } from '@/components/dashboard/incidentes-recientes';
import { AccesosRapidos } from '@/components/dashboard/accesos-rapidos';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { CalendarDays } from 'lucide-react';

export function DashboardInstitucional() {
  const { stats, incidentes, isLoading } = useDashboard();
  const [currentDate, setCurrentDate] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCurrentDate(format(new Date(), 'PPPP', { locale: es }));
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
            Dashboard Institucional
            </h1>
            <p className="text-muted-foreground mt-1">
                Resumen de los indicadores clave de la institución.
            </p>
        </div>
        {currentDate ? (
          <Badge variant="outline" className="text-base flex items-center gap-2 h-10 px-4 border-primary text-primary bg-primary/10">
            <CalendarDays className="h-4 w-4" />
            <span>{currentDate}</span>
          </Badge>
        ) : (
          <Skeleton className="h-10 w-64" />
        )}
      </div>

      <DashboardStats stats={stats} isLoading={isLoading} />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <IncidentesRecientes incidentes={incidentes} isLoading={isLoading} />
        </div>
        <div className="space-y-8">
            <AccesosRapidos />
        </div>
      </div>
    </div>
  );
}
