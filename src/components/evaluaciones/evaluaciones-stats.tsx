
'use client';

import { useMemo } from 'react';
import { EstudianteConPromedios } from '@/hooks/use-calificaciones';
import { Users, UserCheck, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'todos' | 'completos' | 'incompletos';

interface StatCardProps {
    title: string; 
    value: number | string; 
    icon: React.ElementType; 
    colorClass: string; 
    isActive: boolean;
    onClick: () => void;
}

const StatCard = ({ title, value, icon: Icon, colorClass, isActive, onClick }: StatCardProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center p-2 rounded-lg border text-left transition-all duration-200",
                isActive 
                    ? `shadow-md text-white ${colorClass}`
                    : "bg-muted/30 hover:bg-muted/60"
            )}
        >
            <div className={cn(
                "flex items-center justify-center rounded-full h-7 w-7 mr-2 transition-colors",
                isActive 
                    ? 'bg-white/20' 
                    : colorClass.replace('bg-', 'bg-opacity-10 text-').replace('-500', '-100')
            )}>
                <Icon className={cn(
                    "h-4 w-4 transition-colors", 
                    isActive ? 'text-white' : colorClass.replace('bg-', 'text-')
                )} />
            </div>
            <div>
                <p className="text-base font-bold">{value}</p>
                <p className={cn("text-xs leading-tight", isActive ? 'text-white/80' : 'text-muted-foreground')}>{title}</p>
            </div>
        </button>
    );
};

interface EvaluacionesStatsProps {
    estudiantes: EstudianteConPromedios[];
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export function EvaluacionesStats({ estudiantes, activeFilter, onFilterChange }: EvaluacionesStatsProps) {
    const stats = useMemo(() => {
        const total = estudiantes.length;
        const incompletos = estudiantes.filter(e => e.tieneNotasFaltantes).length;
        const completos = total - incompletos;
        return { total, completos, incompletos };
    }, [estudiantes]);
    
    return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard 
                title="Total Estudiantes" 
                value={stats.total} 
                icon={Users} 
                colorClass="bg-blue-500"
                isActive={activeFilter === 'todos'} 
                onClick={() => onFilterChange('todos')} 
            />
            <StatCard 
                title="Completos" 
                value={stats.completos} 
                icon={UserCheck} 
                colorClass="bg-green-500"
                isActive={activeFilter === 'completos'} 
                onClick={() => onFilterChange('completos')} 
            />
            <StatCard 
                title="Incompletos" 
                value={stats.incompletos} 
                icon={UserX} 
                colorClass="bg-yellow-500"
                isActive={activeFilter === 'incompletos'} 
                onClick={() => onFilterChange('incompletos')} 
            />
        </div>
    );
}
