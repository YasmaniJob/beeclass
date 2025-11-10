-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS DE PERSONAL
-- =====================================================
-- Ejecutar en Supabase SQL Editor para mejorar rendimiento
-- y reducir consumo de recursos (importante para plan free)

-- Índice en personal.activo para filtrar rápidamente personal activo
CREATE INDEX IF NOT EXISTS idx_personal_activo 
ON personal(activo) 
WHERE activo = true;

-- Índice compuesto en personal para ordenamiento común
CREATE INDEX IF NOT EXISTS idx_personal_activo_apellido 
ON personal(activo, apellido_paterno) 
WHERE activo = true;

-- Índice en asignaciones_docentes.activo
CREATE INDEX IF NOT EXISTS idx_asignaciones_docentes_activo 
ON asignaciones_docentes(activo) 
WHERE activo = true;

-- Índice compuesto para consultas de asignaciones por personal
CREATE INDEX IF NOT EXISTS idx_asignaciones_personal_activo 
ON asignaciones_docentes(personal_id, activo) 
WHERE activo = true;

-- Índice para búsquedas por número de documento
CREATE INDEX IF NOT EXISTS idx_personal_numero_documento 
ON personal(numero_documento) 
WHERE activo = true;

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_personal_email 
ON personal(email) 
WHERE activo = true AND email IS NOT NULL;

-- =====================================================
-- VERIFICAR ÍNDICES CREADOS
-- =====================================================
-- Ejecutar esta consulta para verificar que los índices se crearon correctamente:
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('personal', 'asignaciones_docentes')
ORDER BY tablename, indexname;
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Estos índices mejoran significativamente el rendimiento de consultas
-- 2. Los índices parciales (WHERE activo = true) son más eficientes
-- 3. Reducen el consumo de recursos en el plan gratuito de Supabase
-- 4. No afectan las operaciones de escritura significativamente
