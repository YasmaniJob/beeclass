-- ============================================================================
-- VERIFICACIÓN: Sistema de Horarios
-- ============================================================================
-- Este script verifica que la tabla horarios esté correctamente configurada
-- ============================================================================

-- 1. Verificar que la tabla existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'horarios'
        ) 
        THEN '✅ Tabla horarios existe'
        ELSE '❌ Tabla horarios NO existe - Ejecuta MIGRACION-HORARIOS-COMPLETA.sql'
    END as verificacion;

-- 2. Mostrar estructura completa de la tabla
SELECT 
    column_name as columna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as valor_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'horarios'
ORDER BY ordinal_position;

-- 3. Verificar constraints
SELECT 
    constraint_name as constraint,
    constraint_type as tipo
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'horarios';

-- 4. Verificar políticas RLS
SELECT 
    policyname as politica,
    cmd as operacion,
    roles as roles,
    qual as condicion_using,
    with_check as condicion_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'horarios'
ORDER BY policyname;

-- 5. Contar políticas RLS
SELECT 
    COUNT(*) as total_politicas,
    CASE 
        WHEN COUNT(*) >= 4 
        THEN '✅ Políticas RLS correctas (4 o más)'
        ELSE '❌ Faltan políticas RLS - Ejecuta MIGRACION-HORARIOS-COMPLETA.sql'
    END as estado
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'horarios';

-- 6. Ver datos actuales (si existen)
SELECT 
    COUNT(*) as total_registros,
    COUNT(asignacion_id) as con_asignacion,
    COUNT(actividad_nombre) as con_actividad
FROM horarios;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- ✅ Tabla horarios existe
-- 
-- Columnas (8):
-- - id (uuid, not null)
-- - personal_id (uuid, not null)
-- - dia_semana (text, not null)
-- - hora_id (text, not null)
-- - asignacion_id (uuid, nullable) ← IMPORTANTE: debe ser nullable
-- - actividad_nombre (text, nullable) ← IMPORTANTE: debe existir
-- - created_at (timestamptz)
-- - updated_at (timestamptz)
--
-- Constraints (3+):
-- - PRIMARY KEY
-- - FOREIGN KEY (personal_id)
-- - FOREIGN KEY (asignacion_id)
-- - CHECK (horarios_asignacion_o_actividad)
-- - UNIQUE (personal_id, dia_semana, hora_id)
--
-- Políticas RLS (4):
-- - horarios_select_authenticated (SELECT, authenticated)
-- - horarios_insert_authenticated (INSERT, authenticated)
-- - horarios_update_authenticated (UPDATE, authenticated)
-- - horarios_delete_authenticated (DELETE, authenticated)
--
-- ✅ Políticas RLS correctas (4 o más)
-- ============================================================================
