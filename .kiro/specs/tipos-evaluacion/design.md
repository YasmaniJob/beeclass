# Design Document

## Overview

Este diseño implementa un sistema de selección de tipos de evaluación en la página de calificación de sesiones. La solución se enfoca en preparar la arquitectura para soportar tres tipos de evaluación (Directa, Lista de Cotejo, y Rúbrica), implementando inicialmente solo la funcionalidad de Evaluación Directa (que ya existe) y dejando la infraestructura lista para las futuras implementaciones.

El diseño utiliza un patrón de componentes reutilizables y un sistema de estado que permite cambiar dinámicamente entre tipos de evaluación sin recargar la página.

## Architecture

### Component Structure

```
CalificarSesionPage (page.tsx)
├── EvaluationTypeSelector (nuevo componente)
│   ├── EvaluationTypeButton (componente interno)
│   └── Estado: tipoEvaluacion
├── CalificacionesSesionTable (existente - para Evaluación Directa)
├── ListaCotejoTable (futuro - placeholder)
└── RubricaTable (futuro - placeholder)
```

### Data Flow

1. Usuario selecciona tipo de evaluación en `EvaluationTypeSelector`
2. Estado `tipoEvaluacion` se actualiza en el componente padre
3. Componente padre renderiza condicionalmente la tabla apropiada
4. Las calificaciones se mantienen en el hook existente `useCalificacionesSesion`

### State Management

```typescript
// Estado local en CalificarSesionPage
const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('directa');

// Tipos de evaluación
type TipoEvaluacion = 'directa' | 'lista-cotejo' | 'rubrica';
```

## Components and Interfaces

### 1. EvaluationTypeSelector Component

**Ubicación:** `src/components/evaluaciones/evaluation-type-selector.tsx`

**Props Interface:**
```typescript
interface EvaluationTypeSelectorProps {
  selectedType: TipoEvaluacion;
  onTypeChange: (type: TipoEvaluacion) => void;
}
```

**Estructura:**
```typescript
const EVALUATION_TYPES = [
  {
    id: 'directa' as const,
    label: 'Evaluación Directa',
    icon: CheckCircle2,
    description: 'Calificación literal (AD, A, B, C)',
    available: true
  },
  {
    id: 'lista-cotejo' as const,
    label: 'Lista de Cotejo',
    icon: ClipboardList,
    description: 'Criterios de logro',
    available: false // Próximamente
  },
  {
    id: 'rubrica' as const,
    label: 'Rúbrica',
    icon: Table2,
    description: 'Niveles de desempeño',
    available: false // Próximamente
  }
];
```

**Diseño Visual:**
- Botones tipo "toggle" con iconos
- Estado activo con borde y fondo destacado
- Badge "Próximamente" para opciones no disponibles
- Tooltip con descripción al hacer hover
- Responsive: horizontal en desktop, vertical en móvil

### 2. Types Definition

**Ubicación:** `src/types/evaluacion.ts`

```typescript
export type TipoEvaluacion = 'directa' | 'lista-cotejo' | 'rubrica';

export interface EvaluationType {
  id: TipoEvaluacion;
  label: string;
  icon: LucideIcon;
  description: string;
  available: boolean;
}

// Para futuras implementaciones
export interface ListaCotejoItem {
  id: string;
  criterio: string;
  cumple: boolean;
}

export interface RubricaCriterio {
  id: string;
  nombre: string;
  niveles: {
    nivel: number;
    descripcion: string;
    puntaje: number;
  }[];
}
```

### 3. Updated Page Component

**Cambios en:** `src/app/evaluaciones/[grado]/[seccion]/[areaId]/[sesionId]/page.tsx`

```typescript
// Agregar estado
const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('directa');

// Agregar selector después del header
<EvaluationTypeSelector
  selectedType={tipoEvaluacion}
  onTypeChange={setTipoEvaluacion}
/>

// Renderizado condicional de tablas
{tipoEvaluacion === 'directa' && (
  <Card>
    <CardContent className="p-0">
      <CalificacionesSesionTable
        estudiantes={estudiantes}
        calificaciones={calificaciones}
        onNotaChange={handleNotaChange}
        changedStudentIds={changedStudentIds}
      />
    </CardContent>
  </Card>
)}

{tipoEvaluacion === 'lista-cotejo' && (
  <PlaceholderContent 
    icon={ClipboardList}
    title="Lista de Cotejo"
    description="Esta funcionalidad estará disponible próximamente"
  />
)}

{tipoEvaluacion === 'rubrica' && (
  <PlaceholderContent 
    icon={Table2}
    title="Rúbrica"
    description="Esta funcionalidad estará disponible próximamente"
  />
)}
```

## Data Models

### Current Model (mantener)
```typescript
// Calificaciones actuales - sin cambios
interface Calificacion {
  estudianteId: string;
  nota: 'AD' | 'A' | 'B' | 'C';
  sesionId: string;
}
```

### Future Models (preparar estructura)
```typescript
// Para Lista de Cotejo
interface CalificacionListaCotejo {
  estudianteId: string;
  sesionId: string;
  items: {
    criterioId: string;
    cumple: boolean;
  }[];
  notaFinal: 'AD' | 'A' | 'B' | 'C'; // Calculada automáticamente
}

// Para Rúbrica
interface CalificacionRubrica {
  estudianteId: string;
  sesionId: string;
  criterios: {
    criterioId: string;
    nivelAlcanzado: number;
    puntaje: number;
  }[];
  puntajeTotal: number;
  notaFinal: 'AD' | 'A' | 'B' | 'C'; // Calculada automáticamente
}
```

## UI/UX Design

### Layout Position

