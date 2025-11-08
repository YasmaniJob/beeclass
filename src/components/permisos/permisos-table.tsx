
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Permiso } from '@/domain/entities/Permiso';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, FileLock, MoreHorizontal, Pencil, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { PaginationControls } from '../ui/pagination-controls';
import { PermisoDetailSheet } from './permiso-detail-sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { CardFooter } from '../ui/card';

const ITEMS_PER_PAGE = 10;

interface PermisosTableProps {
    permisos: Permiso[];
    onDelete: (id: string) => void;
    canManage: boolean;
}

export function PermisosTable({ permisos, onDelete, canManage }: PermisosTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [permisos]);

    const totalPages = Math.ceil(permisos.length / ITEMS_PER_PAGE);
    const paginatedPermisos = permisos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleViewDetails = (permiso: Permiso) => {
        setSelectedPermiso(permiso);
        setIsSheetOpen(true);
    }
    
    if (permisos.length === 0) {
        return (
            <div className="p-10">
                <PlaceholderContent
                    icon={FileLock}
                    title={"No se encontraron resultados"}
                    description={"Intenta con otro término de búsqueda o registra un nuevo permiso."}
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
                        <TableHead>Grado y Sección</TableHead>
                        <TableHead>Fechas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedPermisos.map(p => (
                        <TableRow key={`${p.id}-${p.fechaInicio.getTime()}-${p.fechaFin.getTime()}`}>
                            <TableCell className="font-medium">
                                {`${p.estudiante.apellidoPaterno} ${p.estudiante.apellidoMaterno}, ${p.estudiante.nombres}`}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{p.estudiante.grado} - {p.estudiante.seccion}</Badge>
                            </TableCell>
                            <TableCell>
                                {format(p.fechaInicio, 'P', {locale: es})} - {format(p.fechaFin, 'P', {locale: es})}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(p)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Detalles
                                </Button>
                                {canManage && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Más Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/permisos/${p.id}/editar`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar Permiso
                                                </Link>
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Se eliminará el permiso para <strong>{p.estudiante.nombres}</strong>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(p.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <CardFooter className="border-t pt-6">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardFooter>
            )}

            <PermisoDetailSheet
                permiso={selectedPermiso}
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </>
    );
}
