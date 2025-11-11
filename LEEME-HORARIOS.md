# 📚 Sistema de Horarios - Documentación

## 🚀 Inicio Rápido

**¿Tienes problemas guardando horarios?**

1. Lee: **`GUIA-SOLUCION-HORARIOS.md`** ⭐
2. Ejecuta: **`MIGRACION-HORARIOS-COMPLETA.sql`** ⭐
3. Verifica: **`VERIFICAR-HORARIOS.sql`** ⭐

## 📁 Archivos Principales (USA ESTOS)

| Archivo | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| **`GUIA-SOLUCION-HORARIOS.md`** | Guía paso a paso | Lee esto primero |
| **`MIGRACION-HORARIOS-COMPLETA.sql`** | Migración definitiva | Ejecuta en Supabase |
| **`VERIFICAR-HORARIOS.sql`** | Verificación | Después de migrar |

## 📝 Archivos de Referencia (Opcional)

| Archivo | Propósito |
|---------|-----------|
| `SOLUCION-COMPLETA-HORARIOS.md` | Documentación técnica detallada |
| `RESUMEN-CAMBIOS-HORARIOS.md` | Resumen de cambios en el código |
| `CORRECCION-GUARDADO-HORARIOS.md` | Explicación del problema original |

## ⚠️ Archivos Obsoletos (NO USES ESTOS)

Estos archivos fueron reemplazados por `MIGRACION-HORARIOS-COMPLETA.sql`:

- ~~`MIGRACION-TABLA-HORARIOS.sql`~~ (V1 - Obsoleto)
- ~~`MIGRACION-TABLA-HORARIOS-V2.sql`~~ (V2 - Obsoleto)
- ~~`MIGRACION-TABLA-HORARIOS-V3-RLS.sql`~~ (V3 - Obsoleto)
- ~~`VERIFICAR-MIGRACION-HORARIOS.sql`~~ (Obsoleto)
- ~~`ERROR-HORARIOS-SOLUCION-RAPIDA.md`~~ (Obsoleto)
- ~~`SOLUCION-ERROR-HORARIOS.md`~~ (Obsoleto)

**Razón**: Estos archivos eran parches incrementales. La migración completa los reemplaza todos.

## 🎯 Flujo de Trabajo

```
1. Leer GUIA-SOLUCION-HORARIOS.md
   ↓
2. Ejecutar MIGRACION-HORARIOS-COMPLETA.sql en Supabase
   ↓
3. Ejecutar VERIFICAR-HORARIOS.sql para confirmar
   ↓
4. Probar en la aplicación
   ↓
5. ✅ Listo
```

## 🔧 Qué Hace la Migración

La migración completa:

1. ✅ Crea/actualiza la tabla `horarios`
2. ✅ Agrega columna `actividad_nombre` (si no existe)
3. ✅ Hace `asignacion_id` nullable
4. ✅ Agrega constraint de validación
5. ✅ Elimina políticas RLS antiguas
6. ✅ Crea 4 políticas RLS correctas
7. ✅ Crea índices para performance
8. ✅ Crea trigger para `updated_at`

**Es idempotente**: Puede ejecutarse múltiples veces sin problemas.

## 📊 Estructura Final

```sql
CREATE TABLE horarios (
    id UUID PRIMARY KEY,
    personal_id UUID NOT NULL,
    dia_semana TEXT NOT NULL,
    hora_id TEXT NOT NULL,
    asignacion_id UUID,           -- ✅ Nullable
    actividad_nombre TEXT,         -- ✅ Nueva columna
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    
    UNIQUE(personal_id, dia_semana, hora_id),
    
    CHECK (
        (asignacion_id IS NOT NULL AND actividad_nombre IS NULL) OR
        (asignacion_id IS NULL AND actividad_nombre IS NOT NULL)
    )
);
```

## 🔐 Políticas RLS

4 políticas para usuarios autenticados:
- `horarios_select_authenticated` (SELECT)
- `horarios_insert_authenticated` (INSERT)
- `horarios_update_authenticated` (UPDATE)
- `horarios_delete_authenticated` (DELETE)

## ❓ Preguntas Frecuentes

### ¿Debo ejecutar las migraciones V1, V2 y V3?

**No**. Solo ejecuta `MIGRACION-HORARIOS-COMPLETA.sql`. Esta incluye todo.

### ¿Qué pasa si ya ejecuté V1, V2 o V3?

No hay problema. `MIGRACION-HORARIOS-COMPLETA.sql` es idempotente y actualizará todo correctamente.

### ¿Se perderán mis datos?

**No**. La migración solo modifica la estructura, no elimina datos.

### ¿Puedo ejecutar la migración múltiples veces?

**Sí**. Es seguro ejecutarla múltiples veces.

## 🆘 Soporte

Si tienes problemas:

1. Ejecuta `VERIFICAR-HORARIOS.sql`
2. Copia los resultados completos
3. Copia el error de la consola del navegador
4. Comparte ambos para ayuda

## 📚 Documentación Adicional

- **Código fuente**: 
  - `src/hooks/use-horario.ts` - Hook de horarios
  - `src/infrastructure/repositories/supabase/SupabasePersonalRepository.ts` - Repositorio
  - `src/app/docentes/mi-horario/page.tsx` - Página de UI

- **Mejoras de UI/UX**: Ver commits recientes en estos archivos

---

**Última actualización**: Migración completa e integral implementada
