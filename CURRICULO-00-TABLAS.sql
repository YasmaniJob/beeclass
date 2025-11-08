-- ============================================================================
-- CURRÍCULO NACIONAL - PARTE 0: CREACIÓN DE TABLAS
-- ============================================================================
-- IMPORTANTE: Ejecutar ANTES de cualquier otro script del currículo
-- Este script crea las tablas necesarias para el sistema curricular

-- ============================================================================
-- TABLA: niveles
-- ============================================================================
-- Almacena los niveles educativos (Inicial, Primaria, Secundaria)

CREATE TABLE IF NOT EXISTS niveles (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_nivel_orden UNIQUE (orden)
);

CREATE INDEX idx_niveles_orden ON niveles(orden);
CREATE INDEX idx_niveles_activo ON niveles(activo);

COMMENT ON TABLE niveles IS 'Niveles educativos del sistema (Inicial, Primaria, Secundaria)';
COMMENT ON COLUMN niveles.id IS 'Identificador único del nivel (inicial, primaria, secundaria)';
COMMENT ON COLUMN niveles.nombre IS 'Nombre del nivel educativo';
COMMENT ON COLUMN niveles.orden IS 'Orden de presentación del nivel';

-- ============================================================================
-- TABLA: areas_curriculares
-- ============================================================================
-- Almacena las áreas curriculares por nivel educativo

CREATE TABLE IF NOT EXISTS areas_curriculares (
    id VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    nivel_id VARCHAR(50) REFERENCES niveles(id) ON DELETE CASCADE,
    es_oficial BOOLEAN DEFAULT false,
    orden INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_area_nivel UNIQUE (nombre, nivel_id)
);

CREATE INDEX idx_areas_nivel ON areas_curriculares(nivel_id);
CREATE INDEX idx_areas_oficial ON areas_curriculares(es_oficial);
CREATE INDEX idx_areas_activo ON areas_curriculares(activo);
CREATE INDEX idx_areas_orden ON areas_curriculares(orden);

COMMENT ON TABLE areas_curriculares IS 'Áreas curriculares por nivel educativo';
COMMENT ON COLUMN areas_curriculares.id IS 'Identificador único del área';
COMMENT ON COLUMN areas_curriculares.nombre IS 'Nombre del área curricular';
COMMENT ON COLUMN areas_curriculares.nivel_id IS 'Nivel educativo al que pertenece';
COMMENT ON COLUMN areas_curriculares.es_oficial IS 'Indica si es un área oficial del MINEDU';

-- ============================================================================
-- TABLA: competencias
-- ============================================================================
-- Almacena las competencias de cada área curricular

CREATE TABLE IF NOT EXISTS competencias (
    id VARCHAR(100) PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    area_id VARCHAR(100) REFERENCES areas_curriculares(id) ON DELETE CASCADE,
    orden INTEGER,
    es_transversal BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_competencias_area ON competencias(area_id);
CREATE INDEX idx_competencias_transversal ON competencias(es_transversal);
CREATE INDEX idx_competencias_activo ON competencias(activo);
CREATE INDEX idx_competencias_orden ON competencias(orden);

COMMENT ON TABLE competencias IS 'Competencias del currículo nacional';
COMMENT ON COLUMN competencias.id IS 'Identificador único de la competencia';
COMMENT ON COLUMN competencias.nombre IS 'Nombre de la competencia';
COMMENT ON COLUMN competencias.area_id IS 'Área curricular a la que pertenece (NULL si es transversal)';
COMMENT ON COLUMN competencias.es_transversal IS 'Indica si es una competencia transversal';

-- ============================================================================
-- TABLA: capacidades
-- ============================================================================
-- Almacena las capacidades de cada competencia

CREATE TABLE IF NOT EXISTS capacidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    competencia_id VARCHAR(100) NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
    orden INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_capacidades_competencia ON capacidades(competencia_id);
CREATE INDEX idx_capacidades_activo ON capacidades(activo);
CREATE INDEX idx_capacidades_orden ON capacidades(orden);

COMMENT ON TABLE capacidades IS 'Capacidades de cada competencia';
COMMENT ON COLUMN capacidades.nombre IS 'Nombre de la capacidad';
COMMENT ON COLUMN capacidades.competencia_id IS 'Competencia a la que pertenece';

-- ============================================================================
-- TRIGGERS para updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_niveles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_niveles_updated_at
    BEFORE UPDATE ON niveles
    FOR EACH ROW
    EXECUTE FUNCTION update_niveles_updated_at();

CREATE OR REPLACE FUNCTION update_areas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_areas_updated_at
    BEFORE UPDATE ON areas_curriculares
    FOR EACH ROW
    EXECUTE FUNCTION update_areas_updated_at();

CREATE OR REPLACE FUNCTION update_competencias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_competencias_updated_at
    BEFORE UPDATE ON competencias
    FOR EACH ROW
    EXECUTE FUNCTION update_competencias_updated_at();

CREATE OR REPLACE FUNCTION update_capacidades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_capacidades_updated_at
    BEFORE UPDATE ON capacidades
    FOR EACH ROW
    EXECUTE FUNCTION update_capacidades_updated_at();

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security) - Opcional
-- ============================================================================
-- Descomentar si deseas habilitar RLS

-- ALTER TABLE niveles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE areas_curriculares ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE capacidades ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Permitir lectura pública de niveles" ON niveles FOR SELECT USING (true);
-- CREATE POLICY "Permitir lectura pública de áreas" ON areas_curriculares FOR SELECT USING (true);
-- CREATE POLICY "Permitir lectura pública de competencias" ON competencias FOR SELECT USING (true);
-- CREATE POLICY "Permitir lectura pública de capacidades" ON capacidades FOR SELECT USING (true);
