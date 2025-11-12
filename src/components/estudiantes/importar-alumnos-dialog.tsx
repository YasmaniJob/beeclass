
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Check, AlertTriangle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { EstudianteInput } from '@/domain/entities/EstudianteInput';
import { normalizeTipoDocumento } from '@/domain/mappers/entity-builders';

type Step = 'upload' | 'preview' | 'finished';
type EstudianteImportado = EstudianteInput;

export function ImportarAlumnosDialog({ 
    open: isOpen, 
    onOpenChange: setIsOpen, 
    onSave,
    grado,
    seccion
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    onSave: (estudiantes: EstudianteInput[]) => void,
    grado: string,
    seccion: string
}) {
    const { toast } = useToast();
    const { allEstudiantes } = useMatriculaData();
    const [step, setStep] = useState<Step>('upload');
    const [fileName, setFileName] = useState<string>('');
    const [processedEstudiantes, setProcessedEstudiantes] = useState<EstudianteImportado[]>([]);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setStep('upload');
        setFileName('');
        setProcessedEstudiantes([]);
        setError(null);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        resetState();
        setFileName(file.name);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            let headerRowIndex = -1;
            for (let i = 0; i < jsonData.length; i++) {
                if (jsonData[i].some((cell: any) => typeof cell === 'string' && cell.toUpperCase().includes('APELLIDO PATERNO'))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                setError('No se pudo encontrar la fila de encabezados. Asegúrate de que el archivo contenga la columna "APELLIDO PATERNO".');
                return;
            }

            const headerMap: { [key: string]: number } = {};
            const mainHeaderRow = jsonData[headerRowIndex];
            const upperHeaderRow = headerRowIndex > 0 ? jsonData[headerRowIndex - 1] : [];
            const upperHeaderRow2 = headerRowIndex > 1 ? jsonData[headerRowIndex - 2] : [];

            mainHeaderRow.forEach((cell: any, index: number) => {
                let headerText = typeof cell === 'string' ? cell.trim().toUpperCase() : '';
                if (!headerText) {
                    headerText = typeof upperHeaderRow[index] === 'string' ? upperHeaderRow[index].trim().toUpperCase() : '';
                }
                if (!headerText) {
                    headerText = typeof upperHeaderRow2[index] === 'string' ? upperHeaderRow2[index].trim().toUpperCase() : '';
                }
                if (headerText) {
                    if (headerText.includes('APELLIDO PATERNO')) headerMap['PATERNO'] = index;
                    if (headerText.includes('APELLIDO MATERNO')) headerMap['MATERNO'] = index;
                    if (headerText.includes('NOMBRES')) headerMap['NOMBRES'] = index;
                    if (headerText.includes('TIPO DE DOCUMENTO')) headerMap['TIPO_DOC'] = index;
                    if (headerText.includes('NÚMERO DE DOCUMENTO')) headerMap['NUM_DOC'] = index;
                }
            });

            if (!headerMap['PATERNO'] || !headerMap['NOMBRES'] || !headerMap['NUM_DOC']) {
                setError('No se pudieron encontrar las columnas requeridas: "NÚMERO DE DOCUMENTO", "APELLIDO PATERNO" y "NOMBRES".');
                return;
            }
            
            const dataRows = jsonData.slice(headerRowIndex + 1);
            const estudiantes: EstudianteImportado[] = [];

            for (const row of dataRows) {
                const numDoc = String(row[headerMap['NUM_DOC']] || '').trim();
                const paterno = String(row[headerMap['PATERNO']] || '').trim();
                const nombres = String(row[headerMap['NOMBRES']] || '').trim();

                if (numDoc && paterno && nombres) {
                    const tipoDocRaw = String(row[headerMap['TIPO_DOC']] || 'DNI').toUpperCase();
                    const tipoDocumento = normalizeTipoDocumento(tipoDocRaw);
                    const materno = String(row[headerMap['MATERNO']] || '').trim();

                    estudiantes.push({
                        tipoDocumento,
                        numeroDocumento: numDoc,
                        apellidoPaterno: paterno.toUpperCase(),
                        apellidoMaterno: materno.toUpperCase(),
                        nombres: nombres.toUpperCase(),
                    });
                }
            }
            
            if (estudiantes.length === 0) {
                setError("No se encontraron estudiantes válidos en el archivo. Verifica el formato del archivo y la fila de encabezados.");
                return;
            }

            setProcessedEstudiantes(estudiantes);
            setStep('preview');

        } catch (e) {
            console.error(e);
            setError("Hubo un error al procesar el archivo. Asegúrate de que sea un archivo .xlsx válido y no esté dañado.");
        }
    };
    
    const handleConfirmImport = async () => {
        // Normalizar números de documento para comparación (eliminar espacios y convertir a mayúsculas)
        const existingDocNumbers = new Set(
            allEstudiantes.map(e => e.numeroDocumento.trim().toUpperCase())
        );
        
        const nuevosEstudiantes = processedEstudiantes.filter(
            imp => !existingDocNumbers.has(imp.numeroDocumento.trim().toUpperCase())
        );

        const skippedCount = processedEstudiantes.length - nuevosEstudiantes.length;

        if (nuevosEstudiantes.length > 0) {
            const estudiantesConDestino = nuevosEstudiantes.map(est => ({
                ...est,
                grado,
                seccion,
            }));
            
            // Mostrar mensaje informativo si hay matriculados
            if (skippedCount > 0) {
                toast({
                    title: "Estudiantes ya matriculados",
                    description: `Se omitirán ${skippedCount} estudiante(s) ya matriculado(s). Se importarán ${nuevosEstudiantes.length} nuevo(s).`,
                });
            }
            
            // Cerrar el diálogo antes de iniciar la importación
            setIsOpen(false);
            resetState();
            
            // Llamar a onSave que ahora manejará el progreso
            onSave(estudiantesConDestino);
        } else {
            toast({
                title: "Sin cambios",
                description: `Todos los ${skippedCount} estudiante(s) del archivo ya están matriculados en el sistema.`,
            });
            setIsOpen(false);
            resetState();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetState(); setIsOpen(open); }}>
            <DialogTrigger asChild>
                <Button variant="outline"><Users className="mr-2 h-4 w-4" />Importar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Importar Estudiantes Masivamente</DialogTitle>
                    <DialogDescription>
                        Importa la lista de estudiantes para {grado} - {seccion} desde un archivo Excel (formato SIAGIE).
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto min-h-0">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error de Importación</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {step === 'upload' && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center min-h-[250px]">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Subir archivo de SIAGIE</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Arrastra un archivo .xlsx aquí, o haz clic para seleccionarlo.</p>
                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" />
                            <Button asChild className="mt-4">
                                <Label htmlFor="file-upload">Seleccionar Archivo</Label>
                            </Button>
                        </div>
                    )}
                
                    {step === 'preview' && (() => {
                        // Normalizar números de documento para comparación
                        const existingDocNumbers = new Set(
                            allEstudiantes.map(e => e.numeroDocumento.trim().toUpperCase())
                        );
                        const nuevosEstudiantes = processedEstudiantes.filter(
                            imp => !existingDocNumbers.has(imp.numeroDocumento.trim().toUpperCase())
                        );
                        const matriculados = processedEstudiantes.length - nuevosEstudiantes.length;
                        
                        return (
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                                        <Check className="text-primary"/>
                                        Previsualización y Confirmación
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Se encontraron <span className="font-bold text-foreground">{processedEstudiantes.length}</span> estudiantes en <span className="font-bold text-foreground">{fileName}</span>
                                    </p>
                                </div>
                                
                                {matriculados > 0 && (
                                    <Alert className="py-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle className="text-sm">Estudiantes ya matriculados</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            <span className="font-bold text-orange-600 dark:text-orange-400">{matriculados}</span> ya matriculado(s), 
                                            se importarán <span className="font-bold text-green-600 dark:text-green-400">{nuevosEstudiantes.length}</span> nuevo(s).
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {nuevosEstudiantes.length === 0 && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle className="text-sm">Sin estudiantes nuevos</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            Todos los estudiantes del archivo ya están matriculados.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-auto max-h-[300px]">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10">
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Estado</TableHead>
                                                    <TableHead>Nombres</TableHead>
                                                    <TableHead>Apellido</TableHead>
                                                    <TableHead className="w-[120px]">Documento</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {processedEstudiantes.slice(0, 10).map((est, index) => {
                                                    const yaExiste = existingDocNumbers.has(est.numeroDocumento.trim().toUpperCase());
                                                    return (
                                                        <TableRow key={index} className={yaExiste ? 'opacity-50' : ''}>
                                                            <TableCell>
                                                                {yaExiste ? (
                                                                    <span className="text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 whitespace-nowrap">
                                                                        Matriculado
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 whitespace-nowrap">
                                                                        Nuevo
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm">{est.nombres}</TableCell>
                                                            <TableCell className="text-sm">{est.apellidoPaterno}</TableCell>
                                                            <TableCell className="text-sm">{est.numeroDocumento}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                
                                {processedEstudiantes.length > 10 && (
                                    <p className="text-xs text-muted-foreground text-center">
                                        Mostrando 10 de {processedEstudiantes.length} registros
                                    </p>
                                )}
                            </div>
                        );
                    })()}
                </div>


                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                     <Button variant="outline" onClick={() => { setIsOpen(false); resetState(); }}>Cancelar</Button>
                     {step === 'preview' && (() => {
                         // Normalizar números de documento para comparación
                         const existingDocNumbers = new Set(
                             allEstudiantes.map(e => e.numeroDocumento.trim().toUpperCase())
                         );
                         const nuevosCount = processedEstudiantes.filter(
                             imp => !existingDocNumbers.has(imp.numeroDocumento.trim().toUpperCase())
                         ).length;
                         
                         return (
                             <Button 
                                 onClick={handleConfirmImport}
                                 disabled={nuevosCount === 0}
                             >
                                 {nuevosCount > 0 
                                     ? `Confirmar e Importar ${nuevosCount} Estudiante${nuevosCount !== 1 ? 's' : ''} Nuevo${nuevosCount !== 1 ? 's' : ''}`
                                     : 'No hay estudiantes nuevos para importar'
                                 }
                             </Button>
                         );
                     })()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    