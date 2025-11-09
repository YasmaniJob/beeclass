
'use client';

import { Button } from '@/components/ui/button';
import { AlumnoSearchCombobox } from '@/components/alumnos/alumno-search-combobox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Permiso } from '@/domain/entities/Permiso';
import { usePermisoForm } from '@/hooks/use-permiso-form';
import { SujetoHeader } from '../incidentes/SujetoHeader';
import { PermisoFormFields } from './PermisoFormFields';
import { FormularioHistorial } from '../shared/FormularioHistorial';

interface PermisoFormProps {
  permisoToEdit?: Permiso;
}

export function PermisoForm({ permisoToEdit }: PermisoFormProps) {
  const { formState, actions, isEditMode, historial, isSaveDisabled, estudiantes } =
    usePermisoForm({ permisoToEdit });

  const { selectedEstudiante } = formState;

  return (
    <div className="space-y-6">
      {!isEditMode && !selectedEstudiante && (
        <Card>
          <CardHeader>
            <CardTitle>1. Buscar Estudiante</CardTitle>
            <CardDescription>
              Selecciona el estudiante al que se le registrará el permiso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlumnoSearchCombobox
              sujetos={estudiantes}
              selectedSujeto={selectedEstudiante}
              onSelect={actions.setSelectedEstudiante}
            />
          </CardContent>
        </Card>
      )}

      {selectedEstudiante && (
        <div className="space-y-6">
          <SujetoHeader
            sujeto={selectedEstudiante}
            isEditMode={isEditMode}
            onReset={actions.resetForm}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                {isEditMode
                  ? 'Modificar Detalles del Permiso'
                  : '2. Detalles del Nuevo Permiso'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PermisoFormFields formState={formState} formActions={actions} />
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
                  : `Registrar Permiso para ${
                      selectedEstudiante.nombres.split(' ')[0]
                    }`}
              </Button>
            </CardFooter>
          </Card>

          <FormularioHistorial
            titulo="Historial de Permisos"
            historial={historial}
            mensajeVacio="Este estudiante no tiene otros permisos registrados."
            isPermiso
          />
        </div>
      )}
    </div>
  );
}
