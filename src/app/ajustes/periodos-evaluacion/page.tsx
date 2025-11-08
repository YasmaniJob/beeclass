
'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useEvaluacionConfig } from '@/hooks/use-evaluacion-config';
import { PeriodoEvaluacion } from '@/lib/definitions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

const periodosBase = {
    Bimestre: 4,
    Trimestre: 3,
    Semestre: 2,
};

export default function PeriodosEvaluacionPage() {
    const { toast } = useToast();
    const { config, setConfig, saveConfig, loading, isLoaded } = useEvaluacionConfig();

    const [localTipo, setLocalTipo] = useState<PeriodoEvaluacion>(config.tipo);

    useEffect(() => {
        setLocalTipo(config.tipo);
    }, [config]);

    const handleTipoChange = (newTipo: PeriodoEvaluacion) => {
        setLocalTipo(newTipo);
    }

    const handleSave = async () => {
        const newConfig = { tipo: localTipo, cantidad: periodosBase[localTipo] };
        const success = await saveConfig(newConfig);
        
        if (success) {
            setConfig(newConfig);
            toast({
                title: 'Configuración guardada',
                description: `El sistema ahora usa ${localTipo}s (${periodosBase[localTipo]} períodos).`,
            });
        } else {
            toast({
                title: 'Error',
                description: 'No se pudo guardar la configuración.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Períodos de Evaluación
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Define cómo se divide el año académico para el registro de calificaciones.
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Tipo de Período</CardTitle>
                    <CardDescription>
                        Selecciona el sistema que utiliza tu institución. Esto afectará cómo se registran y visualizan las notas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    {!isLoaded ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : (
                        <RadioGroup
                            value={localTipo}
                            onValueChange={(value: PeriodoEvaluacion) => handleTipoChange(value)}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                            {Object.keys(periodosBase).map((key) => (
                                <div key={key}>
                                    <RadioGroupItem value={key} id={key} className="sr-only" />
                                    <Label
                                        htmlFor={key}
                                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                                            localTipo === key ? 'border-primary' : ''
                                        } cursor-pointer`}
                                    >
                                        <span className="text-lg font-semibold">{key}</span>
                                        <span className="text-sm text-muted-foreground">{periodosBase[key as PeriodoEvaluacion]} períodos al año</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
