
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaCurricular, Competencia } from '@/lib/definitions';
import { Badge } from '../ui/badge';

interface CompetenciaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (competencia: Competencia) => void;
    area: AreaCurricular | null;
    competenciaToEdit?: Competencia | null;
}

export function CompetenciaFormDialog({ open, onOpenChange, onSave, area, competenciaToEdit }: CompetenciaFormDialogProps) {
    const [nombre, setNombre] = useState('');

    useEffect(() => {
        if (open) {
            setNombre(competenciaToEdit?.nombre || '');
        }
    }, [open, competenciaToEdit]);

    const handleSave = () => {
        if (nombre.trim()) {
            const data: Competencia = {
                id: competenciaToEdit?.id || `comp-${Date.now()}`,
                nombre: nombre.trim(),
            };
            onSave(data);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{competenciaToEdit ? 'Editar Competencia' : 'Añadir Nueva Competencia'}</DialogTitle>
                     <DialogDescription>
                       {area ? (
                        <>
                            Para el área de <Badge variant="secondary">{area.nombre}</Badge>
                        </>
                       ) : (
                        'Completa el nombre de la competencia.'
                       )}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nombre-competencia" className="text-right">
                            Nombre
                        </Label>
                        <Input
                            id="nombre-competencia"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="col-span-3"
                            placeholder="Ej: Aprecia de manera crítica..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={!nombre.trim()}>Guardar Competencia</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
