# Mejora: Edición Directa de Competencias Transversales

## Problema Identificado

En la libreta de competencias transversales (`/evaluaciones/[grado]/[seccion]/transversal-secundaria`), los docentes solo podían evaluar mediante sesiones de aprendizaje. Esto generaba fricción cuando querían registrar calificaciones rápidamente sin crear una sesión completa.

## Solución Implementada

Se agregó **edición directa SIEMPRE ACTIVA para competencias transversales** que permite a los docentes:
1. Evaluar directamente en la tabla sin crear sesiones
2. Las celdas están siempre habilitadas para edición (sin botón de toggle)
3. Guardar calificaciones por periodo sin necesidad de sesión
4. Mantener la opción de crear sesiones si lo desean

## Cambios Realizados

### Archivo: `src/app/evaluaciones/[grado]/[seccion]/[areaId]/page.tsx`

#### 1. Detección de Área Transversal

```typescript
// Detectar si es área de competencias transversales
const esCompetenciasTransversales = useMemo(() => {
    return area?.nombre === 'Competencias Transversales' || areaId.includes('transversal');
}, [area, areaId]);
```

#### 2. Nuevos Estados (Simplificados)

```typescript
// Sin estado de modoEdicion - siempre activo en transversales
const [notasEditadas, setNotasEditadas] = useState<Map<string, NotaCualitativa>>(new Map());
const [estudiantesModificados, setEstudiantesModificados] = useState<Set<string>>(new Set());

const { saveCalificacion } = useCompetencias();
const { user } = useCurrentUser();
```

#### 2. Funciones de Manejo

**handleNotaChange** - Registra cambios en las notas:
```typescript
const handleNotaChange = useCallback((estudianteId: string, competenciaId: string, nota: NotaCualitativa) => {
    const key = `${estudianteId}-${competenciaId}`;
    setNotasEditadas(prev => new Map(prev).set(key, nota));
    setEstudiantesModificados(prev => new Set(prev).add(estudianteId));
}, []);
```

**handleGuardarCambios** - Guarda las calificaciones directamente:
```typescript
const handleGuardarCambios = useCallback(() => {
    if (!user || !area) return;

    let cambiosGuardados = 0;
    notasEditadas.forEach((nota, key) => {
        const [estudianteId, competenciaId] = key.split('-');
        saveCalificacion({
            estudianteId,
            docenteId: user.numeroDocumento,
            grado,
            seccion,
            areaId: area.id,
            competenciaId,
            nota,
            periodo: `${evaluacionConfig.tipo} ${periodoSeleccionado}`, // Sin sesionId
            tipoEvaluacion: 'directa',
        });
        cambiosGuardados++;
    });

    toast({
        title: 'Calificaciones guardadas',
        description: `Se han guardado ${cambiosGuardados} calificación(es).`,
    });

    // Limpiar cambios después de guardar
    setNotasEditadas(new Map());
    setEstudiantesModificados(new Set());
}, [user, area, notasEditadas, estudiantesModificados, grado, seccion, evaluacionConfig, periodoSeleccionado, saveCalificacion, toast]);
```

**getNotaActual** - Obtiene la nota actual (editada o guardada):
```typescript
const getNotaActual = useCallback((estudianteId: string, competenciaId: string): NotaCualitativa | '-' => {
    const key = `${estudianteId}-${competenciaId}`;
    if (notasEditadas.has(key)) {
        return notasEditadas.get(key)!;
    }
    const estudiante = estudiantesConPromedios.find(e => e.numeroDocumento === estudianteId);
    return estudiante?.promediosPorCompetencia[competenciaId]?.nota || '-';
}, [notasEditadas, estudiantesConPromedios]);
```

#### 3. UI - Botón Simplificado

```tsx
// Sin botones de toggle - edición siempre activa en transversales
<Button onClick={() => setIsSesionSheetOpen(true)}>
    <Plus className="mr-2 h-4 w-4" />
    Añadir Sesión
</Button>
```

#### 4. Celdas Siempre Editables (Solo Transversales)

```tsx
{esCompetenciasTransversales ? (
    // Siempre editable en transversales
    <NotaSelector
        value={notaActual === '-' ? null : notaActual}
        onValueChange={(nota: NotaCualitativa) => handleNotaChange(estudiante.numeroDocumento, c.id, nota)}
    />
) : (
    <div className="relative inline-flex items-center justify-center">
        <NotaBadge
            nota={promedio.nota}
            onClick={() => handleOpenDesglose(estudiante, c)}
            clickable={promedio.nota !== '-'}
        />
        {promedio.faltanNotas > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 justify-center p-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-full">{promedio.faltanNotas}</Badge>
        )}
    </div>
)}
```

#### 5. Botón de Guardar (Aparece Automáticamente)

