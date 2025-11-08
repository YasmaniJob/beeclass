# 🔍 Debug: Botón Crear Sección

**Fecha:** 28 de octubre de 2025  
**Problema:** El botón "Añadir Sección" no funciona correctamente

---

## 🔧 CAMBIOS REALIZADOS

### 1. Agregado Logging de Debug

```typescript
const handleAddSeccion = async (grado: string) => {
  // Log 1: Estado inicial
  console.log('🔍 Agregando sección:', { 
    grado, 
    seccionesActuales, 
    seccionesPorGrado: seccionesPorGrado[grado] 
  });

  // Log 2: Siguiente sección encontrada
  console.log('📝 Siguiente sección:', siguienteSeccion);

  // Log 3: Estudiante dummy a crear
  console.log('💾 Creando estudiante dummy:', estudianteDummy);

  // Log 4: Resultado de la operación
  console.log('✅ Resultado:', success);
};
```

### 2. Mejorado Manejo de Errores

```typescript
try {
  const success = await addEstudiante(estudianteDummy as any);
  
  if (success) {
    await refreshEstudiantes();
    toast({ title: 'Sección creada' });
  } else {
    toast({ 
      title: 'Error',
      description: 'No se pudo crear la sección',
      variant: 'destructive' 
    });
  }
} catch (error) {
  console.error('❌ Error al crear sección:', error);
  toast({ 
    title: 'Error',
    description: 'Ocurrió un error al crear la sección',
    variant: 'destructive' 
  });
}
```

### 3. Cambiado a Async/Await

Antes usaba `.then()`, ahora usa `async/await` para mejor control del flujo.

---

## 🧪 CÓMO PROBAR

### Paso 1: Abrir DevTools

1. Abre la aplicación: `http://localhost:9002/estudiantes`
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**

### Paso 2: Crear un Grado

1. Click en el botón "+" para crear un grado
2. Verifica en la consola:
   ```
   ✅ Grado creado
   ```

### Paso 3: Intentar Crear Sección

1. Selecciona el grado recién creado
2. Click en "Añadir Sección"
3. **Observa la consola:**

**Caso Exitoso:**
```
🔍 Agregando sección: { grado: '1er Grado', seccionesActuales: [], ... }
📝 Siguiente sección: A
💾 Creando estudiante dummy: { numeroDocumento: 'SECCION-...', ... }
✅ Resultado: true
```

**Caso con Error:**
```
🔍 Agregando sección: { grado: '1er Grado', seccionesActuales: [], ... }
📝 Siguiente sección: A
💾 Creando estudiante dummy: { numeroDocumento: 'SECCION-...', ... }
❌ Error al crear sección: [mensaje de error]
```

---

## 🔍 POSIBLES PROBLEMAS

### Problema 1: `addEstudiante` retorna `false`

**Síntomas:**
- Console muestra: `✅ Resultado: false`
- Toast de error: "No se pudo crear la sección"

**Causas posibles:**
- Error en Supabase
- Validación fallida
- Permisos insuficientes

**Solución:**
Revisar el hook `useEstudiantes` y la función `addEstudiante` en `useMatriculaSupabaseHibrida`.

### Problema 2: Error en `addEstudiante`

**Síntomas:**
- Console muestra: `❌ Error al crear sección: [error]`
- Toast de error: "Ocurrió un error al crear la sección"

**Causas posibles:**
- Excepción no manejada
- Error de red
- Error de Supabase

**Solución:**
Ver el mensaje de error completo en la consola.

### Problema 3: No encuentra siguiente sección

**Síntomas:**
- Console muestra: `📝 Siguiente sección: undefined`
- Toast: "No hay más secciones"

**Causas posibles:**
- Todas las secciones (A-J) ya existen
- Error en el filtrado de secciones

**Solución:**
Verificar `seccionesActuales` en el log.

### Problema 4: Grado no tiene secciones

**Síntomas:**
- `seccionesPorGrado[grado]` es `undefined` o `[]`
- Pero aún así no crea la sección A

