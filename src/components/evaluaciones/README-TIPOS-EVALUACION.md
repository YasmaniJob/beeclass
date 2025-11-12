# Guía de Implementación: Tipos de Evaluación

## Resumen

Este documento proporciona una guía completa para implementar los tipos de evaluación pendientes: **Lista de Cotejo** y **Rúbrica**.

## Arquitectura Actual

### Componentes Implementados

1. **EvaluationTypeSelector** (`evaluation-type-selector.tsx`)
   - Selector visual de tipos de evaluación
   - Soporta 3 tipos: Directa, Lista de Cotejo, Rúbrica
   - Actualmente solo "Directa" está habilitado

2. **CalificacionesSesionTable** (`calificaciones-sesion-table.tsx`)
   - Tabla para evaluación directa (AD, A, B, C)
   - Completamente funcional

3. **Tipos TypeScript** (`src/types/evaluacion.ts`)
   - Definiciones de tipos para todos los métodos de evaluación
   - Interfaces placeholder para Lista de Cotejo y Rúbrica

4. **Hook de Datos** (`src/hooks/use-calificaciones-sesion.ts`)
   - Gestiona carga y guardado de calificaciones
   - Actualmente solo soporta evaluación directa
   - Necesita extensión para otros tipos

## Implementación de Lista de Cotejo

### 1. Crear Componente ListaCotejoTable

**Ubicación:** `src/components/evaluaciones/lista-cotejo-table.tsx`

**Props Interface:**
```typescript
interface ListaCotejoTableProps {
  estudiantes: Estudiante[];
  calificaciones: Record<string, CalificacionListaCotejo>;
  criterios: ListaCotejoItem[];
  onItemChange: (estudianteId: string, criterioId: string, cumple: boolean) => void;
  changedStudentIds: Set<string>;
}
```

**Estructura de la Tabla:**
- **Columnas:** Nombre del estudiante + una columna por cada criterio + Nota Final
- **Filas:** Un estudiante por fila
- **Celdas de criterios:** Checkbox para marcar cumple/no cumple
- **Celda de nota:** Calculada automáticamente, solo lectura

**Lógica de Cálculo de Nota:**
```typescript
function calcularNotaListaCotejo(items: { cumple: boolean }[]): NotaCualitativa {
  const cumplidos = items.filter(i => i.cumple).length;
  const porcentaje = (cumplidos / items.length) * 100;
  
  if (porcentaje >= 90) return 'AD';
  if (porcentaje >= 75) return 'A';
  if (porcentaje >= 60) return 'B';
  return 'C';
}
```

**Características UI:**
- Resaltar filas con cambios sin guardar (usar `changedStudentIds`)
- Tooltips en headers de criterios con descripciones completas
- Indicador visual del porcentaje de cumplimiento
- Responsive: considerar scroll horizontal en móviles

### 2. Extender Hook useCalificacionesSesion

**Agregar al hook:**
```typescript
// Nuevo estado
const [calificacionesListaCotejo, setCalificacionesListaCotejo] = 
  useState<Record<string, CalificacionListaCotejo>>({});
const [criteriosListaCotejo, setCriteriosListaCotejo] = 
  useState<ListaCotejoItem[]>([]);

// Nuevo handler
const handleListaCotejoChange = useCallback(
  (estudianteId: string, criterioId: string, cumple: boolean) => {
    setCalificacionesListaCotejo(prev => {
      const current = prev[estudianteId] || { 
        estudianteId, 
        sesionId, 
        items: [], 
        notaFinal: 'C' 
      };
      
      const updatedItems = current.items.map(item =>
        item.criterioId === criterioId ? { ...item, cumple } : item
      );
      
      const notaFinal = calcularNotaListaCotejo(updatedItems);
      
      return {
        ...prev,
        [estudianteId]: { ...current, items: updatedItems, notaFinal }
      };
    });
    
    setChangedStudentIds(prev => new Set(prev).add(estudianteId));
  },
  [sesionId]
);
```

### 3. Crear Tabla en Base de Datos

**SQL para Supabase:**
```sql
-- Tabla de criterios de lista de cotejo por sesión
CREATE TABLE criterios_lista_cotejo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id TEXT NOT NULL REFERENCES sesiones_aprendizaje(id),
  criterio TEXT NOT NULL,
  orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de calificaciones con lista de cotejo
CREATE TABLE calificaciones_lista_cotejo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id TEXT NOT NULL,
  sesion_id TEXT NOT NULL REFERENCES sesiones_aprendizaje(id),
  items JSONB NOT NULL, -- Array de { criterioId, cumple }
  nota_final TEXT NOT NULL CHECK (nota_final IN ('AD', 'A', 'B', 'C')),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, sesion_id)
);

-- Índices
CREATE INDEX idx_criterios_lista_cotejo_sesion 
  ON criterios_lista_cotejo(sesion_id);
CREATE INDEX idx_calificaciones_lista_cotejo_sesion 
  ON calificaciones_lista_cotejo(sesion_id);
```

