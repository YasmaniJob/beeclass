
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { TipoDocumentoEnum, UserRoleEnum } from '@/lib/definitions';
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
import { Docente, DocenteRol } from '@/domain/entities/Docente';
import { normalizeTipoDocumento } from '@/domain/mappers/entity-builders';

interface DocenteFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (docente: Docente) => void;
    docenteToEdit: Docente | null;
}

export function DocenteFormDialog({ open, onOpenChange, onSave, docenteToEdit }: DocenteFormDialogProps) {
    const [tipoDocumento, setTipoDocumento] = useState<z.infer<typeof TipoDocumentoEnum>>('DNI');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [nombres, setNombres] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [rol, setRol] = useState<DocenteRol>('Docente');
    const [formError, setFormError] = useState<string | null>(null);

    const resetForm = () => {
        setTipoDocumento('DNI');
        setNumeroDocumento('');
        setApellidoPaterno('');
        setApellidoMaterno('');
        setNombres('');
        setEmail('');
        setTelefono('');
        setRol('Docente');
        setFormError(null);
    };

    useEffect(() => {
        if (open) {
            if (docenteToEdit) {
                setTipoDocumento(docenteToEdit.tipoDocumento);
                setNumeroDocumento(docenteToEdit.numeroDocumento);
                setApellidoPaterno(docenteToEdit.apellidoPaterno);
                setApellidoMaterno(docenteToEdit.apellidoMaterno || '');
                setNombres(docenteToEdit.nombres);
                setEmail(docenteToEdit.email || '');
                setTelefono(docenteToEdit.telefono || '');
                setRol(docenteToEdit.rol || 'Docente');
            } else {
                resetForm();
            }
        }
    }, [docenteToEdit, open]);


    const validateForm = () => {
        if (!docenteToEdit) {
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
        }

        if (!email.trim()) {
            setFormError('El correo electrónico es obligatorio para crear la cuenta.');
            return false;
        }

        setFormError(null);
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const docenteResult = Docente.crear({
            tipoDocumento: normalizeTipoDocumento(tipoDocumento),
            numeroDocumento: numeroDocumento.trim(),
            apellidoPaterno: apellidoPaterno.trim().toUpperCase(),
            apellidoMaterno: apellidoMaterno.trim() ? apellidoMaterno.trim().toUpperCase() : undefined,
            nombres: nombres.trim().toUpperCase(),
            email: email.trim(),
            telefono: telefono.trim() || undefined,
            rol,
            asignaciones: docenteToEdit?.asignaciones ?? [],
            horario: docenteToEdit?.horario ?? {},
            personalId: docenteToEdit?.personalId,
        });

        if (!docenteResult.isSuccess) {
            setFormError(docenteResult.error.message);
            return;
        }

        onSave(docenteResult.value);
        onOpenChange(false);
    };
    
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Personal
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>{docenteToEdit ? 'Editar Personal' : 'Registrar Nuevo Personal'}</SheetTitle>
                    <SheetDescription>
                        {docenteToEdit ? 'Modifica los datos del miembro del personal.' : 'Añade un nuevo miembro del personal al sistema.'}
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="space-y-4 py-4 px-6">
                        <div className="space-y-2">
                            <Label htmlFor="tipo-documento">Tipo Doc.</Label>
                            <Select value={tipoDocumento} onValueChange={(value) => setTipoDocumento(value as any)} disabled={!!docenteToEdit}>
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
                            <Label htmlFor="numero-documento">N° Doc.</Label>
                            <Input
                                id="numero-documento"
                                value={numeroDocumento}
                                onChange={(e) => setNumeroDocumento(e.target.value)}
                                placeholder="Número de documento"
                                disabled={!!docenteToEdit}
                            />
                            {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellido-paterno">Apellido Paterno</Label>
                            <Input
                                id="apellido-paterno"
                                value={apellidoPaterno}
                                onChange={(e) => setApellidoPaterno(e.target.value)}
                                placeholder="Apellido Paterno"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido-materno">Apellido Materno</Label>
                            <Input
                                id="apellido-materno"
                                value={apellidoMaterno}
                                onChange={(e) => setApellidoMaterno(e.target.value)}
                                placeholder="Apellido Materno"
                            />
                        </div>
                       
                        <div className="space-y-2">
                            <Label htmlFor="nombres">Nombres</Label>
                            <Input
                                id="nombres"
                                value={nombres}
                                onChange={(e) => setNombres(e.target.value)}
                                placeholder="Nombres completos"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                                id="telefono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="987654321"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="rol">Rol</Label>
                            <Select value={rol} onValueChange={(value) => setRol(value as UserRole)}>
                                <SelectTrigger id="rol">
                                    <SelectValue placeholder="Seleccione un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {UserRoleEnum.options.map(roleOption => (
                                        <SelectItem key={roleOption} value={roleOption}>{roleOption}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </SheetClose>
                    <Button type="submit" onClick={handleSubmit} disabled={!numeroDocumento.trim() || !apellidoPaterno.trim() || !nombres.trim()}>Guardar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
