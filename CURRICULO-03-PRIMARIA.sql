-- ============================================================================
-- CURRÍCULO NACIONAL - PARTE 3: COMPETENCIAS Y CAPACIDADES DE PRIMARIA
-- ============================================================================

-- COMUNICACIÓN
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-com-1', 'Se comunica oralmente en su lengua materna', 'primaria-comunicacion', 1),
('pri-com-2', 'Lee diversos tipos de textos en su lengua materna', 'primaria-comunicacion', 2),
('pri-com-3', 'Escribe diversos tipos de textos en su lengua materna', 'primaria-comunicacion', 3),
('pri-com-4', 'Crea proyectos desde los lenguajes artísticos', 'primaria-comunicacion', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Obtiene información del texto oral', 'pri-com-1', 1),
('Infiere e interpreta información del texto oral', 'pri-com-1', 2),
('Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada', 'pri-com-1', 3),
('Utiliza recursos no verbales y paraverbales de forma estratégica', 'pri-com-1', 4),
('Interactúa estratégicamente con distintos interlocutores', 'pri-com-1', 5),
('Reflexiona y evalúa la forma, el contenido y contexto del texto oral', 'pri-com-1', 6),
('Obtiene información del texto escrito', 'pri-com-2', 1),
('Infiere e interpreta información del texto escrito', 'pri-com-2', 2),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'pri-com-2', 3),
('Adecúa el texto a la situación comunicativa', 'pri-com-3', 1),
('Organiza y desarrolla las ideas de forma coherente y cohesionada', 'pri-com-3', 2),
('Utiliza convenciones del lenguaje escrito de forma pertinente', 'pri-com-3', 3),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'pri-com-3', 4),
('Explora y experimenta los lenguajes del arte', 'pri-com-4', 1),
('Aplica procesos creativos', 'pri-com-4', 2),
('Socializa sus procesos y proyectos', 'pri-com-4', 3)
ON CONFLICT DO NOTHING;

-- CASTELLANO COMO SEGUNDA LENGUA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-cast-1', 'Se comunica oralmente en su lengua materna', 'primaria-castellano-segunda-lengua', 1),
('pri-cast-2', 'Lee diversos tipos de textos en su lengua materna', 'primaria-castellano-segunda-lengua', 2),
('pri-cast-3', 'Escribe diversos tipos de textos en su lengua materna', 'primaria-castellano-segunda-lengua', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Obtiene información del texto oral', 'pri-cast-1', 1),
('Infiere e interpreta información del texto oral', 'pri-cast-1', 2),
('Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada', 'pri-cast-1', 3),
('Utiliza recursos no verbales y paraverbales de forma estratégica', 'pri-cast-1', 4),
('Interactúa estratégicamente con distintos interlocutores', 'pri-cast-1', 5),
('Reflexiona y evalúa la forma, el contenido y contexto del texto oral', 'pri-cast-1', 6),
('Obtiene información del texto escrito', 'pri-cast-2', 1),
('Infiere e interpreta información del texto escrito', 'pri-cast-2', 2),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'pri-cast-2', 3),
('Adecúa el texto a la situación comunicativa', 'pri-cast-3', 1),
('Organiza y desarrolla las ideas de forma coherente y cohesionada', 'pri-cast-3', 2),
('Utiliza convenciones del lenguaje escrito de forma pertinente', 'pri-cast-3', 3),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'pri-cast-3', 4)
ON CONFLICT DO NOTHING;

