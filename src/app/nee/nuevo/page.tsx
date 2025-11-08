'use client';

import { useRouter } from 'next/navigation';
import { NeeForm } from '@/components/nee/nee-form';
import { useNeeForm } from '@/hooks/use-nee-form';

export default function NuevaNeePage() {
  const router = useRouter();
  const { estudiantesDisponibles, handleSubmit, isSaving } = useNeeForm();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Registrar estudiante con NEE</h1>
        <p className="text-muted-foreground mt-1">
          Selecciona al estudiante y registra la descripción de sus necesidades educativas especiales.
        </p>
      </div>

      <NeeForm
        estudiantes={estudiantesDisponibles}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
