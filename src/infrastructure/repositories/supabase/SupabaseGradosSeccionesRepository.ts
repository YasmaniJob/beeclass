import { supabase } from '@/infrastructure/adapters/supabase/config';

export interface GradoSeccionRecord {
  id: string;
  grado: string;
  seccion: string;
  nivel: string | null;
  capacidad_maxima: number | null;
  activo: boolean;
}

export class SupabaseGradosSeccionesRepository {
  async findAllActivos(): Promise<GradoSeccionRecord[]> {
    const { data, error } = await supabase
      .from('grados_secciones')
      .select('*')
      .eq('activo', true)
      .order('grado', { ascending: true })
      .order('seccion', { ascending: true });

    if (error) {
      console.error('Error fetching grados_secciones:', error);
      return [];
    }

    return data as GradoSeccionRecord[];
  }

  async upsert(grado: string, seccion?: string | null, nivel?: string | null): Promise<string | null> {
    const seccionValue = seccion ? seccion.substring(0, 10) : null;
    const { data, error } = await supabase
      .from('grados_secciones')
      .upsert({ grado, seccion: seccionValue, nivel, activo: true }, { onConflict: 'grado,seccion' })
      .select('id')
      .single();

    if (error) {
      console.error('Error upserting grado_seccion:', error);
      return null;
    }

    return data?.id ?? null;
  }

  async deleteByGrado(grado: string): Promise<boolean> {
    const { error } = await supabase
      .from('grados_secciones')
      .delete()
      .eq('grado', grado);

    if (error) {
      console.error('Error deleting grado:', error);
      return false;
    }

    return true;
  }

  async deleteByGradoSeccion(grado: string, seccion: string | null): Promise<boolean> {
    const query = supabase
      .from('grados_secciones')
      .delete()
      .eq('grado', grado);

    if (seccion === null) {
      query.is('seccion', null);
    } else {
      query.eq('seccion', seccion.substring(0, 10));
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting grado_seccion:', error);
      return false;
    }

    return true;
  }
}

export const gradosSeccionesRepository = new SupabaseGradosSeccionesRepository();
