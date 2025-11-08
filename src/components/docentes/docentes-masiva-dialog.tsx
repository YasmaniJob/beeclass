
'use client';

import { useState } from 'react';
import { TipoDocumentoEnum, UserRoleEnum } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Download, AlertTriangle, Users, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { ScrollArea } from '../ui/scroll-area';
import { Docente, DocenteRol } from '@/domain/entities/Docente';
import { TipoDocumento } from '@/domain/entities/Estudiante';
import { normalizeTipoDocumento } from '@/domain/mappers/entity-builders';

type Step = 'upload' | 'preview';

type ProcessedDocente = {
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    nombres: string;
    email?: string;
    telefono?: string;
    rol: DocenteRol;
};

export function DocentesMasivaDialog({ 
    open: isOpen, 
    onOpenChange: setIsOpen, 
    onSave,
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    onSave: (docentes: Docente[]) => void,
}) {
    const { toast } = useToast();
    const { docentes: allExistingDocentes } = useMatriculaData();
    const [step, setStep] = useState<Step>('upload');
    const [fileName, setFileName] = useState<string>('');
    const [processedDocentes, setProcessedDocentes] = useState<ProcessedDocente[]>([]);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setStep('upload');
        setFileName('');
        setProcessedDocentes([]);
        setError(null);
    };

    const handleDownloadTemplate = () => {
        const worksheet = XLSX.utils.json_to_sheet([
            {
                NOMBRE_COMPLETO: "GARCIA LOPEZ, ANA MARIA",
                DNI: "10203040",
                EMAIL: "ana.garcia@example.com",
                ROL: "Docente",
            },
        ]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Personal");
        XLSX.writeFile(workbook, "plantilla_importacion_personal.xlsx");
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
            
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                 setError("El archivo está vacío o no tiene un formato válido.");
                 return;
            }

            const docentes: ProcessedDocente[] = [];
            for (const row of jsonData) {
                const nombreCompleto = String(row.NOMBRE_COMPLETO || '').trim();
                const dni = String(row.DNI || '').trim();
                
                if (nombreCompleto && dni) {
                    const email = String(row.EMAIL || '').trim();
                    const rolRaw = String(row.ROL || 'Docente').trim();
                    const rolParsed = UserRoleEnum.safeParse(rolRaw);
                    const rol = (rolParsed.success ? rolParsed.data : 'Docente') as DocenteRol;
                    
                    const parts = nombreCompleto.split(',').map(p => p.trim());
                    let apellidoPaterno = '', apellidoMaterno = '', nombres = '';

                    if(parts.length > 1){
                        const apellidos = parts[0].split(' ');
                        apellidoPaterno = apellidos.shift() || '';
                        apellidoMaterno = apellidos.join(' ');
                        nombres = parts.slice(1).join(' ').trim();
                    } else {
                        // Si no hay coma, intentamos una división simple (poco ideal, pero es un fallback)
                        const nameParts = nombreCompleto.split(' ');
                        apellidoPaterno = nameParts.shift() || '';
                        if (nameParts.length > 2) apellidoMaterno = nameParts.shift() || '';
                        nombres = nameParts.join(' ');
                    }

                    docentes.push({
                        tipoDocumento: TipoDocumento.DNI,
                        numeroDocumento: dni,
                        apellidoPaterno: apellidoPaterno.toUpperCase(),
                        apellidoMaterno: apellidoMaterno.toUpperCase(),
                        nombres: nombres.toUpperCase(),
                        email,
                        rol,
                    });
                }
            }
            
            setProcessedDocentes(docentes);
            setStep('preview');

        } catch (e) {
            console.error(e);
            setError("Hubo un error al procesar el archivo. Asegúrate de que siga el formato de la plantilla.");
        }
    };
    

    const handleConfirmImport = () => {
        const nuevosPendientes = processedDocentes.filter(
            imp => !allExistingDocentes.some(e => e.numeroDocumento === imp.numeroDocumento)
        );

        const docentesCreados: Docente[] = [];
        const errores: string[] = [];

        nuevosPendientes.forEach(imp => {
            const result = Docente.crear({
                tipoDocumento: normalizeTipoDocumento(imp.tipoDocumento),
                numeroDocumento: imp.numeroDocumento,
                apellidoPaterno: imp.apellidoPaterno,
                apellidoMaterno: imp.apellidoMaterno,
                nombres: imp.nombres,
                email: imp.email,
                telefono: imp.telefono,
                rol: imp.rol,
                asignaciones: [],
                horario: {},
            });

            if (result.isSuccess) {
                docentesCreados.push(result.value);
            } else {
                errores.push(`${imp.nombres} ${imp.apellidoPaterno}: ${result.error.message}`);
            }
        });

        const skippedCount = processedDocentes.length - nuevosPendientes.length;

        if (docentesCreados.length > 0) {
            onSave(docentesCreados);
        }

        toast({
            title: 'Importación Completada',
            description: `${docentesCreados.length} miembro(s) del personal importado(s). Se omitieron ${skippedCount} duplicado(s).` + (errores.length > 0 ? ` ${errores.length} registro(s) no se pudieron importar.` : ''),
        });

        if (errores.length > 0) {
            console.warn('Errores al importar docentes:', errores);
        }

        setIsOpen(false);
        resetState();
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetState(); setIsOpen(open); }}>
            <DialogTrigger asChild>
                <Button variant="outline"><Users className="mr-2 h-4 w-4" />Registro Masivo</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Importación Masiva de Personal</DialogTitle>
                    <DialogDescription>
                       Importa la lista del personal desde un archivo Excel.
                    </DialogDescription>
                </DialogHeader>
                
                {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                
                {step === 'upload' && (
                    <div className="space-y-6 py-6">
                        <div className="space-y-2 text-center">
                            <h3 className="font-semibold">Paso 1: Descargar Plantilla</h3>
                            <p className="text-sm text-muted-foreground">Usa nuestra plantilla para asegurar que tus datos tengan el formato correcto.</p>
                            <Button onClick={handleDownloadTemplate}>
                                <Download className="mr-2" />
                                Descargar Plantilla de Excel
                            </Button>
                        </div>
                         <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 text-center">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Paso 2: Subir Archivo</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Una vez que hayas llenado la plantilla, súbela aquí.</p>
                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" />
                            <Button asChild className="mt-4"><Label htmlFor="file-upload">Seleccionar Archivo</Label></Button>
                        </div>
                    </div>
                )}
                
                {step === 'preview' && (
                     <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Check className="text-primary"/>Paso 3: Previsualización y Confirmación</h3>
                        <p className="text-sm text-muted-foreground">Se encontraron <span className="font-bold text-foreground">{processedDocentes.length}</span> registros. Los duplicados existentes (resaltados) se omitirán.</p>
                         <ScrollArea className="border rounded-lg max-h-[50vh] overflow-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Apellidos y Nombres</TableHead><TableHead>DNI</TableHead><TableHead>Email</TableHead><TableHead>Rol</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {processedDocentes.map((doc, index) => (
                                        <TableRow key={index} className={allExistingDocentes.some(e => e.numeroDocumento === doc.numeroDocumento) ? 'bg-muted/50 text-muted-foreground' : ''}>
                                            <TableCell>{`${doc.apellidoPaterno} ${doc.apellidoMaterno}, ${doc.nombres}`}</TableCell>
                                            <TableCell>{doc.numeroDocumento}</TableCell>
                                            <TableCell>{doc.email}</TableCell>
                                            <TableCell>{doc.rol}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                )}

                <DialogFooter className="pt-4">
                     <Button variant="secondary" onClick={() => { setIsOpen(false); resetState(); }}>Cancelar</Button>
                    {step === 'preview' && <Button onClick={handleConfirmImport}>Confirmar e Importar</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

