
'use client';

import { Button } from '@/components/ui/button';
import { AlumnoSearchCombobox as SujetoSearchCombobox } from '@/components/alumnos/alumno-search-combobox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Incidente } from '@/domain/entities/Incidente';
import { useIncidenteForm } from '@/hooks/use-incidente-form';
import { SujetoHeader } from './SujetoHeader';
import { IncidenteFormFields } from './IncidenteFormFields';
import { FormularioHistorial } from '../shared/FormularioHistorial';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface IncidenteFormProps {
  incidenteToEdit?: Incidente;
}

export function IncidenteForm({ incidenteToEdit }: IncidenteFormProps) {
  const {
    formState,
    actions,
    isEditMode,
    historial,
    isSaveDisabled,
    estudiantes,
    personal,
    searchType,
    setSearchType
  } = useIncidenteForm({ incidenteToEdit });

  const { selectedSujeto, selectedIncidentes } = formState;

  return (
    <div className="space-y-6">
      {!isEditMode && !selectedSujeto && (
        <Card>
          <CardHeader>
            <CardTitle>1. Buscar Sujeto</CardTitle>
            <CardDescription>
              Selecciona el tipo y luego busca a la persona a la que se le registrará el incidente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <RadioGroup defaultValue="estudiante" onValueChange={(v) => setSearchType(v as any)} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="estudiante" id="r-estudiante" />
                <Label htmlFor="r-estudiante">Estudiante</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="r-personal" />
                <Label htmlFor="r-personal">Personal</Label>
              </div>
            </RadioGroup>
            
            <SujetoSearchCombobox
              sujetos={searchType === 'estudiante' ? estudiantes : personal}
              selectedSujeto={selectedSujeto}
              onSelect={actions.setSelectedSujeto}
              placeholder={searchType === 'estudiante' ? 'Busca un estudiante...' : 'Busca un miembro del personal...'}
            />
          </CardContent>
        </Card>
      )}

      {selectedSujeto && (
        <div className="space-y-6">
          <SujetoHeader
            sujeto={selectedSujeto}
            isEditMode={isEditMode}
            onReset={actions.resetForm}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                {isEditMode
                  ? 'Modificar Detalles del Incidente'
                  : '2. Detalles del Nuevo Incidente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IncidenteFormFields
                formState={formState}
                formActions={actions}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                onClick={actions.handleSave}
                className="w-full"
                disabled={isSaveDisabled}
              >
                {isEditMode
                  ? 'Guardar Cambios'
                  : `Registrar Incidente para ${
                      selectedSujeto.nombres.split(' ')[0]
                    }`}
                {selectedIncidentes.length > 0 && !isEditMode && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedIncidentes.length}
                  </Badge>
                )}
              </Button>
            </CardFooter>
          </Card>

          <FormularioHistorial
            titulo="Historial de Incidentes"
            historial={historial}
            mensajeVacio="Esta persona no tiene incidentes registrados."
          />
        </div>
      )}
    </div>
  );
}
