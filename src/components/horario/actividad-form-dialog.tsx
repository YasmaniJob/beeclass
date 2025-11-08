
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActividadFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (nombre: string) => void;
    children: React.ReactNode;
}

export function ActividadFormDialog({ open, onOpenChange, onSave, children }: ActividadFormDialogProps) {
    const [nombre, setNombre] = useState('');

    useEffect(() => {
        if (!open) {
            setNombre('');
        }
    }, [open]);

    const handleSave = () => {
        if (nombre.trim()) {
            onSave(nombre.trim());
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Añadir Nueva Actividad</DialogTitle>
                     <DialogDescription>
                       Define una actividad pedagógica personalizada para tu horario.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nombre-actividad" className="text-right">
                            Nombre
                        </Label>
                        <Input
                            id="nombre-actividad"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="col-span-3"
                            placeholder="Ej: Preparación de examen"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={!nombre.trim()}>Guardar Actividad</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
