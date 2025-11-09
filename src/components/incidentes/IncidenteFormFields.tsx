
'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, UserCircle, MessageSquarePlus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useIncidentesComunes } from '@/hooks/use-incidentes-comunes';
import type { IncidenteFormState, IncidenteFormActions } from '@/hooks/use-incidente-form';

interface IncidenteFormFieldsProps {
  formState: IncidenteFormState;
  formActions: IncidenteFormActions;
}

export function IncidenteFormFields({ formState, formActions }: IncidenteFormFieldsProps) {
  const { incidentesComunes } = useIncidentesComunes();
  const { reportadoPor, fecha, selectedIncidentes, detallesAdicionales, selectedSujeto } = formState;

  const tipoSujeto = selectedSujeto && 'grado' in selectedSujeto ? 'estudiantes' : 'personal';
  const listaIncidentesComunes = incidentesComunes[tipoSujeto] || [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Reportado por</Label>
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
          <UserCircle className="mr-2 h-5 w-5" />
          <span>{reportadoPor || 'Cargando usuario...'}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Fecha del Incidente</Label>
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{format(fecha, 'PPP', { locale: es })}</span>
        </div>
      </div>
      {listaIncidentesComunes.length > 0 && (
        <div className="space-y-2">
            <Label>Incidentes Comunes</Label>
            <div className="flex flex-wrap gap-2">
            {listaIncidentesComunes.map(inc => (
                <Button
                key={inc}
                type="button"
                variant={
                    selectedIncidentes.includes(inc) ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => formActions.handleCommonIncidentClick(inc)}
                >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                {inc}
                </Button>
            ))}
            </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Detalles Adicionales (Opcional si se usó una plantilla)</Label>
        <Textarea
          id="descripcion"
          value={detallesAdicionales}
          onChange={e => formActions.setDetallesAdicionales(e.target.value)}
          placeholder="Añade más detalles o contexto si es necesario..."
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
}