El selector de tipo de evaluación se ubicará:
- **Posición:** Entre el header (título + competencia) y las cards de estadísticas
- **Alineación:** Centrado horizontalmente
- **Espaciado:** `mb-6` para separación visual

### Visual Design

```
┌─────────────────────────────────────────────────────┐
│  [Breadcrumb]                          [Fecha]      │
├─────────────────────────────────────────────────────┤
│  Título de la Sesión                                │
│  Competencia y Capacidades                          │
├─────────────────────────────────────────────────────┤
│           ┌──────────────────────────┐              │
│           │  SELECTOR DE TIPO        │              │
│           │  ┌────┐ ┌────┐ ┌────┐   │              │
│           │  │ ✓  │ │ □  │ │ ≡  │   │              │
│           │  │Dir.│ │List│ │Rub.│   │              │
│           │  └────┘ └────┘ └────┘   │              │
│           └──────────────────────────┘              │
├─────────────────────────────────────────────────────┤
│  [AD] [A] [B] [C] [Pendientes]  (estadísticas)     │
├─────────────────────────────────────────────────────┤
│  Tabla de Calificaciones                            │
└─────────────────────────────────────────────────────┘
```

### Button States

1. **Activo (selected):**
   - Border: `border-2 border-primary`
   - Background: `bg-primary/10`
   - Text: `text-primary font-semibold`

2. **Disponible (hover):**
   - Border: `border border-border`
   - Background: `hover:bg-accent`
   - Text: `text-foreground`

3. **No disponible:**
   - Border: `border border-dashed border-muted`
   - Background: `bg-muted/30`
   - Text: `text-muted-foreground`
   - Badge: "Próximamente" en esquina superior derecha
   - Cursor: `cursor-not-allowed`

## Error Handling

### Validation Rules

1. **Cambio de tipo con datos sin guardar:**
   - Mostrar diálogo de confirmación
   - Opciones: "Guardar y cambiar" | "Descartar y cambiar" | "Cancelar"

2. **Tipo no disponible:**
   - Prevenir selección con `disabled`
   - Mostrar tooltip explicativo
   - No ejecutar `onTypeChange`

3. **Error al cargar datos:**
   - Mantener selector visible
   - Deshabilitar todos los tipos temporalmente
   - Mostrar mensaje de error debajo del selector

### Error Messages

```typescript
const ERROR_MESSAGES = {
  unsavedChanges: 'Tienes cambios sin guardar. ¿Deseas guardarlos antes de cambiar el tipo de evaluación?',
  typeNotAvailable: 'Este tipo de evaluación estará disponible en una próxima actualización',
  loadError: 'No se pudo cargar la información de evaluación. Por favor, intenta nuevamente.'
};
```

## Testing Strategy

### Unit Tests

1. **EvaluationTypeSelector Component:**
   - Renderiza los tres tipos de evaluación
   - Marca correctamente el tipo seleccionado
   - Deshabilita tipos no disponibles
   - Llama `onTypeChange` solo para tipos disponibles
   - Muestra badges "Próximamente" correctamente

2. **Type Switching Logic:**
   - Cambia correctamente entre tipos
   - Preserva estado cuando es posible
   - Maneja transiciones con datos sin guardar

### Integration Tests

1. **Page Component:**
   - Renderiza selector correctamente
   - Muestra tabla apropiada según tipo seleccionado
   - Mantiene funcionalidad existente de evaluación directa
   - Muestra placeholders para tipos no implementados

### Manual Testing Checklist

- [ ] Selector visible y accesible
- [ ] Evaluación Directa funciona como antes
- [ ] Lista de Cotejo muestra placeholder
- [ ] Rúbrica muestra placeholder
- [ ] Responsive en móvil y tablet
- [ ] Tooltips informativos funcionan
- [ ] Estados visuales claros
- [ ] Accesibilidad con teclado

## Implementation Notes

### Phase 1: Infrastructure (Current)
- Crear tipos TypeScript
- Implementar `EvaluationTypeSelector`
- Integrar en página existente
- Mantener funcionalidad actual 100%

### Phase 2: Lista de Cotejo (Future)
- Diseñar modelo de datos
- Crear componente `ListaCotejoTable`
- Implementar lógica de cálculo de nota
- Agregar persistencia

### Phase 3: Rúbrica (Future)
- Diseñar modelo de datos
- Crear componente `RubricaTable`
- Implementar lógica de cálculo de puntaje
- Agregar persistencia

### Code Comments for Future Developers

```typescript
// TODO: Implementar ListaCotejoTable
// Este componente debe:
// - Mostrar lista de criterios configurables
// - Permitir marcar cumple/no cumple por estudiante
// - Calcular nota final automáticamente basado en % de criterios cumplidos
// - Guardar en tabla calificaciones_lista_cotejo

// TODO: Implementar RubricaTable
// Este componente debe:
// - Mostrar matriz de criterios x niveles
// - Permitir seleccionar nivel por criterio por estudiante
// - Calcular puntaje total y nota final
// - Guardar en tabla calificaciones_rubrica
```

## Accessibility Considerations

1. **Keyboard Navigation:**
   - Tab entre botones de tipo
   - Enter/Space para seleccionar
   - Escape para cerrar tooltips

2. **Screen Readers:**
   - Labels descriptivos en botones
   - Anunciar estado seleccionado
   - Anunciar disponibilidad

3. **Visual:**
   - Contraste suficiente en todos los estados
   - Iconos + texto para claridad
   - No depender solo del color

## Performance Considerations

- Selector es componente ligero (< 5KB)
- No afecta rendimiento de tabla existente
- Lazy loading para componentes futuros
- Memoización de callbacks con `useCallback`
