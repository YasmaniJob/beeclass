# Design Document

## Overview

La solución consiste en eliminar los filtros que excluyen las Competencias Transversales del array `allAreas` en el hook `use-matricula-data`. Esto permitirá que las competencias transversales estén disponibles para todos los componentes que las necesiten, especialmente el panel de docentes.

## Root Cause Analysis

El problema tiene dos causas principales:

1. **Filtro en `areasPorGrado` (línea 237)**: Excluye explícitamente `'Competencias Transversales'` al construir el objeto `areasPorGrado`
2. **Filtro en `allAreas`**: Aunque no hay un filtro explícito adicional, el array `allAreas` hereda el mismo conjunto filtrado de `areas`

El resultado es que `allAreas` no contiene las competencias transversales, causando que `todasLasAreasTransversales: []` en los logs del navegador.

## Architecture

### Current Flow (Broken)
```
Supabase → supAreas → areas (filtered by nivel) → allAreas (missing transversales)
                                                 ↓
                                          areasPorGrado (explicitly excludes transversales)
```

### Proposed Flow (Fixed)
```
Supabase → supAreas → areas (filtered by nivel only) → allAreas (includes transversales)
                                                      ↓
                                               areasPorGrado (excludes transversales for specific grades)
```

## Components and Interfaces

### Modified Component: `use-matricula-data.tsx`

**Changes Required:**

1. **Keep `allAreas` complete**: Remove any filtering of Competencias Transversales from the main `areas` array
2. **Filter only `areasPorGrado`**: Keep the exclusion of Competencias Transversales only in `areasPorGrado` since these are grade-specific assignments
3. **Add documentation**: Explain why transversales are excluded from `areasPorGrado` but included in `allAreas`

### Affected Component: `src/app/docentes/mis-clases/page.tsx`

**No changes required** - The component already has the correct logic to:
- Search for transversal areas in `allAreas`
- Display them when docente has assigned areas OR is a tutor
- Create individual cards for each transversal competency

## Data Models

### AreaCurricular Interface
```typescript
interface AreaCurricular {
  id: string;
  nombre: string;
  nivel: Nivel;
  competencias: Competencia[];
  // ... other fields
}
```

**Key Distinction:**
- `allAreas`: Contains ALL areas including Competencias Transversales (for global access)
- `areasPorGrado`: Contains only grade-specific areas, excluding Competencias Transversales (for grade-specific assignments)

## Implementation Strategy

### Step 1: Remove Transversal Filter from areasPorGrado
```typescript
// BEFORE (line 237)
newAreasPorGrado[grado] = areas.filter((a: AreaCurricular) => {
    const areaNivel = (a.nivel as Nivel | undefined) ?? inferNivelFromGrado(grado);
    return areaNivel === nivel && a.nombre !== 'Competencias Transversales';
});

// AFTER
newAreasPorGrado[grado] = areas.filter((a: AreaCurricular) => {
    const areaNivel = (a.nivel as Nivel | undefined) ?? inferNivelFromGrado(grado);
    // Excluir Competencias Transversales de areasPorGrado porque se manejan globalmente
    // y no se asignan a grados específicos
    return areaNivel === nivel && a.nombre !== 'Competencias Transversales';
});
```

**Note**: We keep this filter because `areasPorGrado` is used for grade-specific area assignments, and transversal competencies are not assigned to specific grades.

### Step 2: Ensure allAreas Includes Transversales
```typescript
// Line 220 - Keep as is, only filter by nivel
const areas = supabaseReady
  ? (supAreas || []).filter(area => (area.nivel as Nivel | undefined) === nivelInstitucion)
  : [];

// Line 260 - Ensure allAreas gets the complete areas array
allAreas: areas, // This will now include Competencias Transversales
```

### Step 3: Add Documentation Comments
Add clear comments explaining:
- Why `allAreas` includes transversales
- Why `areasPorGrado` excludes transversales
- How components should access transversal competencies

## Error Handling

### Scenario 1: Competencias Transversales Not in Database
- **Detection**: `allAreas.filter(a => a.nombre.includes('transversal')).length === 0`
- **Handling**: Component will gracefully not show transversal cards (existing behavior)
- **User Impact**: No error, just missing functionality

### Scenario 2: Wrong Nivel for Transversales
- **Detection**: Transversal area exists but nivel doesn't match institution
- **Handling**: Filter by `nivelInstitucion` will exclude it
- **User Impact**: Correct behavior - only show transversales for current nivel

### Scenario 3: Multiple Transversal Areas
- **Detection**: Multiple areas with "transversal" in name
- **Handling**: Component will show all matching areas
- **User Impact**: All transversal competencies displayed (correct behavior)

## Testing Strategy

### Unit Tests (Optional)
- Test that `allAreas` includes Competencias Transversales when present in supAreas
- Test that `areasPorGrado` excludes Competencias Transversales
- Test nivel filtering works correctly for transversales

### Integration Tests
1. **Test Case 1**: Docente with assigned areas sees transversal competencies
   - Setup: Docente with 1+ area assignments
   - Expected: Transversal competency cards visible
   
2. **Test Case 2**: Docente without areas but is tutor sees transversals
   - Setup: Docente with tutor role, no area assignments
   - Expected: Transversal competency cards visible

3. **Test Case 3**: Correct nivel transversales shown
   - Setup: Institution nivel = Secundaria
   - Expected: Only Secundaria transversal competencies shown

### Manual Testing
1. Check browser console logs show `todasLasAreasTransversales` with items
2. Verify transversal cards appear in docente panel
3. Confirm clicking transversal card navigates to calification page
4. Verify transversals only show for docentes with areas OR tutors

## Performance Considerations

- **Impact**: Minimal - only adds 1-2 items to `allAreas` array
- **Memory**: Negligible increase (~few KB per transversal area)
- **Rendering**: No impact - cards already conditionally rendered

## Migration Notes

- **Database**: No changes required
- **Backwards Compatibility**: Fully compatible - only changes internal filtering logic
- **Rollback**: Simple - revert the filter removal if issues arise
