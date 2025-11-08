
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaCurricular, Nivel } from '@/lib/definitions';
import { Badge } from '../ui/badge';
import { useAreasCurriculares } from '@/hooks/use-supabase-data';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AreaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (area: Partial<AreaCurricular>) => void;
    onSuccess?: () => void;
    areaToEdit?: AreaCurricular | null;
    nivel?: Nivel | string;
}

export function AreaFormDialog({ open, onOpenChange, onSave, onSuccess, areaToEdit, nivel: nivelProp }: AreaFormDialogProps) {
    const [nombre, setNombre] = useState('');
    const [competencias, setCompetencias] = useState<Array<{ nombre: string; capacidades: string[] }>>([]);
    const [saving, setSaving] = useState(false);
    const { add: addArea } = useAreasCurriculares();
    const { toast } = useToast();

    // Funciones para manejar competencias
    const agregarCompetencia = () => {
        setCompetencias([...competencias, { nombre: '', capacidades: [] }]);
    };

    const eliminarCompetencia = (index: number) => {
        setCompetencias(competencias.filter((_, i) => i !== index));
    };

    const actualizarCompetencia = (index: number, nombre: string) => {
        const nuevas = [...competencias];
        nuevas[index].nombre = nombre;
        setCompetencias(nuevas);
    };

    const agregarCapacidad = (compIndex: number) => {
        const nuevas = [...competencias];
        nuevas[compIndex].capacidades.push('');
        setCompetencias(nuevas);
    };

    const eliminarCapacidad = (compIndex: number, capIndex: number) => {
        const nuevas = [...competencias];
        nuevas[compIndex].capacidades = nuevas[compIndex].capacidades.filter((_, i) => i !== capIndex);
        setCompetencias(nuevas);
    };

    const actualizarCapacidad = (compIndex: number, capIndex: number, valor: string) => {
        const nuevas = [...competencias];
        nuevas[compIndex].capacidades[capIndex] = valor;
        setCompetencias(nuevas);
    };

    useEffect(() => {
        if (open) {
            setNombre(areaToEdit?.nombre || '');
            setCompetencias([]);
        }
    }, [open, areaToEdit]);

    const handleSave = async () => {
        if (!nombre.trim()) {
            toast({
                title: 'Error',
                description: 'El nombre del área es requerido',
                variant: 'destructive',
            });
            return;
        }

        if (!nivelProp) {
            toast({
                title: 'Error',
                description: 'No se pudo determinar el nivel educativo',
                variant: 'destructive',
            });
            return;
        }

        setSaving(true);
        try {
            // Preparar competencias con sus capacidades
            const competenciasFormateadas = competencias
                .filter(c => c.nombre.trim())
                .map((c, index) => ({
                    id: `comp-${Date.now()}-${index}`,
                    nombre: c.nombre.trim(),
                    capacidades: c.capacidades.filter(cap => cap.trim())
                }));

            if (onSave) {
                // Modo legacy
                onSave({ 
                    ...areaToEdit, 
                    nombre: nombre.trim(), 
                    nivel: typeof nivelProp === 'string' ? nivelProp : nivelProp,
                    competencias: competenciasFormateadas
                });
                onOpenChange(false);
            } else {
                // Modo Supabase
                const success = await addArea({
                    nombre: nombre.trim(),
                    nivel: typeof nivelProp === 'string' ? nivelProp : nivelProp,
                    competencias: competenciasFormateadas,
                });

                if (success) {
                    toast({
                        title: 'Éxito',
                        description: `Área "${nombre.trim()}" creada correctamente`,
                    });
                    onOpenChange(false);
                    setNombre('');
                    setCompetencias([]);
                    if (onSuccess) onSuccess();
                } else {
                    toast({
                        title: 'Error',
                        description: 'No se pudo crear el área curricular',
                        variant: 'destructive',
                    });
                }
            }
        } catch (error) {
            console.error('Error saving area:', error);
            toast({
                title: 'Error',
                description: 'Ocurrió un error al guardar',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const nivelNombre = typeof nivelProp === 'string' ? nivelProp : nivelProp;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{areaToEdit ? 'Editar Área Curricular' : 'Nueva Área Curricular'}</SheetTitle>
                    <SheetDescription>
                        Crea un área para el nivel <Badge variant="secondary">{nivelNombre}</Badge>
                    </SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 space-y-6 py-4">
                    {/* Nombre del área */}
                    <div className="space-y-2">
                        <Label htmlFor="nombre-area">Nombre del Área *</Label>
                        <Input
                            id="nombre-area"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Arte y Cultura, Educación Física"
                        />
                    </div>

                    {/* Competencias (opcional) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Competencias (opcional)</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={agregarCompetencia}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Competencia
                            </Button>
                        </div>

                        {competencias.length > 0 && (
                            <Accordion type="single" collapsible className="w-full">
                                {competencias.map((comp, compIndex) => (
                                    <AccordionItem key={compIndex} value={`comp-${compIndex}`}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-sm">
                                                    {comp.nombre || `Competencia ${compIndex + 1}`}
                                                </span>
                                                {comp.capacidades.length > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {comp.capacidades.length} capacidades
                                                    </Badge>
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-3 pt-2">
                                                {/* Nombre de la competencia */}
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={comp.nombre}
                                                        onChange={(e) => actualizarCompetencia(compIndex, e.target.value)}
                                                        placeholder="Nombre de la competencia"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => eliminarCompetencia(compIndex)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Capacidades */}
                                                <div className="space-y-2 pl-4 border-l-2">
                                                    <Label className="text-xs text-muted-foreground">Capacidades</Label>
                                                    {comp.capacidades.map((cap, capIndex) => (
                                                        <div key={capIndex} className="flex gap-2">
                                                            <Textarea
                                                                value={cap}
                                                                onChange={(e) => actualizarCapacidad(compIndex, capIndex, e.target.value)}
                                                                placeholder="Describe la capacidad"
                                                                className="min-h-[60px]"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => eliminarCapacidad(compIndex, capIndex)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => agregarCapacidad(compIndex)}
                                                        className="w-full"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Agregar Capacidad
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                </div>

                <SheetFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="w-full sm:w-auto">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!nombre.trim() || saving} className="w-full sm:w-auto">
                        {saving ? 'Guardando...' : 'Guardar Área'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