```tsx
{esCompetenciasTransversales && estudiantesModificados.size > 0 && (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Button size="lg" onClick={handleGuardarCambios} className="shadow-lg">
            <Save className="mr-2 h-5 w-5" />
            Guardar Cambios
            <Badge variant="secondary" className="ml-2">{estudiantesModificados.size}</Badge>
        </Button>
    </div>
)}
```

## Flujo de Uso

### Opción 1: Evaluación con Sesiones
1. Docente hace clic en "Añadir Sesión"
2. Crea una sesión de aprendizaje
3. Evalúa estudiantes en la sesión
4. Las calificaciones se promedian automáticamente

### Opción 2: Edición Directa (Siempre Activa)
1. Las celdas están siempre habilitadas con selectores de nota
2. Docente selecciona notas directamente en la tabla
3. Las celdas modificadas se resaltan en azul
4. Aparece automáticamente el botón "Guardar Cambios"
5. Hace clic en "Guardar Cambios"
6. Las calificaciones se guardan por periodo (sin sesión)

## Características

### Indicadores Visuales
- ✅ Celdas modificadas se resaltan en azul claro
- ✅ Contador de estudiantes modificados en el botón de guardar
- ✅ Toast de confirmación al guardar
- ✅ Botón de guardar aparece automáticamente al hacer cambios

### Persistencia
- ✅ Calificaciones se guardan con `periodo` en lugar de `sesionId`
- ✅ Se mantiene el `tipoEvaluacion: 'directa'`
- ✅ Se registra el docente que califica

### Simplicidad
- ✅ Sin botones de toggle - edición siempre activa
- ✅ Interfaz más limpia y directa
- ✅ Menos clics para el usuario

## Componentes Utilizados

### NotaSelector (`src/components/shared/nota-selector.tsx`)
Componente existente que muestra 4 botones (AD, A, B, C) para seleccionar la nota.

```tsx
<NotaSelector
    value={notaActual === '-' ? null : notaActual}
    onValueChange={(nota) => handleNotaChange(estudianteId, competenciaId, nota)}
/>
```

## Diferencias entre Opciones

| Aspecto | Evaluación con Sesiones | Edición Directa |
|---------|------------------------|-----------------|
| **Activación** | Crear sesión primero | Siempre activa |
| **Creación** | Requiere crear sesión | No requiere sesión |
| **Guardado** | Por sesión (`sesionId`) | Por periodo (`periodo`) |
| **Promedio** | Automático de sesiones | Nota directa |
| **Desglose** | Muestra sesiones | Muestra calificaciones por periodo |
| **Velocidad** | Más pasos | Más rápido |
| **Detalle** | Más contexto (título, capacidades) | Menos contexto |
| **UI** | Requiere navegación | Edición in-place |

## Beneficios

1. **Flexibilidad**
   - Los docentes pueden elegir el método que prefieran
   - Ambos modos coexisten sin conflicto

2. **Velocidad**
   - Registro rápido de calificaciones
   - Menos clics para evaluaciones simples

3. **Usabilidad**
   - Interfaz intuitiva con indicadores visuales
   - Feedback inmediato de cambios

4. **Compatibilidad**
   - No afecta el modo de sesiones existente
   - Las calificaciones se integran en el promedio

## Casos de Uso

### Usar Sesiones cuando:
- Se quiere documentar el contexto de la evaluación
- Se evalúan capacidades específicas
- Se necesita trazabilidad detallada

### Usar Edición Directa cuando:
- Se necesita registrar calificaciones rápidamente
- Se tiene la evaluación en papel y solo se quiere digitalizar
- Se está haciendo una evaluación general del periodo

## Restricción Importante

⚠️ **La funcionalidad de edición directa SOLO está disponible para Competencias Transversales.**

Para todas las demás áreas curriculares (Matemática, Comunicación, etc.), se mantiene el comportamiento original:
- Solo evaluación mediante sesiones
- Las celdas muestran badges con promedios (no editables)
- Requieren crear sesiones para evaluar

Esto se logra mediante la detección:
```typescript
const esCompetenciasTransversales = useMemo(() => {
    return area?.nombre === 'Competencias Transversales' || areaId.includes('transversal');
}, [area, areaId]);
```

## Ventajas de la Implementación Simplificada

1. **Menos Fricción**: Sin necesidad de activar un modo de edición
2. **Más Intuitivo**: Las celdas editables son evidentes desde el inicio
3. **Más Rápido**: Menos clics para registrar calificaciones
4. **UI Más Limpia**: Sin botones de toggle que confundan
5. **Coexistencia Natural**: Ambas opciones (sesiones y directa) disponibles simultáneamente

## Estado: ✅ COMPLETADO

La libreta de competencias transversales ahora tiene edición directa siempre activa, permitiendo registro rápido de calificaciones sin perder la opción de crear sesiones detalladas. Las demás áreas mantienen solo el modo de sesiones.
