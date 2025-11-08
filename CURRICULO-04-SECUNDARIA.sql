-- ============================================================================
-- CURRÍCULO NACIONAL - PARTE 4: COMPETENCIAS Y CAPACIDADES DE SECUNDARIA
-- ============================================================================

-- COMUNICACIÓN
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-com-1', 'Se comunica oralmente en su lengua materna', 'secundaria-comunicacion', 1),
('sec-com-2', 'Lee diversos tipos de textos escritos en lengua materna', 'secundaria-comunicacion', 2),
('sec-com-3', 'Escribe diversos tipos de textos en lengua materna', 'secundaria-comunicacion', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Obtiene información del texto oral', 'sec-com-1', 1),
('Infiere e interpreta información del texto oral', 'sec-com-1', 2),
('Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada', 'sec-com-1', 3),
('Utiliza recursos no verbales y paraverbales de forma', 'sec-com-1', 4),
('Interactúa estratégicamente con distintos interlocutores', 'sec-com-1', 5),
('Reflexiona y evalúa la forma, el contenido y contexto del texto oral', 'sec-com-1', 6),
('Obtiene información del texto escrito', 'sec-com-2', 1),
('Infiere e interpreta información del texto', 'sec-com-2', 2),
('Reflexiona y evalúa la forma, el contenido y contexto del texto', 'sec-com-2', 3),
('Adecúa el texto a la situación comunicativa', 'sec-com-3', 1),
('Organiza y desarrolla las ideas de forma coherente y cohesionada', 'sec-com-3', 2),
('Utiliza convenciones del lenguaje escrito de forma pertinente', 'sec-com-3', 3),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'sec-com-3', 4)
ON CONFLICT DO NOTHING;

-- CASTELLANO COMO SEGUNDA LENGUA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-cast-1', 'Se comunica oralmente en castellano como segunda lengua', 'secundaria-castellano-segunda-lengua', 1),
('sec-cast-2', 'Lee diversos tipos de textos escritos en castellano como segunda lengua', 'secundaria-castellano-segunda-lengua', 2),
('sec-cast-3', 'Escribe diversos tipos de textos en castellano como segunda lengua', 'secundaria-castellano-segunda-lengua', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Obtiene información del texto oral', 'sec-cast-1', 1),
('Infiere e interpreta información del texto oral', 'sec-cast-1', 2),
('Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada', 'sec-cast-1', 3),
('Utiliza recursos no verbales y paraverbales de forma estratégica', 'sec-cast-1', 4),
('Interactúa estratégicamente con distintos interlocutores', 'sec-cast-1', 5),
('Reflexiona y evalúa la forma, el contenido y contexto del texto oral', 'sec-cast-1', 6),
('Obtiene información del texto escrito', 'sec-cast-2', 1),
('Infiere e interpreta información del texto escrito', 'sec-cast-2', 2),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'sec-cast-2', 3),
('Adecúa el texto a la situación comunicativa', 'sec-cast-3', 1),
('Organiza y desarrolla las ideas de forma coherente y cohesionada', 'sec-cast-3', 2),
('Utiliza convenciones del lenguaje escrito de forma pertinente', 'sec-cast-3', 3),
('Reflexiona y evalúa la forma, el contenido y contexto del texto escrito', 'sec-cast-3', 4)
ON CONFLICT DO NOTHING;

