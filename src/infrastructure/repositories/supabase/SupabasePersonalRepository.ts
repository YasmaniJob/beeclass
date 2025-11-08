// src/infrastructure/repositories/supabase/SupabasePersonalRepository.ts
import { supabase, isSupabaseConfigured } from '../../adapters/supabase/config';
import { Result, success, failure } from '@/domain/shared/types';
import { DomainError } from '@/domain/shared/types';
import { gradosSeccionesRepository } from './SupabaseGradosSeccionesRepository';
import { Docente, DocenteAsignacion, DocenteInput } from '@/domain/entities/Docente';
import { toDocenteEntity, normalizeTipoDocumento } from '@/domain/mappers/entity-builders';

let horariosTableChecked = false;
let horariosTableAvailable = true;

export class SupabasePersonalRepository {
  private async ensureAuthUser(docente: Docente, previousEmail?: string): Promise<Result<void, DomainError>> {
    if (!isSupabaseConfigured || !docente.email) {
      return success(undefined);
    }

    try {
      const payload = {
        docente: {
          email: docente.email,
          numeroDocumento: docente.numeroDocumento,
          tipoDocumento: docente.tipoDocumento,
          nombres: docente.nombres,
          apellidoPaterno: docente.apellidoPaterno,
          apellidoMaterno: docente.apellidoMaterno ?? null,
          rol: docente.rol,
        },
        previousEmail,
      };

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9003');

      const response = await fetch(`${siteUrl}/api/personal/auth-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = 'Error sincronizando usuario de autenticación';
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch (parseError) {
          // ignorar errores de parseo
        }

        if (response.status === 503) {
          console.warn('Supabase Auth admin no disponible. Configura SUPABASE_SERVICE_ROLE_KEY para habilitar la sincronización automática de cuentas.', message);
          return success(undefined);
        }

        return failure(new DomainError(message));
      }

      return success(undefined);
    } catch (error) {
      return failure(new DomainError(`Unexpected auth sync error: ${error}`));
    }
  }

  private async fetchAsignacionesByPersonalId(personalId: string): Promise<{ id: string; area_id: string | null; grado_seccion_id: string | null; rol: string | null; horas_semanales: number | null }[]> {
    const { data, error } = await supabase
      .from('asignaciones_docentes')
      .select('id, area_id, grado_seccion_id, rol, horas_semanales')
      .eq('personal_id', personalId)
      .eq('activo', true);

    if (error) {
      console.warn('Error fetching existing assignments:', error);
      return [];
    }

    return data ?? [];
  }
  async findById(id: string): Promise<Result<Docente | null, DomainError>> {
    try {
      // Obtener personal
      const { data: personal, error: personalError } = await supabase
        .from('personal')
        .select('*')
        .eq('id', id)
        .single();

      if (personalError && personalError.code !== 'PGRST116') {
        return failure(new DomainError(`Error fetching personal: ${personalError.message}`));
      }

      if (!personal) {
        return success(null);
      }

      // Obtener asignaciones desde la nueva tabla + join con grados_secciones
      const { data: asignaciones, error: asignacionesError } = await supabase
        .from('asignaciones_docentes')
        .select(`
          id,
          grado_seccion_id,
          area_id,
          rol,
          horas_semanales,
          activo,
          grados_secciones (
            id,
            grado,
            seccion,
            nivel
          )
        `)
        .eq('personal_id', id)
        .eq('activo', true);

      if (asignacionesError) {
        return failure(new DomainError(`Error fetching assignments: ${asignacionesError.message}`));
      }

      // Obtener horarios (tabla opcional - puede no existir)
      const { data: horarios } = await supabase
        .from('horarios')
        .select('*')
        .eq('personal_id', id);

      // Construir objeto Docente
      const docenteInput: DocenteInput = {
        tipoDocumento: normalizeTipoDocumento(personal.tipo_documento),
        numeroDocumento: personal.numero_documento,
        apellidoPaterno: personal.apellido_paterno,
        apellidoMaterno: personal.apellido_materno || undefined,
        nombres: personal.nombres,
        email: personal.email || undefined,
        telefono: personal.telefono || undefined,
        rol: personal.rol,
        asignaciones: (asignaciones || []).map(a => {
          const gradoSeccion = Array.isArray(a.grados_secciones) ? a.grados_secciones[0] : a.grados_secciones;
          return {
            id: a.id,
            grado: gradoSeccion?.grado ?? '',
            seccion: gradoSeccion?.seccion ?? '',
            rol: a.rol ?? undefined,
            areaId: a.area_id ?? undefined,
            gradoSeccionId: a.grado_seccion_id ?? undefined,
            horasSemanales: a.horas_semanales ?? undefined,
          } satisfies DocenteAsignacion;
        }),
        horario: horarios?.reduce((acc, h) => {
          acc[`${h.dia_semana}-${h.hora_id}`] = h.asignacion_id;
          return acc;
        }, {} as Record<string, string>) || {},
        personalId: personal.id,
      };

      const docenteResult = toDocenteEntity(docenteInput);
      if (!docenteResult.isSuccess) {
        return failure(docenteResult.error);
      }

      return success(docenteResult.value);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async findByDocumento(numeroDocumento: string): Promise<Result<Docente | null, DomainError>> {
    try {
      // Obtener personal
      const { data: personal, error: personalError } = await supabase
        .from('personal')
        .select('*')
        .eq('numero_documento', numeroDocumento)
        .single();

      if (personalError && personalError.code !== 'PGRST116') {
        return failure(new DomainError(`Error fetching personal: ${personalError.message}`));
      }

      if (!personal) {
        return success(null);
      }

      return this.findById(personal.id);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async findByEmail(email: string): Promise<Result<Docente | null, DomainError>> {
    if (!isSupabaseConfigured) {
      return success(null);
    }

    try {
      const { data: personal, error: personalError } = await supabase
        .from('personal')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (personalError && personalError.code !== 'PGRST116') {
        return failure(new DomainError(`Error fetching personal by email: ${personalError.message}`));
      }

      if (!personal) {
        return success(null);
      }

      return this.findById(personal.id);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  private mapPersonalRecord(personal: any): Result<Docente, DomainError> {
    const asignaciones: DocenteAsignacion[] = (personal.asignaciones_docentes || []).map((a: any) => {
      const gradoSeccion = Array.isArray(a.grados_secciones) ? a.grados_secciones[0] : a.grados_secciones;
      return {
        id: a.id,
        grado: gradoSeccion?.grado ?? '',
        seccion: gradoSeccion?.seccion ?? '',
        rol: a.rol ?? undefined,
        areaId: a.area_id ?? undefined,
        gradoSeccionId: a.grado_seccion_id ?? undefined,
        horasSemanales: a.horas_sisemanales ?? a.horas_semanales ?? undefined,
      };
    });

    return toDocenteEntity({
      tipoDocumento: normalizeTipoDocumento(personal.tipo_documento),
      numeroDocumento: personal.numero_documento,
      apellidoPaterno: personal.apellido_paterno,
      apellidoMaterno: personal.apellido_materno ?? undefined,
      nombres: personal.nombres,
      email: personal.email ?? undefined,
      telefono: personal.telefono ?? undefined,
      rol: personal.rol,
      asignaciones,
      personalId: personal.id,
    });
  }

  private async fetchPersonal(filter?: Record<string, any>): Promise<Result<Docente[], DomainError>> {
    try {
      const query = supabase
        .from('personal')
        .select(`
          id,
          numero_documento,
          tipo_documento,
          apellido_paterno,
          apellido_materno,
          nombres,
          email,
          telefono,
          rol,
          asignaciones_docentes (
            id,
            grado_seccion_id,
            area_id,
            rol,
            horas_semanales,
            grados_secciones (
              id,
              grado,
              seccion,
              nivel
            )
          )
        `)
        .eq('activo', true)
        .order('apellido_paterno', { ascending: true });

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        return failure(new DomainError(`Error fetching personal: ${error.message}`));
      }

      const docentes: Docente[] = [];
      for (const record of data || []) {
        const docenteResult = this.mapPersonalRecord(record);
        if (!docenteResult.isSuccess) {
          return failure(docenteResult.error);
        }
        docentes.push(docenteResult.value);
      }
      return success(docentes);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async findAll(): Promise<Result<Docente[], DomainError>> {
    return this.fetchPersonal();
  }

  async findByRol(rol: string): Promise<Result<Docente[], DomainError>> {
    return this.fetchPersonal({ rol });
  }

  async save(docente: Docente): Promise<Result<Docente, DomainError>> {
    try {
      // Insertar o actualizar personal
      const { data: existingPersonal } = await supabase
        .from('personal')
        .select('id, email')
        .eq('numero_documento', docente.numeroDocumento)
        .maybeSingle();

      const previousEmail = existingPersonal?.email ?? undefined;

      const { data: personal, error: personalError } = await supabase
        .from('personal')
        .upsert({
          numero_documento: docente.numeroDocumento,
          tipo_documento: docente.tipoDocumento,
          apellido_paterno: docente.apellidoPaterno,
          apellido_materno: docente.apellidoMaterno,
          nombres: docente.nombres,
          email: docente.email,
          telefono: docente.telefono,
          rol: docente.rol,
          activo: true,
        }, { onConflict: 'numero_documento' })
        .select()
        .single();

      if (personalError) {
        return failure(new DomainError(`Error saving personal: ${personalError.message}`));
      }

      const existingAsignaciones = await this.fetchAsignacionesByPersonalId(personal.id);
      const existingKeyed = new Map<string, { id: string; grado_seccion_id: string | null; area_id: string | null; rol: string | null; horas_semanales: number | null }>();
      existingAsignaciones.forEach(item => {
        const key = `${item.grado_seccion_id ?? 'null'}|${item.area_id ?? 'null'}`;
        existingKeyed.set(key, item);
      });

      const desiredAsignaciones = docente.asignaciones ?? [];
      const inserts: any[] = [];
      const updates: any[] = [];
      const toDeleteIds = new Set(existingAsignaciones.map(item => item.id));

      for (const asignacion of desiredAsignaciones) {
        let gradoSeccionId = asignacion.gradoSeccionId;
        if (!gradoSeccionId) {
          gradoSeccionId = await gradosSeccionesRepository.upsert(
            asignacion.grado,
            asignacion.seccion
          ) ?? undefined;
        }

        if (!gradoSeccionId) {
          console.warn('No se pudo resolver grado_seccion_id para', asignacion);
          continue;
        }

        const key = `${gradoSeccionId}|${asignacion.areaId ?? 'null'}`;
        const existing = existingKeyed.get(key);

        if (existing) {
          // Ya existe en Supabase, conservarlo y removerlo del set de deletes
          toDeleteIds.delete(existing.id);

          const currentRol = existing.rol ?? undefined;
          const currentHoras = existing.horas_semanales ?? undefined;
          const targetRol = asignacion.rol ?? currentRol;
          const targetHoras = asignacion.horasSemanales ?? null;

          // Verificar si hay cambios en campos editables (rol/horas) o nivel/área
          const requiresUpdate =
            existing.grado_seccion_id !== gradoSeccionId ||
            (existing.area_id ?? null) !== (asignacion.areaId ?? null) ||
            (currentRol ?? null) !== (targetRol ?? null) ||
            (currentHoras ?? null) !== (targetHoras ?? null);

          if (requiresUpdate) {
            updates.push({
              id: existing.id,
              personal_id: personal.id,
              grado_seccion_id: gradoSeccionId,
              area_id: asignacion.areaId ?? null,
              rol: targetRol ?? currentRol ?? 'Docente',
              horas_semanales: targetHoras,
              activo: true,
            });
          }
        } else {
          inserts.push({
            personal_id: personal.id,
            grado_seccion_id: gradoSeccionId,
            area_id: asignacion.areaId ?? null,
            rol: asignacion.rol ?? 'Docente',
            horas_semanales: asignacion.horasSemanales ?? null,
            activo: true,
          });
        }
      }

      if (toDeleteIds.size > 0) {
        const { error: deleteError } = await supabase
          .from('asignaciones_docentes')
          .delete()
          .in('id', Array.from(toDeleteIds));

        if (deleteError) {
          return failure(new DomainError(`Error deleting assignments: ${deleteError.message}`));
        }
      }

      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('asignaciones_docentes')
          .insert(inserts);

        if (insertError) {
          return failure(new DomainError(`Error saving assignments: ${insertError.message}`));
        }
      }

      if (updates.length > 0) {
        const { error: updatesError } = await supabase
          .from('asignaciones_docentes')
          .upsert(updates, { onConflict: 'id' });

        if (updatesError) {
          return failure(new DomainError(`Error updating assignments: ${updatesError.message}`));
        }
      }

      // Eliminar / insertar horarios sólo si la tabla existe
      if (!horariosTableChecked || horariosTableAvailable) {
        const { error: deleteHorariosError } = await supabase
          .from('horarios')
          .delete()
          .eq('personal_id', personal.id);

        if (deleteHorariosError) {
          horariosTableChecked = true;
          const tableMissing = deleteHorariosError.code === '42P01' || deleteHorariosError.code === 'PGRST302';
          if (tableMissing) {
            horariosTableAvailable = false;
          } else {
            console.warn('Error deleting horarios:', deleteHorariosError);
          }
        } else {
          horariosTableChecked = true;
          horariosTableAvailable = true;
          if (docente.horario) {
            const horariosData = Object.entries(docente.horario).map(([key, asignacionId]) => {
              const [diaSemana, horaId] = key.split('-');
              return {
                personal_id: personal.id,
                dia_semana: diaSemana,
                hora_id: horaId,
                asignacion_id: asignacionId,
              };
            });

            if (horariosData.length > 0) {
              const { error: insertHorariosError } = await supabase
                .from('horarios')
                .insert(horariosData);

              if (insertHorariosError) {
                console.warn('Error inserting horarios:', insertHorariosError);
              }
            }
          }
        }
      }

      const finalDocenteResult = await this.findById(personal.id);
      if (!finalDocenteResult.isSuccess) {
        return failure(finalDocenteResult.error);
      }

      const finalDocente = finalDocenteResult.value;
      const authResult = await this.ensureAuthUser(finalDocente ?? docente, previousEmail);
      if (!authResult.isSuccess) {
        return failure(authResult.error);
      }

      return success(finalDocente ?? docente);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async delete(numeroDocumento: string): Promise<Result<boolean, DomainError>> {
    try {
      // Soft delete: marcar como inactivo
      const { error } = await supabase
        .from('personal')
        .update({ activo: false })
        .eq('numero_documento', numeroDocumento);

      if (error) {
        return failure(new DomainError(`Error deleting personal: ${error.message}`));
      }

      return success(true);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async update(numeroDocumento: string, docente: Partial<Docente>): Promise<Result<Docente | null, DomainError>> {
    try {
      // Primero obtener el personal actual
      const { data: personal, error: personalError } = await supabase
        .from('personal')
        .select('*')
        .eq('numero_documento', numeroDocumento)
        .single();

      if (personalError) {
        return failure(new DomainError(`Error fetching personal: ${personalError.message}`));
      }

      if (!personal) {
        return success(null);
      }

      // Actualizar personal
      const updateData: any = {};
      if (docente.tipoDocumento) updateData.tipo_documento = docente.tipoDocumento;
      if (docente.apellidoPaterno) updateData.apellido_paterno = docente.apellidoPaterno;
      if (docente.apellidoMaterno !== undefined) updateData.apellido_materno = docente.apellidoMaterno;
      if (docente.nombres) updateData.nombres = docente.nombres;
      if (docente.email !== undefined) updateData.email = docente.email;
      if (docente.telefono !== undefined) updateData.telefono = docente.telefono;
      if (docente.rol) updateData.rol = docente.rol;

      const { error: updateError } = await supabase
        .from('personal')
        .update(updateData)
        .eq('numero_documento', numeroDocumento);

      if (updateError) {
        return failure(new DomainError(`Error updating personal: ${updateError.message}`));
      }

      // Si hay asignaciones nuevas, actualizarlas
      if (docente.asignaciones) {
        await supabase
          .from('asignaciones_docentes')
          .delete()
          .eq('personal_id', personal.id);

        if (docente.asignaciones.length > 0) {
          const asignacionesPayload = [] as any[];

          for (const asignacion of docente.asignaciones) {
            let gradoSeccionId = asignacion.gradoSeccionId;
            if (!gradoSeccionId) {
              const resolvedId = await gradosSeccionesRepository.upsert(
                asignacion.grado,
                asignacion.seccion
              );
              gradoSeccionId = resolvedId ?? undefined;
            }

            if (!gradoSeccionId) {
              console.warn('No se pudo resolver grado_seccion_id para', asignacion);
              continue;
            }

            asignacionesPayload.push({
              personal_id: personal.id,
              grado_seccion_id: gradoSeccionId,
              area_id: asignacion.areaId ?? null,
              rol: asignacion.rol,
              horas_semanales: asignacion.horasSemanales ?? null,
              activo: true,
            });
          }

          if (asignacionesPayload.length > 0) {
            const { error: asignacionesInsertError } = await supabase
              .from('asignaciones_docentes')
              .insert(asignacionesPayload);

            if (asignacionesInsertError) {
              return failure(new DomainError(`Error saving assignments: ${asignacionesInsertError.message}`));
            }
          }
        }
      }

      // Si hay horarios nuevos, actualizarlos (si la tabla existe)
      if (docente.horario) {
        try {
          await supabase
            .from('horarios')
            .delete()
            .eq('personal_id', personal.id);

          const horariosData = Object.entries(docente.horario).map(([key, asignacionId]) => {
            const [diaSemana, horaId] = key.split('-');
            return {
              personal_id: personal.id,
              dia_semana: diaSemana,
              hora_id: horaId,
              asignacion_id: asignacionId,
            };
          });

          if (horariosData.length > 0) {
            await supabase
              .from('horarios')
              .insert(horariosData);
          }
        } catch (error) {
          // Tabla horarios no existe, continuar sin error
          console.log('Tabla horarios no disponible, continuando...');
        }
      }

      const finalDocenteResult = await this.findById(personal.id);
      if (!finalDocenteResult.isSuccess) {
        return failure(finalDocenteResult.error);
      }

      const finalDocente = finalDocenteResult.value;
      if (!finalDocente) {
        return success(null);
      }

      const authResult = await this.ensureAuthUser(finalDocente, personal.email ?? undefined);
      if (!authResult.isSuccess) {
        return failure(authResult.error);
      }

      return success(finalDocente);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }
}