**Causas posibles:**
- Problema con el filtrado de `__PLACEHOLDER__`
- Error en el useMemo

**Solución:**
Verificar el log de `seccionesPorGrado`.

---

## 🔧 VERIFICACIONES ADICIONALES

### 1. Verificar Hook `useEstudiantes`

```typescript
// En src/hooks/use-supabase-data.ts
export function useEstudiantes() {
  const { 
    estudiantes, 
    loading, 
    refreshEstudiantes, 
    addEstudiante,      // ← Debe existir
    updateEstudiante, 
    deleteEstudiante 
  } = useMatriculaSupabaseHibrida();
  
  return {
    estudiantes,
    loading: loading.estudiantes,
    refresh: refreshEstudiantes,
    add: addEstudiante,  // ← Debe estar mapeado
    update: updateEstudiante,
    delete: deleteEstudiante,
  };
}
```

### 2. Verificar `addEstudiante` en `useMatriculaSupabaseHibrida`

```typescript
// Debe retornar boolean
const addEstudiante = async (estudiante: Estudiante): Promise<boolean> => {
  try {
    // Lógica de guardado
    return true;  // ← Debe retornar true si es exitoso
  } catch (error) {
    console.error('Error:', error);
    return false; // ← Debe retornar false si falla
  }
};
```

### 3. Verificar Permisos en Supabase

Ir a Supabase Dashboard → Authentication → Policies

Verificar que la tabla `estudiantes` tiene políticas que permiten INSERT.

---

## 📊 DATOS DE DEBUG

### Estructura Esperada

**Grado recién creado:**
```typescript
{
  grado: '1er Grado',
  seccionesActuales: [],  // ← Vacío porque no hay secciones reales
  seccionesPorGrado: {
    '1er Grado': []  // ← Puede ser [] o undefined
  }
}
```

**Estudiante Dummy a Crear:**
```typescript
{
  tipoDocumento: 'DNI',
  numeroDocumento: 'SECCION-1730167200000',  // ← Timestamp
  apellidoPaterno: 'PLACEHOLDER',
  nombres: 'SECCION',
  grado: '1er Grado',
  seccion: 'A'  // ← Primera sección disponible
}
```

---

## 🎯 SIGUIENTE PASO

### Si el problema persiste:

1. **Copia los logs de la consola**
2. **Verifica:**
   - ¿Qué muestra `🔍 Agregando sección`?
   - ¿Qué muestra `📝 Siguiente sección`?
   - ¿Qué muestra `✅ Resultado`?
   - ¿Hay algún error `❌`?

3. **Comparte la información:**
   - Logs de la consola
   - Toast que aparece
   - Comportamiento observado

---

## 💡 POSIBLE SOLUCIÓN ALTERNATIVA

Si el problema es que `addEstudiante` no funciona con estudiantes dummy, podemos:

### Opción 1: Crear tabla de secciones en Supabase

```sql
CREATE TABLE secciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grado TEXT NOT NULL,
  seccion TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(grado, seccion)
);
```

### Opción 2: Usar localStorage temporalmente

```typescript
const handleAddSeccion = (grado: string) => {
  // Guardar en localStorage
  const secciones = JSON.parse(localStorage.getItem('secciones') || '{}');
  if (!secciones[grado]) secciones[grado] = [];
  secciones[grado].push(siguienteSeccion);
  localStorage.setItem('secciones', JSON.stringify(secciones));
  
  // Refresh
  refreshEstudiantes();
};
```

---

## 📝 CHECKLIST DE DEBUGGING

- [ ] Abrir DevTools (F12)
- [ ] Ir a pestaña Console
- [ ] Crear un grado nuevo
- [ ] Intentar crear sección
- [ ] Copiar logs de la consola
- [ ] Verificar qué toast aparece
- [ ] Revisar si la sección se creó en Supabase
- [ ] Compartir resultados

---

**Última actualización:** 28 de octubre de 2025, 10:31 PM
