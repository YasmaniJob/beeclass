
'use client';

import { useState, useEffect } from 'react';
import { DocenteEditable } from '@/domain/mappers/docente-editable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Pencil, Trash2, Users, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PaginationControls } from '../ui/pagination-controls';
import { CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DocentesTableProps {
    docentes: DocenteEditable[];
    onEdit: (docente: DocenteEditable) => void;
    onDelete: (numeroDocumento: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function DocentesTable({ docentes, onEdit, onDelete }: DocentesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [docenteToDelete, setDocenteToDelete] = useState<DocenteEditable | null>(null);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [docentes]);

    const handleDeleteClick = (docente: DocenteEditable) => {
        setDocenteToDelete(docente);
        setDeleteConfirmation('');
    };

    const handleDeleteConfirm = () => {
        if (docenteToDelete) {
            onDelete(docenteToDelete.numeroDocumento);
            setDocenteToDelete(null);
            setDeleteConfirmation('');
        }
    };

    const isDeleteConfirmationValid = () => {
        if (!docenteToDelete) return false;
        const expectedName = `${docenteToDelete.apellidoPaterno} ${docenteToDelete.apellidoMaterno}, ${docenteToDelete.nombres}`.toLowerCase().trim();
        return deleteConfirmation.toLowerCase().trim() === expectedName;
    };

    const totalPages = Math.ceil(docentes.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedDocentes = docentes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (docentes.length === 0) {
        return (
            <div className="p-6">
                <PlaceholderContent
                    icon={Users}
                    title="No se encontró personal"
                    description={"No hay personal que coincida con los filtros aplicados."}
                />
            </div>
        );
    }
    
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombres y Apellidos</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Asignaciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedDocentes.map(docente => {
                        const mainAsignaciones = docente.asignaciones?.filter(a => !a.areaId) || [];
                        const areasAsignadasCount = docente.asignaciones?.filter(a => a.areaId).length || 0;
                        return (
                            <TableRow key={docente.numeroDocumento}>
                                <TableCell className="font-medium">
                                    {`${docente.apellidoPaterno} ${docente.apellidoMaterno}, ${docente.nombres}`}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{docente.rol}</Badge>
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <div className="flex items-center gap-2">
                                            {mainAsignaciones.length > 0 && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline">{mainAsignaciones.length} sección(es)</Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-semibold">Secciones Asignadas:</p>
                                                        <ul className="list-disc pl-4">
                                                            {mainAsignaciones.map(a => <li key={a.id}>{a.grado} - {a.seccion}</li>)}
                                                        </ul>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            {areasAsignadasCount > 0 && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="default">{areasAsignadasCount} área(s)</Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Este docente ha autogestionado {areasAsignadasCount} áreas.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            {mainAsignaciones.length === 0 && areasAsignadasCount === 0 && (
                                                 <span className="text-xs text-muted-foreground italic">Sin asignaciones</span>
                                            )}
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
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
                                            <DropdownMenuItem onClick={() => onEdit(docente)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar Datos
                                            </DropdownMenuItem>
                                            <AlertDialog open={docenteToDelete?.numeroDocumento === docente.numeroDocumento} onOpenChange={(open) => !open && setDocenteToDelete(null)}>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteClick(docente); }} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <div className="flex items-center gap-2 text-destructive">
                                                            <AlertTriangle className="h-5 w-5" />
                                                            <AlertDialogTitle>⚠️ Eliminación Permanente</AlertDialogTitle>
                                                        </div>
                                                        <AlertDialogDescription className="space-y-3">
                                                            <p>
                                                                Esta acción <strong className="text-destructive">NO se puede deshacer</strong>. 
                                                                Se eliminará permanentemente a:
                                                            </p>
                                                            <p className="font-semibold text-foreground text-base">
                                                                {docente.apellidoPaterno} {docente.apellidoMaterno}, {docente.nombres}
                                                            </p>
                                                            <p className="text-sm">
                                                                Para confirmar, escribe el nombre completo exactamente como aparece arriba:
                                                            </p>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="delete-confirmation">Nombre completo</Label>
                                                        <Input
                                                            id="delete-confirmation"
                                                            placeholder="Apellido Paterno Apellido Materno, Nombres"
                                                            value={deleteConfirmation}
                                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                            className="font-mono"
                                                        />
                                                    </div>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={handleDeleteConfirm} 
                                                            disabled={!isDeleteConfirmationValid()}
                                                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50"
                                                        >
                                                            Eliminar Permanentemente
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
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
        </>
    );
}
