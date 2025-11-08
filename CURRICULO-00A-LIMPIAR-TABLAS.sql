-- ============================================================================
-- LIMPIEZA DE TABLAS DEL CURRÍCULO (OPCIONAL)
-- ============================================================================
-- ADVERTENCIA: Este script ELIMINA todas las tablas del currículo y sus datos
-- Solo ejecutar si necesitas recrear las tablas desde cero
-- ============================================================================

-- Eliminar tablas en orden inverso (por las dependencias)
DROP TABLE IF EXISTS capacidades CASCADE;
DROP TABLE IF EXISTS competencias CASCADE;
DROP TABLE IF EXISTS areas_curriculares CASCADE;
DROP TABLE IF EXISTS niveles CASCADE;

-- Eliminar funciones de triggers si existen
DROP FUNCTION IF EXISTS update_capacidades_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_competencias_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_areas_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_niveles_updated_at() CASCADE;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Tablas del currículo eliminadas correctamente';
    RAISE NOTICE 'Ahora puedes ejecutar CURRICULO-00-TABLAS.sql';
END $$;
