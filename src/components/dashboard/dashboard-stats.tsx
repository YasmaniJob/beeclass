
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, UserX } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    presentesHoy: number;
    faltasHoy: number;
    tardanzasHoy: number;
    enRiesgoTotal: number;
  };
  isLoading: boolean;
}

const StatCard = ({ title, value, icon: Icon, colorClass, isLoading }: { title: string; value: number; icon: React.ElementType, colorClass: string, isLoading: boolean }) => {
    if (isLoading) {
        return <Skeleton className="h-24 w-full" />;
    }

    return (
        <Card className={cn(
            "text-white hover:brightness-110 transition-all duration-300",
            colorClass
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                 <div className="flex items-center justify-center rounded-full h-8 w-8 bg-white/20">
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}


export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Asistencia Hoy" value={stats.presentesHoy} icon={CheckCircle} colorClass="bg-green-500" isLoading={isLoading} />
        <StatCard title="Faltas Hoy" value={stats.faltasHoy} icon={UserX} colorClass="bg-red-500" isLoading={isLoading} />
        <StatCard title="Tardanzas Hoy" value={stats.tardanzasHoy} icon={Clock} colorClass="bg-yellow-500" isLoading={isLoading} />
        <StatCard title="Estudiantes en Riesgo" value={stats.enRiesgoTotal} icon={AlertTriangle} colorClass="bg-orange-500" isLoading={isLoading} />
    </div>
  );
}
