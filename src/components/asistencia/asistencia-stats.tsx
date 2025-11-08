
'use client';

import { cn } from "@/lib/utils";
import { Users, Check, Clock, X, FileLock, Siren } from "lucide-react";
import { useMemo } from "react";
import { AsistenciaState, FilterStatus, AsistenciaRecord } from "@/hooks/use-asistencia";

interface StatCardProps {
    title: string; 
    value: number | string; 
    icon: React.ElementType; 
    colorClass: string; 
    status: FilterStatus | 'incidentes';
    isActive: boolean;
    onClick: () => void;
}

const StatCard = ({ title, value, icon: Icon, colorClass, status, isActive, onClick }: StatCardProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center p-2 rounded-lg border text-left transition-all duration-200",
                isActive 
                    ? `shadow-md text-white ${colorClass}`
                    : `bg-muted/30 hover:bg-muted/60`
            )}
        >
            <div className={cn(
                "flex items-center justify-center rounded-full h-7 w-7 mr-2 transition-colors",
                isActive 
                    ? 'bg-white/20' 
                    : colorClass.replace('bg-', 'bg-opacity-10 text-').replace('-500', '-100')
            )}>
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? 'text-white' : colorClass.replace('bg-', 'text-'))} />
            </div>
            <div>
                <p className="text-base font-bold">{value}</p>
                <p className={cn("text-xs leading-tight", isActive ? 'text-white/80' : 'text-muted-foreground')}>{title}</p>
            </div>
        </button>
    );
};

interface AsistenciaStatsProps {
    asistencia: Record<string, AsistenciaRecord>;
    totalSubjects: number;
    incidentesCount: number;
    statusFilter: FilterStatus;
    onFilterChange: (status: FilterStatus) => void;
    isPersonal?: boolean;
}

export function AsistenciaStats({ asistencia, totalSubjects, incidentesCount, statusFilter, onFilterChange, isPersonal = false }: AsistenciaStatsProps) {
    const stats = useMemo(() => ({
        total: totalSubjects,
        presentes: Object.values(asistencia).filter(r => r.status === 'presente').length,
        tardes: Object.values(asistencia).filter(r => r.status === 'tarde').length,
        faltas: Object.values(asistencia).filter(r => r.status === 'falta').length,
        permisos: Object.values(asistencia).filter(r => r.status === 'permiso').length,
      }), [asistencia, totalSubjects]);

      const handleFilterChange = (status: FilterStatus) => {
        onFilterChange(status);
      }

    return (
        <div className={cn("grid gap-2 grid-cols-2 sm:grid-cols-3", isPersonal ? "lg:grid-cols-5" : "lg:grid-cols-6")}>
            <StatCard title={isPersonal ? "Total Personal" : "Estudiantes"} value={stats.total} icon={Users} colorClass="bg-blue-500" status="todos" isActive={statusFilter === 'todos'} onClick={() => handleFilterChange('todos')} />
            <StatCard title="Presentes" value={stats.presentes} icon={Check} colorClass="bg-green-500" status="presente" isActive={statusFilter === 'presente'} onClick={() => handleFilterChange('presente')} />
            <StatCard title="Tardanzas" value={stats.tardes} icon={Clock} colorClass="bg-yellow-500" status="tarde" isActive={statusFilter === 'tarde'} onClick={() => handleFilterChange('tarde')} />
            <StatCard title="Faltas" value={stats.faltas} icon={X} colorClass="bg-red-500" status="falta" isActive={statusFilter === 'falta'} onClick={() => handleFilterChange('falta')} />
            <StatCard title="Permisos" value={stats.permisos} icon={FileLock} colorClass="bg-purple-500" status="permiso" isActive={statusFilter === 'permiso'} onClick={() => handleFilterChange('permiso')} />
            {!isPersonal && (
                 <StatCard title="Incidentes" value={incidentesCount} icon={Siren} colorClass="bg-amber-500" status="incidentes" isActive={false} onClick={() => { /* No action for now */ }} />
            )}
        </div>
    );
}
