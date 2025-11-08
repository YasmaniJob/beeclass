
'use client';

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Clock, FileLock, X } from "lucide-react";
import { AsistenciaStatus } from "@/lib/definitions";

const statusConfig: Record<AsistenciaStatus, { variant: string; icon?: React.ComponentType<{ className?: string }>; label: string }> = {
    sin_asistencia: {
        variant: 'bg-muted text-muted-foreground hover:bg-muted dark:bg-slate-800/70 dark:text-slate-200',
        label: 'Sin asistencia',
    },
    presente: {
        variant: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300',
        icon: Check,
        label: 'Presente',
    },
    tarde: {
        variant: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300',
        icon: Clock,
        label: 'Tarde',
    },
    falta: {
        variant: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300',
        icon: X,
        label: 'Falta',
    },
    permiso: {
        variant: 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300',
        icon: FileLock,
        label: 'Permiso',
    },
};

interface AsistenciaBadgeProps {
    status: AsistenciaStatus;
}

export function AsistenciaBadge({ status }: AsistenciaBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge
          variant="outline"
          className={cn(
            'capitalize text-sm font-medium border-0',
            Icon ? 'gap-1.5' : 'gap-0',
            config.variant
          )}
        >
          {Icon ? <Icon className="w-4 h-4" /> : null}
          {config.label}
        </Badge>
    );
};
