
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
        const existingDocNumbers = new Set(allEstudiantes.map(e => e.numeroDocumento));
        const nuevosEstudiantes = processedEstudiantes.filter(
            imp => !existingDocNumbers.has(imp.numeroDocumento)
        );

        const skippedCount = processedEstudiantes.length - nuevosEstudiantes.length;

        if (nuevosEstudiantes.length > 0) {
            const estudiantesConDestino = nuevosEstudiantes.map(est => ({
                ...est,
                grado,
                seccion,
            }));
            
            // Cerrar el diálogo antes de iniciar la importación
            setIsOpen(false);
            resetState();
            
            // Llamar a onSave que ahora manejará el progreso
            onSave(estudiantesConDestino);
        } else {
            toast({
                title: "Sin cambios",
                description: `Todos los estudiantes ya están registrados. Se omitieron ${skippedCount} duplicado(s).`,
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
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Importar Estudiantes Masivamente</DialogTitle>
                    <DialogDescription>
                        Importa la lista de estudiantes para {grado} - {seccion} desde un archivo Excel (formato SIAGIE).
                    </DialogDescription>
                </DialogHeader>
                
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error de Importación</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                {step === 'upload' && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center h-64">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Subir archivo de SIAGIE</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Arrastra un archivo .xlsx aquí, o haz clic para seleccionarlo.</p>
                        <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" />
                        <Button asChild className="mt-4">
                            <Label htmlFor="file-upload">Seleccionar Archivo</Label>
                        </Button>
                    </div>
                )}
                
                {step === 'preview' && (
                     <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Check className="text-primary"/>Previsualización y Confirmación</h3>
                        <p className="text-sm text-muted-foreground">Se encontraron <span className="font-bold text-foreground">{processedEstudiantes.length}</span> estudiantes en el archivo <span className="font-bold text-foreground">{fileName}</span>. Revisa los primeros 6 registros antes de importar.</p>
                        <div className="overflow-auto border rounded-lg max-h-[50vh]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombres</TableHead>
                                        <TableHead>Apellido Paterno</TableHead>
                                        <TableHead>N° Documento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {processedEstudiantes.slice(0, 6).map((est, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{est.nombres}</TableCell>
                                            <TableCell>{est.apellidoPaterno}</TableCell>
                                            <TableCell>{est.numeroDocumento}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}


                <DialogFooter className="pt-4">
                     <Button variant="outline" onClick={() => { setIsOpen(false); resetState(); }}>Cancelar</Button>
                     {step === 'preview' && (
                         <Button onClick={handleConfirmImport}>
                            Confirmar e Importar {processedEstudiantes.length} Estudiantes
                        </Button>
                     )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    