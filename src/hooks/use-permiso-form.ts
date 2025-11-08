
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { usePermisos } from '@/hooks/use-permisos';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Permiso } from '@/domain/entities/Permiso';
import { SujetoIncidente } from '@/domain/entities/SujetoIncidente';
import { DateRange } from 'react-day-picker';
import { useMatriculaData } from './use-matricula-data';
import { useCurrentUser } from './use-current-user';

export interface PermisoFormState {
  selectedEstudiante: Estudiante | null;
  dateRange: DateRange | undefined;
  motivo: string;
  documentoUrl: string;
  registradoPor: string;
  permisoToEdit?: Permiso;
}

export interface PermisoFormActions {
  setSelectedEstudiante: (estudiante: SujetoIncidente | null) => void;
  setDateRange: (range: DateRange | undefined) => void;
  setMotivo: (motivo: string) => void;
  setDocumento: (url: string) => void;
  resetForm: () => void;
  handleSave: () => void;
}

interface UsePermisoFormProps {
  permisoToEdit?: Permiso;
}

export function usePermisoForm({ permisoToEdit }: UsePermisoFormProps) {
  const router = useRouter();
  const { allEstudiantes } = useMatriculaData();
  const { addPermiso, updatePermiso, getPermisosForEstudiante, isLoading } = usePermisos();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const [formState, setFormState] = useState<PermisoFormState>({
    selectedEstudiante: permisoToEdit?.estudiante || null,
    dateRange: permisoToEdit
      ? { from: new Date(permisoToEdit.fechaInicio), to: new Date(permisoToEdit.fechaFin) }
      : undefined,
    motivo: permisoToEdit?.motivo || '',
    documentoUrl: permisoToEdit?.documento || '',
    registradoPor: permisoToEdit?.registradoPor || '',
    permisoToEdit: permisoToEdit,
  });

  const isEditMode = !!permisoToEdit;

  useEffect(() => {
    if (!isEditMode && !formState.registradoPor && user) {
        setFormState(prev => ({
            ...prev,
            registradoPor: `${user.nombreCompleto} (${user.rol})`,
        }));
    }
  }, [isEditMode, formState.registradoPor, user]);

  const historial = useMemo(() => {
    if (formState.selectedEstudiante) {
      const historico = getPermisosForEstudiante(
        formState.selectedEstudiante.numeroDocumento
      );
      return isEditMode && permisoToEdit
        ? historico.filter(p => p.id !== permisoToEdit.id)
        : historico;
    }
    return [];
  }, [formState.selectedEstudiante, getPermisosForEstudiante, isEditMode, permisoToEdit]);

  const handleSave = async () => {
    const { selectedEstudiante, dateRange, motivo, registradoPor, documentoUrl } = formState;

    if (!selectedEstudiante || !dateRange?.from || !motivo.trim() || !registradoPor) {
      toast({
        variant: 'destructive',
        title: 'Faltan datos',
        description: 'Por favor, completa todos los campos para registrar el permiso.',
      });
      return;
    }

    const permisoData = {
      estudiante: selectedEstudiante,
      fechaInicio: dateRange.from,
      fechaFin: dateRange.to || dateRange.from,
      motivo: motivo.trim(),
      registradoPor: registradoPor,
      documento: documentoUrl || undefined,
    };

    try {
      if (isEditMode && permisoToEdit) {
        await updatePermiso(permisoToEdit.id, permisoData);
        toast({
          title: 'Permiso actualizado',
          description: `Se han guardado los cambios para el permiso de ${selectedEstudiante.nombreCompleto}.`,
        });
      } else {
        await addPermiso(permisoData);
        toast({
          title: 'Permiso registrado',
          description: `Se ha registrado el permiso para ${selectedEstudiante.nombreCompleto}.`,
        });
      }

      router.push('/permisos');
    } catch (error) {
      console.error('handleSave permiso error', error);
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: 'Ocurrió un problema al guardar el permiso. Intenta nuevamente.',
      });
    }
  };
  
  const setSelectedEstudiante = (sujeto: SujetoIncidente | null) => {
    if (sujeto instanceof Estudiante || (sujeto && 'grado' in sujeto)) {
      setFormState(prev => ({ ...prev, selectedEstudiante: sujeto as Estudiante }));
      return;
    }

    if (sujeto === null) {
      setFormState(prev => ({ ...prev, selectedEstudiante: null }));
    }
  }
  const setDateRange = (range: DateRange | undefined) => setFormState(prev => ({ ...prev, dateRange: range }));
  const setMotivo = (motivo: string) => setFormState(prev => ({ ...prev, motivo: motivo }));
  const setDocumento = (url: string) => setFormState(prev => ({ ...prev, documentoUrl: url }));

  const resetForm = () => {
    if (!isEditMode) {
      setFormState(prev => ({
        ...prev,
        selectedEstudiante: null,
        dateRange: undefined,
        motivo: '',
        documentoUrl: '',
      }));
    }
  };
  
  const isSaveDisabled =
    !formState.selectedEstudiante ||
    !formState.dateRange?.from ||
    !formState.motivo.trim() ||
    !formState.registradoPor ||
    isLoading;

  return {
    formState,
    actions: {
      setSelectedEstudiante,
      setDateRange,
      setMotivo,
      setDocumento,
      resetForm,
      handleSave,
    },
    isEditMode,
    historial,
    isSaveDisabled,
    estudiantes: allEstudiantes,
  };
}
    