-- INGLÉS
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-ing-1', 'Se comunica oralmente en inglés como lengua extranjera', 'primaria-ingles', 1),
('pri-ing-2', 'Lee diversos tipos de textos en inglés como lengua extranjera', 'primaria-ingles', 2),
('pri-ing-3', 'Escribe diversos tipos de textos en inglés como lengua extranjera', 'primaria-ingles', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Obtiene información de textos orales', 'pri-ing-1', 1),
('Infiere e interpreta información de textos orales', 'pri-ing-1', 2),
('Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada', 'pri-ing-1', 3),
('Utiliza recursos no verbales y paraverbales de forma estratégica', 'pri-ing-1', 4),
('Interactúa estratégicamente con distintos interlocutores', 'pri-ing-1', 5),
('Reflexiona y evalúa la forma, el contenido y el contexto del texto oral', 'pri-ing-1', 6),
('Obtiene información del texto escrito', 'pri-ing-2', 1),
('Infiere e interpreta información del texto escrito', 'pri-ing-2', 2),
('Reflexiona y evalúa la forma, el contenido y contexto del texto', 'pri-ing-2', 3),
('Adecúa el texto a la situación comunicativa', 'pri-ing-3', 1),
('Organiza y desarrolla las ideas de forma coherente y cohesionada', 'pri-ing-3', 2),
('Utiliza convenciones del lenguaje escrito de forma pertinente', 'pri-ing-3', 3),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'pri-ing-3', 4)
ON CONFLICT DO NOTHING;

