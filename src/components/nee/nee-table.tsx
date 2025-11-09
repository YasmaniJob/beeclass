
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NeeEntry } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { Accessibility, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { PaginationControls } from '../ui/pagination-controls';
import { CardFooter } from '../ui/card';
import { Button } from '../ui/button';

interface NeeTableProps {
    entries: NeeEntry[];
    onViewDetails: (entry: NeeEntry) => void;
}

const ITEMS_PER_PAGE = 10;

export function NeeTable({ entries, onViewDetails }: NeeTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [entries]);

    const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedEntries = entries.slice(startIndex, endIndex);

    if (entries.length === 0) {
        return (
            <div className="p-6">
                <PlaceholderContent
                    icon={Accessibility}
                    title="No se encontraron estudiantes"
                    description="No hay estudiantes con NEE que coincidan con la búsqueda."
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
                        <TableHead>Apellidos y Nombres</TableHead>
                        <TableHead>Grado y Sección</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedEntries.map((entry, index) => (
                        <TableRow key={entry.id} className="odd:bg-muted/50">
                            <TableCell>{startIndex + index + 1}</TableCell>
                            <TableCell className="font-medium">{`${entry.estudiante.apellidoPaterno} ${entry.estudiante.apellidoMaterno ?? ''}, ${entry.estudiante.nombres}`}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{entry.estudiante.grado ?? 'Sin grado'} - {entry.estudiante.seccion ?? 'Sin sección'}</Badge>
                            </TableCell>
                            <TableCell>
                                {entry.documentoUrl ? (
                                    <Link
                                        href={entry.documentoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Ver documento
                                    </Link>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">Sin documento</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button type="button" variant="outline" size="sm" onClick={() => onViewDetails(entry)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver detalles
                                </Button>
                            </TableCell>
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
        </>
    );
}
