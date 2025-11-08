
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopEstudiante {
  nombre: string;
  grado?: string;
  factores: string[];
}

interface RiesgoChartsProps {
  isLoading: boolean;
  total: number;
  faltas: number;
  incidentes: number;
  notas: number;
  multiples: number;
  topEstudiantes: TopEstudiante[];
}

const metricsColors: Record<string, string> = {
  total: 'text-primary',
  faltas: 'text-red-500',
  incidentes: 'text-orange-500',
  notas: 'text-yellow-600',
  multiples: 'text-purple-500',
};

export function RiesgoCharts({
  isLoading,
  total,
  faltas,
  incidentes,
  notas,
  multiples,
  topEstudiantes,
}: RiesgoChartsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de riesgo</CardTitle>
          <CardDescription>No se han detectado estudiantes en riesgo con los criterios actuales.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceholderContent
            icon={AlertTriangle}
            title="Sin alertas"
            description="Puedes ajustar los umbrales en la sección de Configuración de Riesgo."
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { id: 'total', label: 'Total en riesgo', value: total, description: 'Estudiantes que cumplen al menos un criterio' },
    { id: 'faltas', label: 'Por faltas', value: faltas, description: 'Superan el umbral de inasistencias' },
    { id: 'incidentes', label: 'Por incidentes', value: incidentes, description: 'Reportes disciplinarios recientes' },
    { id: 'notas', label: 'Por notas "C"', value: notas, description: 'Notas desaprobadas consecutivas' },
    { id: 'multiples', label: 'Con múltiples factores', value: multiples, description: 'Presentan 2 o más alertas simultáneas' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(metric => (
          <Card key={metric.id} className="border-muted">
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-semibold ${metricsColors[metric.id] ?? 'text-foreground'}`}>{metric.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Casos prioritarios</CardTitle>
          <CardDescription>Estudiantes que concentran más alertas y requieren seguimiento cercano.</CardDescription>
        </CardHeader>
        <CardContent>
          {topEstudiantes.length === 0 ? (
            <PlaceholderContent
              icon={AlertTriangle}
              title="Sin casos destacados"
              description="No hay estudiantes con múltiples indicadores de riesgo en este momento."
              className="py-6"
            />
          ) : (
            <ul className="space-y-3">
              {topEstudiantes.map((estudiante, index) => (
                <li
                  key={`${estudiante.nombre}-${index}`}
                  className="flex flex-col gap-1 rounded-lg border border-border/60 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm text-foreground">
                      {index + 1}. {estudiante.nombre}
                    </p>
                    {estudiante.grado && (
                      <Badge variant="secondary">{estudiante.grado}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {estudiante.factores.map(factor => (
                      <Badge key={factor} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
