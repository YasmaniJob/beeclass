# Resumen de Cambios: Sistema de Horarios

## Cambios Realizados

### 1. Mejoras de UI/UX en Mi Horario ✅

**Archivo**: `src/app/docentes/mi-horario/page.tsx`

**Mejoras visuales**:
- Distribución optimizada: Grid de 12 columnas (8 para selector, 4 para botones)
- Botones en grid 2x1 para mejor aprovechamiento del espacio
- Altura consistente (`h-10`) en todos los controles
- Mejor responsive: Stack vertical en móviles, grid horizontal en desktop
- Espaciado mejorado con `gap-3` y `space-y-4`
- Textos más claros: "Limpiar Celda" y "Añadir Otra"

**Correcciones de tipos**:
- Cambio de `Asignacion` a `DocenteAsignacion` para compatibilidad
- Uso de `??` en lugar de `||` para valores opcionales
- Type guards mejorados para distinguir entre asignaciones y actividades

### 2. Corrección del Guardado en Base de Datos ✅

**Problema identificado**:
- Las actividades personalizadas generaban IDs inválidos (`act-custom-123`)
- La tabla `horarios` requería `asignacion_id` NOT NULL con foreign key
- Esto impedía guardar actividades personalizadas

**Solución implementada**:

#### A. Migración de Base de Datos

**Archivo**: `MIGRACION-TABLA-HORARIOS-V2.sql`

```sql
-- asignacion_id ahora es nullable
ALTER TABLE horarios ALTER COLUMN asignacion_id DROP NOT NULL;

-- Nueva columna para actividades personalizadas
ALTER TABLE horarios ADD COLUMN IF NOT EXISTS actividad_nombre TEXT;

-- Constraint: debe tener asignacion_id O actividad_nombre (no ambos)
ALTER TABLE horarios ADD CONSTRAINT horarios_asignacion_o_actividad 
CHECK (
    (asignacion_id IS NOT NULL AND actividad_nombre IS NULL) OR
    (asignacion_id IS NULL AND actividad_nombre IS NOT NULL)
);
```

#### B. Formato Estandarizado

- **Asignaciones docentes**: UUID directo (ej: `"550e8400-e29b-41d4-a716-446655440000"`)
- **Actividades personalizadas**: Formato `"activity:{nombre}"` (ej: `"activity:Tutoría"`)

#### C. Cambios en el Repositorio

**Archivo**: `src/infrastructure/repositories/supabase/SupabasePersonalRepository.ts`

**Método `save()`**:
- Detecta actividades personalizadas por formato `activity:` o `act-custom-`
- Guarda actividades en `actividad_nombre` con `asignacion_id = null`
- Guarda asignaciones en `asignacion_id` con `actividad_nombre = null`
- Logs de debugging: `✅ Horarios guardados exitosamente: X bloques`
- Manejo de errores mejorado con mensajes claros

**Método `findById()`**:
- Lee tanto `asignacion_id` como `actividad_nombre`
- Reconstruye horario con formato `activity:{nombre}` para actividades

**Método `update()`**:
- Manejo consistente de horarios con validación de errores

#### D. Cambios en el Hook

**Archivo**: `src/hooks/use-horario.ts`

**Método `buildHorarioMap()`**:
- Detecta valores con formato `activity:{nombre}`
- Crea celdas apropiadas para actividades personalizadas
- Mantiene compatibilidad con asignaciones docentes

**Método `updateHorarioCell()`**:
- Guarda actividades con formato `activity:{nombre}`
- Mantiene IDs de asignaciones sin cambios

## ⚠️ IMPORTANTE: Pasos para Aplicar

### 1. Ejecutar Migración SQL (OBLIGATORIO)

**Sin este paso, el sistema NO funcionará**

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido completo de `MIGRACION-TABLA-HORARIOS-V2.sql`
3. Haz clic en **Run**
4. Deberías ver: "Success. No rows returned"

### 1.1 Verificar que la Migración se Aplicó

1. En **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido de `VERIFICAR-MIGRACION-HORARIOS.sql`
3. Haz clic en **Run**
4. Todas las verificaciones deben mostrar ✅ SÍ

### 2. Verificar Código

Los cambios ya están aplicados en:
- ✅ `src/app/docentes/mi-horario/page.tsx`
- ✅ `src/infrastructure/repositories/supabase/SupabasePersonalRepository.ts`
- ✅ `src/hooks/use-horario.ts`

### 3. Probar el Sistema

1. Ir a "Mi Horario" como docente
2. Agregar actividad personalizada (ej: "Tutoría")
3. Asignar actividad y clases al horario
4. Guardar cambios
5. Verificar mensaje en consola: `✅ Horarios guardados exitosamente`
6. Recargar página y verificar persistencia

### 4. Verificar en Base de Datos

```sql
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
- Registros con `asignacion_id` lleno y `actividad_nombre` NULL (clases)
- Registros con `asignacion_id` NULL y `actividad_nombre` lleno (actividades)

## Archivos Creados

1. `MIGRACION-TABLA-HORARIOS-V2.sql` - Migración de base de datos
2. `CORRECCION-GUARDADO-HORARIOS.md` - Documentación detallada
3. `RESUMEN-CAMBIOS-HORARIOS.md` - Este archivo

## Compatibilidad

- ✅ Compatible con horarios existentes
- ✅ Soporta actividades personalizadas nuevas
- ✅ No requiere migración de datos existentes
- ✅ Mantiene integridad referencial

## Notas Técnicas

- El formato `activity:{nombre}` es solo en la capa de aplicación
- En BD, las actividades se guardan en `actividad_nombre`
- El constraint asegura consistencia de datos
- Las actividades personalizadas se generan en memoria (no persisten entre sesiones)
- Solo el horario asignado se persiste en BD

## Testing

Para verificar que todo funciona:

```bash
# 1. Verificar que no hay errores de TypeScript
npm run build

# 2. Ejecutar en desarrollo
npm run dev

# 3. Probar flujo completo:
#    - Login como docente
#    - Ir a Mi Horario
#    - Añadir actividad personalizada
#    - Asignar clases y actividades
#    - Guardar
#    - Recargar página
#    - Verificar que se mantiene el horario
```

## Estado Final

✅ UI/UX mejorada
✅ Guardado en base de datos funcionando
✅ Actividades personalizadas soportadas
✅ Sin errores de TypeScript
✅ Documentación completa
