// src/infrastructure/adapters/supabase/config.ts
import { createClient } from '@supabase/supabase-js';

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Use real values if configured, otherwise use valid dummy values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin client para operaciones del servidor
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Tipos de base de datos generados por Supabase
export type Database = {
  public: {
    Tables: {
      estudiantes: {
        Row: {
          id: string;
          tipo_documento: string;
          numero_documento: string;
          apellido_paterno: string;
          apellido_materno: string | null;
          nombres: string;
          grado: string | null;
          seccion: string | null;
          nee: string | null;
          nee_documentos: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tipo_documento: string;
          numero_documento: string;
          apellido_paterno: string;
          apellido_materno?: string | null;
          nombres: string;
          grado?: string | null;
          seccion?: string | null;
          nee?: string | null;
          nee_documentos?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tipo_documento?: string;
          numero_documento?: string;
          apellido_paterno?: string;
          apellido_materno?: string | null;
          nombres?: string;
          grado?: string | null;
          seccion?: string | null;
          nee?: string | null;
          nee_documentos?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      personal: {
        Row: {
          id: string;
          tipo_documento: string;
          numero_documento: string;
          apellido_paterno: string;
          apellido_materno: string | null;
          nombres: string;
          email: string | null;
          telefono: string | null;
          rol: string;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tipo_documento: string;
          numero_documento: string;
          apellido_paterno: string;
          apellido_materno?: string | null;
          nombres: string;
          email?: string | null;
          telefono?: string | null;
          rol: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tipo_documento?: string;
          numero_documento?: string;
          apellido_paterno?: string;
          apellido_materno?: string | null;
          nombres?: string;
          email?: string | null;
          telefono?: string | null;
          rol?: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      asignaciones: {
        Row: {
          id: string;
          personal_id: string;
          grado: string;
          seccion: string;
          rol_asignacion: string;
          area_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          personal_id: string;
          grado: string;
          seccion: string;
          rol_asignacion: string;
          area_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          personal_id?: string;
          grado?: string;
          seccion?: string;
          rol_asignacion?: string;
          area_id?: string | null;
          created_at?: string;
        };
      };
      areas_curriculares: {
        Row: {
          id: string;
          nombre: string;
          nivel: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          nivel: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          nivel?: string;
          created_at?: string;
        };
      };
      niveles_educativos: {
        Row: {
          id: string;
          nombre: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
