-- ============================================================================
-- MIGRACIÓN V2: Actualización de Tabla de Horarios para Docentes
-- ============================================================================
-- Esta migración actualiza la tabla horarios para soportar actividades personalizadas
-- que no están vinculadas a asignaciones_docentes

-- Hacer asignacion_id nullable para permitir actividades personalizadas
ALTER TABLE horarios 
    ALTER COLUMN asignacion_id DROP NOT NULL;

-- Agregar columna para nombre de actividad personalizada
ALTER TABLE horarios 
    ADD COLUMN IF NOT EXISTS actividad_nombre TEXT;

-- Agregar constraint: debe tener asignacion_id O actividad_nombre (no ambos)
ALTER TABLE horarios 
    ADD CONSTRAINT horarios_asignacion_o_actividad 
    CHECK (
        (asignacion_id IS NOT NULL AND actividad_nombre IS NULL) OR
        (asignacion_id IS NULL AND actividad_nombre IS NOT NULL)
    );

-- Comentarios actualizados
COMMENT ON COLUMN horarios.asignacion_id IS 'ID de la asignación docente para este bloque (NULL si es actividad personalizada)';
COMMENT ON COLUMN horarios.actividad_nombre IS 'Nombre de la actividad personalizada (NULL si es asignación docente)';

-- Nota: Esta migración es compatible con datos existentes ya que:
-- 1. Los registros existentes tienen asignacion_id NOT NULL, por lo que cumplen el constraint
-- 2. actividad_nombre será NULL por defecto en registros existentes
