# 🎯 Plan de Finalización - Inkuña
## Objetivo: Aplicación 100% Funcional con Datos Reales

---

## 📊 ESTADO ACTUAL

### ✅ Completado (40%):
- ✅ Infraestructura Supabase (100%)
- ✅ Infraestructura Google Sheets (100%)
- ✅ 4 páginas migradas a Supabase
- ✅ API de asistencias funcionando
- ✅ Hooks personalizados creados

### ⏳ Pendiente (60%):
- ⏳ 11 páginas usando datos mock
- ⏳ Componentes de asistencia sin integrar
- ⏳ Autenticación con localStorage
- ⏳ CRUD incompleto en varias páginas

---

## 🗺️ ROADMAP COMPLETO

### FASE 1: ASISTENCIAS (Prioridad CRÍTICA) 🔴
**Tiempo estimado:** 3-4 horas  
**Impacto:** Alto - Funcionalidad principal

#### 1.1 Integrar useAsistencias en la UI
- [ ] Actualizar `/asistencia/estudiantes/[grado]/[seccion]/page.tsx`
- [ ] Reemplazar localStorage por Google Sheets
- [ ] Implementar guardado individual
- [ ] Implementar guardado masivo (toda la sección)
- [ ] Agregar indicadores de guardado
- [ ] Manejo de errores y reintentos

#### 1.2 Historial de Asistencias
- [ ] Crear página `/asistencia/historial`
- [ ] Mostrar asistencias por fecha
- [ ] Filtros por grado, sección, estudiante
- [ ] Exportar a Excel/PDF
- [ ] Estadísticas básicas (% asistencia)

#### 1.3 Reportes de Asistencia
- [ ] Crear página `/reportes/asistencia`
- [ ] Reporte mensual por estudiante
- [ ] Reporte por grado/sección
- [ ] Gráficos de tendencias
- [ ] Alertas de inasistencias frecuentes

**Archivos a modificar:**
```
src/app/asistencia/estudiantes/[grado]/[seccion]/page.tsx
src/app/asistencia/historial/page.tsx (nuevo)
src/app/reportes/asistencia/page.tsx (actualizar)
src/components/asistencia/* (varios)
```

---

### FASE 2: ESTUDIANTES COMPLETO 🟡
**Tiempo estimado:** 2-3 horas  
**Impacto:** Medio - Gestión de datos maestros

#### 2.1 CRUD Completo de Estudiantes
- [ ] Crear repositorio Supabase para estudiantes
- [ ] Implementar `addEstudiante()`
- [ ] Implementar `updateEstudiante()`
- [ ] Implementar `deleteEstudiante()` (soft delete)
- [ ] Formularios de creación/edición
- [ ] Validaciones con Zod

#### 2.2 Importación Masiva
- [ ] Mantener importación desde Excel
- [ ] Guardar en Supabase en lugar de memoria
- [ ] Validación de datos
- [ ] Preview antes de importar
- [ ] Manejo de duplicados

#### 2.3 Páginas de Detalle
- [ ] Actualizar `/estudiantes/[grado]/[seccion]/page.tsx`
- [ ] Usar datos de Supabase
- [ ] Mostrar historial de asistencias
- [ ] Mostrar evaluaciones
- [ ] Mostrar incidentes

**Archivos a modificar:**
```
src/infrastructure/repositories/supabase/SupabaseEstudiantesRepository.ts (nuevo)
src/app/estudiantes/page.tsx
src/app/estudiantes/[grado]/[seccion]/page.tsx
src/components/estudiantes/* (varios)
```

---

### FASE 3: EVALUACIONES 🟡
**Tiempo estimado:** 4-5 horas  
**Impacto:** Alto - Funcionalidad core

#### 3.1 Decidir Almacenamiento
**Opción A: Supabase** (Recomendado)
- ✅ Relaciones con estudiantes y áreas
- ✅ Queries complejas
- ✅ Mejor para reportes
- ❌ Consume más espacio

**Opción B: Google Sheets**
- ✅ Más espacio disponible
- ✅ Fácil exportar
- ❌ Queries limitadas
- ❌ Sin relaciones

**Decisión recomendada:** Supabase

