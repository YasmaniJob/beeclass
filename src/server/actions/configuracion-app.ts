'use server';

import { createSupabaseServerClient } from '@/infrastructure/supabase-server-client';
import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ConfiguracionApp {
  app_name: string;
  institution_name: string;
  theme_color: string;
  logo_url: string;
  login_image_url: string;
  nivel_institucion: string;
}

/**
 * Obtiene toda la configuración de la aplicación
 */
export async function getConfiguracionApp(): Promise<ConfiguracionApp> {
  try {
    const supabase = await createSupabaseServerClient() as SupabaseClient<any>;
    
    const { data, error } = await supabase
      .from('configuracion_app')
      .select('clave, valor');

    if (error) {
      console.warn('Tabla configuracion_app no existe o hay un error. Usando valores por defecto:', error.message);
      // Retornar valores por defecto en caso de error
      return {
        app_name: 'Beeclass',
        institution_name: '',
        theme_color: '#59AB45',
        logo_url: '',
        login_image_url: '',
        nivel_institucion: 'Primaria',
      };
    }

    // Convertir array de {clave, valor} a objeto
    const config: any = {};
    data?.forEach((item) => {
      config[item.clave] = item.valor || '';
    });

    return {
      app_name: config.app_name || 'Beeclass',
      institution_name: config.institution_name || '',
      theme_color: config.theme_color || '#59AB45',
      logo_url: config.logo_url || '',
      login_image_url: config.login_image_url || '',
      nivel_institucion: config.nivel_institucion || 'Primaria',
    };
  } catch (error) {
    console.error('Error inesperado al obtener configuración:', error);
    return {
      app_name: 'Beeclass',
      institution_name: '',
      theme_color: '#59AB45',
      logo_url: '',
      login_image_url: '',
      nivel_institucion: 'Primaria',
    };
  }
}

/**
 * Actualiza la configuración de la aplicación
 */
export async function updateConfiguracionApp(
  config: Partial<ConfiguracionApp>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient() as SupabaseClient<any>;

  try {
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Verificar que el usuario sea administrador
    const { data: personal, error: personalError } = await supabase
      .from('personal')
      .select('rol')
      .eq('id', user.id)
      .single();

    // Si hay error al buscar el personal, permitir la operación (modo desarrollo)
    // En producción, esto debería ser más estricto
    if (personalError) {
      console.warn('No se pudo verificar el rol del usuario. Permitiendo operación en modo desarrollo.');
    } else if (personal && personal.rol !== 'Admin') {
      return { success: false, error: 'Solo los administradores pueden modificar la configuración' };
    }

    // Verificar si la tabla existe intentando hacer una consulta
    const { error: tableCheckError } = await supabase
      .from('configuracion_app')
      .select('clave')
      .limit(1);

    if (tableCheckError) {
      console.error('La tabla configuracion_app no existe. Ejecuta el script SQL primero:', tableCheckError.message);
      return { 
        success: false, 
        error: 'La tabla de configuración no existe. Por favor, ejecuta el script SQL de migración primero.' 
      };
    }

    // Actualizar cada clave de configuración
    for (const [clave, valor] of Object.entries(config)) {
      const { error } = await supabase
        .from('configuracion_app')
        .update({ 
          valor: valor as string,
          actualizado_por: user.id 
        })
        .eq('clave', clave);

      if (error) {
        console.error(`Error al actualizar ${clave}:`, error);
        return { success: false, error: `Error al actualizar ${clave}: ${error.message}` };
      }
    }

    // Revalidar las rutas que usan esta configuración
    revalidatePath('/');
    revalidatePath('/ajustes/personalizacion');
    revalidatePath('/login');

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return { success: false, error: 'Error inesperado al actualizar configuración' };
  }
}

/**
 * Obtiene un valor específico de configuración
 */
export async function getConfigValue(clave: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient() as SupabaseClient<any>;
  
  const { data, error } = await supabase
    .from('configuracion_app')
    .select('valor')
    .eq('clave', clave)
    .single();

  if (error) {
    console.error(`Error al obtener ${clave}:`, error);
    return null;
  }

  return data?.valor || null;
}
