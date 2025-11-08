import { Docente } from '@/domain/entities/Docente';
import { SupabasePersonalRepository } from '@/infrastructure/repositories/supabase/SupabasePersonalRepository';
import { Result } from '@/domain/shared/types';
import { DomainError } from '@/domain/shared/types';

const personalRepository = new SupabasePersonalRepository();

async function persistDocente(docente: Docente): Promise<Result<Docente, DomainError>> {
  return personalRepository.save(docente);
}

export async function saveDocenteAsignaciones(docente: Docente): Promise<boolean> {
  const result = await persistDocente(docente);
  if (result.isFailure) {
    console.error('Error saving docente asignaciones:', result.error);
    return false;
  }
  return true;
}

export async function syncDocentesAsignaciones(docentes: Docente[]): Promise<boolean> {
  if (docentes.length === 0) {
    return true;
  }

  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const results = await Promise.allSettled(
    docentes.map(async docente => {
      const success = await saveDocenteAsignaciones(docente);
      return { docenteId: docente.numeroDocumento, success };
    })
  );

  const failures = results
    .filter((result): result is PromiseFulfilledResult<{ docenteId: string; success: boolean }> => result.status === 'fulfilled')
    .filter(result => !result.value.success)
    .map(result => result.value.docenteId);

  results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .forEach(result => {
      console.error('syncDocentesAsignaciones: unhandled rejection', result.reason);
    });

  const durationMs = typeof performance !== 'undefined'
    ? Number((performance.now() - startTime).toFixed(2))
    : Number((Date.now() - (startTime as number)).toFixed(2));

  console.info('Supabase::syncDocentesAsignaciones', {
    docentesProcesados: docentes.length,
    fallas: failures,
    durationMs,
    timestamp: new Date().toISOString(),
  });

  return failures.length === 0 && results.every(result => result.status === 'fulfilled');
}