-- MATEMÁTICA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-mat-1', 'Resuelve problemas de cantidad', 'primaria-matematica', 1),
('pri-mat-2', 'Resuelve problemas de regularidad, equivalencia y cambio', 'primaria-matematica', 2),
('pri-mat-3', 'Resuelve problemas de forma, movimiento y localización', 'primaria-matematica', 3),
('pri-mat-4', 'Resuelve problemas de gestión de datos e incertidumbre', 'primaria-matematica', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Traduce cantidades a expresiones numéricas', 'pri-mat-1', 1),
('Comunica su comprensión sobre los números y las operaciones', 'pri-mat-1', 2),
('Usa estrategias y procedimientos de estimación y cálculo', 'pri-mat-1', 3),
('Argumenta afirmaciones sobre las relaciones numéricas y las operaciones', 'pri-mat-1', 4),
('Traduce datos y condiciones a expresiones algebraicas y gráficas', 'pri-mat-2', 1),
('Comunica su comprensión sobre las relaciones algebraicas', 'pri-mat-2', 2),
('Usa estrategias y procedimientos para encontrar equivalencias y reglas generales', 'pri-mat-2', 3),
('Argumenta afirmaciones sobre relaciones de cambio y equivalencia', 'pri-mat-2', 4),
('Modela objetos con formas geométricas y sus transformaciones', 'pri-mat-3', 1),
('Comunica su comprensión sobre las formas y relaciones geométricas', 'pri-mat-3', 2),
('Usa estrategias y procedimientos para orientarse en el espacio', 'pri-mat-3', 3),
('Argumenta afirmaciones sobre las relaciones geométricas', 'pri-mat-3', 4),
('Representa datos con gráficos y medidas estadísticas o probabilísticas', 'pri-mat-4', 1),
('Comunica su comprensión de los conceptos estadísticos y probabilísticos', 'pri-mat-4', 2),
('Usa estrategias y procedimientos para recopilar y procesar datos', 'pri-mat-4', 3),
('Sustenta conclusiones o decisiones con base en la información obtenida', 'pri-mat-4', 4)
ON CONFLICT DO NOTHING;

-- CIENCIA Y TECNOLOGÍA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-cyt-1', 'Indaga mediante métodos científicos para construir sus conocimientos', 'primaria-ciencia-tecnologia', 1),
('pri-cyt-2', 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo', 'primaria-ciencia-tecnologia', 2),
('pri-cyt-3', 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno', 'primaria-ciencia-tecnologia', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Problematiza situaciones para hacer indagación', 'pri-cyt-1', 1),
('Diseña estrategias para hacer indagación', 'pri-cyt-1', 2),
('Genera y registra datos e información', 'pri-cyt-1', 3),
('Analiza datos e información', 'pri-cyt-1', 4),
('Evalúa y comunica el proceso y resultados de su indagación', 'pri-cyt-1', 5),
('Comprende y usa conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo', 'pri-cyt-2', 1),
('Evalúa las implicancias del saber y del quehacer científico y tecnológico', 'pri-cyt-2', 2),
('Determina una alternativa de solución tecnológica', 'pri-cyt-3', 1),
('Diseña la alternativa de solución tecnológica', 'pri-cyt-3', 2),
('Implementa y valida la alternativa de solución tecnológica', 'pri-cyt-3', 3),
('Evalúa y comunica el funcionamiento y los impactos de su alternativa de solución tecnológica', 'pri-cyt-3', 4)
ON CONFLICT DO NOTHING;

-- PERSONAL SOCIAL
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-ps-1', 'Construye su identidad', 'primaria-personal-social', 1),
('pri-ps-2', 'Convive y participa democráticamente en la búsqueda del bien común', 'primaria-personal-social', 2),
('pri-ps-3', 'Construye su identidad, como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas', 'primaria-personal-social', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Se valora a sí mismo', 'pri-ps-1', 1),
('Autorregula sus emociones', 'pri-ps-1', 2),
('Interactúa con todas las personas', 'pri-ps-2', 1),
('Construye normas, y asume acuerdos y leyes', 'pri-ps-2', 2),
('Participa en acciones que promueven el bienestar común', 'pri-ps-2', 3),
('Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente', 'pri-ps-3', 1),
('Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa', 'pri-ps-3', 2)
ON CONFLICT DO NOTHING;

-- EDUCACIÓN RELIGIOSA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-er-1', 'Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas', 'primaria-educacion-religiosa', 1),
('pri-er-2', 'Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa', 'primaria-educacion-religiosa', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente', 'pri-er-1', 1),
('Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa', 'pri-er-1', 2),
('Transforma su entorno desde el encuentro personal y comunitario con Dios y desde la fe que profesa', 'pri-er-2', 1),
('Actúa coherentemente en razón de su fe según los principios de su conciencia moral en situaciones concretas de la vida', 'pri-er-2', 2)
ON CONFLICT DO NOTHING;

-- ARTE Y CULTURA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-ac-1', 'Aprecia de manera crítica manifestaciones artístico-culturales', 'primaria-arte-cultura', 1),
('pri-ac-2', 'Crea proyectos desde los lenguajes artísticos', 'primaria-arte-cultura', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Percibe manifestaciones artístico-culturales', 'pri-ac-1', 1),
('Contextualiza manifestaciones artístico-culturales', 'pri-ac-1', 2),
('Reflexiona creativa y críticamente sobre manifestaciones artístico-culturales', 'pri-ac-1', 3),
('Explora y experimenta los lenguajes del arte', 'pri-ac-2', 1),
('Aplica procesos creativos', 'pri-ac-2', 2),
('Evalúa y comunica sus procesos y proyectos', 'pri-ac-2', 3)
ON CONFLICT DO NOTHING;

-- EDUCACIÓN FÍSICA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-ef-1', 'Se desenvuelve de manera autónoma a través de su motricidad', 'primaria-educacion-fisica', 1),
('pri-ef-2', 'Asume una vida saludable', 'primaria-educacion-fisica', 2),
('pri-ef-3', 'Interactúa a través de sus habilidades sociomotrices', 'primaria-educacion-fisica', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Comprende su cuerpo', 'pri-ef-1', 1),
('Se expresa corporalmente', 'pri-ef-1', 2),
('Comprende las relaciones entre la actividad física, alimentación, postura e higiene personal y del ambiente, y la salud', 'pri-ef-2', 1),
('Incorpora prácticas que mejoran su calidad de vida', 'pri-ef-2', 2),
('Se relaciona utilizando sus habilidades sociomotrices', 'pri-ef-3', 1),
('Crea y aplica estrategias y tácticas de juego', 'pri-ef-3', 2)
ON CONFLICT DO NOTHING;

-- PSICOMOTRIZ
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('pri-psico-1', 'Se desenvuelve de manera autónoma a través de su motricidad', 'primaria-psicomotriz', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Comprende su cuerpo', 'pri-psico-1', 1),
('Se expresa corporalmente', 'pri-psico-1', 2)
ON CONFLICT DO NOTHING;
