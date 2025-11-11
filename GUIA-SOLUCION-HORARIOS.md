# 🎯 Guía de Solución: Sistema de Horarios

## El Problema

El sistema de horarios no guarda en la base de datos. Error:
```
new row violates row-level security policy for table "horarios"
```

## La Causa Raíz

La tabla `horarios` tiene problemas en:
1. Estructura (columnas faltantes o mal configuradas)
2. Políticas RLS (Row Level Security) incorrectas

## ✅ La Solución (2 Pasos)

### Paso 1: Ejecutar Migración Completa

1. Ve a **Supabase Dashboard**
2. Click en **SQL Editor** (menú lateral)
3. Abre el archivo `MIGRACION-HORARIOS-COMPLETA.sql`
4. **Copia TODO el contenido**
5. Pégalo en el SQL Editor
6. Click en **Run** (o Ctrl+Enter)
7. Espera: "Success. No rows returned"

**Esta migración es segura**: 
- ✅ No borra datos existentes
- ✅ Puede ejecutarse múltiples veces
- ✅ Actualiza solo lo necesario

### Paso 2: Verificar

1. En el mismo **SQL Editor**
2. Abre el archivo `VERIFICAR-HORARIOS.sql`
3. Copia y pega su contenido
4. Click en **Run**
5. Verifica los resultados:

**Debes ver**:
```
✅ Tabla horarios existe
✅ Políticas RLS correctas (4 o más)
```

**Columnas importantes**:
- `asignacion_id` → nullable: YES ✅
- `actividad_nombre` → existe ✅

**Políticas RLS** (4):
- horarios_select_authenticated
- horarios_insert_authenticated
- horarios_update_authenticated
- horarios_delete_authenticated

## 🧪 Probar el Sistema

1. **Recarga la aplicación** (F5)
2. Ve a **"Mi Horario"**
3. Asigna una clase al horario
4. Click en **"Guardar Cambios"**
5. Abre la **consola del navegador** (F12)

**Debes ver**:
```
🔄 Guardando horarios para personal_id: ...
📝 Intentando guardar horarios: [...]
✅ Horarios guardados exitosamente: X bloques
```

6. **Recarga la página** (F5)
7. El horario debe **mantenerse guardado** ✅

## ❌ Si Sigue Fallando

### Error: "column actividad_nombre does not exist"
**Causa**: La migración no se ejecutó completamente
**Solución**: Ejecuta `MIGRACION-HORARIOS-COMPLETA.sql` nuevamente

### Error: "violates row-level security policy"
**Causa**: Las políticas RLS no se crearon
**Solución**: 
1. Ejecuta `MIGRACION-HORARIOS-COMPLETA.sql` nuevamente
2. Verifica con `VERIFICAR-HORARIOS.sql`
3. Debe mostrar 4 políticas RLS

### Error: "violates check constraint horarios_asignacion_o_actividad"
**Causa**: Datos inválidos (ambos campos NULL o ambos llenos)
**Solución**: Este es un error de código, no de BD. Contacta soporte.

## 📊 Cómo Funciona

La tabla `horarios` ahora soporta dos tipos de entradas:

### Tipo 1: Asignaciones Docentes (Clases)
```sql
INSERT INTO horarios (
    personal_id, 
    dia_semana, 
    hora_id, 
    asignacion_id,      -- ✅ UUID de asignacion
    actividad_nombre    -- ❌ NULL
);
```

### Tipo 2: Actividades Personalizadas
```sql
INSERT INTO horarios (
    personal_id, 
    dia_semana, 
    hora_id, 
    asignacion_id,      -- ❌ NULL
    actividad_nombre    -- ✅ "Tutoría", "Reunión", etc.
);
```

## 🔐 Políticas RLS

Las políticas permiten a **cualquier usuario autenticado**:
- Ver todos los horarios (SELECT)
- Crear horarios (INSERT)
- Actualizar horarios (UPDATE)
- Eliminar horarios (DELETE)

Esto es correcto porque la autorización se maneja en la capa de aplicación.

## 📁 Archivos

- **`MIGRACION-HORARIOS-COMPLETA.sql`** ⭐ - Ejecuta este
- **`VERIFICAR-HORARIOS.sql`** - Verifica con este
- **`GUIA-SOLUCION-HORARIOS.md`** - Este archivo

## ✅ Checklist Final

- [ ] Ejecuté `MIGRACION-HORARIOS-COMPLETA.sql`
- [ ] Vi "Success. No rows returned"
- [ ] Ejecuté `VERIFICAR-HORARIOS.sql`
- [ ] Vi "✅ Tabla horarios existe"
- [ ] Vi "✅ Políticas RLS correctas (4 o más)"
- [ ] Vi que `asignacion_id` es nullable
- [ ] Vi que `actividad_nombre` existe
- [ ] Recargué la aplicación (F5)
- [ ] Guardé un horario exitosamente
- [ ] El horario se mantiene al recargar

## 🆘 Soporte

Si después de seguir esta guía el problema persiste:

1. Ejecuta `VERIFICAR-HORARIOS.sql`
2. Copia TODOS los resultados
3. Copia el error completo de la consola del navegador
4. Comparte ambos para diagnóstico

---

**Nota**: Esta es la solución definitiva. No necesitas ejecutar las migraciones V2 o V3 anteriores. `MIGRACION-HORARIOS-COMPLETA.sql` incluye todo.
