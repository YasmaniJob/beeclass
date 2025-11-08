-- ============================================================================
-- CURRÍCULO NACIONAL - PARTE 1: NIVELES Y ÁREAS CURRICULARES
-- ============================================================================
-- IMPORTANTE: Ejecutar DESPUÉS de MIGRACION-DATOS-MAESTROS-SUPABASE.sql

-- Niveles educativos
INSERT INTO niveles (id, nombre, descripcion, orden) VALUES
('inicial', 'Inicial', 'Educación Inicial - 3 a 5 años', 1),
('primaria', 'Primaria', 'Educación Primaria - 1° a 6° grado', 2),
('secundaria', 'Secundaria', 'Educación Secundaria - 1° a 5° año', 3)
ON CONFLICT (id) DO NOTHING;

-- INICIAL - Áreas
INSERT INTO areas_curriculares (id, nombre, descripcion, nivel_id, es_oficial, orden) VALUES
('inicial-comunicacion', 'Comunicación', 'Desarrollo de competencias comunicativas orales, escritas y artísticas', 'inicial', true, 1),
('inicial-personal-social', 'Personal Social', 'Construcción de la identidad y convivencia democrática', 'inicial', true, 2),
('inicial-psicomotriz', 'Psicomotriz', 'Desarrollo de la motricidad y expresión corporal', 'inicial', true, 3),
('inicial-matematica', 'Matemática', 'Resolución de problemas matemáticos', 'inicial', true, 4),
('inicial-ciencia-tecnologia', 'Ciencia y Tecnología', 'Indagación y alfabetización científica', 'inicial', true, 5)
ON CONFLICT (id) DO NOTHING;

-- PRIMARIA - Áreas
INSERT INTO areas_curriculares (id, nombre, descripcion, nivel_id, es_oficial, orden) VALUES
('primaria-comunicacion', 'Comunicación', 'Desarrollo de competencias comunicativas en lengua materna', 'primaria', true, 1),
('primaria-castellano-segunda-lengua', 'Castellano como Segunda Lengua', 'Comunicación en castellano para estudiantes de lengua originaria', 'primaria', true, 2),
('primaria-ingles', 'Inglés', 'Comunicación en inglés como lengua extranjera', 'primaria', true, 3),
('primaria-matematica', 'Matemática', 'Resolución de problemas matemáticos', 'primaria', true, 4),
('primaria-ciencia-tecnologia', 'Ciencia y Tecnología', 'Indagación científica y diseño tecnológico', 'primaria', true, 5),
('primaria-personal-social', 'Personal Social', 'Construcción de identidad y ciudadanía', 'primaria', true, 6),
('primaria-educacion-religiosa', 'Educación Religiosa', 'Formación religiosa y espiritual', 'primaria', true, 7),
('primaria-arte-cultura', 'Arte y Cultura', 'Apreciación y creación artística', 'primaria', true, 8),
('primaria-educacion-fisica', 'Educación Física', 'Desarrollo físico y vida saludable', 'primaria', true, 9),
('primaria-psicomotriz', 'Psicomotriz', 'Desarrollo de la motricidad', 'primaria', true, 10)
ON CONFLICT (id) DO NOTHING;

-- SECUNDARIA - Áreas
INSERT INTO areas_curriculares (id, nombre, descripcion, nivel_id, es_oficial, orden) VALUES
('secundaria-comunicacion', 'Comunicación', 'Desarrollo de competencias comunicativas en lengua materna', 'secundaria', true, 1),
('secundaria-castellano-segunda-lengua', 'Castellano como Segunda Lengua', 'Comunicación en castellano para estudiantes de lengua originaria', 'secundaria', true, 2),
('secundaria-ingles', 'Inglés', 'Comunicación en inglés como lengua extranjera', 'secundaria', true, 3),
('secundaria-matematica', 'Matemática', 'Resolución de problemas matemáticos', 'secundaria', true, 4),
('secundaria-ciencia-tecnologia', 'Ciencia y Tecnología', 'Indagación científica y diseño tecnológico', 'secundaria', true, 5),
('secundaria-ciencias-sociales', 'Ciencias Sociales', 'Comprensión del tiempo histórico y el espacio geográfico', 'secundaria', true, 6),
('secundaria-desarrollo-personal', 'Desarrollo Personal, Ciudadanía y Cívica', 'Construcción de identidad y ejercicio ciudadano', 'secundaria', true, 7),
('secundaria-educacion-religiosa', 'Educación Religiosa', 'Formación religiosa y espiritual', 'secundaria', true, 8),
('secundaria-arte-cultura', 'Arte y Cultura', 'Apreciación y creación artística', 'secundaria', true, 9),
('secundaria-educacion-fisica', 'Educación Física', 'Desarrollo físico y vida saludable', 'secundaria', true, 10),
('secundaria-educacion-trabajo', 'Educación para el Trabajo', 'Gestión de proyectos de emprendimiento', 'secundaria', true, 11)
ON CONFLICT (id) DO NOTHING;
