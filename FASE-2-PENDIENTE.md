# 📋 Fase 2: Estudiantes CRUD - Estado Actual

## ✅ Completado (70%)

### 1. Repositorio Supabase ✅
**Archivo:** `src/infrastructure/repositories/supabase/SupabaseEstudiantesRepository.ts`

**Funciones implementadas:**
- ✅ `getAll()` - Obtener todos los estudiantes
- ✅ `getById(id)` - Obtener por ID
- ✅ `getByGradoSeccion(grado, seccion)` - Filtrar por grado/sección
- ✅ `create(estudiante)` - Crear nuevo estudiante
- ✅ `update(id, estudiante)` - Actualizar estudiante
- ✅ `delete(id)` - Soft delete
- ✅ `hardDelete(id)` - Eliminación permanente
- ✅ `search(query)` - Búsqueda por nombre/documento

### 2. Componente de Formulario ✅
**Archivo:** `src/components/estudiantes/estudiante-form-dialog.tsx`

**Características:**
- ✅ Formulario completo con todos los campos
- ✅ Validaciones
- ✅ Modo crear/editar
- ✅ Loading states
- ✅ Toast notifications
- ✅ Campos organizados por secciones:
  - Datos personales
  - Contacto
  - Apoderado
  - Matrícula
  - NEE

---

## ⏳ Pendiente (30%)

### 3. Actualizar Página de Estudiantes
**Archivo:** `src/app/estudiantes/page.tsx`

**Cambios necesarios:**

```typescript
// 1. Agregar manejadores
const handleCreate = () => {
  setFormMode('create');
  setSelectedEstudiante(null);
  setFormDialogOpen(true);
};

const handleSave = async (estudiante: any) => {
  if (formMode === 'create') {
    return await addEstudiante(estudiante);
  } else {
    // TODO: Implementar update
    return false;
  }
};

// 2. Agregar botón "Nuevo Estudiante" en el header
<Button onClick={handleCreate}>
  <Plus className="h-4 w-4 mr-2" />
  Nuevo Estudiante
</Button>

// 3. Agregar diálogo al final
<EstudianteFormDialog
  open={formDialogOpen}
  onOpenChange={setFormDialogOpen}
  estudiante={selectedEstudiante}
  onSave={handleSave}
  mode={formMode}
/>
```

### 4. Actualizar Tabla de Secciones
**Archivo:** `src/components/estudiantes/secciones-table.tsx`

**Agregar botones de acción:**
- Botón "Ver" - Navegar a detalle
- Botón "Editar" - Abrir formulario en modo edición
- Botón "Eliminar" - Confirmar y eliminar

### 5. Crear Página de Detalle
**Archivo:** `src/app/estudiantes/[grado]/[seccion]/page.tsx`

**Funcionalidades:**
- Lista de estudiantes de la sección
- Botones de editar/eliminar por estudiante
- Búsqueda y filtros
- Exportar a Excel

---

## 🔧 Problemas de TypeScript

### Tipo `Estudiante` Incompleto
El tipo `Estudiante` en `src/lib/definitions.ts` no tiene todas las propiedades necesarias.

**Propiedades faltantes:**
- `id?: string`
- `fechaNacimiento?: Date`
- `sexo?: 'M' | 'F'`
- `direccion?: string`
- `telefono?: string`
- `email?: string`
- `nombreApoderado?: string`
- `telefonoApoderado?: string`
- `descripcionNee?: string`

**Solución temporal:**
- Usar `any` en formulario y repositorio
- **Solución permanente:** Actualizar el tipo en `definitions.ts`

---

## 📝 Código Pendiente

### Actualizar `src/app/estudiantes/page.tsx`

```typescript
// Agregar después de la línea 56:
const handleCreate = () => {
  setFormMode('create');
  setSelectedEstudiante(null);
  setFormDialogOpen(true);
};

const handleSave = async (estudiante: any) => {
  if (formMode === 'create') {
    const success = await addEstudiante(estudiante);
    if (success) {
      await refreshEstudiantes();
    }
    return success;
  }
  return false;
};

// Actualizar el header (línea 128):
<div className="flex items-center gap-2">
  <Badge variant={loading.estudiantes ? "secondary" : "default"}>
    {estudiantes.length} estudiantes
  </Badge>
  <Button
    variant="outline"
    size="sm"
    onClick={refreshEstudiantes}
    disabled={loading.estudiantes}
  >
    <RefreshCw className={`h-4 w-4 mr-2 ${loading.estudiantes ? 'animate-spin' : ''}`} />
    Actualizar
  </Button>
  {isAdmin && (
    <Button onClick={handleCreate}>
      <Plus className="h-4 w-4 mr-2" />
      Nuevo
    </Button>
  )}
</div>

// Agregar al final del return (línea 199):
<EstudianteFormDialog
  open={formDialogOpen}
  onOpenChange={setFormDialogOpen}
  estudiante={selectedEstudiante}
  onSave={handleSave}
  mode={formMode}
/>
```

---

## 🧪 Testing

### Pasos para Probar:

1. **Abrir página de estudiantes:**
   ```
   http://localhost:9002/estudiantes
   ```

2. **Click en "Nuevo Estudiante"**
   - Debería abrir el formulario
   - Completar todos los campos obligatorios
   - Click en "Crear"

3. **Verificar en Supabase:**
   - Ir a Supabase Dashboard
   - Tabla `estudiantes`
   - Verificar que se creó el registro

4. **Refresh de la página:**
   - El nuevo estudiante debería aparecer
   - En el grado y sección correctos

---

## ⏱️ Tiempo Estimado Restante

- **Actualizar página:** 30 min
- **Actualizar tabla:** 30 min
- **Testing:** 30 min
- **Total:** 1.5 horas

---

## 🎯 Próximos Pasos

1. Completar Fase 2 (1.5h restantes)
2. Fase 3: Evaluaciones (4-5h)
3. Fase 4: Incidentes y Permisos (2-3h)

---

**Última actualización:** 28 de octubre de 2025, 5:05 PM
