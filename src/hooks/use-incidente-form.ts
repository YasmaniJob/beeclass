
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useIncidentes } from '@/hooks/use-incidentes';
import { useIncidentesComunes } from '@/hooks/use-incidentes-comunes';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Incidente, SujetoIncidente } from '@/domain/entities/Incidente';
import { useMatriculaData } from './use-matricula-data';
import { useCurrentUser } from './use-current-user';

export interface IncidenteFormState {
  selectedSujeto: SujetoIncidente | null;
  fecha: Date;
  detallesAdicionales: string;
  reportadoPor: string;
  selectedIncidentes: string[];
}

export interface IncidenteFormActions {
  setSelectedSujeto: (sujeto: SujetoIncidente | null) => void;
  resetForm: () => void;
  handleCommonIncidentClick: (text: string) => void;
  setDetallesAdicionales: (details: string) => void;
  handleSave: () => void;
}

interface UseIncidenteFormProps {
  incidenteToEdit?: Incidente;
  initialSujeto?: SujetoIncidente;
  onSaveSuccess?: () => void;
}

export function useIncidenteForm({
  incidenteToEdit,
  initialSujeto,
  onSaveSuccess,
}: UseIncidenteFormProps) {
  const router = useRouter();
  const { allEstudiantes, docentes } = useMatriculaData();
  const { addIncidente, updateIncidente, getIncidentesForSujeto } =
    useIncidentes();
  const { incidentesComunes } = useIncidentesComunes();
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const [searchType, setSearchType] = useState<'estudiante' | 'personal'>('estudiante');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<IncidenteFormState>({
    selectedSujeto: initialSujeto || incidenteToEdit?.sujeto || null,
    fecha: incidenteToEdit ? new Date(incidenteToEdit.fecha) : new Date(),
    detallesAdicionales: '',
    reportadoPor: incidenteToEdit?.reportadoPor || '',
    selectedIncidentes: [],
  });

  const isEditMode = !!incidenteToEdit;

  useEffect(() => {
    if (isEditMode && incidenteToEdit) {
      const mainDescription = incidenteToEdit.descripcion;
      const detailsMarker = '\n\nDetalles Adicionales:\n';
      const detailsIndex = mainDescription.indexOf(detailsMarker);

      let commonPart = mainDescription;
      let detailsPart = '';

      if (detailsIndex !== -1) {
        commonPart = mainDescription.substring(0, detailsIndex);
        detailsPart = mainDescription.substring(detailsIndex + detailsMarker.length);
      }
      
      const tipoSujeto = 'grado' in incidenteToEdit.sujeto ? 'estudiantes' : 'personal';
      const listaComunes = incidentesComunes[tipoSujeto] || [];

      const selected = listaComunes.filter(ic =>
        commonPart.includes(`- ${ic}`)
      );
      
      setFormState(prev => ({
        ...prev,
        selectedIncidentes: selected,
        detallesAdicionales: detailsPart,
      }));
    }
  }, [isEditMode, incidenteToEdit, incidentesComunes]);

  useEffect(() => {
    if (!formState.reportadoPor && user) {
        setFormState(prev => ({
            ...prev,
            reportadoPor: `${user.nombreCompleto} (${user.rol})`
        }));
    }
  }, [formState.reportadoPor, user]);
  
  const historial = useMemo(() => {
    if (formState.selectedSujeto) {
      const historico = getIncidentesForSujeto(
        formState.selectedSujeto.numeroDocumento
      );
      return isEditMode && incidenteToEdit
        ? historico.filter(i => i.id !== incidenteToEdit.id)
        : historico;
    }
    return [];
  }, [formState.selectedSujeto, getIncidentesForSujeto, isEditMode, incidenteToEdit]);

  const handleSave = useCallback(async () => {
    if (!formState.selectedSujeto || !formState.fecha || !formState.reportadoPor) {
      return;
    }

    if (formState.selectedIncidentes.length === 0 && !formState.detallesAdicionales.trim()) {
      toast({
        variant: 'destructive',
        title: 'Faltan datos',
        description: 'Por favor, selecciona al menos un incidente común o añade detalles.',
      });
      return;
    }

    setIsSaving(true);

    try {
      let finalDescription = formState.selectedIncidentes
        .map(inc => `- ${inc}`)
        .join('\n');
      if (formState.detallesAdicionales.trim()) {
        finalDescription += `\n\nDetalles Adicionales:\n${formState.detallesAdicionales.trim()}`;
      }

      const incidenteData = {
        sujeto: formState.selectedSujeto,
        fecha: formState.fecha,
        descripcion: finalDescription.trim(),
        reportadoPor: formState.reportadoPor,
      };

      if (isEditMode && incidenteToEdit) {
        await updateIncidente(incidenteToEdit.id, incidenteData);
        toast({
          title: 'Incidente actualizado',
          description: `Se han guardado los cambios para el incidente de ${formState.selectedSujeto.nombreCompleto}.`,
        });
      } else {
        await addIncidente(incidenteData);
        toast({
          title: 'Incidente registrado',
          description: `Se ha registrado el incidente para ${formState.selectedSujeto.nombreCompleto}.`,
        });
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        router.push('/incidentes');
      }
    } catch (error) {
      console.error('Error guardando incidente', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'No se pudo registrar el incidente. Inténtalo nuevamente en unos minutos.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    addIncidente,
    formState.detallesAdicionales,
    formState.fecha,
    formState.reportadoPor,
    formState.selectedIncidentes,
    formState.selectedSujeto,
    incidenteToEdit,
    isEditMode,
    onSaveSuccess,
    router,
    toast,
    updateIncidente,
  ]);

  const setSelectedSujeto = (sujeto: SujetoIncidente | null) => {
    setFormState(prev => ({ ...prev, selectedSujeto: sujeto, selectedIncidentes: [], detallesAdicionales: '' }));
  };

  const resetForm = () => {
    if (!isEditMode) {
      setFormState(prev => ({
        ...prev,
        selectedSujeto: null,
        fecha: new Date(),
        detallesAdicionales: '',
        selectedIncidentes: [],
      }));
    }
  };

  const handleCommonIncidentClick = (text: string) => {
    setFormState(prev => {
        const isSelected = prev.selectedIncidentes.includes(text);
        return {
            ...prev,
            selectedIncidentes: isSelected
                ? prev.selectedIncidentes.filter(item => item !== text)
                : [...prev.selectedIncidentes, text]
        };
    });
  };

  const setDetallesAdicionales = (details: string) => {
    setFormState(prev => ({...prev, detallesAdicionales: details}));
  }

  const isSaveDisabled =
    !formState.selectedSujeto ||
    !formState.fecha ||
    (formState.selectedIncidentes.length === 0 && !formState.detallesAdicionales.trim()) ||
    !formState.reportadoPor;

  return {
    formState,
    actions: {
      setSelectedSujeto,
      resetForm,
      handleCommonIncidentClick,
      setDetallesAdicionales,
      handleSave,
    },
    isEditMode,
    historial,
    isSaveDisabled,
    estudiantes: allEstudiantes,
    personal: docentes,
    searchType,
    setSearchType,
    isSaving,
  };
}
