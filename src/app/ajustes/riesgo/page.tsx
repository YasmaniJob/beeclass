
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRiesgoConfig } from '@/hooks/use-riesgo-config';

export default function RiesgoPage() {
  const { toast } = useToast();
  const {
    faltasThreshold,
    incidentesThreshold,
    notasReprobadasThreshold,
    setFaltasThreshold: setFaltas,
    setIncidentesThreshold: setIncidentes,
    setNotasReprobadasThreshold: setNotas,
    saveConfig: saveRiesgoConfig,
  } = useRiesgoConfig();

  const [localFaltas, setLocalFaltas] = useState(faltasThreshold);
  const [localIncidentes, setLocalIncidentes] = useState(incidentesThreshold);
  const [localNotas, setLocalNotas] = useState(notasReprobadasThreshold);

  useEffect(() => {
    setLocalFaltas(faltasThreshold);
    setLocalIncidentes(incidentesThreshold);
    setLocalNotas(notasReprobadasThreshold);
  }, [faltasThreshold, incidentesThreshold, notasReprobadasThreshold]);

  const handleSaveRiesgoConfig = () => {
    setFaltas(localFaltas);
    setIncidentes(localIncidentes);
    setNotas(localNotas);
    saveRiesgoConfig(localFaltas, localIncidentes, localNotas);
    toast({
      title: 'Configuración guardada',
      description: 'Los criterios de riesgo han sido actualizados.',
    });
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Criterios de Riesgo
            </h1>
            <p className="text-muted-foreground mt-1">
                Define los umbrales para que un estudiante sea considerado en riesgo.
            </p>
            </div>
        </div>
        <Card>
        <CardHeader>
            <CardTitle>Umbrales de Riesgo</CardTitle>
            <CardDescription>
                Un estudiante será marcado "en riesgo" si cumple o supera cualquiera de estos umbrales en un período determinado (ej: mensual).
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="faltas-threshold">N° de Faltas para Riesgo</Label>
                <Input
                id="faltas-threshold"
                type="number"
                value={localFaltas}
                onChange={(e) => setLocalFaltas(Number(e.target.value))}
                min="1"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="incidentes-threshold">N° de Incidentes para Riesgo</Label>
                <Input
                id="incidentes-threshold"
                type="number"
                value={localIncidentes}
                onChange={(e) => setLocalIncidentes(Number(e.target.value))}
                min="1"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="notas-threshold">N° de Notas "C" para Riesgo</Label>
                <Input
                id="notas-threshold"
                type="number"
                value={localNotas}
                onChange={(e) => setLocalNotas(Number(e.target.value))}
                min="1"
                />
            </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveRiesgoConfig}>Guardar Criterios</Button>
        </CardFooter>
        </Card>
    </div>
  );
}
