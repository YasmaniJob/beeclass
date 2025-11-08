'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Estudiante, NeeEntry } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useMatriculaData } from './use-matricula-data';
import { useNee, NeeInput } from './use-nee';
import { useCurrentUser } from './use-current-user';

export interface NeeFormData {
  estudiante: Estudiante;
  descripcion: string;
  documentoUrl?: string;
}

interface UseNeeFormOptions {
  entryId?: string;
}

export function useNeeForm({ entryId }: UseNeeFormOptions = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { allEstudiantes } = useMatriculaData();
  const { user } = useCurrentUser();
  const { entries, upsertNee, deleteNee, refresh, isLoading } = useNee();

  const [isSaving, setIsSaving] = useState(false);

  const currentEntry = useMemo(() => {
    if (!entryId) return null;
    return entries.find(entry => entry.id === entryId) ?? null;
  }, [entries, entryId]);

  const estudiantesDisponibles = useMemo(() => {
    const ocupados = new Set(entries.map(entry => entry.estudiante.numeroDocumento));

    if (currentEntry) {
      ocupados.delete(currentEntry.estudiante.numeroDocumento);
    }

    const disponibles = allEstudiantes.filter(estudiante => !ocupados.has(estudiante.numeroDocumento));

    if (currentEntry && !disponibles.some(est => est.numeroDocumento === currentEntry.estudiante.numeroDocumento)) {
      const match = allEstudiantes.find(est => est.numeroDocumento === currentEntry.estudiante.numeroDocumento);
      if (match) {
        disponibles.push(match);
      }
    }

    return disponibles.sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno, 'es'));
  }, [allEstudiantes, entries, currentEntry]);

  const registradoPorDefault = useMemo(() => {
    if (currentEntry?.registradoPor) return currentEntry.registradoPor;
    if (!user) return 'Sistema';
    const nombres = user.nombres ?? '';
    const apellido = user.apellidoPaterno ?? '';
    return `${nombres} ${apellido}`.trim() + (user.rol ? ` (${user.rol})` : '');
  }, [currentEntry, user]);

  const handleSubmit = useCallback(
    async ({ estudiante, descripcion, documentoUrl }: NeeFormData) => {
      if (!descripcion.trim()) {
        toast({
          variant: 'destructive',
          title: 'Faltan datos',
          description: 'La descripción de la NEE es obligatoria.',
        });
        return;
      }

      const payload: NeeInput = {
        estudiante,
        descripcion: descripcion.trim(),
        documentoUrl: documentoUrl?.trim() || undefined,
        registradoPor: registradoPorDefault,
      };

      setIsSaving(true);
      try {
        const saved = await upsertNee(payload);
        await refresh();

        toast({
          title: currentEntry ? 'NEE actualizada' : 'NEE registrada',
          description: `Se registró la información de NEE para ${saved.estudiante.nombres}.`,
        });

        router.push('/nee');
      } catch (error) {
        console.error('useNeeForm handleSubmit error', error);
        toast({
          variant: 'destructive',
          title: 'No se pudo guardar',
          description: 'Ocurrió un problema al guardar la información. Intenta nuevamente.',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [currentEntry, registradoPorDefault, upsertNee, refresh, toast, router]
  );

  const handleDelete = useCallback(async () => {
    if (!currentEntry) return;

    setIsSaving(true);
    try {
      await deleteNee(currentEntry.id);
      await refresh();
      toast({
        title: 'Registro eliminado',
        description: 'Se eliminó el registro de NEE correctamente.',
      });
      router.push('/nee');
    } catch (error) {
      console.error('useNeeForm handleDelete error', error);
      toast({
        variant: 'destructive',
        title: 'No se pudo eliminar',
        description: 'Ocurrió un problema al eliminar el registro. Intenta nuevamente.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentEntry, deleteNee, refresh, toast, router]);

  return {
    entry: currentEntry,
    estudiantesDisponibles,
    handleSubmit,
    handleDelete,
    isSaving,
    isLoading,
  };
}
