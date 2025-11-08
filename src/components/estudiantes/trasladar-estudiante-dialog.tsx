
'use client';

import { useState, useEffect } from 'react';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMatriculaData } from '@/hooks/use-matricula-data';

interface TrasladarEstudianteDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    estudiante: Estudiante | null;
    onConfirm: (newGrado: string, newSeccion: string) => void;
}

export function TrasladarEstudianteDialog({ isOpen, onOpenChange, estudiante, onConfirm }: TrasladarEstudianteDialogProps) {
    const { allGrados, seccionesPorGrado } = useMatriculaData();
    const [targetGrado, setTargetGrado] = useState('');
    const [targetSeccion, setTargetSeccion] = useState('');
    
    useEffect(() => {
        if (!isOpen) {
            setTargetGrado('');
            setTargetSeccion('');
        } else if (estudiante) {
            setTargetGrado(estudiante.grado);
        }
    }, [isOpen, estudiante]);

    const handleConfirm = () => {
        if (targetGrado && targetSeccion) {
            onConfirm(targetGrado, targetSeccion);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Trasladar Estudiante</DialogTitle>
                    <DialogDescription>
                        Selecciona el nuevo grado y sección para <strong className="font-medium">{estudiante?.nombres} {estudiante?.apellidoPaterno}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="target-grado">Grado de Destino</Label>
                        <Select value={targetGrado} onValueChange={(value) => { setTargetGrado(value); setTargetSeccion(''); }}>
                            <SelectTrigger id="target-grado">
                                <SelectValue placeholder="Selecciona un grado" />
                            </SelectTrigger>
                            <SelectContent>
                                {allGrados.map(g => (
                                    <SelectItem key={g} value={g}>
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {targetGrado && (
                        <div className="grid gap-2">
                            <Label htmlFor="target-seccion">Sección de Destino</Label>
                            <Select value={targetSeccion} onValueChange={setTargetSeccion}>
                                <SelectTrigger id="target-seccion">
                                    <SelectValue placeholder="Selecciona una sección" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(seccionesPorGrado[targetGrado] || []).map(s => (
                                        <SelectItem key={s} value={s} disabled={targetGrado === estudiante?.grado && s === estudiante?.seccion}>
                                            {s.replace('Sección ', '')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={!targetGrado || !targetSeccion}>Trasladar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
    