-- INGLÉS
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-ing-1', 'Se comunica oralmente en inglés como lengua extranjera', 'secundaria-ingles', 1),
('sec-ing-2', 'Lee diversos tipos de textos en inglés como lengua extranjera', 'secundaria-ingles', 2),
('sec-ing-3', 'Escribe diversos tipos de textos en inglés como lengua extranjera', 'secundaria-ingles', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Obtiene información de textos orales', 'sec-ing-1', 1),
('Infiere e interpreta información de textos orales', 'sec-ing-1', 2),
('Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada', 'sec-ing-1', 3),
('Utiliza recursos no verbales y paraverbales de forma estratégica', 'sec-ing-1', 4),
('Interactúa estratégicamente con distintos interlocutores', 'sec-ing-1', 5),
('Reflexiona y evalúa la forma, el contenido y el contexto del texto oral', 'sec-ing-1', 6),
('Obtiene información del texto escrito', 'sec-ing-2', 1),
('Infiere e interpreta información del texto escrito', 'sec-ing-2', 2),
('Reflexiona y evalúa la forma, el contenido y el contexto del texto escrito', 'sec-ing-2', 3),
('Adecúa el texto a la situación comunicativa', 'sec-ing-3', 1),
('Organiza y desarrolla las ideas de forma coherente y cohesionada', 'sec-ing-3', 2),
('Utiliza convenciones del lenguaje escrito de forma pertinente', 'sec-ing-3', 3),
('Reflexiona y evalúa la forma', 'sec-ing-3', 4)
ON CONFLICT DO NOTHING;

-- MATEMÁTICA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-mat-1', 'Resuelve problemas de cantidad', 'secundaria-matematica', 1),
('sec-mat-2', 'Resuelve problemas de regularidad, equivalencia y cambio', 'secundaria-matematica', 2),
('sec-mat-3', 'Resuelve problemas de forma, movimiento y localización', 'secundaria-matematica', 3),
('sec-mat-4', 'Resuelve problemas de gestión de datos e incertidumbre', 'secundaria-matematica', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Traduce cantidades a expresiones numéricas', 'sec-mat-1', 1),
('Comunica su comprensión sobre los números y las operaciones', 'sec-mat-1', 2),
('Usa estrategias y procedimientos de estimación y cálculo', 'sec-mat-1', 3),
('Argumenta afirmaciones sobre las relaciones numéricas y las operaciones', 'sec-mat-1', 4),
('Traduce datos y condiciones a expresiones algebraicas y gráficas', 'sec-mat-2', 1),
('Comunica su comprensión sobre las relaciones algebraicas', 'sec-mat-2', 2),
('Usa estrategias y procedimientos para encontrar equivalencias y reglas generales', 'sec-mat-2', 3),
('Argumenta afirmaciones sobre relaciones de cambio y equivalencia', 'sec-mat-2', 4),
('Modela objetos con formas geométricas y sus transformaciones', 'sec-mat-3', 1),
('Comunica su comprensión sobre las formas y relaciones geométricas', 'sec-mat-3', 2),
('Usa estrategias y procedimientos para medir y orientarse en el espacio', 'sec-mat-3', 3),
('Argumenta afirmaciones sobre relaciones geométricas', 'sec-mat-3', 4),
('Representa datos con gráficos y medidas estadísticas o probabilísticas', 'sec-mat-4', 1),
('Comunica su comprensión de los conceptos estadísticos y probabilísticos', 'sec-mat-4', 2),
('Usa estrategias y procedimientos para recopilar y procesar datos', 'sec-mat-4', 3),
('Sustenta conclusiones o decisiones con base en la información obtenida', 'sec-mat-4', 4)
ON CONFLICT DO NOTHING;

-- CIENCIA Y TECNOLOGÍA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-cyt-1', 'Indaga mediante métodos científicos para construir conocimientos', 'secundaria-ciencia-tecnologia', 1),
('sec-cyt-2', 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo', 'secundaria-ciencia-tecnologia', 2),
('sec-cyt-3', 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno', 'secundaria-ciencia-tecnologia', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Problematiza situaciones para hacer indagación: plantea preguntas sobre hechos y fenómenos naturales, interpreta situaciones y formula hipótesis', 'sec-cyt-1', 1),
('Diseña estrategias para hacer indagación: propone actividades que permitan construir un procedimiento; seleccionar materiales, instrumentos e información para comprobar o refutar las hipótesis', 'sec-cyt-1', 2),
('Genera y registra datos e información: obtiene, organiza y registra datos fiables en función de las variables, utilizando instrumentos y diversas técnicas que permitan comprobar o refutar las hipótesis', 'sec-cyt-1', 3),
('Analiza datos e información: interpreta los datos obtenidos en la indagación, contrastarlos con las hipótesis e información relacionada al problema para elaborar conclusiones que comprueban o refutan las hipótesis', 'sec-cyt-1', 4),
('Evalúa y comunica el proceso y resultados de su indagación: identificar y dar a conocer las dificultades técnicas y los conocimientos logrados para cuestionar el grado de satisfacción que la respuesta da a la pregunta de indagación', 'sec-cyt-1', 5),
('Comprende y usa conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo', 'sec-cyt-2', 1),
('Evalúa las implicancias del saber y del quehacer científico y tecnológico', 'sec-cyt-2', 2),
('Determina una alternativa de solución tecnológica', 'sec-cyt-3', 1),
('Diseña la alternativa de solución tecnológica', 'sec-cyt-3', 2),
('Implementa y valida la alternativa de solución tecnológica', 'sec-cyt-3', 3),
('Evalúa y comunica el funcionamiento y los impactos de su alternativa de solución tecnológica', 'sec-cyt-3', 4)
ON CONFLICT DO NOTHING;

-- CIENCIAS SOCIALES
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-cs-1', 'Construye interpretaciones históricas', 'secundaria-ciencias-sociales', 1),
('sec-cs-2', 'Gestiona responsablemente el espacio y el ambiente', 'secundaria-ciencias-sociales', 2),
('sec-cs-3', 'Gestiona responsablemente los recursos económicos', 'secundaria-ciencias-sociales', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Interpreta críticamente fuentes diversas', 'sec-cs-1', 1),
('Comprende el tiempo histórico', 'sec-cs-1', 2),
('Elabora explicaciones sobre procesos históricos', 'sec-cs-1', 3),
('Comprende las relaciones entre los elementos naturales y sociales', 'sec-cs-2', 1),
('Maneja fuentes de información para comprender el espacio geográfico y el ambiente', 'sec-cs-2', 2),
('Genera acciones para conservar el ambiente local y global', 'sec-cs-2', 3),
('Comprende las relaciones entre los elementos del sistema económico y financiero', 'sec-cs-3', 1),
('Toma decisiones económicas y financieras', 'sec-cs-3', 2)
ON CONFLICT DO NOTHING;

-- DESARROLLO PERSONAL, CIUDADANÍA Y CÍVICA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-dpcc-1', 'Construye su identidad', 'secundaria-desarrollo-personal', 1),
('sec-dpcc-2', 'Convive y participa democráticamente en la búsqueda del bien común', 'secundaria-desarrollo-personal', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Se valora a sí mismo', 'sec-dpcc-1', 1),
('Autorregula sus emociones', 'sec-dpcc-1', 2),
('Reflexiona y argumenta éticamente', 'sec-dpcc-1', 3),
('Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez', 'sec-dpcc-1', 4),
('Interactúa con todas las personas', 'sec-dpcc-2', 1),
('Construye normas y asume acuerdos y leyes', 'sec-dpcc-2', 2),
('Maneja conflictos de manera constructiva', 'sec-dpcc-2', 3),
('Delibera sobre asuntos públicos', 'sec-dpcc-2', 4),
('Participa en acciones que promueven el bienestar común', 'sec-dpcc-2', 5)
ON CONFLICT DO NOTHING;

-- EDUCACIÓN RELIGIOSA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-er-1', 'Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas', 'secundaria-educacion-religiosa', 1),
('sec-er-2', 'Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa', 'secundaria-educacion-religiosa', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente', 'sec-er-1', 1),
('Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa', 'sec-er-1', 2),
('Transforma su entorno desde el encuentro personal y comunitario con Dios y desde la fe que profesa', 'sec-er-2', 1),
('Actúa coherentemente en razón de su fe según los principios de su conciencia moral en situaciones concretas de la vida', 'sec-er-2', 2)
ON CONFLICT DO NOTHING;

-- ARTE Y CULTURA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-ac-1', 'Aprecia de manera crítica manifestaciones artístico-culturales', 'secundaria-arte-cultura', 1),
('sec-ac-2', 'Crea proyectos desde los lenguajes artísticos', 'secundaria-arte-cultura', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Percibe manifestaciones artístico-culturales', 'sec-ac-1', 1),
('Contextualiza manifestaciones artístico-culturales', 'sec-ac-1', 2),
('Reflexiona creativa y críticamente sobre manifestaciones artístico-culturales', 'sec-ac-1', 3),
('Explora y experimenta los lenguajes artísticos', 'sec-ac-2', 1),
('Aplica procesos creativos', 'sec-ac-2', 2),
('Evalúa y comunica sus procesos y proyectos', 'sec-ac-2', 3)
ON CONFLICT DO NOTHING;

-- EDUCACIÓN FÍSICA
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-ef-1', 'Se desenvuelve de manera autónoma a través de su motricidad', 'secundaria-educacion-fisica', 1),
('sec-ef-2', 'Asume una vida saludable', 'secundaria-educacion-fisica', 2),
('sec-ef-3', 'Interactúa a través de sus habilidades sociomotrices', 'secundaria-educacion-fisica', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Comprende su cuerpo', 'sec-ef-1', 1),
('Se expresa corporalmente', 'sec-ef-1', 2),
('Comprende las relaciones entre la actividad física, alimentación, postura e higiene personal y del ambiente, y la salud', 'sec-ef-2', 1),
('Incorpora prácticas que mejoran su calidad de vida', 'sec-ef-2', 2),
('Se relaciona utilizando sus habilidades sociomotrices', 'sec-ef-3', 1),
('Crea y aplica estrategias y tácticas de juego', 'sec-ef-3', 2)
ON CONFLICT DO NOTHING;

-- EDUCACIÓN PARA EL TRABAJO
INSERT INTO competencias (id, nombre, area_id, orden) VALUES
('sec-et-1', 'Gestiona proyectos de emprendimiento económico o social', 'secundaria-educacion-trabajo', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Crea propuestas de valor', 'sec-et-1', 1),
('Aplica habilidades técnicas', 'sec-et-1', 2),
('Trabaja cooperativamente para lograr objetivos y metas', 'sec-et-1', 3),
('Evalúa los resultados del proyecto de emprendimiento', 'sec-et-1', 4)
ON CONFLICT DO NOTHING;
