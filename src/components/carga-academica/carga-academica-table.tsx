
'use client';

import { useState, useEffect } from 'react';
import { DocenteEditable, cloneDocenteEditable } from '@/domain/mappers/docente-editable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { Button } from '@/components/ui/button';
import { Users, Settings } from 'lucide-react';
import { PaginationControls } from '../ui/pagination-controls';
import { CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { DocenteAsignacionDialog } from '../docentes/docente-asignacion-dialog';

interface CargaAcademicaTableProps {
    docentes: DocenteEditable[];
    onUpdateIndividual: (updatedDocente: DocenteEditable) => void;
}

const ITEMS_PER_PAGE = 10;

export function CargaAcademicaTable({ 
    docentes, 
    onUpdateIndividual,
}: CargaAcademicaTableProps) {
    
    const [currentPage, setCurrentPage] = useState(1);
    const [dialogState, setDialogState] = useState<{ isOpen: boolean; docente: DocenteEditable | null; }>({ isOpen: false, docente: null });

    useEffect(() => {
        setCurrentPage(1);
    }, [docentes]);

    const handleOpenDialog = (docente: DocenteEditable) => {
        setDialogState({ isOpen: true, docente: cloneDocenteEditable(docente) });
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
                    description={"No hay personal que coincida con la búsqueda."}
                />
            </div>
        );
    }

    return (
        <>
            <div className="overflow-auto relative">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Personal</TableHead>
                            <TableHead>Asignaciones</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedDocentes.map(docente => {
                            const mainAsignaciones = docente.asignaciones?.filter(a => !a.areaId) || [];
                            const tutorAsignaciones = mainAsignaciones.filter(a => a.rol === 'Docente y Tutor');
                            
                            return (
                                <TableRow key={docente.numeroDocumento}>
                                    <TableCell className="font-medium">
                                        <div className='flex flex-col gap-1 w-full pr-2'>
                                            <div className="flex items-center gap-2">
                                                <span>{`${docente.apellidoPaterno} ${docente.apellidoMaterno}, ${docente.nombres}`}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{docente.numeroDocumento}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {mainAsignaciones.length > 0 ? (
                                                <>
                                                    <Badge variant="outline">{mainAsignaciones.length} sección(es)</Badge>
                                                    {tutorAsignaciones.length > 0 && <Badge variant="default">{tutorAsignaciones.length} tutoría(s)</Badge>}
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Sin asignaciones</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleOpenDialog(docente)}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Gestionar Carga
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            
            {totalPages > 1 && (
                <CardFooter className="border-t pt-4 p-2 flex justify-end">
                    <PaginationControls 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardFooter>
            )}
            
            {dialogState.docente && (
                <DocenteAsignacionDialog 
                    open={dialogState.isOpen}
                    onOpenChange={(isOpen) => setDialogState(prev => ({...prev, isOpen}))}
                    docente={dialogState.docente}
                    onSave={onUpdateIndividual}
                />
            )}
        </>
    );
}
