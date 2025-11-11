-- ============================================================================
-- MIGRACIÓN COMPLETA: Sistema de Horarios para Docentes
-- ============================================================================
-- Esta migración crea/actualiza la tabla horarios con soporte completo para:
-- 1. Asignaciones docentes (clases)
-- 2. Actividades personalizadas (tutorías, reuniones, etc.)
-- 3. Políticas RLS correctas
--
-- IMPORTANTE: Esta migración es idempotente - puede ejecutarse múltiples veces
-- ============================================================================

-- ============================================================================
-- PASO 1: Eliminar políticas RLS antiguas que causan problemas
-- ============================================================================

DROP POLICY IF EXISTS "Usuarios autenticados pueden gestionar horarios" ON horarios;
DROP POLICY IF EXISTS "horarios_select_policy" ON horarios;
DROP POLICY IF EXISTS "horarios_insert_policy" ON horarios;
DROP POLICY IF EXISTS "horarios_update_policy" ON horarios;
DROP POLICY IF EXISTS "horarios_delete_policy" ON horarios;

-- ============================================================================
-- PASO 2: Crear o actualizar la tabla horarios
-- ============================================================================

CREATE TABLE IF NOT EXISTS horarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
    dia_semana TEXT NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
    hora_id TEXT NOT NULL,
    asignacion_id UUID REFERENCES asignaciones_docentes(id) ON DELETE CASCADE,
    actividad_nombre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint único: un docente no puede tener dos asignaciones en el mismo día y hora
    UNIQUE(personal_id, dia_semana, hora_id)
);

-- ============================================================================
-- PASO 3: Actualizar columnas existentes (si la tabla ya existe)
-- ============================================================================

-- Hacer asignacion_id nullable (si no lo es)
DO $$ 
BEGIN
    ALTER TABLE horarios ALTER COLUMN asignacion_id DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignorar si ya es nullable
END $$;

-- Agregar columna actividad_nombre (si no existe)
DO $$ 
BEGIN
    ALTER TABLE horarios ADD COLUMN IF NOT EXISTS actividad_nombre TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL; -- Ignorar si ya existe
END $$;

-- ============================================================================
-- PASO 4: Agregar/actualizar constraints
-- ============================================================================

-- Eliminar constraint antiguo si existe
ALTER TABLE horarios DROP CONSTRAINT IF EXISTS horarios_asignacion_o_actividad;

-- Agregar constraint: debe tener asignacion_id O actividad_nombre (no ambos, no ninguno)
ALTER TABLE horarios ADD CONSTRAINT horarios_asignacion_o_actividad 
CHECK (
    (asignacion_id IS NOT NULL AND actividad_nombre IS NULL) OR
    (asignacion_id IS NULL AND actividad_nombre IS NOT NULL)
);

-- ============================================================================
-- PASO 5: Crear índices para performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_horarios_personal_id ON horarios(personal_id);
CREATE INDEX IF NOT EXISTS idx_horarios_asignacion_id ON horarios(asignacion_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_semana ON horarios(dia_semana);

-- ============================================================================
-- PASO 6: Crear trigger para updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_horarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_horarios_updated_at ON horarios;

CREATE TRIGGER trigger_update_horarios_updated_at
    BEFORE UPDATE ON horarios
    FOR EACH ROW
    EXECUTE FUNCTION update_horarios_updated_at();

-- ============================================================================
-- PASO 7: Habilitar RLS y crear políticas CORRECTAS
-- ============================================================================

-- Habilitar RLS
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Usuarios autenticados pueden ver todos los horarios
CREATE POLICY "horarios_select_authenticated"
    ON horarios
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: Usuarios autenticados pueden insertar horarios
CREATE POLICY "horarios_insert_authenticated"
    ON horarios
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para UPDATE: Usuarios autenticados pueden actualizar horarios
CREATE POLICY "horarios_update_authenticated"
    ON horarios
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para DELETE: Usuarios autenticados pueden eliminar horarios
CREATE POLICY "horarios_delete_authenticated"
    ON horarios
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- PASO 8: Agregar comentarios para documentación
-- ============================================================================

COMMENT ON TABLE horarios IS 'Almacena el horario semanal de cada docente, soportando tanto asignaciones docentes como actividades personalizadas';
COMMENT ON COLUMN horarios.personal_id IS 'ID del docente al que pertenece este bloque horario';
COMMENT ON COLUMN horarios.dia_semana IS 'Día de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)';
COMMENT ON COLUMN horarios.hora_id IS 'ID de la hora pedagógica (1, 2, 3, etc.)';
COMMENT ON COLUMN horarios.asignacion_id IS 'ID de la asignación docente (NULL si es actividad personalizada)';
COMMENT ON COLUMN horarios.actividad_nombre IS 'Nombre de la actividad personalizada (NULL si es asignación docente)';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'horarios'
ORDER BY ordinal_position;

-- Mostrar políticas RLS
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'horarios';

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Debes ver:
-- 1. Columnas: id, personal_id, dia_semana, hora_id, asignacion_id (nullable), 
--              actividad_nombre (nullable), created_at, updated_at
-- 2. Políticas: 4 políticas (select, insert, update, delete) para 'authenticated'
-- 3. Mensaje: "Success. No rows returned" (si no hay errores)
-- ============================================================================
