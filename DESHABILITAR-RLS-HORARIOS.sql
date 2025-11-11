-- ============================================================================
-- SOLUCIÓN: Deshabilitar RLS en tabla horarios
-- ============================================================================
-- Esta es la solución más simple y práctica para el problema de guardado
-- 
-- RAZÓN: El sistema usa autenticación personalizada (no Supabase Auth),
-- por lo que RLS bloquea las operaciones al no detectar usuario autenticado.
-- 
-- SEGURIDAD: La autorización se maneja en la capa de aplicación (repositorio)
-- ============================================================================

-- Deshabilitar Row Level Security en la tabla horarios
ALTER TABLE horarios DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó correctamente
SELECT 
    tablename,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS deshabilitado - Guardado funcionará'
        ELSE '❌ RLS aún habilitado - Ejecuta este script nuevamente'
    END as estado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'horarios';

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- tablename: horarios
-- rls_habilitado: false
-- estado: ✅ RLS deshabilitado - Guardado funcionará
-- ============================================================================

-- ============================================================================
-- DESPUÉS DE EJECUTAR:
-- ============================================================================
-- 1. Recarga la aplicación (F5)
-- 2. Ve a "Mi Horario"
-- 3. Asigna una clase al horario
-- 4. Click en "Guardar Cambios"
-- 5. Deberías ver: ✅ Horarios guardados exitosamente
-- ============================================================================
