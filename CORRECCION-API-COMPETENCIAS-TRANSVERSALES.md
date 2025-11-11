# ✅ Corrección Final: API de Competencias Transversales

**Fecha:** 10 de noviembre de 2025  
**Prioridad:** 🔴 CRÍTICA (Funcionalidad Bloqueada)

## Problema Identificado

Aunque se agregó el soporte para que los tutores vean "Competencias Transversales" en el selector de áreas, **no podían generar registros auxiliares** porque:

1. La API buscaba competencias por `area_id` en la base de datos
2. Las competencias transversales tienen `area_id = NULL` y `es_transversal = true`
3. El sistema usaba IDs virtuales (`t-primaria`, `t-secundaria`) que no existen en la BD
4. La validación de permisos no reconocía a los tutores como autorizados para competencias transversales

## Estructura en Base de Datos

Las competencias transversales están almacenadas así:

```sql
-- COMPETENCIA TRANSVERSAL 1
INSERT INTO competencias (id, nombre, descripcion, area_id, orden, es_transversal) VALUES
('ct-tic', 'Se desenvuelve en entornos virtuales generados por las TIC', 
 'Interactúa en entornos virtuales y gestiona información digital', NULL, 1, true);

-- COMPETENCIA TRANSVERSAL 2
INSERT INTO competencias (id, nombre, descripcion, area_id, orden, es_transversal) VALUES
('ct-aprendizaje', 'Gestiona su aprendizaje de manera autónoma', 
 'Desarrolla la autonomía en el aprendizaje', NULL, 2, true);
```

**Características:**
- `area_id = NULL` (no pertenecen a un área específica)
- `es_transversal = true` (marcador especial)
- IDs reales: `ct-tic` y `ct-aprendizaje`
- Cada una tiene sus propias capacidades

## Solución Implementada

### 1. Detección de Competencias Transversales

Agregado al inicio de la función para detectar cuando se solicitan competencias transversales:

```typescript
// Detectar si es competencias transversales
const esCompetenciasTransversales = areaId === 't-primaria' || areaId === 't-secundaria';
```

### 2. Query Condicional para Competencias

Modificado el query para buscar competencias transversales cuando corresponda:

```typescript
const [studentsResponse, areaResponse, competenciasResponse] = await Promise.all([
  // ... query de estudiantes ...
  
  // Query de área: si es transversal, usar nombre fijo
  esCompetenciasTransversales
    ? Promise.resolve({ data: { nombre: 'Competencias Transversales' }, error: null })
    : supabaseAdmin
        .from("areas_curriculares")
        .select("nombre")
        .eq("id", areaId)
        .maybeSingle(),
  
  // Query de competencias: si es transversal, buscar por flag
  esCompetenciasTransversales
    ? supabaseAdmin
        .from("competencias")
        .select("id, nombre")
        .eq("es_transversal", true)  // ← Buscar por flag en lugar de area_id
        .order("orden", { ascending: true })
    : supabaseAdmin
        .from("competencias")
        .select("id, nombre")
        .eq("area_id", areaId)
        .order("orden", { ascending: true }),
]);
```

### 3. Validación de Permisos para Tutores

Agregada lógica para validar que los tutores tienen acceso a competencias transversales:

```typescript
// Verificar si tiene asignación directa al área
const hasDirectAssignment = normalizedAssignments.some((assignment) => {
  const gradeMatch = assignment.grado === grado;
  const sectionMatch = assignment.seccion === seccion;
  const areaMatch = assignment.areaId === areaId;
  return gradeMatch && sectionMatch && areaMatch;
});

// Si es competencias transversales, verificar si es tutor de la sección
let hasTutorAccess = false;
if (esCompetenciasTransversales) {
  const { data: tutorAssignments, error: tutorError } = await supabaseAdmin
    .from("asignaciones_docentes")
    .select("rol, grados_secciones (grado, seccion)")
    .eq("personal_id", user.personalId)
    .eq("activo", true)
    .eq("rol", "Docente y Tutor");  // ← Solo tutores
  
  if (!tutorError && tutorAssignments) {
    hasTutorAccess = tutorAssignments.some((assignment) => {
      const group = Array.isArray(assignment.grados_secciones)
        ? assignment.grados_secciones[0]
        : assignment.grados_secciones;
      return group?.grado === grado && group?.seccion === seccion;
    });
  }
}

// Permitir acceso si tiene asignación directa O es tutor (para transversales)
if (!hasDirectAssignment && !hasTutorAccess) {
  return NextResponse.json(
    { message: "No tienes asignaciones para la sección o área solicitada" },
    { status: 403 },
  );
}
```

## Flujo Completo

### Para Tutores

1. **Frontend:** Tutor selecciona "Competencias Transversales" (`t-primaria` o `t-secundaria`)
2. **API:** Detecta que es competencias transversales
3. **Validación:** Verifica que el usuario es tutor de la sección
4. **Query:** Busca competencias con `es_transversal = true`
5. **Resultado:** Obtiene ambas competencias:
   - Gestiona su aprendizaje de manera autónoma
   - Se desenvuelve en entornos virtuales generados por las TIC
6. **Generación:** Crea registro auxiliar con ambas competencias y sus capacidades

### Para Docentes con Áreas

1. **Frontend:** Docente selecciona un área específica (ej: "Matemática")
2. **API:** Detecta que NO es competencias transversales
3. **Validación:** Verifica asignación directa al área
4. **Query:** Busca competencias con `area_id = 'matematica'`
5. **Resultado:** Obtiene competencias del área
6. **Generación:** Crea registro auxiliar del área