#### 3.2 Crear Schema en Supabase
```sql
-- Tabla de evaluaciones
CREATE TABLE evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id UUID REFERENCES estudiantes(id),
  area_id UUID REFERENCES areas_curriculares(id),
  competencia_id UUID REFERENCES competencias(id),
  periodo VARCHAR(20), -- 'Bimestre 1', 'Trimestre 1', etc.
  nivel_logro VARCHAR(2), -- 'AD', 'A', 'B', 'C'
  descripcion TEXT,
  fecha DATE,
  registrado_por VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_evaluaciones_estudiante ON evaluaciones(estudiante_id);
CREATE INDEX idx_evaluaciones_area ON evaluaciones(area_id);
CREATE INDEX idx_evaluaciones_periodo ON evaluaciones(periodo);
```

#### 3.3 Implementar CRUD
- [ ] Crear repositorio `SupabaseEvaluacionesRepository`
- [ ] Implementar hook `useEvaluaciones`
- [ ] Actualizar páginas de evaluaciones
- [ ] Formularios de registro
- [ ] Validaciones

#### 3.4 Páginas a Actualizar
- [ ] `/evaluaciones/page.tsx` - Lista de grados/secciones
- [ ] `/evaluaciones/[grado]/[seccion]/page.tsx` - Áreas
- [ ] `/evaluaciones/[grado]/[seccion]/[areaId]/page.tsx` - Registro
- [ ] `/evaluaciones/transversal/[grado]/[seccion]/page.tsx` - Competencias transversales

**Archivos a modificar:**
```
supabase-schema.sql (agregar tablas)
src/infrastructure/repositories/supabase/SupabaseEvaluacionesRepository.ts (nuevo)
src/hooks/use-evaluaciones.ts (nuevo)
src/app/evaluaciones/**/*.tsx (varios)
```

---

### FASE 4: INCIDENTES Y PERMISOS 🟢
**Tiempo estimado:** 2-3 horas  
**Impacto:** Medio - Funcionalidad complementaria

#### 4.1 Crear Hojas en Google Sheets
- [ ] Crear pestaña "Incidentes"
- [ ] Crear pestaña "Permisos"
- [ ] Definir estructura de columnas

#### 4.2 Implementar en google-sheets.ts
```typescript
// Incidentes
export async function readIncidentes()
export async function writeIncidente()

// Permisos
export async function readPermisos()
export async function writePermiso()
```

#### 4.3 Crear API Routes
- [ ] `/api/google-sheets/incidentes/route.ts`
- [ ] `/api/google-sheets/permisos/route.ts`

#### 4.4 Crear Hooks
- [ ] `useIncidentes()`
- [ ] `usePermisos()`

#### 4.5 Actualizar Páginas
- [ ] `/incidentes/page.tsx`
- [ ] `/permisos/page.tsx`

**Archivos a modificar:**
```
src/lib/google-sheets.ts
src/app/api/google-sheets/incidentes/route.ts (nuevo)
src/app/api/google-sheets/permisos/route.ts (nuevo)
src/hooks/use-incidentes.ts (nuevo)
src/hooks/use-permisos.ts (nuevo)
src/app/incidentes/page.tsx
src/app/permisos/page.tsx
```

---

### FASE 5: CARGA ACADÉMICA Y HORARIOS 🟢
**Tiempo estimado:** 3-4 horas  
**Impacto:** Medio - Gestión docente

#### 5.1 Decidir Almacenamiento
**Recomendación:** Supabase (relaciones con personal y áreas)

