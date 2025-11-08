'use client';

import { Estudiante, NotaCualitativa } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NotaSelector } from '../shared/nota-selector';
import { cn } from '@/lib/utils';
import { PlaceholderContent } from '../ui/placeholder-content';
import { GraduationCap } from 'lucide-react';

interface CalificacionesSesionTableProps {
    estudiantes: Estudiante[];
    calificaciones: Record<string, NotaCualitativa | null>;
    onNotaChange: (estudianteId: string, nota: NotaCualitativa) => void;
    changedStudentIds: Set<string>;
}

export function CalificacionesSesionTable({
    estudiantes,
    calificaciones,
    onNotaChange,
    changedStudentIds,
}: CalificacionesSesionTableProps) {

    if (estudiantes.length === 0) {
        return (
            <PlaceholderContent
                icon={GraduationCap}
                title="No hay estudiantes"
                description="No se encontraron estudiantes en esta sección para calificar."
                className="py-10 my-4"
            />
        )
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">N°</TableHead>
                        <TableHead>Apellidos y Nombres</TableHead>
                        <TableHead className="text-center w-[150px]">Calificación</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {estudiantes.map((estudiante, index) => (
                        <TableRow key={estudiante.numeroDocumento} className={cn(changedStudentIds.has(estudiante.numeroDocumento) && 'bg-blue-50 dark:bg-blue-900/30')}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                                {`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}
                            </TableCell>
                            <TableCell className="text-center">
                                <NotaSelector
                                    value={calificaciones[estudiante.numeroDocumento] || null}
                                    onValueChange={(nota) => onNotaChange(estudiante.numeroDocumento, nota)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}