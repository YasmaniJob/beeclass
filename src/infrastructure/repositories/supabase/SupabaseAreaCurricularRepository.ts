// src/infrastructure/repositories/supabase/SupabaseAreaCurricularRepository.ts
import { supabase, isSupabaseConfigured } from '../../adapters/supabase/config';
import { AreaCurricular, Nivel } from '@/lib/definitions';
import { Result, success, failure } from '@/domain/shared/types';
import { DomainError } from '@/domain/shared/types';

export class SupabaseAreaCurricularRepository {
  async findAll(): Promise<Result<AreaCurricular[], DomainError>> {
    // Return empty array if Supabase is not configured (localStorage mode)
    if (!isSupabaseConfigured) {
      return success([]);
    }

    try {
      // Obtener solo áreas (sin competencias para ser más rápido)
      const { data: areas, error: areasError } = await supabase
        .from('areas_curriculares')
        .select('id, nombre, nivel_id, niveles(nombre)')
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true });

      if (areasError) {
        return failure(new DomainError(`Error fetching areas: ${areasError.message}`));
      }

      // Mapear áreas sin competencias (carga lazy)
      const areasSimplificadas: AreaCurricular[] = (areas || []).map((area: any) => ({
        id: area.id,
        nombre: area.nombre,
        nivel: (area.niveles?.nombre || area.nivel_id) as Nivel,
        competencias: [], // Vacío por defecto, se cargan bajo demanda
      }));

