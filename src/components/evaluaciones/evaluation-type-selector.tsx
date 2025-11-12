'use client';

import { TipoEvaluacion, EvaluationType } from '@/types/evaluacion';
import { CheckCircle2, ClipboardList, Table2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Props para el componente EvaluationTypeSelector
 */
interface EvaluationTypeSelectorProps {
  selectedType: TipoEvaluacion;
  onTypeChange: (type: TipoEvaluacion) => void;
}

/**
 * Configuración de tipos de evaluación disponibles
 * TODO: Cambiar available a true cuando se implementen los componentes correspondientes
 */
const EVALUATION_TYPES: EvaluationType[] = [
  {
    id: 'directa',
    label: 'Evaluación Directa',
    icon: CheckCircle2,
    description: 'Calificación literal (AD, A, B, C)',
    available: true,
  },
  {
    id: 'lista-cotejo',
    label: 'Lista de Cotejo',
    icon: ClipboardList,
    description: 'Criterios de logro',
    available: false, // TODO: Implementar ListaCotejoTable
  },
  {
    id: 'rubrica',
    label: 'Rúbrica',
    icon: Table2,
    description: 'Niveles de desempeño',
    available: false, // TODO: Implementar RubricaTable
  },
];

/**
 * Componente selector de tipo de evaluación
 * 
 * Permite al docente elegir entre diferentes métodos de evaluación:
 * - Evaluación Directa (disponible)
 * - Lista de Cotejo (próximamente)
 * - Rúbrica (próximamente)
 */
export function EvaluationTypeSelector({
  selectedType,
  onTypeChange,
}: EvaluationTypeSelectorProps) {
  const selectedTypeData = EVALUATION_TYPES.find(t => t.id === selectedType);
  const SelectedIcon = selectedTypeData?.icon || CheckCircle2;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        Tipo de Evaluación
      </label>
      
      <Select value={selectedType} onValueChange={(value) => onTypeChange(value as TipoEvaluacion)}>
        <SelectTrigger className="w-[240px] h-auto py-2">
          <SelectValue>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 flex-shrink-0">
                <SelectedIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{selectedTypeData?.label}</p>
                <p className="text-xs text-muted-foreground">{selectedTypeData?.description}</p>
              </div>
            </div>
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="w-[280px]">
          {EVALUATION_TYPES.map((type) => {
            const Icon = type.icon;
            const isAvailable = type.available;

            return (
              <SelectItem
                key={type.id}
                value={type.id}
                disabled={!isAvailable}
                className={cn(
                  'cursor-pointer py-3',
                  !isAvailable && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Icono */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0',
                      isAvailable ? 'bg-primary/10' : 'bg-muted/50'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        isAvailable ? 'text-primary' : 'text-muted-foreground/50'
                      )}
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'font-semibold text-sm',
                        isAvailable ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {type.label}
                      </p>
                      {!isAvailable && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Próximo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {type.description}
                    </p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
