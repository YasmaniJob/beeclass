import { supabase } from '@/infrastructure/adapters/supabase/config';
import { Asignacion } from '@/lib/definitions';

export const AsignacionesService = {
  async fetchByDocente(docenteId: string): Promise<Asignacion[]> {
    const { data, error } = await supabase
      .from('asignaciones_docentes')
      .select('*')
      .eq('docente_id', docenteId);

    if (error) {
      console.error('Error fetching asignaciones:', error);
      return [];
    }
    return data || [];
  },

  async saveAsignaciones(docenteId: string, asignaciones: Asignacion[]): Promise<boolean> {
    // Eliminar asignaciones existentes
    const { error: deleteError } = await supabase
      .from('asignaciones_docentes')
      .delete()
      .eq('docente_id', docenteId);

    if (deleteError) {
      console.error('Error deleting asignaciones:', deleteError);
      return false;
    }

    // Insertar nuevas asignaciones
    const newAsignaciones = asignaciones.map(a => ({
      docente_id: docenteId,
      grado: a.grado,
      seccion: a.seccion,
      area_id: a.areaId || null,
      es_tutor: a.rol === 'Docente y Tutor',
    }));

    const { error: insertError } = await supabase
      .from('asignaciones_docentes')
      .insert(newAsignaciones);

    if (insertError) {
      console.error('Error saving asignaciones:', insertError);
      return false;
    }

    return true;
  },

  async fetchAll(): Promise<Asignacion[]> {
    const { data, error } = await supabase
      .from('asignaciones_docentes')
      .select('*');

    if (error) {
      console.error('Error fetching all asignaciones:', error);
      return [];
    }
    return data || [];
  },
};
