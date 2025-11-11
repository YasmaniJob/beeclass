-- ============================================================================
-- MIGRACIÓN: Tabla de Horarios para Docentes
-- ============================================================================
-- Esta tabla almacena el horario semanal de cada docente
-- Relaciona personal con asignaciones en bloques horarios específicos

-- Crear tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
    dia_semana TEXT NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
    hora_id TEXT NOT NULL,
    asignacion_id UUID REFERENCES asignaciones_docentes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint único: un docente no puede tener dos asignaciones en el mismo día y hora
    UNIQUE(personal_id, dia_semana, hora_id)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_horarios_personal_id ON horarios(personal_id);
CREATE INDEX IF NOT EXISTS idx_horarios_asignacion_id ON horarios(asignacion_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_semana ON horarios(dia_semana);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_horarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_horarios_updated_at
    BEFORE UPDATE ON horarios
    FOR EACH ROW
    EXECUTE FUNCTION update_horarios_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE horarios IS 'Almacena el horario semanal de cada docente, relacionando personal con asignaciones en bloques horarios específicos';
COMMENT ON COLUMN horarios.personal_id IS 'ID del docente al que pertenece este bloque horario';
COMMENT ON COLUMN horarios.dia_semana IS 'Día de la semana (Lunes, Martes, etc.)';
COMMENT ON COLUMN horarios.hora_id IS 'ID de la hora pedagógica (1, 2, 3, etc.)';
COMMENT ON COLUMN horarios.asignacion_id IS 'ID de la asignación docente para este bloque (puede ser NULL para actividades no académicas)';

-- Habilitar Row Level Security (RLS)
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Política: Permitir acceso completo a usuarios autenticados
-- (La autorización se maneja en la capa de aplicación)
CREATE POLICY "Usuarios autenticados pueden gestionar horarios"
    ON horarios
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
