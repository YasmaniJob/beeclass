-- ============================================================================
-- CURRÍCULO NACIONAL - PARTE 5: COMPETENCIAS TRANSVERSALES
-- ============================================================================
-- Estas competencias aplican a TODOS los niveles educativos

-- COMPETENCIA TRANSVERSAL 1: TIC
INSERT INTO competencias (id, nombre, descripcion, area_id, orden, es_transversal) VALUES
('ct-tic', 'Se desenvuelve en entornos virtuales generados por las TIC', 'Interactúa en entornos virtuales y gestiona información digital', NULL, 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Personaliza entornos virtuales', 'ct-tic', 1),
('Gestiona información del entorno virtual', 'ct-tic', 2),
('Interactúa en entornos virtuales', 'ct-tic', 3),
('Crea objetos virtuales en diversos formatos', 'ct-tic', 4)
ON CONFLICT DO NOTHING;

-- COMPETENCIA TRANSVERSAL 2: GESTIÓN DEL APRENDIZAJE
INSERT INTO competencias (id, nombre, descripcion, area_id, orden, es_transversal) VALUES
('ct-aprendizaje', 'Gestiona su aprendizaje de manera autónoma', 'Desarrolla la autonomía en el aprendizaje', NULL, 2, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO capacidades (nombre, competencia_id, orden) VALUES
('Define metas de aprendizaje', 'ct-aprendizaje', 1),
('Organiza acciones estratégicas para alcanzar sus metas de aprendizaje', 'ct-aprendizaje', 2),
('Monitorea y ajusta su desempeño durante el proceso de aprendizaje', 'ct-aprendizaje', 3)
ON CONFLICT DO NOTHING;
