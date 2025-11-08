

'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Estudiante } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';
import { EstudiantesTable } from '@/components/estudiantes/estudiantes-table';
import { EstudiantesFiltros } from '@/components/alumnos/alumnos-filtros';
import { AlumnoFormDialog } from '@/components/alumnos/alumno-form-dialog';
import { ImportarAlumnosDialog } from '@/components/estudiantes/importar-alumnos-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { Download, FileText, Sheet as ExcelIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { useSupabaseData } from '@/hooks/use-supabase-data';
import { toEstudianteEntity } from '@/domain/mappers/entity-builders';
import { TipoDocumento } from '@/domain/entities/Estudiante';

export type EstudianteFilters = {
    estado: string[];
};

export default function SeccionDetailPage() {
    const params = useParams<{ grado: string; seccion: string }>();
    const { toast } = useToast();
    const { user } = useCurrentUser();
    const isAdmin = user?.rol === 'Admin';
    
    const grado = decodeURIComponent(params.grado);
    const seccion = decodeURIComponent(params.seccion);

    const { estudiantesPorSeccion } = useMatriculaData();
    const { addEstudiante, updateEstudiante, deleteEstudiante, refreshEstudiantes } = useSupabaseData();

    const estudiantes = useMemo(() => {
        return (estudiantesPorSeccion[grado]?.[seccion] || []).sort((a: Estudiante, b: Estudiante) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
    }, [estudiantesPorSeccion, grado, seccion]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<EstudianteFilters>({ estado: [] });
    const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
    const [isMasivaDialogOpen, setIsMasivaDialogOpen] = useState(false);
    const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);

    const buildEstudianteEntity = (data: Omit<Estudiante, 'grado' | 'seccion'>, gradoDestino: string, seccionDestino: string) => {
        const result = toEstudianteEntity({
            numeroDocumento: data.numeroDocumento,
            tipoDocumento: data.tipoDocumento as TipoDocumento,
            nombres: data.nombres,
            apellidoPaterno: data.apellidoPaterno,
            apellidoMaterno: data.apellidoMaterno,
            grado: gradoDestino,
            seccion: seccionDestino,
            nee: data.nee,
            neeDocumentos: data.neeDocumentos,
        });

        if (!result.isSuccess) {
            toast({
                title: 'Datos inválidos',
                description: result.error.message,
                variant: 'destructive',
            });
            return null;
        }

        return result.value;
    };

    const handleSaveEstudiante = async (estudianteData: Omit<Estudiante, 'grado' | 'seccion'>) => {
        const entity = buildEstudianteEntity(estudianteData, grado, seccion);
        if (!entity) {
            return;
        }

        if (editingEstudiante) {
            const success = await updateEstudiante(editingEstudiante.numeroDocumento, { ...entity });
            if (success) {
                await refreshEstudiantes();
                toast({ title: 'Estudiante actualizado', description: `${estudianteData.nombres} ${estudianteData.apellidoPaterno} ha sido actualizado.` });
            } else {
                toast({
                    title: 'Error',
                    description: 'No se pudo actualizar el estudiante',
                    variant: 'destructive',
                });
            }
        } else {
            const success = await addEstudiante(entity);
            if (success) {
                await refreshEstudiantes();
                toast({ title: 'Estudiante matriculado', description: `${estudianteData.nombres} ${estudianteData.apellidoPaterno} ha sido añadido a la sección.` });
            } else {
                toast({
                    title: 'Error',
                    description: 'No se pudo matricular el estudiante',
                    variant: 'destructive',
                });
            }
        }

        setEditingEstudiante(null);
    };

    const handleMassEnrollment = async (nuevosEstudiantes: Omit<Estudiante, 'grado' | 'seccion'>[]) => {
        const entities = nuevosEstudiantes
            .map(data => buildEstudianteEntity(data, grado, seccion))
            .filter((entity): entity is NonNullable<typeof entity> => Boolean(entity));

        if (entities.length === 0) {
            return;
        }

        const results = await Promise.all(entities.map(entity => addEstudiante(entity)));
        const successCount = results.filter(Boolean).length;

        if (successCount > 0) {
            await refreshEstudiantes();
        }

        toast({
            title: 'Importación masiva completa',
            description: `Se han añadido ${successCount} nuevo(s) estudiante(s).`,
        });
    };
    
    const handleDeleteEstudiante = async (numeroDocumento: string) => {
        const success = await deleteEstudiante(numeroDocumento);
        if (success) {
            await refreshEstudiantes();
            toast({ title: 'Estudiante eliminado', description: 'El estudiante ha sido eliminado de la sección.' });
        } else {
            toast({ 
                title: 'Error', 
                description: 'No se pudo eliminar el estudiante',
                variant: 'destructive'
            });
        }
    };

    const handleOpenEditDialog = (estudiante: Estudiante) => {
        setEditingEstudiante(estudiante);
        setIsIndividualDialogOpen(true);
    };
    
    const handleOpenIndividualDialog = (open: boolean) => {
        if (!open) {
            setEditingEstudiante(null);
        }
        setIsIndividualDialogOpen(open);
    }
    
    const handleTransfer = async (numeroDocumento: string, newGrado: string, newSeccion: string) => {
        // Encontrar el estudiante actual
        const estudiante = estudiantes.find(e => e.numeroDocumento === numeroDocumento);
        if (!estudiante) {
            toast({
                title: 'Error',
                description: 'No se encontró el estudiante',
                variant: 'destructive'
            });
            return;
        }

        // Actualizar con el nuevo grado y sección
        const entity = buildEstudianteEntity(estudiante, newGrado, newSeccion);
        if (!entity) {
            return;
        }

        const success = await updateEstudiante(numeroDocumento, { ...entity });

        if (success) {
            await refreshEstudiantes();
            toast({
                title: 'Estudiante Trasladado',
                description: `El estudiante ha sido movido a ${newGrado} - ${newSeccion}.`,
            });
        } else {
            toast({
                title: 'Error',
                description: 'No se pudo trasladar el estudiante',
                variant: 'destructive'
            });
        }
    }

    const filteredEstudiantes = estudiantes.filter(estudiante => {
        const searchTermLower = searchTerm.toLowerCase();
        const fullName = `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno} ${estudiante.nombres}`.toLowerCase();
        const searchMatch = fullName.includes(searchTermLower) || estudiante.numeroDocumento.toLowerCase().includes(searchTermLower);
        return searchMatch;
    });
    
    const exportToExcel = () => {
        const dataToExport = filteredEstudiantes.map((a, index) => ({
            'N°': index + 1,
            'Apellidos y Nombres': `${a.apellidoPaterno} ${a.apellidoMaterno}, ${a.nombres}`,
            'Tipo Doc.': a.tipoDocumento,
            'N° Documento': a.numeroDocumento,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');
        XLSX.writeFile(workbook, `Estudiantes_${grado}_${seccion}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const year = new Date().getFullYear();
    
        doc.setFontSize(18);
        doc.text(`NÓMINA DE ASISTENCIA ${year}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Grado: ${grado}`, 14, 28);
        doc.text(`Sección: ${seccion.replace('Sección ','')}`, 14, 34);

        const tableBody = filteredEstudiantes.map((estudiante, index) => [
            (index + 1).toString().padStart(2, '0'),
            `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`,
            ...Array(20).fill(''), // 4 semanas * 5 dias
            estudiante.nee ? 'NEE' : '' // Observaciones
        ]);

        autoTable(doc, {
            startY: 40,
            head: [
                [
                    { content: 'N°', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'APELLIDOS Y NOMBRES', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'SEMANA 1', colSpan: 5, styles: { halign: 'center' } },
                    { content: 'SEMANA 2', colSpan: 5, styles: { halign: 'center' } },
                    { content: 'SEMANA 3', colSpan: 5, styles: { halign: 'center' } },
                    { content: 'SEMANA 4', colSpan: 5, styles: { halign: 'center' } },
                    { content: 'OBSERVACIONES', rowSpan: 2, styles: { halign: 'center', valign: 'middle', minCellWidth: 20 } },
                ],
                [...Array(4).fill(['L', 'M', 'M', 'J', 'V']).flat()]
            ],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [89, 171, 69],
                textColor: 255,
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 60 },
                22: { cellWidth: 20, halign: 'center' }
            },
            didDrawCell: (data) => {
                const isWeekSeparator = data.column.index > 1 && (data.column.index - 1) % 5 === 0;
                if (isWeekSeparator && data.column.index < 22) {
                    doc.setLineWidth(0.5);
                    doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                }
            },
        });

        doc.save(`Registro_Auxiliar_${grado}_${seccion}.pdf`);
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {grado} - {seccion.replace('Sección ', '')}
                    </h1>
                     <p className="text-muted-foreground mt-1">
                        {filteredEstudiantes.length} de {estudiantes.length} estudiantes en esta sección.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    {isAdmin && (
                        <>
                            <AlumnoFormDialog
                                open={isIndividualDialogOpen}
                                onOpenChange={handleOpenIndividualDialog}
                                onSave={handleSaveEstudiante}
                                studentToEdit={editingEstudiante}
                            />
                            <ImportarAlumnosDialog 
                                open={isMasivaDialogOpen}
                                onOpenChange={setIsMasivaDialogOpen}
                                onSave={handleMassEnrollment}
                                grado={grado}
                                seccion={seccion}
                            />
                        </>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                           <div className="flex flex-col space-y-2">
                                <Button variant="ghost" onClick={exportToPDF} className="justify-start">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Registro Auxiliar (PDF)
                                </Button>
                                <Button variant="ghost" onClick={exportToExcel} className="justify-start">
                                    <ExcelIcon className="mr-2 h-4 w-4" />
                                    Lista de Estudiantes (Excel)
                                </Button>
                           </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            
            <Card>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b">
                   <EstudiantesFiltros
                        filters={filters}
                        onFiltersChange={setFilters}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                    />
                </div>
                <CardContent className="p-0">
                    <EstudiantesTable
                        estudiantes={filteredEstudiantes}
                        onEdit={handleOpenEditDialog}
                        onDelete={handleDeleteEstudiante}
                        onTransfer={handleTransfer}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
    
