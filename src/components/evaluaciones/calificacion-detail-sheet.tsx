
'use client';

import { Estudiante, Calificacion, NotaCualitativa } from '@/lib/definitions';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceholderContent } from '../ui/placeholder-content';
import { Users } from 'lucide-react';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Docente } from '@/domain/entities/Docente';
import { NotaBadge } from '../shared/nota-badge';

interface CalificacionDetailSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    estudiante: Estudiante | null;
    calificaciones: Calificacion[];
}

interface CalificacionPorDocente {
    docente: Docente;
    competencia1?: NotaCualitativa;
    competencia2?: NotaCualitativa;
    fecha?: Date;
    haCalificado: boolean;
}


export function CalificacionDetailSheet({ 
    isOpen, 
    onOpenChange, 
    estudiante,
    calificaciones,
}: CalificacionDetailSheetProps) {
    const { docentes } = useMatriculaData();
    
    const { calificadosYpendientes } = useMemo(() => {
        if (!estudiante) return { calificadosYpendientes: [] };

        const docentesAsignados = docentes.filter(d => 
            d.asignaciones?.some(a => a.grado === estudiante.grado && a.seccion === estudiante.seccion)
        );

        const data: CalificacionPorDocente[] = docentesAsignados.map(docente => {
            const calificacionesDocente = calificaciones.filter(c => c.docenteId === docente.numeroDocumento);
            
            const c1 = calificacionesDocente.find(c => c.competenciaId === 't-c1');
            const c2 = calificacionesDocente.find(c => c.competenciaId === 't-c2');

            const fechaMasReciente = [c1?.fecha, c2?.fecha].filter(Boolean).reduce((max, d) => (d && max && d > max) ? d : max, c1?.fecha || c2?.fecha);
            
            return {
                docente: docente,
                competencia1: c1?.nota,
                competencia2: c2?.nota,
                fecha: fechaMasReciente,
                haCalificado: !!c1 || !!c2,
            }
        });

        return { calificadosYpendientes: data };
    }, [calificaciones, docentes, estudiante]);


    if (!estudiante) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl flex flex-col">
                <SheetHeader>
                    <SheetTitle>Desglose de Competencias Transversales</SheetTitle>
                    <SheetDescription>
                        Calificaciones registradas por cada docente para <strong className="font-semibold text-foreground">{estudiante.nombres} {estudiante.apellidoPaterno}</strong>.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 flex-1 overflow-y-auto">
                    {calificadosYpendientes.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Docente</TableHead>
                                    <TableHead className="text-center">Gestiona Apr.</TableHead>
                                    <TableHead className="text-center">Desenv. EV</TableHead>
                                    <TableHead className="text-right">Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calificadosYpendientes.map(({ docente, competencia1, competencia2, fecha, haCalificado }) => (
                                    <TableRow key={docente.numeroDocumento} className={!haCalificado ? 'bg-muted/30' : ''}>
                                        <TableCell className="font-medium">{docente.nombres} {docente.apellidoPaterno}</TableCell>
                                        <TableCell className="text-center"><NotaBadge nota={competencia1} /></TableCell>
                                        <TableCell className="text-center"><NotaBadge nota={competencia2} /></TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {fecha ? format(fecha, 'dd/MM/yy HH:mm', { locale: es }) : (haCalificado ? '-' : 'Pendiente')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <PlaceholderContent
                            icon={Users}
                            title="No hay docentes"
                            description="No se encontraron docentes asignados a esta sección para calificar."
                        />
                    )}
                </div>
                 <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="secondary">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
