
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlaceholderContent } from "@/components/ui/placeholder-content";
import { Users } from "lucide-react";
import { EstudianteConteo } from "@/hooks/use-reporte-asistencia";
import { Badge } from "../ui/badge";
import { CardFooter } from "../ui/card";
import { PaginationControls } from "../ui/pagination-controls";

interface ReporteAsistenciaTableProps {
    estudiantes: EstudianteConteo[];
    pagination: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
}

export function ReporteAsistenciaTable({ estudiantes, pagination }: ReporteAsistenciaTableProps) {
    
    if (estudiantes.length === 0) {
        return (
            <div className="p-6">
                <PlaceholderContent
                    icon={Users}
                    title="No se encontraron estudiantes"
                    description="No hay estudiantes en la sección seleccionada para mostrar en el reporte."
                />
            </div>
        );
    }
    
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead className="text-center">Presente</TableHead>
                        <TableHead className="text-center">Tardanzas</TableHead>
                        <TableHead className="text-center">Faltas</TableHead>
                        <TableHead className="text-center">Permisos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {estudiantes.map(est => {
                        const fullName = `${est.estudiante.apellidoPaterno}${est.estudiante.apellidoMaterno ? ` ${est.estudiante.apellidoMaterno}` : ''}, ${est.estudiante.nombres}`;
                        return (
                        <TableRow key={est.estudiante.numeroDocumento}>
                            <TableCell className="font-medium">
                                {fullName}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="text-green-600 border-green-200">{est.presente}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                 <Badge variant="outline" className="text-yellow-600 border-yellow-200">{est.tarde}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                 <Badge variant="destructive">{est.falta}</Badge>
                            </TableCell>
                             <TableCell className="text-center">
                                 <Badge variant="outline" className="text-purple-600 border-purple-200">{est.permiso}</Badge>
                            </TableCell>
                        </TableRow>
                    );
                    })}
                </TableBody>
            </Table>

            {pagination.totalPages > 1 && (
                <CardFooter className="border-t px-6 py-4 justify-end">
                    <PaginationControls
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                    />
                </CardFooter>
            )}
        </>
    );
}
