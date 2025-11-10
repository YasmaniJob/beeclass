# Verificar y Crear Tabla de Configuración

## Paso 1: Verificar si la tabla existe

Ejecuta esta consulta en Supabase SQL Editor:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'configuracion_app'
);
```

Si retorna `false`, la tabla no existe y necesitas crearla.

## Paso 2: Crear la tabla

Copia y pega TODO el contenido del archivo `MIGRACION-CONFIGURACION-APP.sql` en el SQL Editor de Supabase y ejecútalo.

## Paso 3: Verificar que se creó correctamente

```sql
SELECT * FROM configuracion_app;
```

Deberías ver 6 registros con las configuraciones por defecto.

## Paso 4: Verificar tu rol de usuario

```sql
-- Ver tu user ID actual
SELECT auth.uid();

-- Ver tu información en la tabla personal
SELECT id, nombre, apellido, rol 
FROM personal 
WHERE id = auth.uid();
```

Si no tienes rol "Administrador", actualízalo:

```sql
UPDATE personal 
SET rol = 'Administrador' 
WHERE id = auth.uid();
```

## Paso 5: Verificar las políticas RLS

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'configuracion_app';
```

Deberías ver 2 políticas:
1. "Todos pueden leer configuracion_app"
2. "Solo administradores pueden modificar configuracion_app"

## Troubleshooting Rápido

### Error: "La tabla de configuración no existe"
**Solución**: Ejecuta el script `MIGRACION-CONFIGURACION-APP.sql`

### Error: "Solo los administradores pueden modificar la configuración"
**Solución**: Actualiza tu rol a "Administrador" con el comando del Paso 4

### Error: "Usuario no autenticado"
**Solución**: Asegúrate de estar logueado en la aplicación

### La configuración no se guarda
**Solución**: 
1. Verifica que la tabla existe (Paso 1)
2. Verifica que tienes rol de Administrador (Paso 4)
3. Verifica las políticas RLS (Paso 5)
4. Revisa la consola del navegador para errores específicos

## Comando Rápido para Crear Todo

Si quieres crear todo de una vez, ejecuta este script completo:

```sql
-- Crear la tabla
CREATE TABLE IF NOT EXISTS configuracion_app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    actualizado_por UUID REFERENCES personal(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_configuracion_app_clave ON configuracion_app(clave);

-- Insertar valores por defecto
INSERT INTO configuracion_app (clave, valor, descripcion) VALUES
    ('app_name', 'Beeclass', 'Nombre de la aplicación'),
    ('institution_name', '', 'Nombre de la institución educativa'),
    ('theme_color', '#59AB45', 'Color principal de la aplicación (hexadecimal)'),
    ('logo_url', '', 'URL del logo de la institución'),
    ('login_image_url', '', 'URL de la imagen de fondo del login'),
    ('nivel_institucion', 'Primaria', 'Nivel educativo principal de la institución')
ON CONFLICT (clave) DO NOTHING;

-- Habilitar RLS
ALTER TABLE configuracion_app ENABLE ROW LEVEL SECURITY;

-- Política de lectura
DROP POLICY IF EXISTS "Todos pueden leer configuracion_app" ON configuracion_app;
CREATE POLICY "Todos pueden leer configuracion_app"
    ON configuracion_app
    FOR SELECT
    USING (true);

-- Política de escritura
DROP POLICY IF EXISTS "Solo administradores pueden modificar configuracion_app" ON configuracion_app;
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

-- Actualizar tu usuario a Administrador
UPDATE personal 
SET rol = 'Administrador' 
WHERE id = auth.uid();

-- Verificar
SELECT * FROM configuracion_app;
SELECT id, nombre, apellido, rol FROM personal WHERE id = auth.uid();
```

Este script hace todo en un solo paso.
