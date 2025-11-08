// src/infrastructure/repositories/supabase/SupabaseEstudianteRepository.ts
import { supabase, isSupabaseConfigured } from '../../adapters/supabase/config';
import { Estudiante, TipoDocumento } from '@/domain/entities/Estudiante';
import { EstudianteRepository } from '@/domain/ports/EstudianteRepository';
import { Result, success, failure } from '@/domain/shared/types';
import { DomainError } from '@/domain/shared/types';

export class SupabaseEstudianteRepository implements EstudianteRepository {
  private mapDbToInput(data: any) {
    return {
      tipoDocumento: data.tipo_documento as TipoDocumento,
      numeroDocumento: data.numero_documento,
      apellidoPaterno: data.apellido_paterno,
      apellidoMaterno: data.apellido_materno || undefined,
      nombres: data.nombres,
      grado: data.grado || undefined,
      seccion: data.seccion || undefined,
      nee: data.nee || undefined,
      neeDocumentos: data.nee_documentos || undefined,
    };
  }

  async guardar(estudiante: Estudiante): Promise<Result<void, DomainError>> {
    try {
      const { error } = await supabase
        .from('estudiantes')
        .upsert({
          numero_documento: estudiante.numeroDocumento,
          tipo_documento: estudiante.tipoDocumento,
          apellido_paterno: estudiante.apellidoPaterno,
          apellido_materno: estudiante.apellidoMaterno,
          nombres: estudiante.nombres,
          grado: estudiante.grado,
          seccion: estudiante.seccion,
          nee: estudiante.nee,
          nee_documentos: estudiante.neeDocumentos,
        });

      if (error) {
        return failure(new DomainError(`Error saving student: ${error.message}`));
      }

      return success(undefined);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async obtenerPorId(numeroDocumento: string, tipoDocumento: TipoDocumento): Promise<Result<Estudiante | null, DomainError>> {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('numero_documento', numeroDocumento)
        .eq('tipo_documento', tipoDocumento)
        .single();

      if (error && error.code !== 'PGRST116') {
        return failure(new DomainError(`Error fetching student: ${error.message}`));
      }

      if (!data) {
        return success(null);
      }

      const estudianteResult = Estudiante.crear(this.mapDbToInput(data));
      return estudianteResult.isSuccess ? success(estudianteResult.value) : failure(estudianteResult.error);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async obtenerTodos(): Promise<Result<Estudiante[], DomainError>> {
    // Return empty array if Supabase is not configured (localStorage mode)
    if (!isSupabaseConfigured) {
      return success([]);
    }

    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .order('apellido_paterno', { ascending: true });

      if (error) {
        return failure(new DomainError(`Error fetching students: ${error.message}`));
      }

      const estudiantes: Estudiante[] = [];

      for (const item of data || []) {
        const estudianteResult = Estudiante.crear(this.mapDbToInput(item));
        if (estudianteResult.isSuccess) {
          estudiantes.push(estudianteResult.value);
        }
      }

      return success(estudiantes);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async obtenerPorGrado(grado: string): Promise<Result<Estudiante[], DomainError>> {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('grado', grado)
        .order('apellido_paterno', { ascending: true });

      if (error) {
        return failure(new DomainError(`Error fetching students: ${error.message}`));
      }

      const estudiantes: Estudiante[] = [];

      for (const item of data || []) {
        const estudianteResult = Estudiante.crear(this.mapDbToInput(item));
        if (estudianteResult.isSuccess) {
          estudiantes.push(estudianteResult.value);
        }
      }

      return success(estudiantes);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async obtenerPorSeccion(grado: string, seccion: string): Promise<Result<Estudiante[], DomainError>> {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('grado', grado)
        .eq('seccion', seccion)
        .order('apellido_paterno', { ascending: true });

      if (error) {
        return failure(new DomainError(`Error fetching students: ${error.message}`));
      }

      const estudiantes: Estudiante[] = [];

      for (const item of data || []) {
        const estudianteResult = Estudiante.crear(this.mapDbToInput(item));
        if (estudianteResult.isSuccess) {
          estudiantes.push(estudianteResult.value);
        }
      }

      return success(estudiantes);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async actualizar(estudiante: Estudiante): Promise<Result<void, DomainError>> {
    try {
      const { error } = await supabase
        .from('estudiantes')
        .update({
          apellido_paterno: estudiante.apellidoPaterno,
          apellido_materno: estudiante.apellidoMaterno,
          nombres: estudiante.nombres,
          grado: estudiante.grado,
          seccion: estudiante.seccion,
          nee: estudiante.nee,
          nee_documentos: estudiante.neeDocumentos,
        })
        .eq('numero_documento', estudiante.numeroDocumento)
        .eq('tipo_documento', estudiante.tipoDocumento);

      if (error) {
        return failure(new DomainError(`Error updating student: ${error.message}`));
      }

      return success(undefined);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async eliminar(numeroDocumento: string, tipoDocumento: TipoDocumento): Promise<Result<void, DomainError>> {
    try {
      const { error } = await supabase
        .from('estudiantes')
        .delete()
        .eq('numero_documento', numeroDocumento)
        .eq('tipo_documento', tipoDocumento);

      if (error) {
        return failure(new DomainError(`Error deleting student: ${error.message}`));
      }

      return success(undefined);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async buscarPorNombre(query: string): Promise<Result<Estudiante[], DomainError>> {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .or(`nombres.ilike.%${query}%,apellido_paterno.ilike.%${query}%,apellido_materno.ilike.%${query}%`)
        .order('apellido_paterno', { ascending: true });

      if (error) {
        return failure(new DomainError(`Error searching students: ${error.message}`));
      }

      const estudiantes: Estudiante[] = [];

      for (const item of data || []) {
        const estudianteResult = Estudiante.crear(this.mapDbToInput(item));
        if (estudianteResult.isSuccess) {
          estudiantes.push(estudianteResult.value);
        }
      }

      return success(estudiantes);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async obtenerEstadisticas(): Promise<Result<{
    total: number;
    porGrado: Record<string, number>;
    porTipoDocumento: Record<TipoDocumento, number>;
    conNEE: number;
  }, DomainError>> {
    try {
      // Total de estudiantes
      const { count: total, error: totalError } = await supabase
        .from('estudiantes')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        return failure(new DomainError(`Error getting total: ${totalError.message}`));
      }

      // Por grado
      const { data: gradoData, error: gradoError } = await supabase
        .from('estudiantes')
        .select('grado')
        .not('grado', 'is', null);

      if (gradoError) {
        return failure(new DomainError(`Error getting by grade: ${gradoError.message}`));
      }

      const porGrado: Record<string, number> = {};
      gradoData?.forEach(item => {
        if (item.grado) {
          porGrado[item.grado] = (porGrado[item.grado] || 0) + 1;
        }
      });

      // Por tipo de documento
      const { data: tipoDocData, error: tipoDocError } = await supabase
        .from('estudiantes')
        .select('tipo_documento');

      if (tipoDocError) {
        return failure(new DomainError(`Error getting by document type: ${tipoDocError.message}`));
      }

      const porTipoDocumento: Record<TipoDocumento, number> = {
        [TipoDocumento.DNI]: 0,
        [TipoDocumento.CE]: 0,
        [TipoDocumento.OTRO]: 0,
      };

      tipoDocData?.forEach(item => {
        if (item.tipo_documento in porTipoDocumento) {
          porTipoDocumento[item.tipo_documento as TipoDocumento]++;
        }
      });

      // Con NEE
      const { count: conNEE, error: neeError } = await supabase
        .from('estudiantes')
        .select('*', { count: 'exact', head: true })
        .not('nee', 'is', null);

      if (neeError) {
        return failure(new DomainError(`Error getting NEE count: ${neeError.message}`));
      }

      return success({
        total: total || 0,
        porGrado,
        porTipoDocumento,
        conNEE: conNEE || 0
      });
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }
}
