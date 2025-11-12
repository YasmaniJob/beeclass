# Corrección: Tipo de Evaluación Aplicado en Evaluación Directa

## Problema Identificado

El tipo de evaluación seleccionado en el selector **NO se estaba guardando** cuando el docente evaluaba directamente a los estudiantes. El estado `tipoEvaluacion` solo se usaba para mostrar/ocultar componentes en la UI, pero no se persistía en:

1. La sesión de aprendizaje al crearla
2. Las calificaciones al guardarlas

## Cambios Realizados

### 1. Actualización de Schemas (`src/lib/definitions.ts`)

**Agregado:**
- Nuevo enum `TipoEvaluacionEnum` con valores: `'directa' | 'lista-cotejo' | 'rubrica'`
- Campo `tipoEvaluacion` en `SesionAprendizajeSchema` (default: 'directa')
- Campo `tipoEvaluacion` en `CalificacionSchema` (default: 'directa')

```typescript
export const TipoEvaluacionEnum = z.enum(['directa', 'lista-cotejo', 'rubrica']);
export type TipoEvaluacion = z.infer<typeof TipoEvaluacionEnum>;

export const SesionAprendizajeSchema = z.object({
  // ... campos existentes
  tipoEvaluacion: TipoEvaluacionEnum.default('directa'),
});

export const CalificacionSchema = z.object({
  // ... campos existentes
  tipoEvaluacion: TipoEvaluacionEnum.default('directa'),
});
```

### 2. Hook de Sesiones (`src/hooks/use-sesiones.ts`)

**Modificado:**
- Función `addSesion` ahora acepta parámetro `tipoEvaluacion`
- Se guarda el tipo de evaluación en la sesión al crearla

```typescript
const addSesion = useCallback((
    grado: string, 
    seccion: string, 
    areaId: string, 
    titulo: string, 
    competenciaId: string, 
    capacidades?: string[],
    tipoEvaluacion: TipoEvaluacion = 'directa'
): SesionAprendizaje => {
    const newSesion: SesionAprendizaje = {
        // ... campos existentes
        tipoEvaluacion,
    };
    // ...
}, [getSesiones, setSesiones]);
```

### 3. Hook de Competencias (`src/hooks/use-competencias.ts`)

**Modificado:**
- Función `saveCalificacion` ahora guarda el `tipoEvaluacion` en cada calificación
- Se preserva el tipo de evaluación al actualizar calificaciones existentes

```typescript
const saveCalificacion = useCallback((
    data: Omit<Calificacion, 'id' | 'fecha'>
) => {
    // ... lógica existente
    const updatedCalificacion = {
        // ... campos existentes
        tipoEvaluacion: tipoEvaluacion || memoryCalificaciones[existingIndex].tipoEvaluacion || 'directa',
    };
    // ...
}, [getCalificaciones, setCalificaciones]);
```

### 4. Hook de Calificaciones de Sesión (`src/hooks/use-calificaciones-sesion.ts`)

**Modificado:**
- Función `handleSaveChanges` ahora acepta parámetro `tipoEvaluacion`
- Se pasa el tipo de evaluación al guardar cada calificación

```typescript
const handleSaveChanges = useCallback((tipoEvaluacion?: TipoEvaluacion) => {
    // ... lógica existente
    saveCalificacion({
        // ... campos existentes
        tipoEvaluacion: tipoEvaluacion || sesion.tipoEvaluacion || 'directa',
    });
    // ...
}, [user, sesion, competencia, changedStudentIds, localCalificaciones, saveCalificacion, toast]);
```

### 5. Página de Evaluación Directa (`src/app/evaluaciones/[grado]/[seccion]/[areaId]/[sesionId]/page.tsx`)

**Modificado:**
- El estado `tipoEvaluacion` ahora se inicializa desde `sesion.tipoEvaluacion`
- Se usa `useEffect` para actualizar el tipo cuando se carga la sesión
- Se pasa el `tipoEvaluacion` al llamar `handleSaveChanges`

```typescript
// Inicializar desde la sesión
const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('directa');

// Actualizar cuando se carga la sesión
useEffect(() => {
    if (sesion?.tipoEvaluacion) {
        setTipoEvaluacion(sesion.tipoEvaluacion);
    }
}, [sesion]);

// Pasar al guardar
<Button onClick={() => handleSaveChanges(tipoEvaluacion)}>
    Guardar Cambios
</Button>
```

### 6. Componente de Sesiones (`src/components/evaluaciones/sesiones-sheet.tsx`)

**Modificado:**
- Agregado estado `tipoEvaluacion` en el formulario de creación
- Agregado selector `EvaluationTypeSelector` en el formulario
- Se pasa el tipo de evaluación al crear la sesión

```typescript
const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('directa');

// En el formulario
<EvaluationTypeSelector
    selectedType={tipoEvaluacion}
    onTypeChange={setTipoEvaluacion}
/>

// Al crear
onCreateSesion(titulo, competenciaId, capacidades, tipoEvaluacion);
```

### 7. Página de Libreta de Notas (`src/app/evaluaciones/[grado]/[seccion]/[areaId]/page.tsx`)

**Modificado:**
- Función `handleSaveSesion` ahora acepta y pasa el `tipoEvaluacion`

```typescript
const handleSaveSesion = (
    titulo: string, 
    competenciaId: string, 
    capacidades?: string[], 
    tipoEvaluacion?: TipoEvaluacion
) => {
    const newSesion = addSesion(grado, seccion, areaId, titulo, competenciaId, capacidades, tipoEvaluacion);
    // ...
}
```

## Flujo Completo

### Al Crear una Sesión:
1. Docente selecciona tipo de evaluación en `SesionesSheet`
2. Se guarda en la sesión con `addSesion(..., tipoEvaluacion)`
3. La sesión ahora tiene el campo `tipoEvaluacion`

### Al Evaluar:
1. La página carga la sesión y su `tipoEvaluacion`
2. El selector se inicializa con el tipo de la sesión
3. Al guardar calificaciones, se pasa el `tipoEvaluacion` actual
4. Cada calificación se guarda con su `tipoEvaluacion`

### Persistencia:
- ✅ Sesiones tienen `tipoEvaluacion`
- ✅ Calificaciones tienen `tipoEvaluacion`
- ✅ El tipo se preserva al actualizar calificaciones
- ✅ El tipo se carga desde la sesión al evaluar

## Resultado

Ahora el tipo de evaluación se guarda correctamente en:
- La sesión de aprendizaje al crearla
- Cada calificación individual al guardarla
- Se preserva al actualizar calificaciones existentes
- Se carga automáticamente al abrir una sesión para evaluar

## Archivos Modificados

1. `src/lib/definitions.ts` - Schemas actualizados
2. `src/hooks/use-sesiones.ts` - Guardar tipo en sesión
3. `src/hooks/use-competencias.ts` - Guardar tipo en calificación
4. `src/hooks/use-calificaciones-sesion.ts` - Pasar tipo al guardar
5. `src/app/evaluaciones/[grado]/[seccion]/[areaId]/[sesionId]/page.tsx` - Cargar y pasar tipo
6. `src/components/evaluaciones/sesiones-sheet.tsx` - Selector en formulario
7. `src/app/evaluaciones/[grado]/[seccion]/[areaId]/page.tsx` - Pasar tipo al crear

## Estado: ✅ COMPLETADO

El tipo de evaluación ahora se aplica correctamente en toda la cadena de evaluación directa.
