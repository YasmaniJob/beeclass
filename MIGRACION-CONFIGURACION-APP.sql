-- ============================================
-- MIGRACIÓN: Configuración de la Aplicación
-- ============================================
-- Propósito: Almacenar la configuración global de la aplicación
-- que debe ser compartida entre todos los usuarios.
-- Reemplaza: localStorage keys 'app_config_*'
-- ============================================

-- Tabla: configuracion_app
-- Almacena la configuración global de la aplicación
CREATE TABLE IF NOT EXISTS configuracion_app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    actualizado_por UUID REFERENCES personal(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda rápida por clave
CREATE INDEX IF NOT EXISTS idx_configuracion_app_clave ON configuracion_app(clave);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_configuracion_app_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configuracion_app_updated_at
    BEFORE UPDATE ON configuracion_app
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracion_app_updated_at();

-- Insertar valores por defecto
INSERT INTO configuracion_app (clave, valor, descripcion) VALUES
    ('app_name', 'Beeclass', 'Nombre de la aplicación'),
    ('institution_name', '', 'Nombre de la institución educativa'),
    ('theme_color', '#59AB45', 'Color principal de la aplicación (hexadecimal)'),
    ('logo_url', '', 'URL del logo de la institución'),
    ('login_image_url', '', 'URL de la imagen de fondo del login'),
    ('nivel_institucion', 'Primaria', 'Nivel educativo principal de la institución')
ON CONFLICT (clave) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE configuracion_app ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer la configuración
CREATE POLICY "Todos pueden leer configuracion_app"
    ON configuracion_app
    FOR SELECT
    USING (true);

-- Política: Solo administradores pueden modificar la configuración
-- (Asumiendo que existe una columna 'rol' en la tabla personal)
CREATE POLICY "Solo administradores pueden modificar configuracion_app"
    ON configuracion_app
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM personal
            WHERE personal.id = auth.uid()
            AND personal.rol = 'Administrador'
        )
    );

-- Comentarios para documentación
COMMENT ON TABLE configuracion_app IS 'Almacena la configuración global de la aplicación compartida entre todos los usuarios';
COMMENT ON COLUMN configuracion_app.clave IS 'Identificador único de la configuración';
COMMENT ON COLUMN configuracion_app.valor IS 'Valor de la configuración en formato texto';
COMMENT ON COLUMN configuracion_app.descripcion IS 'Descripción de qué representa esta configuración';
COMMENT ON COLUMN configuracion_app.actualizado_por IS 'ID del usuario que realizó la última actualización';
