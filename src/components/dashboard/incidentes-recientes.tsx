
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Incidente } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';
import { PlaceholderContent } from '../ui/placeholder-content';
import { Siren } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../ui/badge';

interface IncidentesRecientesProps {
  incidentes: Incidente[];
  isLoading: boolean;
}

export function IncidentesRecientes({ incidentes, isLoading }: IncidentesRecientesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidentes Recientes</CardTitle>
        <CardDescription>Últimos incidentes reportados en la institución.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : incidentes.length > 0 ? (
          <div className="space-y-4">
            {incidentes.map((incidente) => (
              <div key={`${incidente.id}-${new Date(incidente.fecha).getTime()}`} className="flex items-start space-x-4">
                <div className="flex-shrink-0 pt-1">
                    <Siren className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {`${incidente.sujeto.apellidoPaterno}, ${incidente.sujeto.nombres}`}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{incidente.descripcion}</p>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(incidente.fecha), { addSuffix: true, locale: es })}</span>
                    {'grado' in incidente.sujeto && <Badge variant="outline" className="mt-1">{incidente.sujeto.grado}</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : (
            <PlaceholderContent
                icon={Siren}
                title="Sin Incidentes Hoy"
                description="No se han reportado incidentes durante el día de hoy."
                className="py-10 text-sm"
            />
        )}
      </CardContent>
    </Card>
  );
}
