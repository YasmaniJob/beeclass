
'use client';

import { useState, useEffect } from 'react';
import { EstudianteEnRiesgo } from '@/hooks/use-en-riesgo-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { UserCheck, History } from 'lucide-react';
import { Badge } from '../ui/badge';
import { PaginationControls } from '../ui/pagination-controls';
import { CardFooter } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

interface EnRiesgoTableProps {
    estudiantes: EstudianteEnRiesgo[];
    isLoading: boolean;
    onOpenSeguimiento: (estudiante: EstudianteEnRiesgo) => void;
    seguimientosCount: Map<string, number>;
    canManageSeguimiento: boolean;
}

const ITEMS_PER_PAGE = 10;

export function EnRiesgoTable({ estudiantes, isLoading, onOpenSeguimiento, seguimientosCount, canManageSeguimiento }: EnRiesgoTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [estudiantes]);

    const totalPages = Math.ceil(estudiantes.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedEstudiantes = estudiantes.slice(startIndex, endIndex);

    const RiskDetailsContent = ({estudiante}: {estudiante: EstudianteEnRiesgo}) => (
        <div className='p-2'>
            <div className="font-semibold text-foreground">Detalle de notas bajas:</div>
            <ul className="list-disc list-inside mt-1 space-y-1">
                {estudiante.areasConNotasBajas.map(area => (
                    <li key={area.area} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{area.area}:</span> {area.count}
                    </li>
                ))}
            </ul>
        </div>
    );
    
    if (isLoading) {
        return (
            <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (estudiantes.length === 0) {
        return (
            <div className="p-6">
                <PlaceholderContent
                    icon={UserCheck}
                    title="No hay estudiantes en riesgo"
                    description="Todos los estudiantes están al día según los criterios actuales."
                />
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Apellidos y Nombres</TableHead>
                        <TableHead>Grado y Sección</TableHead>
                        <TableHead className='text-center'>Indicadores de Riesgo</TableHead>
                        <TableHead className='text-center'>Seguimiento</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedEstudiantes.map((estudiante) => {
                        const count = seguimientosCount.get(estudiante.numeroDocumento) || 0;
                        const hasSeguimiento = count > 0;
                        const showPulse = canManageSeguimiento && !hasSeguimiento;
                        const buttonLabel = canManageSeguimiento
                            ? (hasSeguimiento ? `Ver (${count})` : 'Registrar')
                            : (hasSeguimiento ? `Ver (${count})` : 'Ver detalle');
                        return (
                            <TableRow key={estudiante.numeroDocumento} className="odd:bg-muted/50">
                                <TableCell className="font-medium">
                                    {`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{estudiante.grado} - {estudiante.seccion}</Badge>
                                </TableCell>
                                <TableCell className='text-center'>
                                    <div className='flex items-center justify-center gap-2 flex-wrap'>
                                        {estudiante.faltasCount > 0 && <Badge variant="destructive">Faltas: {estudiante.faltasCount}</Badge>}
                                        {estudiante.incidentesCount > 0 && <Badge variant="destructive" className="bg-orange-500 text-white hover:bg-orange-600">Incidentes: {estudiante.incidentesCount}</Badge>}
                                        
                                        {estudiante.notasBajasCount > 0 && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Badge variant="destructive" className="bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer">
                                                        Notas Bajas: {estudiante.notasBajasCount}
                                                    </Badge>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Estudiante: {estudiante.nombres} {estudiante.apellidoPaterno}</DialogTitle>
                                                        <DialogDescription asChild>
                                                            <RiskDetailsContent estudiante={estudiante} />
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button 
                                        variant={showPulse ? "default" : "outline"} 
                                        size="sm" 
                                        onClick={() => onOpenSeguimiento(estudiante)}
                                        className={cn(showPulse && "bg-amber-500 hover:bg-amber-600 text-white font-bold animate-pulse")}
                                    >
                                        <History className="mr-2 h-4 w-4" />
                                        {buttonLabel}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            
            {totalPages > 1 && (
                 <CardFooter className="border-t pt-4 p-2 flex justify-end">
                    <PaginationControls 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardFooter>
            )}
        </>
    );
}