#### 5.2 Crear Schema
```sql
-- Asignaciones de docentes a áreas/grados/secciones
CREATE TABLE asignaciones_docentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID REFERENCES personal(id),
  area_id UUID REFERENCES areas_curriculares(id),
  grado VARCHAR(50),
  seccion VARCHAR(10),
  horas_semanales INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Horarios
CREATE TABLE horarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asignacion_id UUID REFERENCES asignaciones_docentes(id),
  dia_semana VARCHAR(20), -- 'Lunes', 'Martes', etc.
  hora_inicio TIME,
  hora_fin TIME,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.3 Implementar
- [ ] Crear repositorio `SupabaseAsignacionesRepository`
- [ ] Crear hook `useAsignaciones`
- [ ] Actualizar `/carga-academica/page.tsx`
- [ ] Actualizar `/docentes/mi-horario/page.tsx`
- [ ] Actualizar `/docentes/mis-clases/page.tsx`

**Archivos a modificar:**
```
supabase-schema.sql
src/infrastructure/repositories/supabase/SupabaseAsignacionesRepository.ts (nuevo)
src/hooks/use-asignaciones.ts (nuevo)
src/app/carga-academica/page.tsx
src/app/docentes/mi-horario/page.tsx
src/app/docentes/mis-clases/page.tsx
```

---

### FASE 6: NECESIDADES EDUCATIVAS ESPECIALES (NEE) 🟢
**Tiempo estimado:** 1-2 horas  
**Impacto:** Bajo - Funcionalidad específica

#### 6.1 Usar Datos de Supabase
- [ ] Los estudiantes ya tienen campo `nee` en Supabase
- [ ] Actualizar `/nee/page.tsx` para filtrar desde Supabase
- [ ] Agregar documentación de NEE

**Archivos a modificar:**
```
src/app/nee/page.tsx
```

---

### FASE 7: ESTUDIANTES EN RIESGO 🟢
**Tiempo estimado:** 2-3 horas  
**Impacto:** Medio - Análisis importante

#### 7.1 Implementar Lógica de Detección
- [ ] Calcular % de asistencia desde Google Sheets
- [ ] Calcular promedio de evaluaciones desde Supabase
- [ ] Contar incidentes desde Google Sheets
- [ ] Definir umbrales de riesgo

#### 7.2 Actualizar Página
- [ ] `/en-riesgo/page.tsx`
- [ ] Mostrar estudiantes en riesgo
- [ ] Indicadores visuales
- [ ] Acciones recomendadas

**Archivos a modificar:**
```
src/hooks/use-en-riesgo-data.ts
src/app/en-riesgo/page.tsx
```

---

### FASE 8: AUTENTICACIÓN REAL 🔴
**Tiempo estimado:** 2-3 horas  
**Impacto:** Alto - Seguridad

#### 8.1 Configurar Supabase Auth
- [ ] Habilitar Email Auth en Supabase
- [ ] Crear tabla `profiles` para roles
- [ ] Configurar RLS (Row Level Security)

#### 8.2 Implementar en la App
- [ ] Crear hook `useAuth` con Supabase
- [ ] Reemplazar `useCurrentUser`
- [ ] Actualizar `AuthGuard`
- [ ] Página de login real
- [ ] Recuperación de contraseña

#### 8.3 Migrar Usuarios
- [ ] Crear usuarios en Supabase Auth
- [ ] Asignar roles
- [ ] Probar accesos

**Archivos a modificar:**
```
src/hooks/use-auth.ts (nuevo)
src/hooks/use-current-user.tsx (actualizar)
src/components/auth-guard.tsx
src/app/login/page.tsx
```

---

### FASE 9: OPTIMIZACIONES 🟢
**Tiempo estimado:** 2-3 horas  
**Impacto:** Medio - Performance

#### 9.1 Caché y Performance
- [ ] Implementar React Query o SWR
- [ ] Caché de datos de Supabase
- [ ] Caché de Google Sheets
- [ ] Optimistic updates
- [ ] Paginación en listas grandes

#### 9.2 Sincronización
- [ ] Sincronización automática cada X minutos
- [ ] Indicador de última actualización
- [ ] Manejo de conflictos

#### 9.3 Offline Support (PWA)
- [ ] Service Worker actualizado
- [ ] Caché de datos críticos
- [ ] Queue de operaciones offline
- [ ] Sincronización al reconectar

**Archivos a modificar:**
```
src/hooks/use-supabase-data.ts
src/hooks/use-asistencias.ts
src/lib/cache.ts (nuevo)
next.config.mjs
```

---

### FASE 10: LIMPIEZA Y DOCUMENTACIÓN 🟢
**Tiempo estimado:** 2-3 horas  
**Impacto:** Bajo - Mantenibilidad

#### 10.1 Eliminar Código Legacy
- [ ] Eliminar archivos de datos mock
- [ ] Eliminar hooks obsoletos
- [ ] Limpiar imports no usados
- [ ] Actualizar dependencias

#### 10.2 Documentación
- [ ] README completo
- [ ] Guía de instalación
- [ ] Guía de deployment
- [ ] Documentación de API
- [ ] Diagramas de arquitectura

#### 10.3 Testing
- [ ] Tests unitarios de hooks
- [ ] Tests de integración de APIs
- [ ] Tests E2E de flujos críticos

**Archivos a eliminar:**
```
src/lib/alumnos-data.ts
src/lib/docentes-data.ts
src/lib/curricular-data.ts
src/lib/asistencia-aula-data.ts
src/lib/evaluaciones-data.ts
src/lib/historial-asistencia-data.ts
src/lib/incidentes-data.ts
src/lib/permisos-data.ts
src/lib/incidentes-comunes-data.ts
```

---

## 📊 RESUMEN POR PRIORIDAD

### 🔴 CRÍTICO (Hacer Primero)
1. **Asistencias** - 3-4h
2. **Autenticación** - 2-3h

**Total:** 5-7 horas

### 🟡 IMPORTANTE (Hacer Después)
3. **Estudiantes CRUD** - 2-3h
4. **Evaluaciones** - 4-5h

**Total:** 6-8 horas

### 🟢 COMPLEMENTARIO (Hacer Al Final)
5. **Incidentes y Permisos** - 2-3h
6. **Carga Académica** - 3-4h
7. **NEE** - 1-2h
8. **En Riesgo** - 2-3h
9. **Optimizaciones** - 2-3h
10. **Limpieza** - 2-3h

**Total:** 12-18 horas

---

## ⏱️ TIEMPO TOTAL ESTIMADO

- **Mínimo:** 23 horas
- **Máximo:** 33 horas
- **Promedio:** 28 horas

**Distribución recomendada:**
- 4-5 sesiones de 6 horas
- O 7-8 sesiones de 4 horas

---

## 🎯 HITOS CLAVE

### Hito 1: MVP Funcional (12-15h)
- ✅ Asistencias funcionando
- ✅ Estudiantes CRUD completo
- ✅ Autenticación real

**Estado:** Aplicación usable para registro diario

### Hito 2: Funcionalidad Completa (25-30h)
- ✅ Todo lo anterior
- ✅ Evaluaciones
- ✅ Incidentes y permisos
- ✅ Carga académica

**Estado:** Aplicación 100% funcional

### Hito 3: Producción (30-35h)
- ✅ Todo lo anterior
- ✅ Optimizaciones
- ✅ Documentación
- ✅ Tests

**Estado:** Lista para deployment

---

## 📋 CHECKLIST DE FINALIZACIÓN

### Datos Reales
- [ ] 0 archivos de datos mock
- [ ] Todos los datos en Supabase o Google Sheets
- [ ] Migraciones de datos completadas

### Funcionalidad
- [ ] Todas las páginas funcionando
- [ ] CRUD completo donde corresponda
- [ ] Validaciones implementadas
- [ ] Manejo de errores robusto

### Seguridad
- [ ] Supabase Auth implementado
- [ ] RLS configurado
- [ ] Variables de entorno seguras
- [ ] No hay credenciales en el código

### Performance
- [ ] Caché implementado
- [ ] Queries optimizadas
- [ ] Loading states en todas partes
- [ ] PWA funcionando offline

### Calidad
- [ ] Código limpio
- [ ] Sin warnings en consola
- [ ] Tests pasando
- [ ] Documentación completa

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

```
Semana 1:
├─ Día 1-2: Asistencias (3-4h)
├─ Día 3: Estudiantes CRUD (2-3h)
└─ Día 4-5: Evaluaciones (4-5h)

