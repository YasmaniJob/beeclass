-- ============================================================================
-- MIGRACIÓN DE DATOS MAESTROS A SUPABASE
-- ============================================================================
-- Fecha: 29 de octubre de 2025
-- Objetivo: Migrar grados/secciones, horas pedagógicas y asignaciones desde
--           localStorage a Supabase para arquitectura sólida
--
-- ESTRUCTURA EDUCATIVA PERUANA:
-- - Inicial:    3 grados (3 años, 4 años, 5 años)
-- - Primaria:   6 grados (1er a 6to Grado)
-- - Secundaria: 5 grados (1er a 5to Año)
--
-- CAPACIDADES TÍPICAS:
-- - Inicial:    25 estudiantes por sección
-- - Primaria:   30 estudiantes por sección
-- - Secundaria: 35 estudiantes por sección
-- ============================================================================

BEGIN;

-- =========================================================================
-- LIMPIEZA (permite re-ejecución idempotente)
-- =========================================================================
DROP VIEW IF EXISTS vista_asignaciones_completas;
DROP FUNCTION IF EXISTS update_grados_secciones_updated_at();
DROP FUNCTION IF EXISTS update_horas_pedagogicas_updated_at();
DROP TABLE IF EXISTS grados_secciones CASCADE;
DROP TABLE IF EXISTS horas_pedagogicas CASCADE;

-- ============================================================================
-- 1. TABLA: grados_secciones
-- ============================================================================
-- Almacena los grados y secciones disponibles en la institución
-- Reemplaza: localStorage keys 'grados_creados' y 'secciones_creadas'

CREATE TABLE grados_secciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grado VARCHAR(50) NOT NULL,
    seccion VARCHAR(10) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    capacidad_maxima INTEGER DEFAULT 30,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT grados_secciones_grado_seccion_unica UNIQUE (grado, seccion)
);

CREATE INDEX grados_secciones_grado_idx ON grados_secciones(grado);
CREATE INDEX grados_secciones_nivel_idx ON grados_secciones(nivel);
CREATE INDEX grados_secciones_activo_idx ON grados_secciones(activo);

CREATE OR REPLACE FUNCTION update_grados_secciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grados_secciones_updated_at_trg
    BEFORE UPDATE ON grados_secciones
    FOR EACH ROW
    EXECUTE FUNCTION update_grados_secciones_updated_at();

COMMENT ON TABLE grados_secciones IS 'Grados y secciones disponibles en la institución';
COMMENT ON COLUMN grados_secciones.nivel IS 'Nivel educativo (Inicial, Primaria, Secundaria)';

-- ============================================================================
-- 2. TABLA: horas_pedagogicas
-- ============================================================================
-- Almacena las horas pedagógicas del horario escolar
-- Reemplaza: localStorage (hook useHorasPedagogicas)

CREATE TABLE horas_pedagogicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL,
    orden INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    es_recreo BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT horas_pedagogicas_orden_unico UNIQUE (orden)
);

CREATE INDEX horas_pedagogicas_orden_idx ON horas_pedagogicas(orden);
CREATE INDEX horas_pedagogicas_activo_idx ON horas_pedagogicas(activo);

CREATE OR REPLACE FUNCTION update_horas_pedagogicas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER horas_pedagogicas_updated_at_trg
    BEFORE UPDATE ON horas_pedagogicas
    FOR EACH ROW
    EXECUTE FUNCTION update_horas_pedagogicas_updated_at();

COMMENT ON TABLE horas_pedagogicas IS 'Horas pedagógicas del horario escolar';

 -- ============================================================================
 -- NOTA SOBRE VISTAS/FUNCIONES RELACIONADAS A ASIGNACIONES
 -- ============================================================================
 -- La vista `vista_asignaciones_completas` y funciones auxiliares que dependen de
 -- `asignaciones_docentes` se definen en MIGRACION-ASIGNACIONES-DOCENTES.sql para
 -- evitar referencias a tablas aún no creadas durante esta fase.

 -- ============================================================================
 -- 7. FUNCIONES ÚTILES
-- ============================================================================