### 4. Integrar en la Página

**En `page.tsx`, reemplazar el placeholder:**
```typescript
{tipoEvaluacion === 'lista-cotejo' && (
  <Card>
    <CardContent className="p-0">
      <ListaCotejoTable
        estudiantes={estudiantes}
        calificaciones={calificacionesListaCotejo}
        criterios={criteriosListaCotejo}
        onItemChange={handleListaCotejoChange}
        changedStudentIds={changedStudentIds}
      />
    </CardContent>
  </Card>
)}
```

### 5. Habilitar en el Selector

**En `evaluation-type-selector.tsx`:**
```typescript
{
  id: 'lista-cotejo',
  label: 'Lista de Cotejo',
  icon: ClipboardList,
  description: 'Criterios de logro',
  available: true, // Cambiar de false a true
}
```

## Implementación de Rúbrica

### 1. Crear Componente RubricaTable

**Ubicación:** `src/components/evaluaciones/rubrica-table.tsx`

**Props Interface:**
```typescript
interface RubricaTableProps {
  estudiantes: Estudiante[];
  calificaciones: Record<string, CalificacionRubrica>;
  criterios: RubricaCriterio[];
  onNivelChange: (estudianteId: string, criterioId: string, nivel: number) => void;
  changedStudentIds: Set<string>;
}
```

**Estructura de la Tabla:**
- **Columnas:** Nombre + una columna por criterio + Puntaje Total + Nota Final
- **Filas:** Un estudiante por fila
- **Celdas de criterios:** Select/Dropdown con los niveles disponibles
- **Celda de puntaje:** Suma automática, solo lectura
- **Celda de nota:** Calculada automáticamente, solo lectura

**Lógica de Cálculo:**
```typescript
function calcularNotaRubrica(
  puntajeObtenido: number, 
  puntajeMaximo: number
): NotaCualitativa {
  const porcentaje = (puntajeObtenido / puntajeMaximo) * 100;
  
  if (porcentaje >= 90) return 'AD';
  if (porcentaje >= 70) return 'A';
  if (porcentaje >= 55) return 'B';
  return 'C';
}

function calcularPuntajeTotal(
  criterios: { nivelAlcanzado: number; puntaje: number }[]
): number {
  return criterios.reduce((sum, c) => sum + c.puntaje, 0);
}
```

**Características UI:**
- Mostrar descripción del nivel en tooltip al hacer hover
- Indicador visual del puntaje (barra de progreso)
- Resaltar filas con cambios sin guardar
- Color coding por nivel de desempeño

### 2. Extender Hook useCalificacionesSesion

**Agregar al hook:**
```typescript
// Nuevo estado
const [calificacionesRubrica, setCalificacionesRubrica] = 
  useState<Record<string, CalificacionRubrica>>({});
const [criteriosRubrica, setCriteriosRubrica] = 
  useState<RubricaCriterio[]>([]);

// Nuevo handler
const handleRubricaChange = useCallback(
  (estudianteId: string, criterioId: string, nivel: number) => {
    setCalificacionesRubrica(prev => {
      const current = prev[estudianteId] || { 
        estudianteId, 
        sesionId, 
        criterios: [], 
        puntajeTotal: 0,
        notaFinal: 'C' 
      };
      
      // Encontrar el puntaje del nivel seleccionado
      const criterio = criteriosRubrica.find(c => c.id === criterioId);
      const nivelData = criterio?.niveles.find(n => n.nivel === nivel);
      const puntaje = nivelData?.puntaje || 0;
      
      const updatedCriterios = current.criterios.map(c =>
        c.criterioId === criterioId 
          ? { ...c, nivelAlcanzado: nivel, puntaje } 
          : c
      );
      
      const puntajeTotal = calcularPuntajeTotal(updatedCriterios);
      const puntajeMaximo = calcularPuntajeMaximo(criteriosRubrica);
      const notaFinal = calcularNotaRubrica(puntajeTotal, puntajeMaximo);
      
      return {
        ...prev,
        [estudianteId]: { 
          ...current, 
          criterios: updatedCriterios, 
          puntajeTotal,
          notaFinal 
        }
      };
    });
    
    setChangedStudentIds(prev => new Set(prev).add(estudianteId));
  },
  [sesionId, criteriosRubrica]
);
```

