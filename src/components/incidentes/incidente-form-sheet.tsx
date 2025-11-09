
'use client';

import { Button } from '@/components/ui/button';
import { SujetoIncidente } from '@/domain/entities/Incidente';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIncidenteForm } from '@/hooks/use-incidente-form';
import { IncidenteFormFields } from './IncidenteFormFields';
import { Badge } from '../ui/badge';
import { SujetoHeader } from './SujetoHeader';

interface IncidenteFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sujeto: SujetoIncidente;
  onSaveSuccess: () => void;
}

export function IncidenteFormSheet({
  open,
  onOpenChange,
  sujeto,
  onSaveSuccess,
}: IncidenteFormSheetProps) {
  const { toast } = useToast();
  const { formState, actions, isSaveDisabled } = useIncidenteForm({
    initialSujeto: sujeto,
    onSaveSuccess: () => {
      onSaveSuccess();
      toast({
        title: 'Incidente Registrado',
        description: `El incidente para ${sujeto.nombreCompleto} ha sido registrado con éxito.`,
      });
    },
  });

  const { selectedIncidentes } = formState;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Registrar Nuevo Incidente</SheetTitle>
          <SheetDescription>
            Registra un incidente para la persona seleccionada de forma rápida.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto -mx-6 px-6 py-4">
          <SujetoHeader
            sujeto={sujeto}
            isEditMode={true} // Para que no muestre el botón de cambiar
            onReset={() => {}}
          />

          <IncidenteFormFields formState={formState} formActions={actions} />
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={actions.handleSave} disabled={isSaveDisabled}>
            Guardar Incidente
            {selectedIncidentes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedIncidentes.length}
              </Badge>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
