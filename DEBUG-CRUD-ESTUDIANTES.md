# 🔍 Debug: CRUD de Estudiantes

**Fecha:** 28 de octubre de 2025  
**Problema:** CRUD de estudiantes no funciona correctamente

---

## 🎯 OPERACIONES CRUD

### CREATE (Crear)
**Ubicación:** Botón "Nuevo" en `/estudiantes`

**Flujo:**
1. Click en "Nuevo"
2. Se abre formulario
3. Completar datos
4. Click en "Crear"
5. Llamada a `addEstudiante()`

**Posibles problemas:**
- Formulario no se abre
- Validaciones fallan
- `addEstudiante()` retorna false
- Error en Supabase

### READ (Leer)
**Ubicación:** Lista de estudiantes

**Flujo:**
1. `useSupabaseData()` carga estudiantes
2. Se muestran en tabla

**Posibles problemas:**
- No carga estudiantes
- Carga pero no muestra
- Error de permisos en Supabase

### UPDATE (Actualizar)
**Ubicación:** Botón editar en tabla

**Flujo:**
1. Click en editar
2. Se abre formulario con datos
3. Modificar datos
4. Click en "Guardar"
5. Llamada a `updateEstudiante()`

**Posibles problemas:**
- Botón editar no existe
- Formulario no carga datos
- `updateEstudiante()` no implementado
- Error en Supabase

### DELETE (Eliminar)
**Ubicación:** Botón eliminar en tabla

**Flujo:**
1. Click en eliminar
2. Confirmar
3. Llamada a `deleteEstudiante()`

**Posibles problemas:**
- Botón eliminar no existe
- `deleteEstudiante()` no funciona
- Error en Supabase

---

## 🔍 DIAGNÓSTICO PASO A PASO

### Paso 1: Verificar que el Botón "Nuevo" Existe

**Abrir:** `http://localhost:9002/estudiantes`

**Buscar:**
- Botón verde "Nuevo" en la esquina superior derecha
- Solo visible para Admin

**Si no aparece:**
- Verificar que eres Admin
- Verificar código en `page.tsx` línea 170-175

### Paso 2: Probar Crear Estudiante

**Pasos:**
1. Click en "Nuevo"
2. Completar formulario:
   ```
   Tipo Documento: DNI
   Número: TEST001
   Apellido Paterno: PRUEBA
   Nombres: ESTUDIANTE TEST
   Grado: 1er Grado
   Sección: A
   ```
3. Click en "Crear"

**Abrir DevTools (F12) → Console**

**Buscar:**
- Errores en rojo
- Warnings en amarillo
- Logs de la aplicación

**Posibles errores:**
```javascript
// Error de validación
"Error: Campos requeridos faltantes"

// Error de Supabase
"Error saving student: ..."

// Error de permisos
"Permission denied"
```

### Paso 3: Verificar en Supabase

**Ir a:** Supabase Dashboard → Table Editor → estudiantes

**Buscar:** Registro con `numero_documento = 'TEST001'`

**Si existe:**
- ✅ CREATE funciona
- Problema está en el refresh o visualización

**Si no existe:**
- ❌ CREATE no funciona
- Revisar logs de error

### Paso 4: Verificar READ

**En la página `/estudiantes`:**

**¿Se muestran estudiantes?**
- ✅ Sí → READ funciona
- ❌ No → Problema con READ

**Si no se muestran:**
1. Abrir DevTools → Network
2. Buscar llamadas a Supabase
3. Verificar respuesta

### Paso 5: Verificar UPDATE

**Buscar botón "Editar" en la tabla**

**Si no existe:**
- Necesita implementarse
- Agregar botón en `SeccionesTable` o página de detalle

**Si existe:**
1. Click en editar
2. Modificar datos
3. Guardar
4. Verificar en Supabase

### Paso 6: Verificar DELETE

**Buscar botón "Eliminar" (🗑️) en la tabla**

**Si no existe:**
- Necesita implementarse

**Si existe:**
1. Click en eliminar
2. Confirmar
3. Verificar que desaparece

---

## 🐛 PROBLEMAS COMUNES

### Problema 1: "No se pudo agregar el estudiante"

**Causa:** Validaciones de la entidad de dominio