-- Función: Obtener grados por nivel
CREATE OR REPLACE FUNCTION obtener_grados_por_nivel(p_nivel VARCHAR)
RETURNS TABLE (
    id UUID,
    grado VARCHAR,
    seccion VARCHAR,
    capacidad_maxima INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.id,
        gs.grado,
        gs.seccion,
        gs.capacidad_maxima
    FROM grados_secciones gs
    WHERE gs.nivel = p_nivel
    AND gs.activo = true
    ORDER BY 
        CASE 
            -- Orden para Inicial
            WHEN gs.grado = '3 años' THEN 1
            WHEN gs.grado = '4 años' THEN 2
            WHEN gs.grado = '5 años' THEN 3
            -- Orden para Primaria
            WHEN gs.grado = '1er Grado' THEN 1
            WHEN gs.grado = '2do Grado' THEN 2
            WHEN gs.grado = '3er Grado' THEN 3
            WHEN gs.grado = '4to Grado' THEN 4
            WHEN gs.grado = '5to Grado' THEN 5
            WHEN gs.grado = '6to Grado' THEN 6
            -- Orden para Secundaria
            WHEN gs.grado = '1er Año' THEN 1
            WHEN gs.grado = '2do Año' THEN 2
            WHEN gs.grado = '3er Año' THEN 3
            WHEN gs.grado = '4to Año' THEN 4
            WHEN gs.grado = '5to Año' THEN 5
            ELSE 99
        END,
        gs.seccion;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_grados_por_nivel IS 'Obtiene todos los grados y secciones de un nivel educativo específico';

-- Función: Validar estructura educativa
CREATE OR REPLACE FUNCTION validar_estructura_educativa()
RETURNS TABLE (
    nivel VARCHAR,
    grados_esperados INTEGER,
    grados_actuales BIGINT,
    estado VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH estructura_esperada AS (
        SELECT 'Inicial'::VARCHAR AS nivel, 3 AS grados_esperados
        UNION ALL
        SELECT 'Primaria'::VARCHAR, 6
        UNION ALL
        SELECT 'Secundaria'::VARCHAR, 5
    ),
    estructura_actual AS (
        SELECT 
            gs.nivel,
            COUNT(DISTINCT gs.grado) AS grados_actuales
        FROM grados_secciones gs
        WHERE gs.activo = true
        GROUP BY gs.nivel
    )
    SELECT 
        ee.nivel,
        ee.grados_esperados,
        COALESCE(ea.grados_actuales, 0) AS grados_actuales,
        CASE 
            WHEN COALESCE(ea.grados_actuales, 0) = ee.grados_esperados THEN '✓ Completo'
            WHEN COALESCE(ea.grados_actuales, 0) < ee.grados_esperados THEN '⚠ Incompleto'
            WHEN COALESCE(ea.grados_actuales, 0) > ee.grados_esperados THEN '⚠ Excede'
            ELSE '✗ Sin datos'
        END AS estado
    FROM estructura_esperada ee
    LEFT JOIN estructura_actual ea ON ee.nivel = ea.nivel
    ORDER BY 
        CASE ee.nivel
            WHEN 'Inicial' THEN 1
            WHEN 'Primaria' THEN 2
            WHEN 'Secundaria' THEN 3
        END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_estructura_educativa IS 'Valida que la estructura de grados cumpla con el sistema educativo peruano';

-- ============================================================================
-- 8. SCRIPT DE MIGRACIÓN DESDE LOCALSTORAGE (EJEMPLO)
-- ============================================================================
-- Este script es solo un ejemplo. Deberás ejecutarlo desde tu aplicación
-- para migrar los datos existentes en localStorage a Supabase.

/*
EJEMPLO DE MIGRACIÓN DESDE JAVASCRIPT:

// 1. Obtener datos de localStorage
const gradosCreados = JSON.parse(localStorage.getItem('grados_creados') || '[]');
const seccionesCreadas = JSON.parse(localStorage.getItem('secciones_creadas') || '{}');

// 2. Transformar a formato de Supabase
const gradosSecciones = [];
gradosCreados.forEach(grado => {
    const secciones = seccionesCreadas[grado] || [];
    secciones.forEach(seccion => {
        gradosSecciones.push({
            grado: grado,
            seccion: seccion,
            nivel: 'Primaria', // Ajustar según tu lógica
            capacidad_maxima: 30
        });
    });
});

// 3. Insertar en Supabase
const { data, error } = await supabase
    .from('grados_secciones')
    .insert(gradosSecciones);

// 4. Limpiar localStorage (OPCIONAL - hacer después de verificar)
// localStorage.removeItem('grados_creados');
// localStorage.removeItem('secciones_creadas');
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Próximos pasos:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Verificar que las tablas se crearon correctamente
-- 3. Crear los repositorios en TypeScript
-- 4. Crear los hooks personalizados
-- 5. Actualizar las páginas de UI
-- 6. Migrar datos desde localStorage
-- ============================================================================
