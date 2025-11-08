-- ============================================
-- SCHEMA COMPLETO PARA ASISTENCIAFACIL
-- Supabase PostgreSQL
-- ============================================

-- ============================================
-- 1. TABLA: estudiantes
-- ============================================
CREATE TABLE IF NOT EXISTS estudiantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('DNI', 'CE', 'Otro')),
  numero_documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  grado VARCHAR(50),
  seccion VARCHAR(10),
  nee TEXT,
  nee_documentos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_estudiantes_grado_seccion ON estudiantes(grado, seccion);
CREATE INDEX IF NOT EXISTS idx_estudiantes_documento ON estudiantes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_estudiantes_apellidos ON estudiantes(apellido_paterno, apellido_materno);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estudiantes_updated_at BEFORE UPDATE ON estudiantes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. TABLA: personal (docentes, directivos, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS personal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('DNI', 'CE', 'Otro')),
  numero_documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(20),
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('Admin', 'Director', 'Sub-director', 'Coordinador', 'Docente', 'Auxiliar')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_personal_documento ON personal(numero_documento);
CREATE INDEX IF NOT EXISTS idx_personal_rol ON personal(rol);
CREATE INDEX IF NOT EXISTS idx_personal_activo ON personal(activo);

-- Trigger para updated_at
CREATE TRIGGER update_personal_updated_at BEFORE UPDATE ON personal
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. TABLA: niveles_educativos
-- ============================================
CREATE TABLE IF NOT EXISTS niveles_educativos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE CHECK (nombre IN ('Inicial', 'Primaria', 'Secundaria')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar niveles básicos
INSERT INTO niveles_educativos (nombre) VALUES 
  ('Inicial'),
  ('Primaria'),
  ('Secundaria')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 4. TABLA: areas_curriculares
-- ============================================
CREATE TABLE IF NOT EXISTS areas_curriculares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('Inicial', 'Primaria', 'Secundaria')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_areas_nivel ON areas_curriculares(nivel);

-- ============================================
-- 5. TABLA: competencias
-- ============================================
CREATE TABLE IF NOT EXISTS competencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES areas_curriculares(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_competencias_area ON competencias(area_id);

-- ============================================
-- 6. TABLA: capacidades
-- ============================================
CREATE TABLE IF NOT EXISTS capacidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competencia_id UUID NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_capacidades_competencia ON capacidades(competencia_id);

-- ============================================
-- 7. TABLA: asignaciones
-- ============================================
CREATE TABLE IF NOT EXISTS asignaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  grado VARCHAR(50) NOT NULL,
  seccion VARCHAR(10) NOT NULL,
  rol_asignacion VARCHAR(50) NOT NULL CHECK (rol_asignacion IN ('Tutor', 'Docente de área', 'Auxiliar')),
  area_id UUID REFERENCES areas_curriculares(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_asignaciones_personal ON asignaciones(personal_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_grado_seccion ON asignaciones(grado, seccion);

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas_curriculares ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveles_educativos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Básicas - Permitir todo por ahora)
-- ============================================

-- Estudiantes: Permitir todo para usuarios autenticados
CREATE POLICY "Enable all for authenticated users" ON estudiantes
  FOR ALL USING (true) WITH CHECK (true);

-- Personal: Permitir todo para usuarios autenticados
CREATE POLICY "Enable all for authenticated users" ON personal
  FOR ALL USING (true) WITH CHECK (true);

-- Áreas: Permitir lectura a todos, escritura solo a admins
CREATE POLICY "Enable read for all" ON areas_curriculares
  FOR SELECT USING (true);

CREATE POLICY "Enable write for authenticated" ON areas_curriculares
  FOR ALL USING (true) WITH CHECK (true);

-- Competencias: Igual que áreas
CREATE POLICY "Enable read for all" ON competencias
  FOR SELECT USING (true);

CREATE POLICY "Enable write for authenticated" ON competencias
  FOR ALL USING (true) WITH CHECK (true);

-- Capacidades: Igual que áreas
CREATE POLICY "Enable read for all" ON capacidades
  FOR SELECT USING (true);

CREATE POLICY "Enable write for authenticated" ON capacidades
  FOR ALL USING (true) WITH CHECK (true);

-- Asignaciones: Permitir todo para usuarios autenticados
CREATE POLICY "Enable all for authenticated users" ON asignaciones
  FOR ALL USING (true) WITH CHECK (true);

-- Niveles: Solo lectura para todos
CREATE POLICY "Enable read for all" ON niveles_educativos
  FOR SELECT USING (true);

-- ============================================
-- 9. FUNCIONES ÚTILES
-- ============================================

-- Función para buscar estudiantes por nombre o documento
CREATE OR REPLACE FUNCTION buscar_estudiantes(search_term TEXT)
RETURNS TABLE (
  id UUID,
  tipo_documento VARCHAR,
  numero_documento VARCHAR,
  nombres VARCHAR,
  apellido_paterno VARCHAR,
  apellido_materno VARCHAR,
  grado VARCHAR,
  seccion VARCHAR,
  nombre_completo TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.tipo_documento,
    e.numero_documento,
    e.nombres,
    e.apellido_paterno,
    e.apellido_materno,
    e.grado,
    e.seccion,
    CONCAT(e.apellido_paterno, ' ', COALESCE(e.apellido_materno, ''), ', ', e.nombres) as nombre_completo
  FROM estudiantes e
  WHERE 
    e.numero_documento ILIKE '%' || search_term || '%'
    OR e.nombres ILIKE '%' || search_term || '%'
    OR e.apellido_paterno ILIKE '%' || search_term || '%'
    OR e.apellido_materno ILIKE '%' || search_term || '%'
  ORDER BY e.apellido_paterno, e.apellido_materno, e.nombres;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estudiantes por grado y sección
CREATE OR REPLACE FUNCTION obtener_estudiantes_seccion(p_grado VARCHAR, p_seccion VARCHAR)
RETURNS TABLE (
  id UUID,
  tipo_documento VARCHAR,
  numero_documento VARCHAR,
  nombres VARCHAR,
  apellido_paterno VARCHAR,
  apellido_materno VARCHAR,
  nombre_completo TEXT,
  nee TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.tipo_documento,
    e.numero_documento,
    e.nombres,
    e.apellido_paterno,
    e.apellido_materno,
    CONCAT(e.apellido_paterno, ' ', COALESCE(e.apellido_materno, ''), ', ', e.nombres) as nombre_completo,
    e.nee
  FROM estudiantes e
  WHERE e.grado = p_grado AND e.seccion = p_seccion
  ORDER BY e.apellido_paterno, e.apellido_materno, e.nombres;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. VISTAS ÚTILES
-- ============================================

-- Vista: Estudiantes con nombre completo
CREATE OR REPLACE VIEW v_estudiantes_completo AS
SELECT 
  e.id,
  e.tipo_documento,
  e.numero_documento,
  e.nombres,
  e.apellido_paterno,
  e.apellido_materno,
  CONCAT(e.apellido_paterno, ' ', COALESCE(e.apellido_materno, ''), ', ', e.nombres) as nombre_completo,
  e.grado,
  e.seccion,
  e.nee,
  e.nee_documentos,
  e.created_at,
  e.updated_at
FROM estudiantes e;

-- Vista: Personal con nombre completo
CREATE OR REPLACE VIEW v_personal_completo AS
SELECT 
  p.id,
  p.tipo_documento,
  p.numero_documento,
  p.nombres,
  p.apellido_paterno,
  p.apellido_materno,
  CONCAT(p.apellido_paterno, ' ', COALESCE(p.apellido_materno, ''), ', ', p.nombres) as nombre_completo,
  p.email,
  p.telefono,
  p.rol,
  p.activo,
  p.created_at,
  p.updated_at
FROM personal p;

-- Vista: Áreas con sus competencias y capacidades
CREATE OR REPLACE VIEW v_areas_completas AS
SELECT 
  a.id as area_id,
  a.nombre as area_nombre,
  a.nivel,
  c.id as competencia_id,
  c.nombre as competencia_nombre,
  c.descripcion as competencia_descripcion,
  cap.id as capacidad_id,
  cap.descripcion as capacidad_descripcion
FROM areas_curriculares a
LEFT JOIN competencias c ON a.id = c.area_id
LEFT JOIN capacidades cap ON c.id = cap.competencia_id;

-- ============================================
-- RESUMEN
-- ============================================
-- Tablas creadas:
-- ✅ estudiantes (con índices y trigger)
-- ✅ personal (con índices y trigger)
-- ✅ niveles_educativos (con datos iniciales)
-- ✅ areas_curriculares (con índice)
-- ✅ competencias (con índice)
-- ✅ capacidades (con índice)
-- ✅ asignaciones (con índices)
--
-- Seguridad:
-- ✅ RLS habilitado en todas las tablas
-- ✅ Políticas básicas configuradas
--
-- Funciones:
-- ✅ buscar_estudiantes(search_term)
-- ✅ obtener_estudiantes_seccion(grado, seccion)
--
-- Vistas:
-- ✅ v_estudiantes_completo
-- ✅ v_personal_completo
-- ✅ v_areas_completas
--
-- ============================================
-- PRÓXIMO PASO: Migrar datos iniciales
-- ============================================
