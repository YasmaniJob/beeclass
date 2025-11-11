# Solución: Error al Guardar Horarios

## Error Actual

```
Error: Error insertando horarios: {}
```

Este error ocurre porque **la migración de base de datos no se ha ejecutado todavía**.

## Solución Paso a Paso

### Paso 1: Verificar Estado de la Base de Datos

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido de `VERIFICAR-MIGRACION-HORARIOS.sql`
3. Haz clic en **Run**
4. Revisa los resultados:
   - ✅ = Todo bien
   - ❌ = Falta ejecutar migración

### Paso 2: Ejecutar Migraciones (si es necesario)

Si el paso 1 muestra ❌ en alguna verificación:

**Migración V2 - Estructura de Tabla**:
1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido de `MIGRACION-TABLA-HORARIOS-V2.sql`
3. Haz clic en **Run**
4. Deberías ver: "Success. No rows returned"

**Migración V3 - Políticas RLS**:
1. En el mismo **SQL Editor**
2. Copia y pega el contenido de `MIGRACION-TABLA-HORARIOS-V3-RLS.sql`
3. Haz clic en **Run**
4. Deberías ver: "Success. No rows returned"

### Paso 3: Verificar que la Migración se Aplicó

1. Vuelve a ejecutar `VERIFICAR-MIGRACION-HORARIOS.sql`
2. Ahora todas las verificaciones deben mostrar ✅

### Paso 4: Probar el Sistema

1. Recarga la aplicación en el navegador (F5)
2. Ve a "Mi Horario"
3. Asigna una clase o actividad al horario
4. Haz clic en "Guardar Cambios"
5. Abre la consola del navegador (F12)
6. Deberías ver:
   ```
   🔄 Guardando horarios para personal_id: ...
   📝 Intentando guardar horarios: [...]
   ✅ Horarios guardados exitosamente: X bloques
   ```

## Qué Hace la Migración

La migración `MIGRACION-TABLA-HORARIOS-V2.sql` hace lo siguiente:

1. **Hace `asignacion_id` nullable**: Permite que sea NULL para actividades personalizadas
2. **Agrega columna `actividad_nombre`**: Para guardar el nombre de actividades personalizadas
3. **Agrega constraint**: Asegura que cada registro tenga O `asignacion_id` O `actividad_nombre` (no ambos)

## Estructura Esperada de la Tabla

Después de la migración, la tabla `horarios` debe tener:

```sql
CREATE TABLE horarios (
    id UUID PRIMARY KEY,
    personal_id UUID NOT NULL,
    dia_semana TEXT NOT NULL,
    hora_id TEXT NOT NULL,
    asignacion_id UUID,              -- ✅ NULLABLE
    actividad_nombre TEXT,            -- ✅ NUEVA COLUMNA
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    
    -- ✅ NUEVO CONSTRAINT
    CONSTRAINT horarios_asignacion_o_actividad 
    CHECK (
        (asignacion_id IS NOT NULL AND actividad_nombre IS NULL) OR
        (asignacion_id IS NULL AND actividad_nombre IS NOT NULL)
    )
);
```

## Errores Comunes

### Error: "column actividad_nombre does not exist"

**Causa**: No se ejecutó la migración V2

**Solución**: Ejecuta `MIGRACION-TABLA-HORARIOS-V2.sql`

### Error: "null value in column asignacion_id violates not-null constraint"

**Causa**: La columna `asignacion_id` sigue siendo NOT NULL

**Solución**: Ejecuta `MIGRACION-TABLA-HORARIOS-V2.sql`

### Error: "new row violates row-level security policy for table horarios"

**Causa**: Las políticas RLS están bloqueando la inserción

**Solución**: Ejecuta `MIGRACION-TABLA-HORARIOS-V3-RLS.sql`

**Detalles**: Este error ocurre cuando:
- Las políticas RLS están mal configuradas
- La política original usa `auth.role()` que no funciona correctamente
- Se necesitan políticas separadas para SELECT, INSERT, UPDATE, DELETE

### Error: "new row violates check constraint horarios_asignacion_o_actividad"

**Causa**: Intentando guardar un registro con ambos campos llenos o ambos NULL

**Solución**: Esto es un error de código. Verifica que el repositorio esté guardando correctamente:
- Asignaciones: `asignacion_id` lleno, `actividad_nombre` NULL
- Actividades: `asignacion_id` NULL, `actividad_nombre` lleno

## Logs Mejorados

Con los cambios aplicados, ahora verás logs detallados en la consola:

**Éxito**:
```
🔄 Guardando horarios para personal_id: abc-123
📝 Intentando guardar horarios: [{...}]
✅ Horarios guardados exitosamente: 5 bloques
```

**Error de migración faltante**:
```
❌ Error insertando horarios: {
  message: "column actividad_nombre does not exist",
  code: "42703",
  ...
}
⚠️ La tabla horarios no tiene la columna actividad_nombre.
Ejecuta la migración MIGRACION-TABLA-HORARIOS-V2.sql
```

**Error de tabla faltante**:
```
⚠️ Tabla horarios no existe. Ejecuta MIGRACION-TABLA-HORARIOS.sql
```

## Verificación Final

Para confirmar que todo funciona:

```sql
-- En Supabase SQL Editor
SELECT 
    h.dia_semana,
    h.hora_id,
    h.asignacion_id,
    h.actividad_nombre,
    p.nombres,
    p.apellido_paterno
FROM horarios h
JOIN personal p ON h.personal_id = p.id
ORDER BY p.apellido_paterno, h.dia_semana, h.hora_id;
```

Deberías ver registros con:
- `asignacion_id` lleno y `actividad_nombre` NULL (para clases)
- `asignacion_id` NULL y `actividad_nombre` lleno (para actividades)

## Soporte

Si después de seguir estos pasos sigues teniendo problemas:

1. Copia el error completo de la consola del navegador
2. Ejecuta `VERIFICAR-MIGRACION-HORARIOS.sql` y copia los resultados
3. Comparte ambos para diagnóstico adicional
