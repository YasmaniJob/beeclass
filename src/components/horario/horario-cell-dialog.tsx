
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Asignacion } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface HorarioCellDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cellInfo: { dia: string; horaId: string, horaNombre: string } | null;
  asignaciones: Asignacion[];
  horas: { id: string; nombre: string }[];
  onSave: (dia: string, horas: string[], asignacion: Asignacion | null) => void;
}

export function HorarioCellDialog({
  isOpen,
  onOpenChange,
  cellInfo,
  asignaciones,
  horas,
  onSave,
}: HorarioCellDialogProps) {
  const { allAreas } = useMatriculaData();
  const { isMobile } = useIsMobile();
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<string | null>(null);
  const [selectedHoras, setSelectedHoras] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen && cellInfo) {
      setSelectedHoras([cellInfo.horaId]);
    } else {
      setSelectedAsignacionId(null);
      setSelectedHoras([]);
    }
  }, [isOpen, cellInfo]);

  const asignacionesConNombreArea = useMemo(() => {
    return asignaciones
      .map(asig => {
        const area = allAreas.find(a => a.id === asig.areaId);
        return { ...asig, areaNombre: area?.nombre || 'Área Desconocida' };
      })
      .sort((a,b) => `${a.grado}-${a.seccion}-${a.areaNombre}`.localeCompare(`${b.grado}-${b.seccion}-${b.areaNombre}`));
  }, [asignaciones, allAreas]);
  
  const handleSave = () => {
    if (!cellInfo) return;
    const asignacionSeleccionada = asignaciones.find(a => a.id === selectedAsignacionId) || null;
    onSave(cellInfo.dia, selectedHoras, asignacionSeleccionada);
    onOpenChange(false);
  };
  
  const handleClear = () => {
      if (!cellInfo) return;
      onSave(cellInfo.dia, selectedHoras, null);
      onOpenChange(false);
  }

  const handleCheckboxChange = (horaId: string) => {
    setSelectedHoras(prev => 
        prev.includes(horaId) 
            ? prev.filter(item => item !== horaId) 
            : [...prev, horaId]
    );
  };
  
  const DialogComponent = isMobile ? Dialog : Sheet;
  const DialogContentComponent = isMobile ? DialogContent : SheetContent;

  const content = (
    <>
      <DialogHeader>
        <DialogTitle>Asignar Horas para el {cellInfo?.dia}</DialogTitle>
        <DialogDescription>
          Selecciona la clase y luego marca las horas donde se impartirá este día.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        {/* Columna Izquierda: Selección de Clase */}
        <div className="space-y-3 flex flex-col">
           <h4 className="font-medium text-sm">1. Selecciona la Clase</h4>
           <ScrollArea className="flex-1 rounded-md border">
              <div className="p-2 space-y-1">
                {asignacionesConNombreArea.map(asig => {
                  const isSelected = selectedAsignacionId === asig.id;
                  return (
                    <button
                      key={asig.id}
                      onClick={() => setSelectedAsignacionId(asig.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2'
                          : 'bg-card hover:bg-muted'
                      )}
                    >
                      <p className={cn('font-semibold', isSelected && 'text-primary-foreground')}>
                        {asig.areaNombre}
                      </p>
                      <p className={cn('text-xs', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {asig.grado} - {asig.seccion.replace('Sección ','')}
                      </p>
                    </button>
                  );
                })}
              </div>
           </ScrollArea>
        </div>
        {/* Columna Derecha: Selección de Horas */}
        <div className="space-y-4 flex flex-col">
             <div className="space-y-2">
                <h4 className="font-medium text-sm">2. Horas a asignar</h4>
                 <ScrollArea className="flex-1 rounded-md border h-full">
                    <div className="grid grid-cols-2 gap-2 p-2">
                        {horas.map(hora => (
                            <div key={hora.id} className="flex items-center gap-2 p-2 rounded-md bg-background">
                                <Checkbox id={`hora-${hora.id}`} checked={selectedHoras.includes(hora.id)} onCheckedChange={() => handleCheckboxChange(hora.id)} />
                                <Label htmlFor={`hora-${hora.id}`} className="cursor-pointer text-xs">{hora.nombre}</Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
      </div>
      <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
         <Button variant="destructive" onClick={handleClear} disabled={selectedHoras.length === 0}>Limpiar Bloques</Button>
         <div className="flex gap-2">
            <DialogClose asChild>
                <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!selectedAsignacionId || selectedHoras.length === 0}>Confirmar</Button>
        </div>
      </DialogFooter>
    </>
  );

  return (
    <DialogComponent open={isOpen} onOpenChange={onOpenChange}>
      <DialogContentComponent className={cn(!isMobile && "sm:max-w-2xl")}>
        {content}
      </DialogContentComponent>
    </DialogComponent>
  );
}
