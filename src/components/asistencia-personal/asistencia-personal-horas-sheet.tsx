
'use client';

import { useState, useEffect } from 'react';
import { Docente } from '@/domain/entities/Docente';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useHorasPedagogicas } from '@/hooks/use-horas-pedagogicas';
import { AsistenciaRecordPersonal } from '@/hooks/use-asistencia-personal';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCurrentUser } from '@/hooks/use-current-user';
import { DocenteEditable, docenteToEditable, editableToDocente } from '@/domain/mappers/docente-editable';
import { UserCircle, PlusCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface AsistenciaPersonalHorasSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    docente: Docente;
    record: AsistenciaRecordPersonal;
    onSave: (docenteId: string, asignacionId: string, horas: string[], notas?: string) => void;
}

export function AsistenciaPersonalHorasSheet({ isOpen, onOpenChange, docente, record, onSave }: AsistenciaPersonalHorasSheetProps) {
    const { toast } = useToast();
    const { user: currentUser } = useCurrentUser();
    const { horas: horasPedagogicas } = useHorasPedagogicas();
    const docenteEditable: DocenteEditable = docenteToEditable(docente);
    const [selectedAsignacionId, setSelectedAsignacionId] = useState<string>('');
    const [selectedHoras, setSelectedHoras] = useState<string[]>([]);
    const [notas, setNotas] = useState('');
    
    useEffect(() => {
        if(isOpen) {
            const firstAsignacionId = docenteEditable.asignaciones?.filter(a => !a.areaId)[0]?.id || '';
            setSelectedAsignacionId(firstAsignacionId);

            const savedHorasRecord = record?.horasAfectadas?.find(ha => ha.asignacionId === firstAsignacionId);
            setSelectedHoras(savedHorasRecord?.horas || []);
            setNotas(savedHorasRecord?.notas || '');
        } else {
            setSelectedAsignacionId('');
            setSelectedHoras([]);
            setNotas('');
        }
    }, [isOpen, docenteEditable, record]);

    useEffect(() => {
        const savedHorasRecord = record?.horasAfectadas?.find(ha => ha.asignacionId === selectedAsignacionId);
        setSelectedHoras(savedHorasRecord?.horas || []);
        setNotas(savedHorasRecord?.notas || '');
    }, [selectedAsignacionId, record]);


    const handleSave = () => {
        if (!selectedAsignacionId) {
            toast({ variant: 'destructive', title: "Error", description: "Debe seleccionar una sección." });
            return;
        }
        const docenteActualizadoResult = editableToDocente({ ...docenteEditable, horario: docente.horario });
        const docenteActualizado = docenteActualizadoResult ?? docente;
        onSave(docenteActualizado.numeroDocumento, selectedAsignacionId, selectedHoras, notas);
        onOpenChange(false);
        toast({ title: 'Horas actualizadas', description: `Se han guardado las horas para ${docente.nombres}.` });
    };

    const handleHoraClick = (horaId: string) => {
        setSelectedHoras(prev => {
            const newSelected = new Set(prev);
            if(newSelected.has(horaId)) {
                newSelected.delete(horaId);
            } else {
                newSelected.add(horaId);
            }
            return Array.from(newSelected);
        });
    }

    const status = record?.status;
    const isFalta = status === 'falta';
    const isTarde = status === 'tarde';
    
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent 
                className={cn(
                    "flex flex-col sm:max-w-lg",
                    isFalta && "bg-red-50 dark:bg-red-900/20",
                    isTarde && "bg-yellow-50 dark:bg-yellow-900/20",
                )}
            >
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-4">
                        <span>Horas Afectadas</span>
                        {status && (
                             <Badge className={cn(
                                'text-base',
                                isFalta && 'bg-red-500 text-white hover:bg-red-500',
                                isTarde && 'bg-yellow-400 text-black hover:bg-yellow-400',
                             )}>
                                {status.toUpperCase()}
                            </Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        Selecciona la sección y marca las horas afectadas por la incidencia de <strong className="font-medium text-foreground">{docente.nombres} {docente.apellidoPaterno}</strong>.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6 px-6 py-4">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="asignacion-select">Sección de la Incidencia</Label>
                        <Select value={selectedAsignacionId} onValueChange={setSelectedAsignacionId}>
                            <SelectTrigger id="asignacion-select">
                                <SelectValue placeholder="Seleccione una sección" />
                            </SelectTrigger>
                            <SelectContent>
                                {(docenteEditable.asignaciones || []).filter(a => !a.areaId).map(asig => (
                                    <SelectItem key={asig.id} value={asig.id}>
                                        {asig.grado} - {asig.seccion.replace('Sección ','')} ({asig.rol})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                     <div className="space-y-2">
                        <Label>Marcar Horas Pedagógicas Afectadas</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {horasPedagogicas.map(hora => (
                                <Button
                                    key={hora.id}
                                    variant={selectedHoras.includes(hora.id) ? 'default' : 'outline'}
                                    onClick={() => handleHoraClick(hora.id)}
                                    disabled={!selectedAsignacionId}
                                >
                                    {hora.nombre}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border rounded-md px-4">
                            <AccordionTrigger className="text-sm font-medium flex items-center gap-2 hover:no-underline py-3">
                                <PlusCircle className="h-4 w-4" />
                                Añadir Nota / Justificación (Opcional)
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <Textarea 
                                    id="notas" 
                                    value={notas} 
                                    onChange={(e) => setNotas(e.target.value)}
                                    placeholder="Ej: Docente llamó para avisar que está en el tráfico."
                                    disabled={!selectedAsignacionId}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>


                    <div className="space-y-2">
                        <Label>Registrado por</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                            <UserCircle className="mr-2 h-5 w-5" />
                            <span>{currentUser ? `${currentUser.nombres} ${currentUser.apellidoPaterno}`: 'Cargando...'}</span>
                        </div>
                    </div>
                </div>
                </ScrollArea>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </SheetClose>
                    <Button onClick={handleSave} disabled={!selectedAsignacionId}>Guardar Horas</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
