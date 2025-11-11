# Corrección: Guardado de Horarios en Base de Datos

## Problema Identificado

El sistema de horarios no estaba guardando correctamente en la base de datos debido a dos problemas principales:

1. **Actividades personalizadas con IDs inválidos**: Las actividades personalizadas generaban IDs como `act-custom-1234567890` que no son UUIDs válidos y no existen en la tabla `asignaciones_docentes`.

2. **Foreign key constraint**: La tabla `horarios` tenía `asignacion_id` como NOT NULL con foreign key a `asignaciones_docentes`, lo que impedía guardar actividades personalizadas.

## Solución Implementada

### 1. Migración de Base de Datos (MIGRACION-TABLA-HORARIOS-V2.sql)

Se actualizó la tabla `horarios` para soportar actividades personalizadas:

- `asignacion_id` ahora es **nullable**
- Se agregó columna `actividad_nombre` para actividades personalizadas
- Se agregó constraint para asegurar que cada registro tenga **o** `asignacion_id` **o** `actividad_nombre` (no ambos)

```sql
-- Ejecutar esta migración en Supabase SQL Editor
ALTER TABLE horarios 
    ALTER COLUMN asignacion_id DROP NOT NULL;

ALTER TABLE horarios 
    ADD COLUMN IF NOT EXISTS actividad_nombre TEXT;

ALTER TABLE horarios 
    ADD CONSTRAINT horarios_asignacion_o_actividad 
    CHECK (
        (asignacion_id IS NOT NULL AND actividad_nombre IS NULL) OR
        (asignacion_id IS NULL AND actividad_nombre IS NOT NULL)
    );
```

### 2. Formato Estandarizado para Actividades

Se implementó un formato consistente para identificar actividades personalizadas:

- **Asignaciones docentes**: Se guarda el UUID directamente (ej: `"550e8400-e29b-41d4-a716-446655440000"`)
- **Actividades personalizadas**: Se usa el formato `"activity:{nombre}"` (ej: `"activity:Tutoría"`)

### 3. Cambios en el Código

#### SupabasePersonalRepository.ts

**Método `save()`**:
- Detecta si el valor es una actividad personalizada (formato `activity:` o `act-custom-`)
- Guarda actividades personalizadas en `actividad_nombre` con `asignacion_id = null`
- Guarda asignaciones docentes en `asignacion_id` con `actividad_nombre = null`
- Agregó logs para debugging: `✅ Horarios guardados exitosamente: X bloques`

**Método `findById()`**:
- Lee tanto `asignacion_id` como `actividad_nombre`
- Reconstruye el horario usando formato `activity:{nombre}` para actividades personalizadas

#### use-horario.ts

**Método `buildHorarioMap()`**:
- Detecta valores con formato `activity:{nombre}`
- Crea celdas de horario apropiadas para actividades personalizadas
- Mantiene compatibilidad con asignaciones docentes normales

**Método `updateHorarioCell()`**:
- Guarda actividades con formato `activity:{nombre}`
- Mantiene IDs de asignaciones docentes sin cambios

## Pasos para Aplicar la Corrección

### 1. Ejecutar Migración en Supabase

1. Ir a Supabase Dashboard → SQL Editor
2. Copiar y ejecutar el contenido de `MIGRACION-TABLA-HORARIOS-V2.sql`
3. Verificar que no haya errores

### 2. Verificar Cambios en el Código

Los cambios ya están aplicados en:
- `src/infrastructure/repositories/supabase/SupabasePersonalRepository.ts`
- `src/hooks/use-horario.ts`

### 3. Probar el Sistema

1. Ir a "Mi Horario" como docente
2. Agregar una actividad personalizada (ej: "Tutoría")
3. Asignar la actividad a una celda del horario
4. Asignar también una clase normal
5. Hacer clic en "Guardar Cambios"
6. Verificar en la consola del navegador el mensaje: `✅ Horarios guardados exitosamente: X bloques`
7. Recargar la página y verificar que el horario se mantiene

### 4. Verificar en Base de Datos

Ejecutar en Supabase SQL Editor:

```sql
-- Ver horarios guardados
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

Deberías ver:
- Registros con `asignacion_id` lleno y `actividad_nombre` NULL para clases
- Registros con `asignacion_id` NULL y `actividad_nombre` lleno para actividades personalizadas

## Mejoras Adicionales Implementadas

1. **Mejor manejo de errores**: Ahora el sistema retorna errores claros si falla el guardado
2. **Logs de debugging**: Mensajes en consola para facilitar troubleshooting
3. **Validación de tabla**: Detecta si la tabla `horarios` no existe y muestra mensaje apropiado

## Compatibilidad

- ✅ Compatible con horarios existentes (asignaciones docentes)
- ✅ Soporta actividades personalizadas nuevas
- ✅ No requiere migración de datos existentes
- ✅ Mantiene integridad referencial con `asignaciones_docentes`

## Notas Técnicas

- El formato `activity:{nombre}` se usa solo en la capa de aplicación
- En la base de datos, las actividades se guardan en la columna `actividad_nombre`
- El constraint `horarios_asignacion_o_actividad` asegura consistencia de datos
- Las actividades personalizadas NO se persisten entre sesiones (se generan en memoria)
- Solo el horario asignado se persiste en la base de datos
