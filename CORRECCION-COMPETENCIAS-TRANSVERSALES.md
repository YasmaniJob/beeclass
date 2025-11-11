# ✅ Corrección: Competencias Transversales para Tutores

**Fecha:** 10 de noviembre de 2025  
**Prioridad:** 🟡 ALTA (Funcionalidad Core)

## Problema Identificado

Cuando un docente tiene asignada **tutoría** (rol "Docente y Tutor"), el sistema no le daba acceso automático a las **Competencias Transversales**, lo que resultaba en:

1. El docente tutor no podía generar registros auxiliares para competencias transversales
2. El sistema mostraba todas las áreas en lugar de solo las asignadas + competencias transversales
3. Inconsistencia con la lógica educativa: los tutores DEBEN evaluar competencias transversales

## Competencias Transversales

Las competencias transversales son obligatorias para todos los tutores y consisten en:

### Primaria (`t-primaria`)
1. **Gestiona su aprendizaje de manera autónoma**
2. **Se desenvuelve en entornos virtuales generados por las TIC**

### Secundaria (`t-secundaria`)
1. **Gestiona su aprendizaje de manera autónoma**
2. **Se desenvuelve en entornos virtuales generados por las TIC**

## Solución Implementada

### 1. Detección Automática de Tutores

Modificado `assignedAreaIds` para detectar si el docente es tutor en la sección seleccionada:

```typescript
const assignedAreaIds = useMemo(() => {
  const targetUser = isPrivileged && selectedDocente ? selectedDocente : user;
  
  if (!targetUser?.asignaciones?.length) {
    return [] as string[];
  }

  const areaIds = new Set<string>();
  
  // Verificar si el docente es tutor en el grado/sección seleccionado
  const esTutorEnSeccion = targetUser.asignaciones.some((assignment) => {
    const matchesGrado = !grado || assignment.grado === grado;
    const matchesSeccion = !seccion || assignment.seccion === seccion;
    return matchesGrado && matchesSeccion && assignment.rol === 'Docente y Tutor';
  });
  
  // Si es tutor, agregar competencias transversales automáticamente
  if (esTutorEnSeccion) {
    const nivelTransversal = grado?.toLowerCase().includes('secundaria') || 
                             parseInt(grado?.match(/\d+/)?.[0] || '0') > 6
      ? 't-secundaria'
      : 't-primaria';
    areaIds.add(nivelTransversal);
  }
  
  // Agregar áreas asignadas explícitamente
  targetUser.asignaciones.forEach((assignment) => {
    if (!assignment.areaId) return;
    const matchesGrado = !grado || assignment.grado === grado;
    const matchesSeccion = !seccion || assignment.seccion === seccion;
    if (matchesGrado && matchesSeccion) {
      areaIds.add(assignment.areaId);
    }
  });

  return Array.from(areaIds);
}, [user, selectedDocente, isPrivileged, grado, seccion]);
```

### 2. Inclusión de Competencias Transversales en Opciones

Modificado `todasLasAreasDelSistema` para incluir competencias transversales:

```typescript
const competenciasTransversales = useMemo(() => {
  if (!grado) return null;
  
  const esSecundaria = grado?.toLowerCase().includes('secundaria') || 
                       parseInt(grado?.match(/\d+/)?.[0] || '0') > 6;
  
  return {
    id: esSecundaria ? 't-secundaria' : 't-primaria',
    nombre: 'Competencias Transversales'
  };
}, [grado]);

// Agregar competencias transversales a las áreas del sistema
if (competenciasTransversales) {
  areasUnicas.set(competenciasTransversales.id, competenciasTransversales);
}
```

### 3. Filtrado Mejorado de Áreas

Actualizado `filterAreasByGrado` para incluir competencias transversales cuando estén en los IDs permitidos:

```typescript
function filterAreasByGrado(
  areasPorGrado: Record<string, Array<{ id?: string | null; nombre?: string | null }>>,
  grado?: string,
  allowedIds?: string[],
): SelectOption[] {
  if (!grado) return [];
  const allowedSet = allowedIds && allowedIds.length > 0 ? new Set(allowedIds) : undefined;

  const options: SelectOption[] = [];
  
  // Agregar áreas regulares del grado
  (areasPorGrado[grado] || []).forEach((area) => {
    // ... lógica existente ...
  });
  
  // Si hay competencias transversales en los IDs permitidos, agregarlas
  if (allowedSet) {
    const esSecundaria = grado?.toLowerCase().includes('secundaria') || 
                         parseInt(grado?.match(/\d+/)?.[0] || '0') > 6;
    const transversalId = esSecundaria ? 't-secundaria' : 't-primaria';
    
    if (allowedSet.has(transversalId)) {
      options.push({
        value: transversalId,
        label: 'Competencias Transversales'
      });
    }
  }
  
  return options.sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
```

## Lógica de Asignación

### Para Tutores

| Condición | Áreas Visibles |
|-----------|----------------|
| Tutor de Primaria | ✅ Áreas asignadas + Competencias Transversales (Primaria) |
| Tutor de Secundaria | ✅ Áreas asignadas + Competencias Transversales (Secundaria) |
| Tutor sin áreas | ✅ Solo Competencias Transversales |

