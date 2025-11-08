
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incidente } from '@/domain/entities/Incidente';
import { Permiso } from '@/domain/entities/Permiso';
import { CalendarIcon, FileText, History } from 'lucide-react';
import { format } from 'date-fns';

interface FormularioHistorialProps {
  titulo: string;
  historial: (Incidente | Permiso)[];
  mensajeVacio: string;
  isPermiso?: boolean;
}

export function FormularioHistorial({
  titulo,
  historial,
  mensajeVacio,
  isPermiso = false,
}: FormularioHistorialProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-5 w-5" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {historial.length > 0 ? (
          historial.map(item => {
            const key = isPermiso
              ? `${item.id}-${(item as Permiso).fechaInicio}`
              : `${item.id}-${(item as Incidente).fecha.toString()}`;

            return (
            <div
              key={key}
              className="text-sm p-2 rounded-md border bg-background"
            >
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {isPermiso
                    ? `${format(
                        new Date((item as Permiso).fechaInicio),
                        'dd/MM/yy'
                      )} - ${format(
                        new Date((item as Permiso).fechaFin),
                        'dd/MM/yy'
                      )}`
                    : format(new Date((item as Incidente).fecha), 'dd/MM/yy')}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground truncate">
                  {isPermiso
                    ? (item as Permiso).motivo
                    : (item as Incidente).descripcion}
                </p>
              </div>
            </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {mensajeVacio}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
