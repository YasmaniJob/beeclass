-- Verificar si existen competencias transversales en la base de datos

-- 1. Ver todas las competencias transversales
SELECT 
    id,
    nombre,
    descripcion,
    area_id,
    es_transversal,
    orden
FROM competencias
WHERE es_transversal = true
ORDER BY orden;

-- 2. Ver capacidades de competencias transversales
SELECT 
    c.id as competencia_id,
    c.nombre as competencia_nombre,
    cap.nombre as capacidad_nombre,
    cap.orden
FROM competencias c
LEFT JOIN capacidades cap ON c.id = cap.competencia_id
WHERE c.es_transversal = true
ORDER BY c.orden, cap.orden;

-- 3. Contar competencias transversales
SELECT COUNT(*) as total_competencias_transversales
FROM competencias
WHERE es_transversal = true;
