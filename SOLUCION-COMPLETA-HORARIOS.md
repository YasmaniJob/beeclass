# 🎯 Solución Completa: Sistema de Horarios

## 📋 Resumen del Problema

El sistema de horarios no guardaba en la base de datos debido a:

1. ❌ Falta de columna `actividad_nombre` en la tabla
2. ❌ Columna `asignacion_id` configurada como NOT NULL
3. ❌ Políticas RLS (Row Level Security) mal configuradas

## ✅ Solución: Ejecutar 2 Migraciones SQL

### Migración 1: MIGRACION-TABLA-HORARIOS-V2.sql

**Qué hace**:
- Hace `asignacion_id` nullable
- Agrega columna `actividad_nombre`
- Agrega constraint para validar datos

**Cómo ejecutar**:
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega TODO el contenido de `MIGRACION-TABLA-HORARIOS-V2.sql`
3. Click en **Run**
4. Espera: "Success. No rows returned"

### Migración 2: MIGRACION-TABLA-HORARIOS-V3-RLS.sql

**Qué hace**:
- Elimina política RLS antigua que no funciona
- Crea 4 políticas nuevas (SELECT, INSERT, UPDATE, DELETE)
- Permite a usuarios autenticados gestionar horarios

**Cómo ejecutar**:
1. En el mismo SQL Editor
2. Copia y pega TODO el contenido de `MIGRACION-TABLA-HORARIOS-V3-RLS.sql`
3. Click en **Run**
4. Espera: "Success. No rows returned"

## 🔍 Verificación

Ejecuta `VERIFICAR-MIGRACION-HORARIOS.sql` para confirmar:

```sql
-- Debes ver:
✅ Tabla horarios existe: SÍ
✅ asignacion_id es nullable: SÍ
✅ Columna actividad_nombre existe: SÍ
✅ Constraint horarios_asignacion_o_actividad existe: SÍ
✅ Políticas RLS configuradas: SÍ (4 políticas)
```

## 🧪 Prueba Final

1. Recarga la aplicación (F5)
2. Ve a "Mi Horario"
3. Asigna una clase al horario
4. Click en "Guardar Cambios"
5. Abre consola del navegador (F12)
6. Debes ver:

```
🔄 Guardando horarios para personal_id: abc-123
📝 Intentando guardar horarios: [{...}]
✅ Horarios guardados exitosamente: 2 bloques
```

7. Recarga la página
8. El horario debe mantenerse guardado

## 📊 Estructura Final de la Tabla

```sql
CREATE TABLE horarios (
    id UUID PRIMARY KEY,
    personal_id UUID NOT NULL REFERENCES personal(id),
    dia_semana TEXT NOT NULL,
    hora_id TEXT NOT NULL,
    asignacion_id UUID REFERENCES asignaciones_docentes(id),  -- ✅ NULLABLE
    actividad_nombre TEXT,                                     -- ✅ NUEVA
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(personal_id, dia_semana, hora_id),
    
    -- ✅ CONSTRAINT: Debe tener asignacion_id O actividad_nombre
    CONSTRAINT horarios_asignacion_o_actividad 
    CHECK (
        (asignacion_id IS NOT NULL AND actividad_nombre IS NULL) OR
        (asignacion_id IS NULL AND actividad_nombre IS NOT NULL)
    )
);
```

## 🔐 Políticas RLS Configuradas

```sql
-- 1. SELECT: Ver horarios
CREATE POLICY "horarios_select_policy"
    ON horarios FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 2. INSERT: Crear horarios
CREATE POLICY "horarios_insert_policy"
    ON horarios FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 3. UPDATE: Actualizar horarios
CREATE POLICY "horarios_update_policy"
    ON horarios FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 4. DELETE: Eliminar horarios
CREATE POLICY "horarios_delete_policy"
    ON horarios FOR DELETE
    USING (auth.uid() IS NOT NULL);
```

## 📁 Archivos de Referencia

- **`ERROR-HORARIOS-SOLUCION-RAPIDA.md`** - Guía rápida de 4 pasos
- **`SOLUCION-ERROR-HORARIOS.md`** - Guía detallada con troubleshooting
- **`MIGRACION-TABLA-HORARIOS-V2.sql`** - Migración de estructura
- **`MIGRACION-TABLA-HORARIOS-V3-RLS.sql`** - Migración de políticas RLS
- **`VERIFICAR-MIGRACION-HORARIOS.sql`** - Script de verificación
- **`RESUMEN-CAMBIOS-HORARIOS.md`** - Resumen técnico completo

## ❓ Preguntas Frecuentes

### ¿Tengo que ejecutar ambas migraciones?

**Sí**, ambas son necesarias:
- V2: Estructura de la tabla
- V3: Permisos de seguridad

### ¿Puedo ejecutarlas en cualquier orden?

**Sí**, pero se recomienda V2 primero, luego V3.

### ¿Qué pasa si ya ejecuté V2 pero no V3?

Verás el error: `new row violates row-level security policy`
Solución: Ejecuta V3.

### ¿Qué pasa si ejecuto las migraciones dos veces?

No hay problema. Las migraciones usan `IF EXISTS` y `IF NOT EXISTS` para ser idempotentes.

### ¿Los datos existentes se pierden?

**No**. Las migraciones solo modifican la estructura, no eliminan datos.

## 🎉 Resultado Final

Después de ejecutar ambas migraciones:

✅ Puedes guardar clases en el horario
✅ Puedes guardar actividades personalizadas
✅ Los horarios se persisten en la base de datos
✅ Los horarios se mantienen al recargar la página
✅ Logs claros en la consola para debugging

## 🆘 ¿Necesitas Ayuda?

Si después de seguir todos los pasos sigues con problemas:

1. Ejecuta `VERIFICAR-MIGRACION-HORARIOS.sql`
2. Copia los resultados completos
3. Copia el error completo de la consola del navegador
4. Comparte ambos para diagnóstico
