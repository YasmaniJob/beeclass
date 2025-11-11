# Optimizaciones de Performance - Carga Académica

**Fecha:** 10 de noviembre de 2025

## Problema Identificado

La página de carga académica (`/carga-academica`) tenía problemas de performance al guardar asignaciones:
- Demora excesiva al guardar cambios (varios segundos)
- Múltiples queries redundantes a Supabase
- Refresh innecesario de todos los datos después de guardar

## Análisis del Cuello de Botella

### Antes de la Optimización

El flujo original era:

1. **Guardado secuencial por docente:**
   - Cada docente se guardaba individualmente con `Promise.allSettled`
   - Por cada docente se ejecutaban:
     - 1 query para verificar si existe el personal
     - 1 upsert del personal
     - 1 query para obtener asignaciones existentes
     - N queries para resolver `grado_seccion_id` (una por cada asignación sin ID)
     - 1 delete de asignaciones antiguas
     - 1 insert de nuevas asignaciones
     - 1 upsert de asignaciones actualizadas
     - Queries adicionales para horarios

2. **Refresh completo después de guardar:**
   - `refreshPersonal()` - recarga TODOS los docentes
   - `refreshGradosSecciones()` - recarga TODOS los grados y secciones
   - `refreshAreasCurriculares()` - recarga TODAS las áreas

**Resultado:** Para 20 docentes con 5 asignaciones cada uno = ~200+ queries a Supabase

### Después de la Optimización

El nuevo flujo implementado:

1. **Batch Processing:**
   - 1 query para obtener todos los IDs de personal existentes
   - 1 upsert masivo de todos los docentes
   - Resolución paralela de todos los `grado_seccion_id` necesarios (con caché)
   - 1 query para obtener todas las asignaciones existentes
   - Operaciones en batch (chunks de 1000):
     - 1-N deletes en batch
     - 1-N inserts en batch
     - 1-N updates en batch

2. **Refresh selectivo:**
   - Solo `refreshPersonal()` - las asignaciones ya están actualizadas

**Resultado:** Para 20 docentes con 5 asignaciones cada uno = ~10-15 queries a Supabase

## Mejoras Implementadas

### 1. Batch Processing de Personal
```typescript
// Antes: 1 query por docente
for (const docente of docentes) {
  await supabase.from('personal').upsert(...)
}

// Después: 1 query para todos
await supabase.from('personal').upsert(personalUpserts, ...)
```

### 2. Caché de grado_seccion_id
```typescript
// Resolver todos los IDs necesarios de una vez
const gradoSeccionCache = new Map<string, string>();
await Promise.all(
  Array.from(gradoSeccionPairs).map(async (pair) => {
    const [grado, seccion] = pair.split('|');
    const id = await gradosSeccionesRepository.upsert(grado, seccion);
    if (id) gradoSeccionCache.set(pair, id);
  })
);
```

### 3. Batch de Asignaciones
```typescript
// Acumular todas las operaciones
const allInserts: any[] = [];
const allUpdates: any[] = [];
const allDeletes: string[] = [];

// ... procesar todos los docentes ...

// Ejecutar en batch (chunks de 1000)
if (allInserts.length > 0) {
  const chunks = chunkArray(allInserts, 1000);
  await Promise.all(chunks.map(chunk => 
    supabase.from('asignaciones_docentes').insert(chunk)
  ));
}
```

### 4. Refresh Selectivo
```typescript
// Antes
await refreshPersonal();
await refreshGradosSecciones();
await refreshAreasCurriculares();

// Después
await refreshPersonal(); // Solo lo necesario
```

## Resultados Esperados

### Reducción de Queries
- **Antes:** ~200+ queries para 20 docentes
- **Después:** ~10-15 queries para 20 docentes
- **Mejora:** ~93% menos queries

### Tiempo de Guardado
- **Antes:** 5-10 segundos (dependiendo de la cantidad de docentes)
- **Después:** 1-2 segundos
- **Mejora:** ~80% más rápido

### Carga de Red
- **Antes:** Múltiples round-trips a Supabase
- **Después:** Operaciones consolidadas en batch
- **Mejora:** Menor latencia y uso de ancho de banda

## Archivos Modificados

1. **`src/infrastructure/services/asignaciones-supabase-optimized.ts`** (NUEVO)
   - Implementación optimizada de `syncDocentesAsignacionesOptimized`
   - Batch processing y caché de IDs

2. **`src/hooks/use-matricula-data.tsx`**
   - Cambio de `syncDocentesAsignaciones` a `syncDocentesAsignacionesOptimized`
   - Eliminación de refreshes innecesarios

## Compatibilidad

- ✅ Mantiene la misma interfaz pública
- ✅ Compatible con el código existente
- ✅ No requiere cambios en la base de datos
- ✅ Funciona con Supabase y modo local

## Monitoreo

La función optimizada incluye logging detallado:

```typescript
console.info('Supabase::syncDocentesAsignacionesOptimized', {
  docentesProcesados: docentes.length,
  asignacionesInsertadas: allInserts.length,
  asignacionesActualizadas: allUpdates.length,
  asignacionesEliminadas: allDeletes.length,
  durationMs,
  timestamp: new Date().toISOString(),
});
```

Revisar la consola del navegador para ver las métricas de performance.

## Próximos Pasos

1. ✅ Implementar batch processing
2. ✅ Agregar caché de grado_seccion_id
3. ✅ Optimizar refreshes
4. ⏳ Monitorear performance en producción
5. ⏳ Considerar implementar optimistic updates para UX aún más rápida

## Notas Técnicas

- Los chunks de 1000 registros respetan los límites de Supabase
- El caché de `grado_seccion_id` se mantiene solo durante la operación de guardado
- Las operaciones fallidas se logean pero no bloquean el resto
- Compatible con transacciones futuras si se requiere atomicidad estricta
