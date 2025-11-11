-- ============================================================================
-- VERIFICACIÓN: Migración de Tabla Horarios V2
-- ============================================================================
-- Este script verifica si la migración MIGRACION-TABLA-HORARIOS-V2.sql
-- se ejecutó correctamente

-- 1. Verificar que la tabla horarios existe
SELECT 
    'Tabla horarios existe' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'horarios'
        ) THEN '✅ SÍ'
        ELSE '❌ NO - Ejecuta MIGRACION-TABLA-HORARIOS.sql'
    END as resultado;

-- 2. Verificar estructura de la tabla horarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'horarios'
ORDER BY ordinal_position;

-- 3. Verificar que asignacion_id es nullable
SELECT 
    'asignacion_id es nullable' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'horarios'
            AND column_name = 'asignacion_id'
            AND is_nullable = 'YES'
        ) THEN '✅ SÍ'
        ELSE '❌ NO - Ejecuta MIGRACION-TABLA-HORARIOS-V2.sql'
    END as resultado;

-- 4. Verificar que existe la columna actividad_nombre
SELECT 
    'Columna actividad_nombre existe' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'horarios'
            AND column_name = 'actividad_nombre'
        ) THEN '✅ SÍ'
        ELSE '❌ NO - Ejecuta MIGRACION-TABLA-HORARIOS-V2.sql'
    END as resultado;

-- 5. Verificar que existe el constraint horarios_asignacion_o_actividad
SELECT 
    'Constraint horarios_asignacion_o_actividad existe' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'horarios'
            AND constraint_name = 'horarios_asignacion_o_actividad'
            AND constraint_type = 'CHECK'
        ) THEN '✅ SÍ'
        ELSE '❌ NO - Ejecuta MIGRACION-TABLA-HORARIOS-V2.sql'
    END as resultado;

-- 6. Ver todos los constraints de la tabla
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
    AND table_name = 'horarios';

-- 7. Verificar políticas RLS
SELECT 
    'Políticas RLS configuradas' as verificacion,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ SÍ (' || COUNT(*) || ' políticas)'
        ELSE '❌ NO - Ejecuta MIGRACION-TABLA-HORARIOS-V3-RLS.sql'
    END as resultado
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'horarios';

-- 8. Listar todas las políticas RLS
SELECT 
    policyname as nombre_politica,
    cmd as comando,
    qual as condicion_using,
    with_check as condicion_with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'horarios'
ORDER BY policyname;

-- 9. Contar registros actuales en horarios
SELECT 
    COUNT(*) as total_registros,
    COUNT(asignacion_id) as con_asignacion,
    COUNT(actividad_nombre) as con_actividad
FROM horarios;

-- ============================================================================
-- INSTRUCCIONES:
-- ============================================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Revisa los resultados:
--    - Todas las verificaciones deben mostrar ✅ SÍ
--    - Si alguna muestra ❌ NO, ejecuta la migración correspondiente
-- 3. Si ves errores como "column actividad_nombre does not exist":
--    - Ejecuta MIGRACION-TABLA-HORARIOS-V2.sql
--    - Vuelve a ejecutar este script de verificación
-- 4. Si ves error "violates row-level security policy":
--    - Ejecuta MIGRACION-TABLA-HORARIOS-V3-RLS.sql
--    - Vuelve a ejecutar este script de verificación
-- ============================================================================
