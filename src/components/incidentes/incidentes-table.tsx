
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Incidente } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Siren, MoreHorizontal, Pencil, Eye } from 'lucide-react';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { PaginationControls } from '../ui/pagination-controls';
import { IncidenteDetailSheet } from './incidente-detail-sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';

const ITEMS_PER_PAGE = 10;

interface IncidentesTableProps {
    incidentes: Incidente[];
    onDelete: (id: string) => void;
}

export function IncidentesTable({ incidentes, onDelete }: IncidentesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [incidentes]);

    const totalPages = Math.ceil(incidentes.length / ITEMS_PER_PAGE);
    const paginatedIncidentes = incidentes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleViewDetails = (incidente: Incidente) => {
        setSelectedIncidente(incidente);
        setIsSheetOpen(true);
    }
    
    if (incidentes.length === 0) {
        return (
            <div className="p-10">
                <PlaceholderContent
                    icon={Siren}
                    title={"No se encontraron resultados"}
                    description={"Intenta con otro término de búsqueda o registra un nuevo incidente."}
                />
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sujeto Involucrado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedIncidentes.map(i => (
                        <TableRow key={`${i.id}-${new Date(i.fecha).getTime()}`}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{`${i.sujeto.apellidoPaterno} ${i.sujeto.apellidoMaterno}, ${i.sujeto.nombres}`}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={'grado' in i.sujeto ? "secondary" : "default"}>
                                            {'grado' in i.sujeto ? 'Estudiante' : i.sujeto.rol}
                                        </Badge>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {format(new Date(i.fecha), 'P', {locale: es})}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(i)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Detalles
                                </Button>
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
                                            <Link href={`/incidentes/${i.id}/editar`}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar Incidente
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
                                                        Esta acción no se puede deshacer. Se eliminará el incidente para <strong>{i.sujeto.nombres}</strong>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(i.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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

            <IncidenteDetailSheet
                incidente={selectedIncidente}
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </>
    );
}
