

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaCurricular, Competencia } from '@/lib/definitions';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface SesionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (titulo: string, competenciaId: string, capacidades?: string[]) => void;
    area: AreaCurricular;
}

export function SesionFormDialog({ open, onOpenChange, onSave, area }: SesionFormDialogProps) {
    const [titulo, setTitulo] = useState('');
    const [competenciaId, setCompetenciaId] = useState('');
    const [selectedCapacidades, setSelectedCapacidades] = useState<string[]>([]);

    const capacidadesDisponibles = useMemo(() => {
        if (!competenciaId) return [];
        const competenciaSeleccionada = area.competencias.find(c => c.id === competenciaId);
        return competenciaSeleccionada?.capacidades || [];
    }, [competenciaId, area.competencias]);


    useEffect(() => {
        if (!open) {
            setTitulo('');
            setCompetenciaId('');
            setSelectedCapacidades([]);
        }
    }, [open]);

    useEffect(() => {
        setSelectedCapacidades([]);
    }, [competenciaId]);

    const handleSave = () => {
        if (titulo.trim() && competenciaId) {
            onSave(titulo.trim(), competenciaId, selectedCapacidades);
        }
    };
    
    const handleCapacidadChange = (capacidad: string, checked: boolean) => {
        setSelectedCapacidades(prev => {
            if(checked) {
                return [...prev, capacidad];
            } else {
                return prev.filter(c => c !== capacidad);
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nueva Sesión de Aprendizaje</DialogTitle>
                     <DialogDescription>
                       Añade una nueva sesión para el área de <Badge variant="secondary">{area.nombre}</Badge>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="titulo-sesion">
                            Título de la Sesión
                        </Label>
                        <Input
                            id="titulo-sesion"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Resolvemos problemas de adición"
                            autoFocus
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="competencia-select">Competencia a Evaluar</Label>
                        <Select value={competenciaId} onValueChange={setCompetenciaId}>
                            <SelectTrigger id="competencia-select">
                                <SelectValue placeholder="Seleccione una competencia" />
                            </SelectTrigger>
                            <SelectContent>
                                {area.competencias.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {capacidadesDisponibles.length > 0 && (
                         <div className="space-y-2">
                            <Label>Capacidades (Opcional)</Label>
                             <ScrollArea className="h-40 rounded-md border p-2">
                                <div className="space-y-2">
                                    {capacidadesDisponibles.map((cap, index) => (
                                        <div key={`${competenciaId}-${index}`} className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50">
                                            <Checkbox 
                                                id={`cap-${index}`}
                                                checked={selectedCapacidades.includes(cap)}
                                                onCheckedChange={(checked) => handleCapacidadChange(cap, !!checked)}
                                            />
                                            <Label htmlFor={`cap-${index}`} className="font-normal cursor-pointer flex-1">
                                                {cap}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={!titulo.trim() || !competenciaId}>Guardar Sesión</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