      return success(areasSimplificadas);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async findByNivel(nivel: Nivel): Promise<Result<AreaCurricular[], DomainError>> {
    try {
      // Convertir nombre de nivel a ID (inicial, primaria, secundaria)
      const nivelId = nivel.toLowerCase();
      
      // Obtener áreas del nivel
      const { data: areas, error: areasError } = await supabase
        .from('areas_curriculares')
        .select('*, niveles(nombre)')
        .eq('nivel_id', nivelId)
        .order('orden', { ascending: true });

      if (areasError) {
        return failure(new DomainError(`Error fetching areas: ${areasError.message}`));
      }

      if (!areas || areas.length === 0) {
        return success([]);
      }

      // Obtener todas las competencias del nivel en una sola query
      const areaIds = areas.map(a => a.id);
      const { data: competencias, error: competenciasError } = await supabase
        .from('competencias')
        .select('*')
        .in('area_id', areaIds)
        .order('orden', { ascending: true });

      if (competenciasError) {
        return failure(new DomainError(`Error fetching competencies: ${competenciasError.message}`));
      }

      // También obtener competencias transversales (area_id = NULL)
      const { data: competenciasTransversales, error: transversalesError } = await supabase
        .from('competencias')
        .select('*')
        .is('area_id', null)
        .eq('es_transversal', true)
        .order('orden', { ascending: true });

      if (transversalesError) {
        return failure(new DomainError(`Error fetching transversal competencies: ${transversalesError.message}`));
      }

      // Obtener todas las capacidades en una sola query (incluyendo transversales)
      const competenciaIds = [...(competencias || []).map(c => c.id), ...(competenciasTransversales || []).map(c => c.id)];
      const { data: capacidades, error: capacidadesError } = await supabase
        .from('capacidades')
        .select('*')
        .in('competencia_id', competenciaIds)
        .order('orden', { ascending: true });

      if (capacidadesError) {
        return failure(new DomainError(`Error fetching capacities: ${capacidadesError.message}`));
      }

      // Agrupar capacidades por competencia
      const capacidadesPorCompetencia = new Map<string, any[]>();
      (capacidades || []).forEach(cap => {
        if (!capacidadesPorCompetencia.has(cap.competencia_id)) {
          capacidadesPorCompetencia.set(cap.competencia_id, []);
        }
        capacidadesPorCompetencia.get(cap.competencia_id)!.push(cap);
      });

      // Agrupar competencias por área
      const competenciasPorArea = new Map<string, any[]>();
      (competencias || []).forEach(comp => {
        if (!competenciasPorArea.has(comp.area_id)) {
          competenciasPorArea.set(comp.area_id, []);
        }
        const caps = capacidadesPorCompetencia.get(comp.id) || [];
        competenciasPorArea.get(comp.area_id)!.push({
          ...comp,
          capacidades: caps.map(c => c.nombre)
        });
      });

      // Construir áreas con competencias
      const areasCompletas: AreaCurricular[] = areas.map((area: any) => ({
        id: area.id,
        nombre: area.nombre,
        nivel: (area.niveles?.nombre || area.nivel_id) as Nivel,
        competencias: competenciasPorArea.get(area.id) || []
      }));

      // Agregar área virtual de Competencias Transversales si existen
      if (competenciasTransversales && competenciasTransversales.length > 0) {
        const competenciasTransversalesConCapacidades = competenciasTransversales.map(comp => {
          const caps = capacidadesPorCompetencia.get(comp.id) || [];
          return {
            id: comp.id,
            nombre: comp.nombre,
            descripcion: comp.descripcion,
            capacidades: caps.map(c => c.nombre)
          };
        });

        const areaTransversal: AreaCurricular = {
          id: `transversal-${nivelId}`,
          nombre: 'Competencias Transversales',
          nivel: nivel,
          competencias: competenciasTransversalesConCapacidades
        };

        areasCompletas.push(areaTransversal);
      }

      return success(areasCompletas);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async findById(id: string): Promise<Result<AreaCurricular | null, DomainError>> {
    try {
      return this.getAreaWithCompetencias(id);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async findByGrado(grado: string): Promise<Result<AreaCurricular[], DomainError>> {
    try {
      // Determinar nivel basado en el grado
      let nivel: Nivel;
      if (grado.includes('Inicial') || grado.includes('Años')) {
        nivel = 'Inicial';
      } else if (grado.includes('Secundaria')) {
        nivel = 'Secundaria';
      } else {
        nivel = 'Primaria';
      }

      return this.findByNivel(nivel);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  private async getAreaWithCompetencias(areaId: string): Promise<Result<AreaCurricular, DomainError>> {
    try {
      // Obtener área con información del nivel
      const { data: area, error: areaError } = await supabase
        .from('areas_curriculares')
        .select('*, niveles(nombre)')
        .eq('id', areaId)
        .single();

      if (areaError) {
        return failure(new DomainError(`Error fetching area: ${areaError.message}`));
      }

      // Obtener competencias
      const { data: competencias, error: competenciasError } = await supabase
        .from('competencias')
        .select('*')
        .eq('area_id', areaId)
        .order('nombre', { ascending: true });

      if (competenciasError) {
        return failure(new DomainError(`Error fetching competencies: ${competenciasError.message}`));
      }

      // Obtener capacidades para cada competencia
      const competenciasWithCapacidades = [];

      for (const competencia of competencias || []) {
        const { data: capacidades, error: capacidadesError } = await supabase
          .from('capacidades')
          .select('*')
          .eq('competencia_id', competencia.id)
          .order('orden', { ascending: true });

        if (capacidadesError) {
          return failure(new DomainError(`Error fetching capacities: ${capacidadesError.message}`));
        }

        competenciasWithCapacidades.push({
          ...competencia,
          capacidades: capacidades?.map(c => c.nombre) || [],
        });
      }

      const areaCurricular: AreaCurricular = {
        id: area.id,
        nombre: area.nombre,
        nivel: (area.niveles?.nombre || area.nivel_id) as Nivel,
        competencias: competenciasWithCapacidades,
      };

      return success(areaCurricular);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async save(area: AreaCurricular): Promise<Result<AreaCurricular, DomainError>> {
    try {
      // Convertir nombre de nivel a ID
      const nivelId = area.nivel.toLowerCase();
      
      // Insertar o actualizar área
      const { data: savedArea, error: areaError } = await supabase
        .from('areas_curriculares')
        .upsert({
          id: area.id,
          nombre: area.nombre,
          nivel_id: nivelId,
          es_oficial: false,
        })
        .select()
        .single();

      if (areaError) {
        return failure(new DomainError(`Error saving area: ${areaError.message}`));
      }

      // Eliminar competencias existentes
      await supabase
        .from('competencias')
        .delete()
        .eq('area_id', area.id);

      // Insertar competencias
      for (const competencia of area.competencias) {
        const { error: competenciaError } = await supabase
          .from('competencias')
          .insert({
            id: competencia.id,
            area_id: area.id,
            nombre: competencia.nombre,
            descripcion: competencia.descripcion,
          });

        if (competenciaError) {
          return failure(new DomainError(`Error saving competency: ${competenciaError.message}`));
        }

        // Insertar capacidades
        if (competencia.capacidades && competencia.capacidades.length > 0) {
          const capacidadesData = competencia.capacidades.map((capacidad, index) => ({
            competencia_id: competencia.id,
            nombre: capacidad,
            orden: index + 1,
          }));

          const { error: capacidadesError } = await supabase
            .from('capacidades')
            .insert(capacidadesData);

          if (capacidadesError) {
            return failure(new DomainError(`Error saving capacities: ${capacidadesError.message}`));
          }
        }
      }

      return success(area);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async delete(id: string): Promise<Result<boolean, DomainError>> {
    try {
      // Las áreas curriculares son datos del sistema, no se eliminan
      // En su lugar, se podrían desactivar o marcar como obsoletas
      return failure(new DomainError('Areas curriculares cannot be deleted as they are system data'));
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }

  async getNivelesEducativos(): Promise<Result<{id: string, nombre: Nivel}[], DomainError>> {
    // Return empty array if Supabase is not configured (localStorage mode)
    if (!isSupabaseConfigured) {
      return success([]);
    }

    try {
      const { data, error } = await supabase
        .from('niveles')
        .select('*')
        .order('orden', { ascending: true });

      if (error) {
        return failure(new DomainError(`Error fetching educational levels: ${error.message}`));
      }

      // Mapear a la estructura esperada
      const niveles = (data || []).map(n => ({
        id: n.id,
        nombre: n.nombre as Nivel
      }));
      
      return success(niveles);
    } catch (error) {
      return failure(new DomainError(`Database error: ${error}`));
    }
  }
}
