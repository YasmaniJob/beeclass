
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { usePermisos } from '@/hooks/use-permisos';
import { useToast } from '@/hooks/use-toast';
import { SujetoHeader } from '../incidentes/SujetoHeader';
import { PermisoFormFields } from './PermisoFormFields';
import { FormularioHistorial } from '../shared/FormularioHistorial';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Users, User } from 'lucide-react';

interface PermisoFormProps {
  permisoToEdit?: Permiso;
}

export function PermisoForm({ permisoToEdit }: PermisoFormProps) {
  const { formState, actions, isEditMode, historial, isSaveDisabled, estudiantes } =
    usePermisoForm({ permisoToEdit });
  const { addPermiso } = usePermisos();
  const { toast } = useToast();
  const router = useRouter();

  const { selectedEstudiante } = formState;
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [selectedEstudiantes, setSelectedEstudiantes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleEstudiante = (estudiante: any) => {
    const estudianteId = estudiante.numeroDocumento; // Usar numeroDocumento como ID único
    setSelectedEstudiantes(prev => {
      const exists = prev.find((e: any) => e.numeroDocumento === estudianteId);
      if (exists) {
        return prev.filter((e: any) => e.numeroDocumento !== estudianteId);
      } else {
        return [...prev, estudiante];
      }
    });
  };

  const handleRemoveEstudiante = (numeroDocumento: string) => {
    setSelectedEstudiantes(prev => prev.filter((e: any) => e.numeroDocumento !== numeroDocumento));
  };

  const filteredEstudiantes = estudiantes.filter(e => {
    const term = searchTerm.toLowerCase();
    const fullName = `${e.apellidoPaterno} ${e.apellidoMaterno} ${e.nombres}`.toLowerCase();
    return fullName.includes(term) || e.numeroDocumento.includes(term);
  });

  return (
    <div className="space-y-6">
      {!isEditMode && !selectedEstudiante && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>1. Seleccionar Estudiante(s)</CardTitle>
                  <CardDescription>
                    {isMultipleMode 
                      ? 'Selecciona múltiples estudiantes para registrar el mismo permiso a todos.'
                      : 'Selecciona el estudiante al que se le registrará el permiso.'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="multiple-mode"
                    checked={isMultipleMode}
                    onCheckedChange={setIsMultipleMode}
                  />
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="multiple-mode" className="text-sm font-medium cursor-pointer">
                    Múltiple
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!isMultipleMode ? (
                <AlumnoSearchCombobox
                  sujetos={estudiantes}
                  selectedSujeto={selectedEstudiante}
                  onSelect={actions.setSelectedEstudiante}
                />
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  
                  {selectedEstudiantes.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
                      {selectedEstudiantes.map((est: any) => (
                        <Badge key={est.numeroDocumento} variant="secondary" className="pl-3 pr-1">
                          {est.apellidoPaterno} {est.apellidoMaterno}, {est.nombres}
                          <button
                            onClick={() => handleRemoveEstudiante(est.numeroDocumento)}
                            className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto border rounded-md">
                    {filteredEstudiantes.map((estudiante: any) => {
                      const isSelected = selectedEstudiantes.some((e: any) => e.numeroDocumento === estudiante.numeroDocumento);
                      return (
                        <div
                          key={estudiante.numeroDocumento}
                          className="flex items-center space-x-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => handleToggleEstudiante(estudiante)}
                        >
                          <Checkbox checked={isSelected} />
                          <div className="flex-1">
                            <p className="font-medium">
                              {estudiante.apellidoPaterno} {estudiante.apellidoMaterno}, {estudiante.nombres}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {estudiante.grado} {estudiante.seccion} • {estudiante.numeroDocumento}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {(selectedEstudiante || (isMultipleMode && selectedEstudiantes.length > 0)) && (
        <div className="space-y-6">
          {!isMultipleMode && selectedEstudiante && (
            <SujetoHeader
              sujeto={selectedEstudiante}
              isEditMode={isEditMode}
              onReset={actions.resetForm}
            />
          )}

          {isMultipleMode && selectedEstudiantes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {selectedEstudiantes.length} Estudiante{selectedEstudiantes.length > 1 ? 's' : ''} Seleccionado{selectedEstudiantes.length > 1 ? 's' : ''}
                </CardTitle>
                <CardDescription>
                  El permiso se registrará para todos los estudiantes seleccionados con los mismos datos.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {isEditMode
                  ? 'Modificar Detalles del Permiso'
                  : isMultipleMode 
                    ? '2. Detalles del Permiso (para todos)'
                    : '2. Detalles del Nuevo Permiso'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PermisoFormFields formState={formState} formActions={actions} />
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                onClick={async () => {
                  if (isMultipleMode && selectedEstudiantes.length > 0) {
                    setIsSaving(true);
                    const { dateRange, motivo, registradoPor, documentoUrl } = formState;
                    
                    if (!dateRange?.from || !motivo.trim() || !registradoPor) {
                      toast({
                        variant: 'destructive',
                        title: 'Faltan datos',
                        description: 'Por favor, completa todos los campos.',
                      });
                      setIsSaving(false);
                      return;
                    }
                    
                    let successCount = 0;
                    let errorCount = 0;
                    
                    // Guardar para cada estudiante seleccionado
                    for (const estudiante of selectedEstudiantes) {
                      try {
                        await addPermiso({
                          estudiante: estudiante,
                          fechaInicio: dateRange.from,
                          fechaFin: dateRange.to || dateRange.from,
                          motivo: motivo.trim(),
                          registradoPor: registradoPor,
                          documento: documentoUrl || undefined,
                        });
                        successCount++;
                      } catch (error) {
                        console.error(`Error al guardar permiso para ${estudiante.nombres}:`, error);
                        errorCount++;
                      }
                    }
                    
                    setIsSaving(false);
                    
                    // Mostrar resultado
                    if (successCount > 0) {
                      toast({
                        title: 'Permisos registrados',
                        description: `Se registraron ${successCount} permiso${successCount > 1 ? 's' : ''} exitosamente.${errorCount > 0 ? ` ${errorCount} fallaron.` : ''}`,
                      });
                      router.push('/permisos');
                    } else {
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'No se pudo registrar ningún permiso.',
                      });
                    }
                  } else {
                    await actions.handleSave();
                  }
                }}
                className="w-full"
                disabled={
                  isSaving || (isMultipleMode 
                    ? selectedEstudiantes.length === 0 || !formState.dateRange || !formState.motivo.trim()
                    : isSaveDisabled)
                }
              >
                {isSaving
                  ? 'Guardando...'
                  : isEditMode
                    ? 'Guardar Cambios'
                    : isMultipleMode
                      ? `Registrar Permiso para ${selectedEstudiantes.length} Estudiante${selectedEstudiantes.length > 1 ? 's' : ''}`
                      : `Registrar Permiso para ${selectedEstudiante?.nombres.split(' ')[0]}`}
              </Button>
            </CardFooter>
          </Card>

          {!isMultipleMode && selectedEstudiante && (
            <FormularioHistorial
              titulo="Historial de Permisos"
              historial={historial}
              mensajeVacio="Este estudiante no tiene otros permisos registrados."
              isPermiso
            />
          )}
        </div>
      )}
    </div>
  );
}