**Solución:**
```typescript
// Verificar que el estudiante tiene todas las propiedades requeridas
const estudiante = {
  tipoDocumento: 'DNI',
  numeroDocumento: 'TEST001',
  apellidoPaterno: 'PRUEBA',
  nombres: 'ESTUDIANTE',
  grado: '1er Grado',
  seccion: 'A',
  // Todas las propiedades requeridas
};
```

### Problema 2: Formulario no se abre

**Causa:** Estado del diálogo no se actualiza

**Solución:**
```typescript
// Verificar en page.tsx
const handleCreate = () => {
  setFormMode('create');
  setSelectedEstudiante(null);
  setFormDialogOpen(true); // ← Debe ser true
};
```

### Problema 3: No aparecen estudiantes

**Causa:** Error en la carga de Supabase

**Solución:**
1. Verificar conexión a Supabase
2. Verificar permisos en RLS
3. Verificar que hay datos en la tabla

### Problema 4: UPDATE no funciona

**Causa:** No está implementado en `handleSave`

**Solución:**
```typescript
const handleSave = async (estudiante: any) => {
  if (formMode === 'create') {
    const success = await addEstudiante(estudiante);
    if (success) await refreshEstudiantes();
    return success;
  } else if (formMode === 'edit') {
    // ← Falta implementar esto
    const success = await updateEstudiante(
      selectedEstudiante.numeroDocumento, 
      estudiante
    );
    if (success) await refreshEstudiantes();
    return success;
  }
  return false;
};
```

---

## 🔧 CÓDIGO PARA REVISAR

### 1. Página Principal (`src/app/estudiantes/page.tsx`)

**Líneas clave:**
- 64-68: `handleCreate()` - Abre formulario
- 70-79: `handleSave()` - Guarda estudiante
- 170-175: Botón "Nuevo"
- 236-242: Diálogo de formulario

### 2. Hook (`src/hooks/use-supabase-data.ts`)

**Líneas clave:**
- 36-47: `useEstudiantes()` - Exporta funciones CRUD

### 3. Formulario (`src/components/estudiantes/estudiante-form-dialog.tsx`)

**Verificar:**
- Props correctas
- Validaciones
- Llamada a `onSave`

### 4. Repositorio (`src/infrastructure/repositories/supabase/SupabaseEstudianteRepository.ts`)

**Verificar:**
- Método `guardar()`
- Mapeo de datos
- Manejo de errores

---

## 📝 CHECKLIST DE DEBUGGING

- [ ] Abrir `/estudiantes`
- [ ] Verificar que botón "Nuevo" existe
- [ ] Click en "Nuevo"
- [ ] Verificar que formulario se abre
- [ ] Completar formulario
- [ ] Click en "Crear"
- [ ] Abrir DevTools → Console
- [ ] Copiar errores (si hay)
- [ ] Verificar toast que aparece
- [ ] Verificar en Supabase si se creó
- [ ] Verificar si aparece en la lista

---

## 🎯 INFORMACIÓN NECESARIA

Para ayudarte mejor, necesito saber:

1. **¿Qué operación específica falla?**
   - [ ] CREATE (Crear)
   - [ ] READ (Leer/Ver)
   - [ ] UPDATE (Editar)
   - [ ] DELETE (Eliminar)

2. **¿Qué error aparece?**
   - Toast de error: "_______________"
   - Error en consola: "_______________"
   - No pasa nada

3. **¿Dónde lo intentas?**
   - [ ] Página `/estudiantes`
   - [ ] Página `/estudiantes/[grado]/[seccion]`

4. **¿Eres Admin?**
   - [ ] Sí
   - [ ] No

5. **¿Logs de consola?**
   ```
   (Pegar aquí)
   ```

---

## 🚀 SOLUCIÓN RÁPIDA

Si quieres que funcione TODO el CRUD, necesito implementar:

### 1. Completar `handleSave` con UPDATE
### 2. Agregar botones de editar en tabla
### 3. Agregar botones de eliminar en tabla
### 4. Conectar todo con los hooks

**¿Quieres que implemente todo esto ahora?**

---

**Última actualización:** 28 de octubre de 2025, 10:46 PM
