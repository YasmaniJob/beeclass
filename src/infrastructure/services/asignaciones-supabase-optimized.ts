import { Docente } from '@/domain/entities/Docente';
import { supabase } from '@/infrastructure/adapters/supabase/config';
import { gradosSeccionesRepository } from '@/infrastructure/repositories/supabase/SupabaseGradosSeccionesRepository';

/**
 * Versión optimizada de syncDocentesAsignaciones que reduce el número de queries a Supabase
 * mediante batch processing y caché de grado_seccion_id
 */
export async function syncDocentesAsignacionesOptimized(docentes: Docente[]): Promise<boolean> {
  if (docentes.length === 0) {
    return true;
  }

  const startTime = performance.now();

  try {
    // 1. Obtener todos los IDs de personal de una vez
    const numeroDocumentos = docentes.map(d => d.numeroDocumento);
    const { data: existingPersonal, error: personalError } = await supabase
      .from('personal')
      .select('id, numero_documento, email')
      .in('numero_documento', numeroDocumentos);

    if (personalError) {
      console.error('Error fetching existing personal:', personalError);
      return false;
    }

    const personalMap = new Map(existingPersonal?.map(p => [p.numero_documento, p]) || []);

    // 2. Preparar batch de upserts de personal
    const personalUpserts = docentes.map(docente => ({
      numero_documento: docente.numeroDocumento,
      tipo_documento: docente.tipoDocumento,
      apellido_paterno: docente.apellidoPaterno,
      apellido_materno: docente.apellidoMaterno,
      nombres: docente.nombres,
      email: docente.email,
      telefono: docente.telefono,
      rol: docente.rol,
      activo: true,
    }));

    // 3. Hacer upsert masivo de personal
    const { data: upsertedPersonal, error: upsertError } = await supabase
      .from('personal')
      .upsert(personalUpserts, { onConflict: 'numero_documento' })
      .select('id, numero_documento');

    if (upsertError) {
      console.error('Error upserting personal:', upsertError);
      return false;
    }

    const updatedPersonalMap = new Map(upsertedPersonal?.map(p => [p.numero_documento, p.id]) || []);

    // 4. Obtener todos los grado_seccion_id necesarios de una vez
    const gradoSeccionPairs = new Set<string>();
    docentes.forEach(docente => {
      docente.asignaciones?.forEach(asignacion => {
        if (asignacion.grado && asignacion.seccion) {
          gradoSeccionPairs.add(`${asignacion.grado}|${asignacion.seccion}`);
        }
      });
    });

    // Resolver todos los grado_seccion_id en paralelo
    const gradoSeccionCache = new Map<string, string>();
    await Promise.all(
      Array.from(gradoSeccionPairs).map(async (pair) => {
        const [grado, seccion] = pair.split('|');
        const id = await gradosSeccionesRepository.upsert(grado, seccion);
        if (id) {
          gradoSeccionCache.set(pair, id);
        }
      })
    );

    // 5. Obtener todas las asignaciones existentes de una vez
    const personalIds = Array.from(updatedPersonalMap.values());
    const { data: existingAsignaciones, error: asignacionesError } = await supabase
      .from('asignaciones_docentes')
      .select('id, personal_id, grado_seccion_id, area_id, rol, horas_semanales')
      .in('personal_id', personalIds)
      .eq('activo', true);

    if (asignacionesError) {
      console.error('Error fetching existing asignaciones:', asignacionesError);
      return false;
    }

    // Agrupar asignaciones por personal_id
    const asignacionesByPersonal = new Map<string, any[]>();
    existingAsignaciones?.forEach(asignacion => {
      const list = asignacionesByPersonal.get(asignacion.personal_id) || [];
      list.push(asignacion);
      asignacionesByPersonal.set(asignacion.personal_id, list);
    });

    // 6. Preparar operaciones de asignaciones
    const allInserts: any[] = [];
    const allUpdates: any[] = [];
    const allDeletes: string[] = [];

    docentes.forEach(docente => {
      const personalId = updatedPersonalMap.get(docente.numeroDocumento);
      if (!personalId) return;

      const existingAsigs = asignacionesByPersonal.get(personalId) || [];
      const existingKeyed = new Map<string, any>();
      existingAsigs.forEach(item => {
        const key = `${item.grado_seccion_id ?? 'null'}|${item.area_id ?? 'null'}`;
        existingKeyed.set(key, item);
      });

      const toDeleteIds = new Set(existingAsigs.map(item => item.id));
      const desiredAsignaciones = docente.asignaciones ?? [];

      desiredAsignaciones.forEach(asignacion => {
        let gradoSeccionId = asignacion.gradoSeccionId;
        if (!gradoSeccionId && asignacion.grado && asignacion.seccion) {
          gradoSeccionId = gradoSeccionCache.get(`${asignacion.grado}|${asignacion.seccion}`);
        }

        if (!gradoSeccionId) {
          console.warn('No se pudo resolver grado_seccion_id para', asignacion);
          return;
        }

        const key = `${gradoSeccionId}|${asignacion.areaId ?? 'null'}`;
        const existing = existingKeyed.get(key);

        if (existing) {
          toDeleteIds.delete(existing.id);

          const requiresUpdate =
            existing.grado_seccion_id !== gradoSeccionId ||
            (existing.area_id ?? null) !== (asignacion.areaId ?? null) ||
            (existing.rol ?? null) !== (asignacion.rol ?? null) ||
            (existing.horas_semanales ?? null) !== (asignacion.horasSemanales ?? null);

          if (requiresUpdate) {
            allUpdates.push({
              id: existing.id,
              personal_id: personalId,
              grado_seccion_id: gradoSeccionId,
              area_id: asignacion.areaId ?? null,
              rol: asignacion.rol ?? existing.rol ?? 'Docente',
              horas_semanales: asignacion.horasSemanales ?? null,
              activo: true,
            });
          }
        } else {
          allInserts.push({
            personal_id: personalId,
            grado_seccion_id: gradoSeccionId,
            area_id: asignacion.areaId ?? null,
            rol: asignacion.rol ?? 'Docente',
            horas_semanales: asignacion.horasSemanales ?? null,
            activo: true,
          });
        }
      });

      allDeletes.push(...Array.from(toDeleteIds));
    });

    // 7. Ejecutar operaciones en batch
    const operations: PromiseLike<any>[] = [];

    if (allDeletes.length > 0) {
      // Supabase tiene un límite, dividir en chunks de 1000
      const deleteChunks = [];
      for (let i = 0; i < allDeletes.length; i += 1000) {
        deleteChunks.push(allDeletes.slice(i, i + 1000));
      }
      operations.push(
        ...deleteChunks.map(chunk =>
          supabase.from('asignaciones_docentes').delete().in('id', chunk).then()
        )
      );
    }

    if (allInserts.length > 0) {
      // Dividir en chunks de 1000
      const insertChunks = [];
      for (let i = 0; i < allInserts.length; i += 1000) {
        insertChunks.push(allInserts.slice(i, i + 1000));
      }
      operations.push(
        ...insertChunks.map(chunk =>
          supabase.from('asignaciones_docentes').insert(chunk).then()
        )
      );
    }

    if (allUpdates.length > 0) {
      // Dividir en chunks de 1000
      const updateChunks = [];
      for (let i = 0; i < allUpdates.length; i += 1000) {
        updateChunks.push(allUpdates.slice(i, i + 1000));
      }
      operations.push(
        ...updateChunks.map(chunk =>
          supabase.from('asignaciones_docentes').upsert(chunk, { onConflict: 'id' }).then()
        )
      );
    }

    const results = await Promise.allSettled(operations);
    const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error));

    if (failures.length > 0) {
      failures.forEach(f => console.error('Batch operation failed:', f));
      return false;
    }

    const durationMs = Number((performance.now() - startTime).toFixed(2));

    console.info('Supabase::syncDocentesAsignacionesOptimized', {
      docentesProcesados: docentes.length,
      asignacionesInsertadas: allInserts.length,
      asignacionesActualizadas: allUpdates.length,
      asignacionesEliminadas: allDeletes.length,
      durationMs,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error in syncDocentesAsignacionesOptimized:', error);
    return false;
  }
}
