'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HoraPedagogica } from '@/hooks/use-horas-pedagogicas-supabase';

interface HoraFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (hora: Omit<HoraPedagogica, 'id' | 'activo'>) => Promise<boolean>;
    horaToEdit?: HoraPedagogica | null;
    nextOrden: number;
}

export function HoraFormSheet({ open, onOpenChange, onSave, horaToEdit, nextOrden }: HoraFormSheetProps) {
    const [nombre, setNombre] = useState('');
    const [orden, setOrden] = useState(nextOrden);
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [esRecreo, setEsRecreo] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            if (horaToEdit) {
                setNombre(horaToEdit.nombre);
                setOrden(horaToEdit.orden);
                setHoraInicio(horaToEdit.hora_inicio);
                setHoraFin(horaToEdit.hora_fin);
                setEsRecreo(horaToEdit.es_recreo);
            } else {
                setNombre('');
                setOrden(nextOrden);
                setHoraInicio('');
                setHoraFin('');
                setEsRecreo(false);
            }
        }
    }, [open, horaToEdit, nextOrden]);

    const handleSave = async () => {
        if (!nombre.trim() || !horaInicio || !horaFin) {
            return;
        }

        setSaving(true);
        const success = await onSave({
            nombre: nombre.trim(),
            orden,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            es_recreo: esRecreo,
        });

        if (success) {
            onOpenChange(false);
        }
        setSaving(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{horaToEdit ? 'Editar Hora Pedagógica' : 'Nueva Hora Pedagógica'}</SheetTitle>
                    <SheetDescription>
                        Define un bloque de horario para el día escolar
                    </SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 space-y-4 py-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: 1ra Hora, Recreo"
                        />
                    </div>

                    {/* Orden */}
                    <div className="space-y-2">
                        <Label htmlFor="orden">Orden *</Label>
                        <Input
                            id="orden"
                            type="number"
                            value={orden}
                            onChange={(e) => setOrden(Number(e.target.value))}
                            min="1"
                        />
                        <p className="text-xs text-muted-foreground">
                            Posición en el horario del día
                        </p>
                    </div>

                    {/* Hora Inicio */}
                    <div className="space-y-2">
                        <Label htmlFor="hora-inicio">Hora de Inicio *</Label>
                        <Input
                            id="hora-inicio"
                            type="time"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                        />
                    </div>

                    {/* Hora Fin */}
                    <div className="space-y-2">
                        <Label htmlFor="hora-fin">Hora de Fin *</Label>
                        <Input
                            id="hora-fin"
                            type="time"
                            value={horaFin}
                            onChange={(e) => setHoraFin(e.target.value)}
                        />
                    </div>

                    {/* Es Recreo */}
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="es-recreo">¿Es un recreo?</Label>
                            <p className="text-xs text-muted-foreground">
                                Marca si este bloque es un recreo o descanso
                            </p>
                        </div>
                        <Switch
                            id="es-recreo"
                            checked={esRecreo}
                            onCheckedChange={setEsRecreo}
                        />
                    </div>
                </div>

                <SheetFooter className="flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="w-full sm:w-auto">
                        Cancelar
                    </Button>
                    <Button 
                        type="button"
                        onClick={handleSave} 
                        disabled={!nombre.trim() || !horaInicio || !horaFin || saving} 
                        className="w-full sm:w-auto"
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
