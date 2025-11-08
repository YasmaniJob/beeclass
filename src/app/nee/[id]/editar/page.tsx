'use client';

import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { NeeForm } from '@/components/nee/nee-form';
import { useNeeForm } from '@/hooks/use-nee-form';
import { Button } from '@/components/ui/button';

interface EditNeePageProps {
  params: { id: string };
}

export default function EditNeePage({ params }: EditNeePageProps) {
  const router = useRouter();
  const entryId = decodeURIComponent(params.id);
  const { entry, estudiantesDisponibles, handleSubmit, handleDelete, isSaving, isLoading } =
    useNeeForm({ entryId });

  const handleDeleteClick = async () => {
    if (!entry) return;
    const confirmDelete = window.confirm(
      '¿Estás seguro de eliminar este registro NEE? Esta acción no se puede deshacer.'
    );
    if (confirmDelete) {
      await handleDelete();
    }
  };

  if (isLoading && !entry) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando registro...
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Registro NEE no encontrado</h1>
          <p className="text-muted-foreground mt-1">
            No pudimos encontrar el registro que intentas editar. Es posible que haya sido eliminado.
          </p>
        </div>
        <Button onClick={() => router.push('/nee')}>Volver al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Editar registro NEE</h1>
        <p className="text-muted-foreground">
          Actualiza la información registrada para {entry.estudiante.nombres} {entry.estudiante.apellidoPaterno}.
        </p>
      </div>

      <NeeForm
        estudiantes={estudiantesDisponibles}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        editingEntry={entry}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteClick}
          disabled={isSaving}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar registro
        </Button>
      </div>
    </div>
  );
}
