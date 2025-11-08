
'use client';

import { cn } from "@/lib/utils";
import { Users, Check, Clock, X, FileLock } from "lucide-react";
import { AsistenciaStats } from "@/hooks/use-reporte-asistencia";

interface StatCardProps {
    title: string; 
    value: number | string; 
    icon: React.ElementType; 
    colorClass: string; 
}

const StatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => {
    return (
        <div className={cn("flex w-full items-center p-3 rounded-lg border bg-card")}>
            <div className={cn(
                "flex items-center justify-center rounded-lg h-10 w-10 mr-4",
                colorClass.replace('text-', 'bg-').replace('-600', '-100 dark:bg-opacity-20')
            )}>
                <Icon className={cn("h-5 w-5", colorClass)} />
            </div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{title}</p>
            </div>
        </div>
    );
};

interface ReporteAsistenciaStatsProps {
    stats: AsistenciaStats;
}

export function ReporteAsistenciaStats({ stats }: ReporteAsistenciaStatsProps) {
    const totalDias = stats.totalRegistros > 0 
        ? (stats.presente + stats.tarde + stats.falta + stats.permiso) / stats.totalEstudiantes
        : 0;

    const porcentajeAsistencia = stats.totalRegistros > 0 
        ? (((stats.presente + stats.tarde) / (stats.totalRegistros - stats.permiso)) * 100).toFixed(1)
        : '0.0';


    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Estudiantes" value={stats.totalEstudiantes} icon={Users} colorClass="text-blue-600" />
            <StatCard title="Presentes" value={stats.presente} icon={Check} colorClass="text-green-600" />
            <StatCard title="Tardanzas" value={stats.tarde} icon={Clock} colorClass="text-yellow-600" />
            <StatCard title="Faltas" value={stats.falta} icon={X} colorClass="text-red-600" />
            <StatCard title="Permisos" value={stats.permiso} icon={FileLock} colorClass="text-purple-600" />
        </div>
    );
}

