import { createClient } from '@supabase/supabase-js';
import { Estudiante } from '@/lib/definitions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Repositorio para operaciones CRUD de estudiantes en Supabase
 */
export class SupabaseEstudiantesRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Obtiene todos los estudiantes
   */
  async getAll(): Promise<Estudiante[]> {
    const { data, error } = await this.supabase
      .from('estudiantes')
      .select('*')
      .order('apellido_paterno', { ascending: true });

    if (error) {
      console.error('Error fetching estudiantes:', error);
      throw error;
    }

    return this.mapToEstudiantes(data || []);
  }

  /**
   * Obtiene un estudiante por ID
   */
  async getById(id: string): Promise<Estudiante | null> {
    const { data, error } = await this.supabase
      .from('estudiantes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching estudiante:', error);
      return null;
    }

    return data ? this.mapToEstudiante(data) : null;
  }

  /**
   * Obtiene estudiantes por grado y sección
   */
  async getByGradoSeccion(grado: string, seccion: string): Promise<Estudiante[]> {
    const { data, error } = await this.supabase
      .from('estudiantes')
      .select('*')
      .eq('grado', grado)
      .eq('seccion', seccion)
      .order('apellido_paterno', { ascending: true });

    if (error) {
      console.error('Error fetching estudiantes by grado/seccion:', error);
      throw error;
    }

    return this.mapToEstudiantes(data || []);
  }

  /**
   * Crea un nuevo estudiante
   */
  async create(estudiante: Omit<Estudiante, 'id'>): Promise<Estudiante> {
    const dbEstudiante = this.mapToDbFormat(estudiante);

    const { data, error } = await this.supabase
      .from('estudiantes')
      .insert([dbEstudiante])
      .select()
      .single();

    if (error) {
      console.error('Error creating estudiante:', error);
      throw error;
    }

    return this.mapToEstudiante(data);
  }

  /**
   * Actualiza un estudiante existente
   */
  async update(id: string, estudiante: Partial<Estudiante>): Promise<Estudiante> {
    const dbEstudiante = this.mapToDbFormat(estudiante);

    const { data, error } = await this.supabase
      .from('estudiantes')
      .update(dbEstudiante)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating estudiante:', error);
      throw error;
    }

    return this.mapToEstudiante(data);
  }

  /**
   * Elimina un estudiante (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    // Soft delete: marcar como inactivo en lugar de eliminar
    const { error } = await this.supabase
      .from('estudiantes')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting estudiante:', error);
      return false;
    }

    return true;
  }

  /**
   * Elimina permanentemente un estudiante
   */
  async hardDelete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('estudiantes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error hard deleting estudiante:', error);
      return false;
    }

    return true;
  }

  /**
   * Busca estudiantes por nombre o documento
   */
  async search(query: string): Promise<Estudiante[]> {
    const { data, error } = await this.supabase
      .from('estudiantes')
      .select('*')
      .or(`nombres.ilike.%${query}%,apellido_paterno.ilike.%${query}%,apellido_materno.ilike.%${query}%,numero_documento.ilike.%${query}%`)
      .order('apellido_paterno', { ascending: true });

    if (error) {
      console.error('Error searching estudiantes:', error);
      throw error;
    }

    return this.mapToEstudiantes(data || []);
  }

  /**
   * Mapea datos de la BD al formato de la aplicación
   */
  private mapToEstudiante(data: any): Estudiante {
    return {
      id: data.id,
      tipoDocumento: data.tipo_documento,
      numeroDocumento: data.numero_documento,
      apellidoPaterno: data.apellido_paterno,
      apellidoMaterno: data.apellido_materno,
      nombres: data.nombres,
      fechaNacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : undefined,
      sexo: data.sexo,
      direccion: data.direccion,
      telefono: data.telefono,
      email: data.email,
      nombreApoderado: data.nombre_apoderado,
      telefonoApoderado: data.telefono_apoderado,
      grado: data.grado,
      seccion: data.seccion,
      nee: data.nee,
      descripcionNee: data.descripcion_nee,
    };
  }

  /**
   * Mapea array de datos de la BD
   */
  private mapToEstudiantes(data: any[]): Estudiante[] {
    return data.map(item => this.mapToEstudiante(item));
  }

  /**
   * Mapea datos de la aplicación al formato de la BD
   */
  private mapToDbFormat(estudiante: any): any {
    const dbFormat: any = {};

    if (estudiante.tipoDocumento !== undefined) dbFormat.tipo_documento = estudiante.tipoDocumento;
    if (estudiante.numeroDocumento !== undefined) dbFormat.numero_documento = estudiante.numeroDocumento;
    if (estudiante.apellidoPaterno !== undefined) dbFormat.apellido_paterno = estudiante.apellidoPaterno;
    if (estudiante.apellidoMaterno !== undefined) dbFormat.apellido_materno = estudiante.apellidoMaterno;
    if (estudiante.nombres !== undefined) dbFormat.nombres = estudiante.nombres;
    if (estudiante.fechaNacimiento !== undefined) dbFormat.fecha_nacimiento = estudiante.fechaNacimiento instanceof Date ? estudiante.fechaNacimiento.toISOString().split('T')[0] : estudiante.fechaNacimiento;
    if (estudiante.sexo !== undefined) dbFormat.sexo = estudiante.sexo;
    if (estudiante.direccion !== undefined) dbFormat.direccion = estudiante.direccion;
    if (estudiante.telefono !== undefined) dbFormat.telefono = estudiante.telefono;
    if (estudiante.email !== undefined) dbFormat.email = estudiante.email;
    if (estudiante.nombreApoderado !== undefined) dbFormat.nombre_apoderado = estudiante.nombreApoderado;
    if (estudiante.telefonoApoderado !== undefined) dbFormat.telefono_apoderado = estudiante.telefonoApoderado;
    if (estudiante.grado !== undefined) dbFormat.grado = estudiante.grado;
    if (estudiante.seccion !== undefined) dbFormat.seccion = estudiante.seccion;
    if (estudiante.nee !== undefined) dbFormat.nee = estudiante.nee;
    if (estudiante.descripcionNee !== undefined) dbFormat.descripcion_nee = estudiante.descripcionNee;

    return dbFormat;
  }
}

// Singleton instance
export const estudiantesRepository = new SupabaseEstudiantesRepository();
