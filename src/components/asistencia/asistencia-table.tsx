'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Permiso, Incidente } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, History, FileLock, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AsistenciaRecord, AsistenciaStatus } from '@/hooks/use-asistencia';
import { PermisoFormSheet } from '../permisos/permiso-form-sheet';
import { AsistenciaBadge } from './asistencia-badge';
import { Badge } from '../ui/badge';
import { IncidenteHistorySheet } from '../incidentes/incidente-history-sheet';
import { HistorialAsistenciaSheet } from './historial-asistencia-sheet';
import { IncidenteFormSheet } from '../incidentes/incidente-form-sheet';
import { useIncidentes } from '@/hooks/use-incidentes';
import { Estudiante } from '@/domain/entities/Estudiante';

const statusCycle: AsistenciaStatus[] = ['presente', 'tarde', 'falta'];

interface AsistenciaTableProps {
    estudiantes: Estudiante[];
    asistencia: Record<string, AsistenciaRecord>;
    permisos: Permiso[];
    incidentes: Incidente[];
    onStatusChange: (numeroDocumento: string, status: AsistenciaStatus) => void;
    isReadOnly?: boolean;
}

const AsistenciaTableComponent = ({ estudiantes, asistencia, permisos, incidentes, onStatusChange, isReadOnly = false }: AsistenciaTableProps) => {
    const [isPermisoSheetOpen, setIsPermisoSheetOpen] = useState(false);
    const [isIncidenteHistorySheetOpen, setIsIncidenteHistorySheetOpen] = useState(false);
    const [isIncidenteFormSheetOpen, setIsIncidenteFormSheetOpen] = useState(false);
    const [isHistorialSheetOpen, setIsHistorialSheetOpen] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

    const handleRowClick = useCallback((numeroDocumento: string) => {
        if (isReadOnly) return;
        const currentStatus = asistencia[numeroDocumento]?.status;
        if (!currentStatus || currentStatus === 'permiso') return;

        const currentIndex = statusCycle.indexOf(currentStatus as AsistenciaStatus);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        const nextStatus = statusCycle[nextIndex];

        onStatusChange(numeroDocumento, nextStatus);
    }, [asistencia, onStatusChange, isReadOnly]);

    const handleOpenPermisoSheet = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsPermisoSheetOpen(true);
    };
    
    const handleOpenIncidenteHistorySheet = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsIncidenteHistorySheetOpen(true);
    };

    const handleOpenHistorialSheet = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsHistorialSheetOpen(true);
    }
    
    const handleOpenIncidenteFormSheet = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsIncidenteFormSheetOpen(true);
    }

    const incidentesPorEstudiante = useMemo(() => {
        const map = new Map<string, Incidente[]>();
        incidentes.forEach(incidente => {
            if (incidente.sujeto instanceof Estudiante) {
                const list = map.get(incidente.sujeto.numeroDocumento) || [];
                list.push(incidente);
                map.set(incidente.sujeto.numeroDocumento, list);
            }
        });
        return map;
    }, [incidentes]);
    
    const handleSaveIncidenteSuccess = () => {
        setIsIncidenteFormSheetOpen(false);
    };

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
                                    <TableHead className="text-center w-[150px]">Estado</TableHead>
                                    <TableHead className="text-center">Hora de Entrada</TableHead>
                                    <TableHead className="text-center">Historial</TableHead>
                                    <TableHead className="text-center">Incidentes</TableHead>
                                    <TableHead className="text-center">Permisos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estudiantes.map((estudiante, index) => {
                                    const record = asistencia[estudiante.numeroDocumento];
                                    if (!record) return null;
                                    const isPermission = record.status === 'permiso';
                                    const estudianteIncidentes = incidentesPorEstudiante.get(estudiante.numeroDocumento) || [];
                                    
                                    return (
                                        <TableRow
                                            key={estudiante.numeroDocumento}
                                            className={cn({
                                                'bg-green-50 dark:bg-green-900/30': record.status === 'presente',
                                                'bg-yellow-50 dark:bg-yellow-900/30': record.status === 'tarde',
                                                'bg-red-50 dark:bg-red-900/30': record.status === 'falta',
                                                'bg-purple-50 dark:bg-purple-900/30': isPermission,
                                            })}
                                        >
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell 
                                                className={cn("font-medium", {
                                                    'cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/50': !isReadOnly && !isPermission && record.status === 'presente',
                                                    'cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50': !isReadOnly && !isPermission && record.status === 'tarde',
                                                    'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50': !isReadOnly && !isPermission && record.status === 'falta',
                                                    'cursor-not-allowed': isReadOnly || isPermission,
                                                })}
                                                onClick={() => !isReadOnly && !isPermission && handleRowClick(estudiante.numeroDocumento)}
                                            >
                                                {estudiante.nombreCompleto}
                                            </TableCell>
                                            <TableCell 
                                                className={cn("text-center", {
                                                    'cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/50': !isReadOnly && !isPermission && record.status === 'presente',
                                                    'cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50': !isReadOnly && !isPermission && record.status === 'tarde',
                                                    'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50': !isReadOnly && !isPermission && record.status === 'falta',
                                                    'cursor-not-allowed': isReadOnly || isPermission,
                                                })}
                                                onClick={() => !isReadOnly && !isPermission && handleRowClick(estudiante.numeroDocumento)}
                                            >
                                                <AsistenciaBadge status={record.status} />
                                            </TableCell>
                                            <TableCell 
                                                className={cn("text-center", {
                                                    'cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/50': !isReadOnly && !isPermission && record.status === 'presente',
                                                    'cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50': !isReadOnly && !isPermission && record.status === 'tarde',
                                                    'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50': !isReadOnly && !isPermission && record.status === 'falta',
                                                    'cursor-not-allowed': isReadOnly || isPermission,
                                                })}
                                                onClick={() => !isReadOnly && !isPermission && handleRowClick(estudiante.numeroDocumento)}
                                            >
                                                {record.entryTime ? record.entryTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenHistorialSheet(estudiante)}>
                                                    <History className="h-4 w-4 text-blue-500" />
                                                    <span className="sr-only">Historial</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {estudianteIncidentes.length > 0 ? (
                                                    <Button type="button" variant="ghost" size="icon" className="relative" onClick={() => handleOpenIncidenteHistorySheet(estudiante)}>
                                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                        <Badge variant="destructive" className="absolute -top-1 -right-2 h-4 w-4 justify-center p-0 text-xs">{estudianteIncidentes.length}</Badge>
                                                        <span className="sr-only">Ver Incidentes</span>
                                                    </Button>
                                                ) : (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenIncidenteFormSheet(estudiante)}>
                                                        <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                                                        <span className="sr-only">Registrar Incidente</span>
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isPermission ? (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenPermisoSheet(estudiante)}>
                                                        <FileLock className="h-4 w-4 text-purple-500" />
                                                        <span className="sr-only">Permisos</span>
                                                    </Button>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {selectedEstudiante && isPermisoSheetOpen && (
                <PermisoFormSheet
                    open={isPermisoSheetOpen}
                    onOpenChange={setIsPermisoSheetOpen}
                    estudiante={selectedEstudiante}
                />
            )}
             {selectedEstudiante && isIncidenteHistorySheetOpen && (
                <IncidenteHistorySheet
                    open={isIncidenteHistorySheetOpen}
                    onOpenChange={setIsIncidenteHistorySheetOpen}
                    estudiante={selectedEstudiante}
                    incidentes={incidentesPorEstudiante.get(selectedEstudiante.numeroDocumento) || []}
                    onRegisterNew={() => {
                        setIsIncidenteHistorySheetOpen(false);
                        handleOpenIncidenteFormSheet(selectedEstudiante);
                    }}
                />
            )}
            {selectedEstudiante && isIncidenteFormSheetOpen && (
                 <IncidenteFormSheet
                    open={isIncidenteFormSheetOpen}
                    onOpenChange={setIsIncidenteFormSheetOpen}
                    sujeto={selectedEstudiante}
                    onSaveSuccess={handleSaveIncidenteSuccess}
                />
            )}
            {selectedEstudiante && isHistorialSheetOpen && (
                <HistorialAsistenciaSheet
                    open={isHistorialSheetOpen}
                    onOpenChange={setIsHistorialSheetOpen}
                    estudiante={selectedEstudiante}
                />
            )}
            <p className="mt-4 text-xs text-muted-foreground">
                Total estudiantes: <span className="font-medium text-foreground">{estudiantes.length}</span>
            </p>
        </>
    );
};

export const AsistenciaTable = memo(AsistenciaTableComponent);
