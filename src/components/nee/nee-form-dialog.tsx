
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Estudiante } from '@/domain/entities/Estudiante';
import { NeeEntry } from '@/lib/definitions';
import { toEstudianteEntity } from '@/domain/mappers/entity-builders';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { AlumnoSearchCombobox } from '../alumnos/alumno-search-combobox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Link as LinkIcon } from 'lucide-react';

interface NeeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { estudiante: Estudiante; descripcion: string; documentoUrl?: string }) => Promise<void> | void;
    estudiantes: Estudiante[];
    entry?: NeeEntry | null;
    isSaving?: boolean;
}

export function NeeFormDialog({ open, onOpenChange, onSave, estudiantes, entry = null, isSaving = false }: NeeFormDialogProps) {
    const entryEstudiante = useMemo(() => {
        if (!entry?.estudiante) return null;
        if (entry.estudiante instanceof Estudiante) return entry.estudiante;
        const result = toEstudianteEntity(entry.estudiante as any);
        if (!result.isSuccess) {
            console.warn('NeeFormDialog: no se pudo convertir el estudiante del registro NEE', entry.estudiante);
            return null;
        }
        return result.value;
    }, [entry]);

    const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(entryEstudiante);
    const [neeDescription, setNeeDescription] = useState(entry?.descripcion ?? '');
    const [documentoUrl, setDocumentoUrl] = useState(entry?.documentoUrl ?? '');


    useEffect(() => {
        if (open) {
            setSelectedEstudiante(entryEstudiante);
            setNeeDescription(entry?.descripcion ?? '');
            setDocumentoUrl(entry?.documentoUrl ?? '');
        } else {
            resetForm();
        }
    }, [open, entry, entryEstudiante]);

    const resetForm = () => {
        setSelectedEstudiante(null);
        setNeeDescription('');
        setDocumentoUrl('');
    };

    const handleSave = async () => {
        if (selectedEstudiante && neeDescription.trim()) {
            await onSave({
                estudiante: selectedEstudiante,
                descripcion: neeDescription.trim(),
                documentoUrl: documentoUrl.trim() ? documentoUrl.trim() : undefined,
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Registrar Estudiante con NEE</SheetTitle>
                    <SheetDescription>
                        Busca un estudiante existente y añade la descripción de sus necesidades educativas especiales.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6 flex-1 overflow-y-auto -mx-6 px-6">
                    <div className="space-y-2">
                        <Label htmlFor="estudiante">Estudiante</Label>
                        <AlumnoSearchCombobox 
                            sujetos={estudiantes}
                            selectedSujeto={selectedEstudiante}
                            onSelect={(s) => setSelectedEstudiante((s as Estudiante) ?? null)}
                        />
                    </div>
                    {selectedEstudiante && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="nee-description">
                                    Descripción de NEE / Diagnóstico
                                </Label>
                                <Textarea 
                                    id="nee-description"
                                    value={neeDescription}
                                    onChange={(e) => setNeeDescription(e.target.value)}
                                    placeholder="Ej: Dislexia, TDAH, necesita apoyo visual..."
                                    rows={5}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="documento">
                                  Enlace a documento (opcional)
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="documento"
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={documentoUrl}
                                    onChange={e => setDocumentoUrl(e.target.value)}
                                    className="pl-10"
                                  />
                                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                                {entry?.documentoUrl && entry.documentoUrl !== documentoUrl && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Enlace anterior: <span className="break-all">{entry.documentoUrl}</span>
                                    </p>
                                )}
                              </div>
                        </>
                    )}
                </div>
                <SheetFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        type="submit" 
                        onClick={handleSave} 
                        disabled={!selectedEstudiante || !neeDescription.trim() || isSaving}
                    >
                        {entry ? 'Actualizar NEE' : 'Guardar Registro NEE'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
