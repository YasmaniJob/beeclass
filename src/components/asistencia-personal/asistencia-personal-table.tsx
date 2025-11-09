
'use client';

import { useCallback, useState } from 'react';
import { Docente } from '@/domain/entities/Docente';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AsistenciaRecord } from '@/hooks/use-asistencia';
import { AsistenciaBadge } from '../asistencia/asistencia-badge';
import { MessageSquarePlus, StickyNote } from 'lucide-react';
import { Badge } from '../ui/badge';
import { AsistenciaPersonalHorasSheet } from './asistencia-personal-horas-sheet';
import { AsistenciaStatusSelector } from './asistencia-status-selector';
import { useHorasPedagogicas } from '@/hooks/use-horas-pedagogicas';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { IncidenteFormSheet } from '../incidentes/incidente-form-sheet';
import { AsistenciaStatus } from '@/lib/definitions';

interface AsistenciaPersonalTableProps {
    personal: Docente[];
    asistencia: Record<string, AsistenciaRecord>;
    onStatusChange: (numeroDocumento: string, status: AsistenciaStatus) => void;
    onHorasChange: (numeroDocumento: string, asignacionId: string, horas: string[], notas?: string) => void;
    isReadOnly?: boolean;
}

export function AsistenciaPersonalTable({ personal, asistencia, onStatusChange, onHorasChange, isReadOnly = false }: AsistenciaPersonalTableProps) {
    const [horasSheetState, setHorasSheetState] = useState<{ isOpen: boolean; docente: Docente | null }>({ isOpen: false, docente: null });
    const [incidenteSheetState, setIncidenteSheetState] = useState<{ isOpen: boolean; docente: Docente | null }>({ isOpen: false, docente: null });
    const { horas: horasPedagogicas } = useHorasPedagogicas();

    const handleStatusChange = (docente: Docente, newStatus: AsistenciaStatus) => {
        if (isReadOnly) return;
        onStatusChange(docente.numeroDocumento, newStatus);
        if ((newStatus === 'tarde' || newStatus === 'falta') && (docente.asignaciones || []).filter(a => !a.areaId).length > 0) {
            setHorasSheetState({ isOpen: true, docente: docente });
        }
    };
    
    const handleHorasSheetSave = (docenteId: string, asignacionId: string, horas: string[], notas?: string) => {
        onHorasChange(docenteId, asignacionId, horas, notas);
        setHorasSheetState({ isOpen: false, docente: null });
    };

    const handleOpenIncidenteSheet = (docente: Docente) => {
        setIncidenteSheetState({ isOpen: true, docente: docente });
    }

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">N°</TableHead>
                                    <TableHead>Nombres y Apellidos</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="text-center w-[200px]">Estado</TableHead>
                                    <TableHead className="text-center">Incidentes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {personal.map((p, index) => {
                                    const record = asistencia[p.numeroDocumento];
                                    if (!record) return null;
                                    
                                    const allHorasAfectadas = record.horasAfectadas || [];
                                    const allHorasIds = allHorasAfectadas.flatMap(ha => ha.horas);
                                    
                                    const allHorasData = allHorasIds
                                        .map(id => horasPedagogicas.find(h => h.id === id))
                                        .filter((h): h is {id: string, nombre: string} => !!h);

                                    const horasAbbr = allHorasData.map(h => `${parseInt(h.nombre)}h`);
                                    const horasToShow = horasAbbr.slice(0, 2);
                                    const remainingHorasCount = horasAbbr.length - horasToShow.length;

                                    const hasNotes = allHorasAfectadas.some(ha => ha.notas && ha.notas.trim() !== '');

                                    return (
                                        <TableRow
                                            key={p.numeroDocumento}
                                            className={cn({
                                                'bg-green-50 dark:bg-green-900/30': record.status === 'presente',
                                                'bg-yellow-50 dark:bg-yellow-900/30': record.status === 'tarde',
                                                'bg-red-50 dark:bg-red-900/30': record.status === 'falta',
                                                'bg-purple-50 dark:bg-purple-900/30': record.status === 'permiso',
                                            })}
                                        >
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {p.nombreCompleto}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{p.rol}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                                    {isReadOnly ? (
                                                        <AsistenciaBadge status={record.status} />
                                                    ) : (
                                                        <AsistenciaStatusSelector
                                                            currentStatus={record.status}
                                                            onStatusSelect={(newStatus) => handleStatusChange(p, newStatus)}
                                                            hasAsignaciones={(p.asignaciones || []).filter(a => !a.areaId).length > 0}
                                                        />
                                                    )}
                                                    {(horasAbbr.length > 0 || hasNotes) && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-1 cursor-default">
                                                                        {horasToShow.map(name => (
                                                                            <Badge key={name} variant="destructive" className="h-5">{name}</Badge>
                                                                        ))}
                                                                        {remainingHorasCount > 0 && (
                                                                            <Badge variant="destructive" className="h-5">+{remainingHorasCount}</Badge>
                                                                        )}
                                                                        {hasNotes && <StickyNote className="h-4 w-4 text-amber-600" />}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {allHorasData.length > 0 && <p>Horas: {allHorasData.map(h => h.nombre).join(', ')}</p>}
                                                                    {hasNotes && <p>Tiene notas de justificación.</p>}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenIncidenteSheet(p)}>
                                                    <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                                                    <span className="sr-only">Registrar Incidente</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {horasSheetState.docente && (
                <AsistenciaPersonalHorasSheet
                    isOpen={horasSheetState.isOpen}
                    onOpenChange={(isOpen) => setHorasSheetState(prev => ({...prev, isOpen}))}
                    docente={horasSheetState.docente}
                    record={asistencia[horasSheetState.docente.numeroDocumento]}
                    onSave={handleHorasSheetSave}
                />
            )}
            {incidenteSheetState.docente && (
                 <IncidenteFormSheet
                    open={incidenteSheetState.isOpen}
                    onOpenChange={(isOpen) => setIncidenteSheetState(prev => ({...prev, isOpen}))}
                    sujeto={incidenteSheetState.docente}
                    onSaveSuccess={() => setIncidenteSheetState({ isOpen: false, docente: null })}
                />
            )}
        </>
    );
}
