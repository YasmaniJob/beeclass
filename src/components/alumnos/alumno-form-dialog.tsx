
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Estudiante, TipoDocumentoEnum } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface AlumnoFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (estudiante: Estudiante) => void;
    studentToEdit: Estudiante | null;
}

export function AlumnoFormDialog({ open, onOpenChange, onSave, studentToEdit: studentToEdit }: AlumnoFormDialogProps) {
    const [tipoDocumento, setTipoDocumento] = useState<z.infer<typeof TipoDocumentoEnum>>('DNI');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [nombres, setNombres] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (studentToEdit) {
            setTipoDocumento(studentToEdit.tipoDocumento);
            setNumeroDocumento(studentToEdit.numeroDocumento);
            setApellidoPaterno(studentToEdit.apellidoPaterno);
            setApellidoMaterno(studentToEdit.apellidoMaterno || '');
            setNombres(studentToEdit.nombres);
        } else {
            resetForm();
        }
    }, [studentToEdit, open]);

    const resetForm = () => {
        setTipoDocumento('DNI');
        setNumeroDocumento('');
        setApellidoPaterno('');
        setApellidoMaterno('');
        setNombres('');
        setFormError(null);
    };

    const validateForm = () => {
        if (!!studentToEdit) return true; // No validar N° Doc si estamos editando

        if (tipoDocumento === 'DNI') {
            if (!/^\d{8}$/.test(numeroDocumento)) {
                setFormError('El DNI debe tener 8 dígitos numéricos.');
                return false;
            }
        } else if (tipoDocumento === 'CE') {
            if (!/^[a-zA-Z0-9]{9}$/.test(numeroDocumento)) {
                setFormError('El Carné de Extranjería debe tener 9 caracteres alfanuméricos.');
                return false;
            }
        }
        setFormError(null);
        return true;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        const estudianteData: Estudiante = {
            ...studentToEdit,
            tipoDocumento,
            numeroDocumento: numeroDocumento.trim(),
            apellidoPaterno: apellidoPaterno.trim().toUpperCase(),
            apellidoMaterno: apellidoMaterno.trim().toUpperCase(),
            nombres: nombres.trim().toUpperCase(),
        };

        onSave(estudianteData);
        onOpenChange(false);
        resetForm();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Matricula
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col" onKeyDown={handleKeyDown}>
                <SheetHeader>
                    <SheetTitle>{studentToEdit ? 'Editar Estudiante' : 'Matrícula Individual'}</SheetTitle>
                    <SheetDescription>
                        {studentToEdit ? 'Modifica los datos del estudiante.' : 'Añade un nuevo estudiante a la sección.'}
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="space-y-4 py-4 px-6">
                        <div className="space-y-2">
                            <Label htmlFor="tipo-documento">
                                Tipo Doc.
                            </Label>
                            <Select value={tipoDocumento} onValueChange={(value) => setTipoDocumento(value as any)} disabled={!!studentToEdit}>
                                <SelectTrigger id="tipo-documento">
                                    <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DNI">DNI</SelectItem>
                                    <SelectItem value="CE">CE</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numero-documento">
                                N° Doc.
                            </Label>
                             <Input
                                id="numero-documento"
                                value={numeroDocumento}
                                onChange={(e) => setNumeroDocumento(e.target.value)}
                                placeholder="Número de documento"
                                disabled={!!studentToEdit}
                                autoFocus={!studentToEdit}
                            />
                            {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido-paterno">
                                Apellido Paterno
                            </Label>
                            <Input
                                id="apellido-paterno"
                                value={apellidoPaterno}
                                onChange={(e) => setApellidoPaterno(e.target.value)}
                                placeholder="Apellido Paterno"
                                autoFocus={!!studentToEdit}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido-materno">
                                Apellido Materno
                            </Label>
                            <Input
                                id="apellido-materno"
                                value={apellidoMaterno}
                                onChange={(e) => setApellidoMaterno(e.target.value)}
                                placeholder="Apellido Materno"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nombres">
                                Nombres
                            </Label>
                            <Input
                                id="nombres"
                                value={nombres}
                                onChange={(e) => setNombres(e.target.value)}
                                placeholder="Nombres completos"
                            />
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </SheetClose>
                    <Button 
                        type="submit" 
                        onClick={handleSubmit} 
                        disabled={!numeroDocumento.trim() || !apellidoPaterno.trim() || !nombres.trim()}
                    >
                        Guardar
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
