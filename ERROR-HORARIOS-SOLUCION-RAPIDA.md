# 🚨 Error al Guardar Horarios - Solución Rápida

## Los Errores que Puedes Ver

### Error 1: Columna no existe
```
Error: Error insertando horarios: {}
column "actividad_nombre" does not exist
```

### Error 2: Política RLS (Row Level Security)
```
Error: new row violates row-level security policy for table "horarios"
```

## ¿Por Qué Ocurren?

❌ **No has ejecutado las migraciones de base de datos**

La aplicación intenta guardar en columnas que no existen o las políticas de seguridad están bloqueando la inserción.

## ✅ Solución en 4 Pasos

### Paso 1: Ir a Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor** (icono de base de datos en el menú lateral)

### Paso 2: Ejecutar Migración V2 (Estructura de Tabla)

1. Abre el archivo `MIGRACION-TABLA-HORARIOS-V2.sql` en tu editor
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en el botón **Run** (o presiona Ctrl+Enter)
5. Espera a ver: "Success. No rows returned"

### Paso 3: Ejecutar Migración V3 (Políticas RLS)

1. Abre el archivo `MIGRACION-TABLA-HORARIOS-V3-RLS.sql` en tu editor
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en el botón **Run**
5. Espera a ver: "Success. No rows returned"

### Paso 4: Verificar

1. Abre el archivo `VERIFICAR-MIGRACION-HORARIOS.sql`
2. Copia y pega su contenido en el SQL Editor
3. Haz clic en **Run**
4. Verifica que todas las líneas muestren ✅ SÍ
5. Debe mostrar al menos 4 políticas RLS configuradas

## 🎉 Listo

Ahora recarga tu aplicación (F5) y prueba guardar el horario nuevamente.

Deberías ver en la consola del navegador:

```
🔄 Guardando horarios para personal_id: ...
📝 Intentando guardar horarios: [...]
✅ Horarios guardados exitosamente: X bloques
```

## 📚 Más Información

- **Detalles técnicos**: Ver `CORRECCION-GUARDADO-HORARIOS.md`
- **Guía completa**: Ver `SOLUCION-ERROR-HORARIOS.md`
- **Resumen de cambios**: Ver `RESUMEN-CAMBIOS-HORARIOS.md`

## ❓ ¿Sigues con Problemas?

Si después de ejecutar la migración sigues viendo errores:

1. Abre la consola del navegador (F12)
2. Copia el error completo que aparece
3. Ejecuta `VERIFICAR-MIGRACION-HORARIOS.sql` y copia los resultados
4. Comparte ambos para ayuda adicional

---

**Nota**: Este error es normal la primera vez. Solo necesitas ejecutar la migración una vez y funcionará para siempre.
