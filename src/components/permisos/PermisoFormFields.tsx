
'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LinkIcon, CalendarIcon, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { PermisoFormState, PermisoFormActions } from '@/hooks/use-permiso-form';

interface PermisoFormFieldsProps {
  formState: PermisoFormState;
  formActions: PermisoFormActions;
}

export function PermisoFormFields({
  formState,
  formActions,
}: PermisoFormFieldsProps) {
  const { registradoPor, dateRange, motivo, documentoUrl, permisoToEdit } = formState;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Registrado por</Label>
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
          <UserCircle className="mr-2 h-5 w-5" />
          <span>{registradoPor || 'Cargando usuario...'}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Rango de Fechas</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              id="date"
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'PPP', { locale: es })} -{' '}
                    {format(dateRange.to, 'PPP', { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, 'PPP', { locale: es })
                )
              ) : (
                <span>Elige las fechas del permiso</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={formActions.setDateRange}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo del Permiso</Label>
        <Textarea
          id="motivo"
          value={motivo}
          onChange={e => formActions.setMotivo(e.target.value)}
          placeholder="Ej: Cita médica, viaje familiar, etc."
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="documento">
          Enlace a Documento de Sustento (Opcional)
        </Label>
        <div className="relative">
          <Input
            id="documento"
            type="url"
            placeholder="https://drive.google.com/..."
            value={documentoUrl}
            onChange={e => formActions.setDocumento(e.target.value)}
            className="pl-10"
          />
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {permisoToEdit?.documento && permisoToEdit.documento !== documentoUrl && (
          <p className="text-sm text-muted-foreground mt-2">
            Enlace anterior: <span className="break-all">{permisoToEdit.documento}</span>
          </p>
        )}
      </div>
    </div>
  );
}
