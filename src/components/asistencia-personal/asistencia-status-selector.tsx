
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AsistenciaBadge } from '../asistencia/asistencia-badge';
import {
  AsistenciaStatus,
  AsistenciaStatusEnum,
} from '@/lib/definitions';
import { Button } from '../ui/button';
import { Check, Clock, FileLock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const statusOptions: {
  status: AsistenciaStatus;
  label: string;
  icon: React.ElementType;
  className: string;
  requiresAsignaciones?: boolean;
}[] = [
  {
    status: 'presente',
    label: 'Presente',
    icon: Check,
    className: 'hover:bg-green-100 dark:hover:bg-green-900/50',
  },
  {
    status: 'tarde',
    label: 'Tarde',
    icon: Clock,
    className: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
    requiresAsignaciones: true,
  },
  {
    status: 'falta',
    label: 'Falta',
    icon: X,
    className: 'hover:bg-red-100 dark:hover:bg-red-900/50',
    requiresAsignaciones: true,
  },
  {
    status: 'permiso',
    label: 'Permiso',
    icon: FileLock,
    className: 'hover:bg-purple-100 dark:hover:bg-purple-900/50',
  },
];

interface AsistenciaStatusSelectorProps {
  currentStatus: AsistenciaStatus;
  onStatusSelect: (status: AsistenciaStatus) => void;
  hasAsignaciones: boolean;
}

export function AsistenciaStatusSelector({
  currentStatus,
  onStatusSelect,
  hasAsignaciones,
}: AsistenciaStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (status: AsistenciaStatus) => {
    onStatusSelect(status);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="cursor-pointer">
          <AsistenciaBadge status={currentStatus} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1">
        <div className="flex flex-col gap-1">
          {statusOptions.map(({ status, label, icon: Icon, className, requiresAsignaciones }) => {
            const isDisabled = requiresAsignaciones && !hasAsignaciones;
            
            const button = (
                <Button
                  key={status}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelect(status)}
                  className={cn(
                    'justify-start capitalize',
                    className,
                    currentStatus === status && 'bg-muted'
                  )}
                  disabled={isDisabled}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Button>
            );

            if (isDisabled) {
                return (
                     <TooltipProvider key={status} delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild><div className='w-full'>{button}</div></TooltipTrigger>
                            <TooltipContent>
                                <p>Este estado requiere que el personal tenga secciones asignadas.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }

            return button;

          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
