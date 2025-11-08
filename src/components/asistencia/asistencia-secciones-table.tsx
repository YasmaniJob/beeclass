
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

interface SeccionConInfo {
    grado: string;
    seccion: string;
    totalEstudiantes: number;
}

interface AsistenciaSeccionesTableProps {
    secciones: SeccionConInfo[];
    baseUrl: string;
}

export function AsistenciaSeccionesTable({ secciones, baseUrl }: AsistenciaSeccionesTableProps) {
    const { docentes } = useMatriculaData();
    const router = useRouter();

    if (secciones.length === 0) {
        return (
            <div className="p-6">
                <PlaceholderContent
                    icon={Users}
                    title="No se encontraron secciones"
                    description={"No hay secciones que coincidan con los filtros aplicados para este grado."}
                />
            </div>
        );
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Sección</TableHead>
                    <TableHead>Estudiantes</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {secciones.map(({ grado, seccion, totalEstudiantes }) => {
                    const tutor = docentes.find(d => 
                        d.asignaciones?.some(a => a.grado === grado && a.seccion === seccion && a.rol === 'Docente y Tutor')
                    );
                    const gradoEncoded = encodeURIComponent(grado);
                    const seccionEncoded = encodeURIComponent(seccion);
                    const href = `${baseUrl}/${gradoEncoded}/${seccionEncoded}`;

                    return (
                        <TableRow 
                            key={`${grado}-${seccion}`} 
                            onClick={() => router.push(href)}
                            className="cursor-pointer"
                        >
                            <TableCell className="font-medium">{seccion}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{totalEstudiantes} estudiantes</Badge>
                            </TableCell>
                            <TableCell>
                                {tutor ? `${tutor.nombres.split(' ')[0]} ${tutor.apellidoPaterno}` : <span className="text-muted-foreground italic">No asignado</span>}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push(href); }}>
                                    Registrar Asistencia
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