### 3. Crear Tablas en Base de Datos

**SQL para Supabase:**
```sql
-- Tabla de criterios de rúbrica por sesión
CREATE TABLE criterios_rubrica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id TEXT NOT NULL REFERENCES sesiones_aprendizaje(id),
  nombre TEXT NOT NULL,
  niveles JSONB NOT NULL, -- Array de { nivel, descripcion, puntaje }
  orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de calificaciones con rúbrica
CREATE TABLE calificaciones_rubrica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id TEXT NOT NULL,
  sesion_id TEXT NOT NULL REFERENCES sesiones_aprendizaje(id),
  criterios JSONB NOT NULL, -- Array de { criterioId, nivelAlcanzado, puntaje }
  puntaje_total INTEGER NOT NULL,
  nota_final TEXT NOT NULL CHECK (nota_final IN ('AD', 'A', 'B', 'C')),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, sesion_id)
);

-- Índices
CREATE INDEX idx_criterios_rubrica_sesion 
  ON criterios_rubrica(sesion_id);
CREATE INDEX idx_calificaciones_rubrica_sesion 
  ON calificaciones_rubrica(sesion_id);
```

### 4. Integrar en la Página

**En `page.tsx`, reemplazar el placeholder:**
```typescript
{tipoEvaluacion === 'rubrica' && (
  <Card>
    <CardContent className="p-0">
      <RubricaTable
        estudiantes={estudiantes}
        calificaciones={calificacionesRubrica}
        criterios={criteriosRubrica}
        onNivelChange={handleRubricaChange}
        changedStudentIds={changedStudentIds}
      />
    </CardContent>
  </Card>
)}
```

### 5. Habilitar en el Selector

**En `evaluation-type-selector.tsx`:**
```typescript
{
  id: 'rubrica',
  label: 'Rúbrica',
  icon: Table2,
  description: 'Niveles de desempeño',
  available: true, // Cambiar de false a true
}
```

## Consideraciones Adicionales

### Gestión de Criterios

Ambos tipos de evaluación requieren que los docentes configuren criterios por sesión:

1. **Crear UI de Configuración:**
   - Agregar botón "Configurar Criterios" en la página de sesión
   - Modal o página separada para gestionar criterios
   - Permitir agregar, editar, eliminar y reordenar criterios

2. **Validaciones:**
   - Mínimo 3 criterios para lista de cotejo
   - Mínimo 2 criterios para rúbrica
   - Cada criterio de rúbrica debe tener al menos 2 niveles

### Migración de Datos

Si existen calificaciones directas previas:
- Mantener ambos sistemas en paralelo
- No intentar convertir automáticamente entre tipos
- Permitir al docente elegir el tipo por sesión

### Testing

**Tests Unitarios:**
- Funciones de cálculo de notas
- Lógica de actualización de estado
- Validaciones de datos

**Tests de Integración:**
- Flujo completo de calificación
- Guardado y carga de datos
- Cambio entre tipos de evaluación

**Tests E2E:**
- Calificar estudiantes con lista de cotejo
- Calificar estudiantes con rúbrica
- Guardar y verificar persistencia

## Referencias

- **Diseño Completo:** `.kiro/specs/tipos-evaluacion/design.md`
- **Requisitos:** `.kiro/specs/tipos-evaluacion/requirements.md`
- **Tareas:** `.kiro/specs/tipos-evaluacion/tasks.md`
- **Tipos:** `src/types/evaluacion.ts`
- **Hook Principal:** `src/hooks/use-calificaciones-sesion.ts`
- **Página Principal:** `src/app/evaluaciones/[grado]/[seccion]/[areaId]/[sesionId]/page.tsx`

## Orden de Implementación Sugerido

1. **Lista de Cotejo** (más simple)
   - Implementar tabla de base de datos
   - Crear componente ListaCotejoTable
   - Extender hook
   - Crear UI de configuración de criterios
   - Testing

2. **Rúbrica** (más compleja)
   - Implementar tablas de base de datos
   - Crear componente RubricaTable
   - Extender hook
   - Crear UI de configuración de criterios y niveles
   - Testing

3. **Refinamiento**
   - Mejorar UX basado en feedback
   - Optimizar rendimiento
   - Agregar features adicionales (exportar, reportes, etc.)