Semana 2:
├─ Día 1: Autenticación (2-3h)
├─ Día 2: Incidentes y Permisos (2-3h)
├─ Día 3-4: Carga Académica (3-4h)
└─ Día 5: NEE + En Riesgo (3-5h)

Semana 3:
├─ Día 1-2: Optimizaciones (2-3h)
├─ Día 3-4: Limpieza y Documentación (2-3h)
└─ Día 5: Testing y Deployment
```

---

## 💡 RECOMENDACIONES

### 1. Enfoque Incremental
- Completa una fase antes de pasar a la siguiente
- Prueba cada funcionalidad antes de continuar
- Commitea cambios frecuentemente

### 2. Prioriza lo Crítico
- Asistencias primero (funcionalidad core)
- Autenticación segundo (seguridad)
- Resto después

### 3. Mantén la Calidad
- No sacrifiques calidad por velocidad
- Escribe código limpio y documentado
- Implementa manejo de errores desde el inicio

### 4. Prueba Constantemente
- Prueba cada cambio inmediatamente
- Usa datos reales de prueba
- Verifica en Supabase y Google Sheets

---

## 🎉 RESULTADO FINAL

Al completar este plan tendrás:

✅ **Aplicación 100% funcional**
✅ **0 datos mock**
✅ **Arquitectura híbrida optimizada**
✅ **Autenticación segura**
✅ **Performance optimizado**
✅ **Código limpio y documentado**
✅ **Lista para producción**

---

**Creado:** 28 de octubre de 2025  
**Última actualización:** 28 de octubre de 2025
