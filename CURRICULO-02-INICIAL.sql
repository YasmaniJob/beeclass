-- ============================================================================
-- CURRÍCULO NACIONAL - PARTE 2: COMPETENCIAS Y CAPACIDADES DE INICIAL
-- ============================================================================

-- COMUNICACIÓN
INSERT INTO competencias (id, nombre, descripcion, area_id, orden) VALUES
('ini-com-1', 'Se comunica oralmente en su lengua materna', 'Desarrolla la comunicación oral en diversos contextos', 'inicial-comunicacion', 1),
('ini-com-2', 'Lee diversos tipos de textos en su lengua materna', 'Desarrolla la comprensión de textos escritos', 'inicial-comunicacion', 2),
('ini-com-3', 'Escribe diversos tipos de textos en su lengua materna', 'Desarrolla la producción de textos escritos', 'inicial-comunicacion', 3),
('ini-com-4', 'Crea proyectos desde los lenguajes artísticos', 'Desarrolla la expresión artística y creativa', 'inicial-comunicacion', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Obtiene información del texto oral', 'ini-com-1', 1),
('Infiere e interpreta información del texto oral', 'ini-com-1', 2),
('Adecúa, organiza y desarrolla el texto de forma coherente y cohesionada', 'ini-com-1', 3),
('Utiliza recursos no verbales y paraverbales de forma estratégica', 'ini-com-1', 4),
('Interactúa estratégicamente con distintos interlocutores', 'ini-com-1', 5),
('Reflexiona y evalúa la forma, el contenido y contexto del texto oral', 'ini-com-1', 6),
('Obtiene información del texto escrito', 'ini-com-2', 1),
('Infiere e interpreta información del texto escrito', 'ini-com-2', 2),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'ini-com-2', 3),
('Adecúa el texto a la situación comunicativa', 'ini-com-3', 1),
('Organiza y desarrolla las ideas de forma coherente y cohesionada', 'ini-com-3', 2),
('Utiliza convenciones del lenguaje escrito de forma pertinente', 'ini-com-3', 3),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'ini-com-3', 4),
('Explora y experimenta los lenguajes del arte', 'ini-com-4', 1),
('Aplica procesos creativos', 'ini-com-4', 2),
('Socializa sus procesos y proyectos', 'ini-com-4', 3)
ON CONFLICT DO NOTHING;

-- PERSONAL SOCIAL
INSERT INTO competencias (id, nombre, descripcion, area_id, orden) VALUES
('ini-ps-1', 'Construye su identidad', 'Desarrolla el autoconocimiento y la autorregulación', 'inicial-personal-social', 1),
('ini-ps-2', 'Convive y participa democráticamente en la búsqueda del bien común', 'Desarrolla la convivencia y participación democrática', 'inicial-personal-social', 2),
('ini-ps-3', 'Construye su identidad, como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas', 'Desarrolla su dimensión religiosa y espiritual', 'inicial-personal-social', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Se valora a sí mismo', 'ini-ps-1', 1),
('Autorregula sus emociones', 'ini-ps-1', 2),
('Interactúa con todas las personas', 'ini-ps-2', 1),
('Construye normas, y asume acuerdos y leyes', 'ini-ps-2', 2),
('Participa en acciones que promueven el bienestar común', 'ini-ps-2', 3),
('Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente', 'ini-ps-3', 1),
('Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa', 'ini-ps-3', 2)
ON CONFLICT DO NOTHING;

-- PSICOMOTRIZ
INSERT INTO competencias (id, nombre, descripcion, area_id, orden) VALUES
('ini-psico-1', 'Se desenvuelve de manera autónoma a través de su motricidad', 'Desarrolla la motricidad y expresión corporal', 'inicial-psicomotriz', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Comprende su cuerpo', 'ini-psico-1', 1),
('Se expresa corporalmente', 'ini-psico-1', 2)
ON CONFLICT DO NOTHING;

-- MATEMÁTICA
INSERT INTO competencias (id, nombre, descripcion, area_id, orden) VALUES
('ini-mat-1', 'Resuelve problemas de cantidad', 'Desarrolla el razonamiento numérico y operacional', 'inicial-matematica', 1),
('ini-mat-2', 'Resuelve problemas de forma, movimiento y localización', 'Desarrolla el razonamiento geométrico y espacial', 'inicial-matematica', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Traduce cantidades a expresiones numéricas', 'ini-mat-1', 1),
('Comunica su comprensión sobre los números y las operaciones', 'ini-mat-1', 2),
('Usa estrategias y procedimientos de estimación y cálculo', 'ini-mat-1', 3),
('Modela objetos con formas geométricas y sus transformaciones', 'ini-mat-2', 1),
('Comunica su comprensión sobre las formas y relaciones geométricas', 'ini-mat-2', 2),
('Usa estrategias y procedimientos para orientarse en el espacio', 'ini-mat-2', 3)
ON CONFLICT DO NOTHING;

-- CIENCIA Y TECNOLOGÍA
INSERT INTO competencias (id, nombre, descripcion, area_id, orden) VALUES
('ini-cyt-1', 'Indaga mediante métodos científicos para construir sus conocimientos', 'Desarrolla la indagación científica', 'inicial-ciencia-tecnologia', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Problematiza situaciones para hacer indagación', 'ini-cyt-1', 1),
('Diseña estrategias para hacer indagación', 'ini-cyt-1', 2),
('Genera y registra datos o información', 'ini-cyt-1', 3),
('Analiza datos e información', 'ini-cyt-1', 4),
('Evalúa y comunica el proceso y resultado de su indagación', 'ini-cyt-1', 5)
ON CONFLICT DO NOTHING;