### Para Docentes (No Tutores)

| Condición | Áreas Visibles |
|-----------|----------------|
| Con áreas asignadas | ✅ Solo áreas asignadas |
| Sin áreas asignadas | ❌ Ninguna área |

### Para Administradores

| Condición | Áreas Visibles |
|-----------|----------------|
| Sin docente seleccionado | ✅ Todas las áreas + Competencias Transversales |
| Con docente seleccionado | ✅ Áreas del docente + Competencias Transversales (si es tutor) |

## Determinación del Nivel

El sistema determina automáticamente si usar competencias transversales de Primaria o Secundaria:

```typescript
const esSecundaria = grado?.toLowerCase().includes('secundaria') || 
                     parseInt(grado?.match(/\d+/)?.[0] || '0') > 6;

const transversalId = esSecundaria ? 't-secundaria' : 't-primaria';
```

**Reglas:**
- Grados 1-6: Competencias Transversales de Primaria (`t-primaria`)
- Grados 7+ o que contengan "secundaria": Competencias Transversales de Secundaria (`t-secundaria`)

## Archivos Modificados

1. **`src/app/registros/page.tsx`**
   - Agregada detección automática de tutores
   - Inclusión automática de competencias transversales para tutores
   - Actualizada función `filterAreasByGrado`
   - Agregado `competenciasTransversales` memo

## Casos de Uso

### Caso 1: Docente Tutor con Áreas
**Escenario:** Docente es tutor de 3er Grado A y también enseña Matemática

**Resultado:**
- ✅ Matemática (asignada explícitamente)
- ✅ Competencias Transversales (automático por ser tutor)

### Caso 2: Docente Tutor sin Áreas
**Escenario:** Docente es solo tutor de 5to Grado B

**Resultado:**
- ✅ Competencias Transversales (automático por ser tutor)

### Caso 3: Docente No Tutor
**Escenario:** Docente enseña Comunicación en 2do Grado C

**Resultado:**
- ✅ Comunicación (asignada explícitamente)
- ❌ NO Competencias Transversales (no es tutor)

### Caso 4: Admin Selecciona Tutor
**Escenario:** Admin selecciona un docente tutor para generar reportes

**Resultado:**
- ✅ Áreas del docente
- ✅ Competencias Transversales (automático)

## Testing Recomendado

### Como Tutor de Primaria
1. ✅ Login como docente tutor de primaria
2. ✅ Ir a `/registros`
3. ✅ Seleccionar grado y sección donde es tutor
4. ✅ Verificar que aparece "Competencias Transversales" en el selector de áreas
5. ✅ Generar registro auxiliar de competencias transversales

### Como Tutor de Secundaria
1. ✅ Login como docente tutor de secundaria
2. ✅ Ir a `/registros`
3. ✅ Seleccionar grado y sección donde es tutor
4. ✅ Verificar que aparece "Competencias Transversales" en el selector de áreas
5. ✅ Generar registro auxiliar de competencias transversales

### Como Docente No Tutor
1. ✅ Login como docente sin tutoría
2. ✅ Ir a `/registros`
3. ✅ Verificar que NO aparecen competencias transversales
4. ✅ Solo aparecen áreas asignadas

### Como Admin
1. ✅ Login como admin
2. ✅ Ir a `/registros`
3. ✅ Verificar que aparecen todas las áreas + competencias transversales
4. ✅ Seleccionar un docente tutor
5. ✅ Verificar que aparecen sus áreas + competencias transversales

## Beneficios

### Funcionalidad
- ✅ Tutores pueden generar registros de competencias transversales
- ✅ Asignación automática según rol
- ✅ Consistencia con lógica educativa

### UX
- ✅ No requiere asignación manual de competencias transversales
- ✅ Menos configuración para administradores
- ✅ Interfaz más intuitiva

### Mantenimiento
- ✅ Lógica centralizada y reutilizable
- ✅ Fácil de extender a otras páginas
- ✅ Código más limpio y mantenible

## Notas Importantes

1. **Competencias transversales excluidas de `areasPorGrado`:** Las competencias transversales se excluyen intencionalmente de `areasPorGrado` en `use-matricula-data.tsx` para evitar duplicados. Se agregan dinámicamente cuando es necesario.

2. **Detección de nivel:** El sistema detecta automáticamente si usar competencias de primaria o secundaria basándose en el grado.

3. **Compatibilidad:** Los cambios son compatibles con el código existente y no afectan otras funcionalidades.

4. **Evaluaciones:** La página `/evaluaciones/transversal` ya maneja correctamente las competencias transversales.

## Próximos Pasos

1. ⏳ Aplicar la misma lógica a otras páginas que necesiten competencias transversales
2. ⏳ Agregar tests automatizados para validar la asignación automática
3. ⏳ Documentar en el manual de usuario
4. ⏳ Considerar agregar indicador visual cuando se muestran competencias transversales

## Impacto en Producción

- **Riesgo:** Bajo (solo agrega funcionalidad)
- **Urgencia:** Alta (funcionalidad core para tutores)
- **Rollback:** Fácil (revertir commits)
- **Testing:** Recomendado antes de deploy
