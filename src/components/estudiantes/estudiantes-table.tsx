
'use client';

import { useState, useEffect } from 'react';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, ArrowRightLeft, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TrasladarEstudianteDialog } from '@/components/estudiantes/trasladar-estudiante-dialog';
import { PaginationControls } from '../ui/pagination-controls';
import { CardFooter } from '../ui/card';
import { useCurrentUser } from '@/hooks/use-current-user';

interface EstudiantesTableProps {
    estudiantes: Estudiante[];
    onEdit: (estudiante: Estudiante) => void;
    onDelete: (numeroDocumento: string) => void;
    onTransfer: (numeroDocumento: string, newGrado: string, newSeccion: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function EstudiantesTable({ estudiantes, onEdit, onDelete, onTransfer }: EstudiantesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [transferringEstudiante, setTransferringEstudiante] = useState<Estudiante | null>(null);
    const { user } = useCurrentUser();
    const isAdmin = user?.rol === 'Admin';


    useEffect(() => {
        setCurrentPage(1);
    }, [estudiantes]);

    const totalPages = Math.ceil(estudiantes.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedEstudiantes = estudiantes.slice(startIndex, endIndex);

    const openTransferDialog = (estudiante: Estudiante) => {
        setTransferringEstudiante(estudiante);
        setIsTransferDialogOpen(true);
    };

    const handleTransfer = (newGrado: string, newSeccion: string) => {
        if(transferringEstudiante) {
            onTransfer(transferringEstudiante.numeroDocumento, newGrado, newSeccion);
            setIsTransferDialogOpen(false);
            setTransferringEstudiante(null);
        }
    }

    if (estudiantes.length === 0) {
        return (
            <div className="p-6">
                <PlaceholderContent
                    icon={Users}
                    title="No se encontraron estudiantes"
                    description={isAdmin ? "No hay estudiantes que coincidan con los filtros o no se han matriculado aún." : "No hay estudiantes que coincidan con los filtros aplicados."}
                />
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">N°</TableHead>
                        <TableHead>Apellido Paterno</TableHead>
                        <TableHead>Apellido Materno</TableHead>
                        <TableHead>Nombres</TableHead>
                        {isAdmin && (
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedEstudiantes.map((estudiante, index) => (
                        <TableRow key={estudiante.numeroDocumento}>
                            <TableCell>{startIndex + index + 1}</TableCell>
                            <TableCell className="font-medium">{estudiante.apellidoPaterno}</TableCell>
                            <TableCell>{estudiante.apellidoMaterno}</TableCell>
                            <TableCell>{estudiante.nombres}</TableCell>
                            {isAdmin && (
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onEdit(estudiante)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openTransferDialog(estudiante)}>
                                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                Trasladar sección
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
                                                            Esta acción no se puede deshacer. Se eliminará al estudiante <strong className="font-medium">{estudiante.nombres} {estudiante.apellidoPaterno}</strong> de la sección.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(estudiante.numeroDocumento)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            {totalPages > 1 && (
                <CardFooter className="border-t pt-4 p-2">
                    <PaginationControls 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardFooter>
            )}

            <TrasladarEstudianteDialog
                isOpen={isTransferDialogOpen}
                onOpenChange={setIsTransferDialogOpen}
                estudiante={transferringEstudiante}
                onConfirm={handleTransfer}
            />
        </>
    );
}
