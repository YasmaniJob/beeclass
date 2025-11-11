-- ============================================================================
-- MIGRACIÓN V3: Corrección de Políticas RLS para Tabla Horarios
-- ============================================================================
-- Esta migración corrige las políticas de Row Level Security (RLS)
-- para permitir que usuarios autenticados puedan insertar/actualizar horarios

-- Eliminar política anterior que puede estar causando problemas
DROP POLICY IF EXISTS "Usuarios autenticados pueden gestionar horarios" ON horarios;

-- Crear políticas más específicas y permisivas

-- Política para SELECT: Cualquier usuario autenticado puede ver horarios
CREATE POLICY "horarios_select_policy"
    ON horarios
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Política para INSERT: Cualquier usuario autenticado puede insertar horarios
CREATE POLICY "horarios_insert_policy"
    ON horarios
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE: Cualquier usuario autenticado puede actualizar horarios
CREATE POLICY "horarios_update_policy"
    ON horarios
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política para DELETE: Cualquier usuario autenticado puede eliminar horarios
CREATE POLICY "horarios_delete_policy"
    ON horarios
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Comentarios
COMMENT ON POLICY "horarios_select_policy" ON horarios IS 
    'Permite a usuarios autenticados ver todos los horarios';
COMMENT ON POLICY "horarios_insert_policy" ON horarios IS 
    'Permite a usuarios autenticados insertar horarios';
COMMENT ON POLICY "horarios_update_policy" ON horarios IS 
    'Permite a usuarios autenticados actualizar horarios';
COMMENT ON POLICY "horarios_delete_policy" ON horarios IS 
    'Permite a usuarios autenticados eliminar horarios';

-- Verificar que RLS está habilitado
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NOTA: Si prefieres políticas más restrictivas (solo el docente puede
-- gestionar su propio horario), puedes usar estas políticas alternativas:
-- ============================================================================
/*
-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "horarios_select_policy" ON horarios;
DROP POLICY IF EXISTS "horarios_insert_policy" ON horarios;
DROP POLICY IF EXISTS "horarios_update_policy" ON horarios;
DROP POLICY IF EXISTS "horarios_delete_policy" ON horarios;

-- Políticas restrictivas: Solo el docente dueño puede gestionar su horario
CREATE POLICY "horarios_select_own"
    ON horarios
    FOR SELECT
    USING (
        personal_id IN (
            SELECT id FROM personal WHERE email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "horarios_insert_own"
    ON horarios
    FOR INSERT
    WITH CHECK (
        personal_id IN (
            SELECT id FROM personal WHERE email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "horarios_update_own"
    ON horarios
    FOR UPDATE
    USING (
        personal_id IN (
            SELECT id FROM personal WHERE email = auth.jwt()->>'email'
        )
    )
    WITH CHECK (
        personal_id IN (
            SELECT id FROM personal WHERE email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "horarios_delete_own"
    ON horarios
    FOR DELETE
    USING (
        personal_id IN (
            SELECT id FROM personal WHERE email = auth.jwt()->>'email'
        )
    );
*/
