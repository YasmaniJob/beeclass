
'use client';

import { Estudiante, Calificacion, Competencia, SesionAprendizaje } from '@/lib/definitions';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceholderContent } from '../ui/placeholder-content';
import { BookOpenCheck } from 'lucide-react';
import { NotaBadge } from '../shared/nota-badge';
import Link from 'next/link';

interface CalificacionesDesgloseSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    estudiante: Estudiante | null;
    competencia: Competencia | null;
    calificaciones: Calificacion[];
    sesiones: SesionAprendizaje[];
}


export function CalificacionesDesgloseSheet({ 
    isOpen, 
    onOpenChange, 
    estudiante,
    competencia,
    calificaciones,
    sesiones,
}: CalificacionesDesgloseSheetProps) {
    
    if (!estudiante || !competencia) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl flex flex-col">
                <SheetHeader>
                    <SheetTitle>Desglose de Calificaciones</SheetTitle>
                    <div className="text-sm text-muted-foreground pt-1">
                        <div className="font-medium text-foreground">{competencia.nombre}</div>
                        <div>Calificaciones por sesión para <strong className="font-semibold text-foreground">{estudiante.nombres} {estudiante.apellidoPaterno}</strong>.</div>
                    </div>
                </SheetHeader>
                <div className="py-6 flex-1 overflow-y-auto">
                    {calificaciones.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sesión de Aprendizaje</TableHead>
                                    <TableHead className="text-center">Nota</TableHead>
                                    <TableHead className="text-right">Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calificaciones.map((calificacion) => {
                                    const sesion = sesiones.find(s => s.id === calificacion.sesionId);
                                    
                                    const href = sesion ? `/evaluaciones/${encodeURIComponent(estudiante?.grado || '')}/${encodeURIComponent(estudiante?.seccion || '')}/${encodeURIComponent(sesion.areaId)}/${sesion.id}` : '#';

                                    return (
                                         <TableRow key={calificacion.id}>
                                            <TableCell className="font-medium">
                                                <Link href={href} className="hover:underline underline-offset-4">
                                                    {sesion?.titulo || 'Sesión no encontrada'}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center"><NotaBadge nota={calificacion.nota} /></TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {format(calificacion.fecha, 'dd/MM/yy HH:mm', { locale: es })}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                         <PlaceholderContent
                            icon={BookOpenCheck}
                            title="Sin calificaciones"
                            description="No se encontraron calificaciones de sesiones para esta competencia."
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
