-- ============================================================================
-- MIGRACIÓN: PERÍODOS DE EVALUACIÓN A SUPABASE
-- ============================================================================
-- Descripción: Crea la tabla para almacenar la configuración de períodos
--              de evaluación (Bimestre, Trimestre, Semestre)
-- ============================================================================

-- Tabla: configuracion_evaluacion
CREATE TABLE IF NOT EXISTS configuracion_evaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Bimestre', 'Trimestre', 'Semestre')),
    cantidad INTEGER NOT NULL CHECK (cantidad >= 1 AND cantidad <= 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_configuracion_evaluacion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configuracion_evaluacion_updated_at
    BEFORE UPDATE ON configuracion_evaluacion
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracion_evaluacion_updated_at();

-- Comentarios
COMMENT ON TABLE configuracion_evaluacion IS 'Configuración de períodos de evaluación del año académico';
COMMENT ON COLUMN configuracion_evaluacion.tipo IS 'Tipo de período: Bimestre, Trimestre o Semestre';
COMMENT ON COLUMN configuracion_evaluacion.cantidad IS 'Número de períodos en el año académico';

-- Insertar configuración por defecto (Bimestre con 4 períodos)
INSERT INTO configuracion_evaluacion (tipo, cantidad) 
VALUES ('Bimestre', 4)
ON CONFLICT DO NOTHING;

-- Nota: Solo debe haber un registro en esta tabla
-- Si necesitas cambiar la configuración, actualiza el registro existente
