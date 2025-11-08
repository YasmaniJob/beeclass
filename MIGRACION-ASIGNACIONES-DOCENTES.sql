-- ============================================================================
-- MIGRACIÓN: ASIGNACIONES DOCENTES
-- ============================================================================
-- Descripción: Crea tabla para almacenar asignaciones de docentes a secciones y áreas
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. LIMPIEZA DE ARTEFACTOS ANTERIORES
-- ============================================================================
DROP VIEW IF EXISTS vista_asignaciones_completas;
DROP FUNCTION IF EXISTS obtener_asignaciones_docente(UUID);
DROP FUNCTION IF EXISTS obtener_docentes_grado_seccion(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS update_asignaciones_docentes_updated_at();
DROP TABLE IF EXISTS asignaciones_docentes;

-- ============================================================================
-- 1. TABLA: asignaciones_docentes
-- ============================================================================
-- Almacena la relación entre personal, grados/secciones y áreas curriculares.
-- Usa UUIDs coherentes con tablas maestras (personal, grados_secciones, areas_curriculares).

CREATE TABLE asignaciones_docentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
    grado_seccion_id UUID NOT NULL REFERENCES grados_secciones(id) ON DELETE CASCADE,
    area_id VARCHAR REFERENCES areas_curriculares(id) ON DELETE SET NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('Docente', 'Docente y Tutor', 'Auxiliar')),
    horas_semanales INTEGER DEFAULT 0 CHECK (horas_semanales >= 0),
    periodo_inicio DATE,
    periodo_fin DATE,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================
CREATE INDEX idx_asignaciones_docentes_personal ON asignaciones_docentes(personal_id);
CREATE INDEX idx_asignaciones_docentes_grado_seccion ON asignaciones_docentes(grado_seccion_id);
CREATE INDEX idx_asignaciones_docentes_area ON asignaciones_docentes(area_id);
CREATE INDEX idx_asignaciones_docentes_activo ON asignaciones_docentes(activo);
CREATE INDEX idx_asignaciones_docentes_rol ON asignaciones_docentes(rol);

-- ============================================================================
-- 3. TRIGGER updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_asignaciones_docentes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asignaciones_docentes_updated_at
    BEFORE UPDATE ON asignaciones_docentes
    FOR EACH ROW
    EXECUTE FUNCTION update_asignaciones_docentes_updated_at();

-- ============================================================================
-- 4. VISTA: vista_asignaciones_completas
-- ============================================================================
CREATE OR REPLACE VIEW vista_asignaciones_completas AS
SELECT
    a.id,
    a.personal_id,
    p.numero_documento AS documento_personal,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    a.grado_seccion_id,
    gs.grado,
    gs.seccion,
    gs.nivel,
    a.area_id,
    ar.nombre AS area_nombre,
    a.rol,
    a.horas_semanales,
    a.periodo_inicio,
    a.periodo_fin,
    a.activo,
    a.created_at,
    a.updated_at
FROM asignaciones_docentes a
INNER JOIN personal p ON a.personal_id = p.id
INNER JOIN grados_secciones gs ON a.grado_seccion_id = gs.id
LEFT JOIN areas_curriculares ar ON a.area_id = ar.id;

COMMENT ON VIEW vista_asignaciones_completas IS 'Asignaciones de docentes con información de personal, grado/sección y área.';

-- ============================================================================
-- 5. FUNCIONES AUXILIARES
-- ============================================================================

CREATE OR REPLACE FUNCTION obtener_asignaciones_docente(p_personal_id UUID)
RETURNS TABLE (
    id UUID,
    grado VARCHAR,
    seccion VARCHAR,
    nivel VARCHAR,
    area_id UUID,
    area_nombre VARCHAR,
    rol VARCHAR,
    horas_semanales INTEGER,
    periodo_inicio DATE,
    periodo_fin DATE,
    activo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        gs.grado,
        gs.seccion,
        gs.nivel,
        a.area_id,
        ar.nombre,
        a.rol,
        a.horas_semanales,
        a.periodo_inicio,
        a.periodo_fin,
        a.activo
    FROM asignaciones_docentes a
    INNER JOIN grados_secciones gs ON a.grado_seccion_id = gs.id
    LEFT JOIN areas_curriculares ar ON a.area_id = ar.id
    WHERE a.personal_id = p_personal_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_asignaciones_docente IS 'Obtiene todas las asignaciones (activas e inactivas) de un docente.';


CREATE OR REPLACE FUNCTION obtener_docentes_grado_seccion(p_grado_seccion_id UUID)
RETURNS TABLE (
    asignacion_id UUID,
    personal_id UUID,
    nombre_completo VARCHAR,
    area_id UUID,
    area_nombre VARCHAR,
    rol VARCHAR,
    activo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.personal_id,
        p.nombres || ' ' || p.apellido_paterno || ' ' || COALESCE(p.apellido_materno, '') AS nombre_completo,
        a.area_id,
        ar.nombre,
        a.rol,
        a.activo
    FROM asignaciones_docentes a
    INNER JOIN personal p ON a.personal_id = p.id
    LEFT JOIN areas_curriculares ar ON a.area_id = ar.id
    WHERE a.grado_seccion_id = p_grado_seccion_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_docentes_grado_seccion IS 'Retorna el personal asignado a un grado_seccion específico.';

COMMIT;