## Mapeo de IDs

| ID Frontend | Búsqueda en BD | Competencias Obtenidas |
|-------------|----------------|------------------------|
| `t-primaria` | `es_transversal = true` | `ct-tic`, `ct-aprendizaje` |
| `t-secundaria` | `es_transversal = true` | `ct-tic`, `ct-aprendizaje` |
| `matematica` | `area_id = 'matematica'` | Competencias de Matemática |
| `comunicacion` | `area_id = 'comunicacion'` | Competencias de Comunicación |

**Nota:** `t-primaria` y `t-secundaria` son IDs virtuales usados solo en el frontend para diferenciar el nivel, pero ambos buscan las mismas competencias transversales en la BD.

## Archivos Modificados

1. **`src/app/api/registros/registro-auxiliar/route.ts`**
   - Agregada detección de competencias transversales
   - Query condicional para área y competencias
   - Validación de permisos para tutores
   - Soporte para `es_transversal = true`

## Testing Recomendado

### Como Tutor - Generar Registro Auxiliar
1. ✅ Login como docente tutor
2. ✅ Ir a `/registros`
3. ✅ Seleccionar grado y sección donde es tutor
4. ✅ Seleccionar "Competencias Transversales" en el selector de áreas
5. ✅ Hacer clic en "Descargar" → "Registro Auxiliar (Excel)"
6. ✅ Verificar que el archivo se descarga correctamente
7. ✅ Abrir el archivo y verificar que contiene:
   - Ambas competencias transversales
   - Capacidades de cada competencia
   - Lista de estudiantes

### Como Tutor - Generar PDF
1. ✅ Repetir pasos 1-4 anteriores
2. ✅ Hacer clic en "Descargar" → "Registro Auxiliar (PDF)"
3. ✅ Verificar que el PDF se genera correctamente
4. ✅ Verificar que contiene ambas competencias y capacidades

### Como Docente No Tutor
1. ✅ Login como docente sin tutoría
2. ✅ Ir a `/registros`
3. ✅ Verificar que NO aparece "Competencias Transversales"
4. ✅ Solo aparecen áreas asignadas

### Validación de Permisos
1. ✅ Intentar acceder a competencias transversales sin ser tutor
2. ✅ Verificar que retorna error 403
3. ✅ Mensaje: "No tienes asignaciones para la sección o área solicitada"

## Beneficios

### Funcionalidad
- ✅ Tutores pueden generar registros de competencias transversales
- ✅ Ambas competencias se incluyen automáticamente
- ✅ Capacidades específicas de cada competencia

### Seguridad
- ✅ Solo tutores pueden acceder a competencias transversales
- ✅ Validación en backend (no solo frontend)
- ✅ Mensajes de error claros

### Mantenimiento
- ✅ Usa datos reales de la base de datos
- ✅ No depende de mocks o datos hardcodeados
- ✅ Fácil de extender con nuevas competencias transversales

## Estructura del Registro Auxiliar Generado

El registro auxiliar de competencias transversales incluye:

```
┌─────────────────────────────────────────────────────────────┐
│ REGISTRO AUXILIAR - COMPETENCIAS TRANSVERSALES              │
│ Grado: 3er Grado | Sección: A | Año: 2025                  │
├─────────────────────────────────────────────────────────────┤
│ N° │ Apellidos y Nombres │ Gestiona su aprendizaje │ ...  │
│    │                     ├─────────────────────────┤      │
│    │                     │ Define metas            │      │
│    │                     │ Organiza acciones       │      │
│    │                     │ Monitorea y ajusta      │      │
│    │                     │ Nivel de logro          │      │
│    │                     ├─────────────────────────┤      │
│    │                     │ Se desenvuelve en TIC   │      │
│    │                     ├─────────────────────────┤      │
│    │                     │ Personaliza entornos    │      │
│    │                     │ Gestiona información    │      │
│    │                     │ Interactúa en entornos  │      │
│    │                     │ Crea objetos virtuales  │      │
│    │                     │ Nivel de logro          │      │
└─────────────────────────────────────────────────────────────┘
```

## Notas Importantes

1. **IDs Virtuales:** `t-primaria` y `t-secundaria` son solo para el frontend. En la BD se busca por `es_transversal = true`.

2. **Mismo Contenido:** Tanto primaria como secundaria obtienen las mismas competencias transversales. La diferencia es solo organizativa en el frontend.

3. **Capacidades Incluidas:** Cada competencia transversal tiene sus propias capacidades que se incluyen automáticamente en el registro.

4. **Compatibilidad:** Los cambios son compatibles con áreas regulares. El sistema detecta automáticamente qué tipo de área es.

## Próximos Pasos

1. ⏳ Aplicar la misma lógica a la API de nómina si es necesario
2. ⏳ Agregar tests automatizados para competencias transversales
3. ⏳ Documentar en el manual de usuario
4. ⏳ Considerar agregar más competencias transversales en el futuro

## Impacto en Producción

- **Riesgo:** Bajo (solo agrega funcionalidad)
- **Urgencia:** Crítica (funcionalidad bloqueada para tutores)
- **Rollback:** Fácil (revertir commits)
- **Testing:** **OBLIGATORIO** antes de deploy
- **Dependencias:** Requiere que las competencias transversales estén en la BD (archivo `CURRICULO-05-TRANSVERSALES.sql`)
