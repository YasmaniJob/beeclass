# 🎓 Análisis UX: Flujo de Evaluaciones desde la Perspectiva del Docente

## 👨‍🏫 PERSONA: Profesor Juan

**Contexto:**
- Enseña Comunicación en 1er Grado B (Secundaria)
- Tiene 30 estudiantes
- Debe evaluar 3 competencias del área
- Trabaja con sesiones de aprendizaje semanales

---

## 📱 FLUJO ACTUAL

### **Paso 1: Panel de Docente** (`/docentes/mis-clases`)
✅ **Lo que funciona bien:**
- Ve todas sus clases en tarjetas
- Cada área muestra cuántos estudiantes tiene calificados
- Puede hacer clic en un área para ir a calificar

❌ **Problemas detectados:**
- No ve un resumen de sesiones pendientes
- No sabe cuántas sesiones ha creado este bimestre
- No hay indicador de "última sesión creada"

---

### **Paso 2: Libreta de Notas** (`/evaluaciones/[grado]/[seccion]/[areaId]`)

✅ **Lo que funciona bien:**
- Tabla clara con estudiantes y competencias
- Selector de periodo (Bimestre 1, 2, 3, 4)
- Botón "Añadir Sesión" visible
- Badges que muestran notas faltantes por estudiante
- Filtros: Todos / Completos / Incompletos

❌ **Problemas detectados:**
1. **NO HAY LISTA DE SESIONES CREADAS** ⚠️ CRÍTICO
   - El docente no puede ver qué sesiones ha creado
   - No puede editar el título de una sesión
   - No puede eliminar una sesión
   - No sabe cuándo creó cada sesión

2. **Flujo confuso para calificar:**
   - Hace clic en "Añadir Sesión" → Crea sesión → Redirige a calificar
   - Pero si ya tiene sesiones, ¿cómo accede a ellas?
   - Solo puede ver las notas en la tabla, pero no las sesiones

3. **Falta contexto:**
   - No ve cuántas sesiones tiene por competencia
   - No sabe si ya calificó una sesión específica

---

### **Paso 3: Crear Sesión** (Dialog)

✅ **Lo que funciona bien:**
- Formulario simple: Título + Competencia + Capacidades
- Redirige automáticamente a calificar

❌ **Problemas detectados:**
- No puede ver sesiones anteriores para referencia
- No sugiere títulos basados en sesiones previas
- No valida si ya existe una sesión con el mismo nombre

---

### **Paso 4: Calificar Sesión** (`/evaluaciones/.../[sesionId]`)

✅ **Lo que funciona bien:**
- Tabla clara con todos los estudiantes
- Selector de nota (AD/A/B/C) por estudiante
- Botón flotante "Guardar Cambios" con contador
- Muestra capacidades de la sesión

❌ **Problemas detectados:**
- No puede volver a la lista de sesiones
- No puede editar el título de la sesión
- No puede ver otras sesiones de la misma competencia
- No hay breadcrumb claro

---

### **Paso 5: Ver Desglose de Notas** (Sheet lateral)

✅ **Lo que funciona bien:**
- Muestra todas las calificaciones de un estudiante en una competencia
- Lista las sesiones con sus notas

❌ **Problemas detectados:**
- No puede editar notas desde aquí
- No puede navegar a la sesión para calificar
- Solo es informativo, no interactivo

---

## 🎯 PROPUESTA DE MEJORA: Flujo Optimizado

### **CAMBIO PRINCIPAL: Agregar "Historial de Sesiones"**

#### **Ubicación:** En la página de Libreta de Notas

```
┌─────────────────────────────────────────────────────────────┐
│  Comunicación - 1er Grado B                    [Bimestre 1▼]│
├─────────────────────────────────────────────────────────────┤
│  📊 Estadísticas                                             │
│  ├─ 30 estudiantes                                          │
│  ├─ 25 con notas completas                                  │
│  └─ 5 con notas pendientes                                  │
├─────────────────────────────────────────────────────────────┤
│  📝 SESIONES DE APRENDIZAJE                  [+ Nueva Sesión]│
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Competencia 1: Lee diversos tipos de textos          │  │
│  │ ├─ Sesión 1: Lectura de cuentos (15/03) ✅ 30/30    │  │
│  │ ├─ Sesión 2: Análisis de poemas (22/03) ⚠️ 25/30    │  │
│  │ └─ Sesión 3: Comprensión lectora (29/03) ❌ 0/30    │  │
│  │                                                          │  │
│  │ Competencia 2: Escribe diversos tipos de textos      │  │
│  │ ├─ Sesión 1: Redacción de cartas (16/03) ✅ 30/30   │  │
│  │ └─ Sesión 2: Ensayo argumentativo (23/03) ⚠️ 28/30  │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  📋 TABLA DE CALIFICACIONES                                 │
│  [Tabla actual con promedios]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO MEJORADO

### **Escenario 1: Crear y Calificar Nueva Sesión**

1. Docente entra a `/evaluaciones/1er-Grado/B/comunicacion`
2. Ve el historial de sesiones agrupadas por competencia
3. Hace clic en **"+ Nueva Sesión"**
4. Completa formulario:
   - Título: "Análisis de textos narrativos"
   - Competencia: C1 (autoseleccionada si hace clic desde una competencia)
   - Capacidades: [selecciona de la lista]
5. Hace clic en **"Crear y Calificar"**
6. Redirige a `/evaluaciones/.../sesion-123`
7. Califica a los 30 estudiantes
8. Hace clic en **"Guardar Cambios"**
9. Vuelve automáticamente a la libreta con la sesión agregada

---

### **Escenario 2: Calificar Sesión Existente**

1. Docente entra a `/evaluaciones/1er-Grado/B/comunicacion`
2. Ve en el historial: "Sesión 3: Comprensión lectora ❌ 0/30"
3. Hace clic en la sesión
4. Redirige a `/evaluaciones/.../sesion-3`
5. Califica a los estudiantes
6. Guarda cambios
7. Vuelve a la libreta

---

### **Escenario 3: Editar/Eliminar Sesión**

1. Docente ve una sesión con título incorrecto
2. Hace clic en el menú "⋮" de la sesión
3. Opciones:
   - ✏️ Editar título
   - 🗑️ Eliminar sesión (solo si no tiene calificaciones)
   - 📊 Ver estadísticas

---

### **Escenario 4: Ver Progreso por Competencia**

1. Docente hace clic en "Competencia 1"
2. Se expande/colapsa la lista de sesiones
3. Ve rápidamente:
   - Cuántas sesiones ha creado
   - Cuántos estudiantes ha calificado en cada una
   - Qué sesiones están pendientes

---

## 🎨 COMPONENTES NUEVOS NECESARIOS

### 1. **`SesionesHistorialCard`**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Sesiones de Aprendizaje</CardTitle>
    <Button>+ Nueva Sesión</Button>
  </CardHeader>
  <CardContent>
    {competencias.map(comp => (
      <CompetenciaSesionesGroup 
        competencia={comp}
        sesiones={sesionesDeCompetencia}
      />
    ))}
  </CardContent>
</Card>
```

### 2. **`CompetenciaSesionesGroup`**
```tsx
<Collapsible>
  <CollapsibleTrigger>
    <h3>Competencia 1: {nombre}</h3>
    <Badge>{sesiones.length} sesiones</Badge>
  </CollapsibleTrigger>
  <CollapsibleContent>
    {sesiones.map(sesion => (
      <SesionItem sesion={sesion} />
    ))}
  </CollapsibleContent>
</Collapsible>
```

### 3. **`SesionItem`**
```tsx
<div className="flex items-center justify-between p-3 hover:bg-accent">
  <div>
    <h4>{sesion.titulo}</h4>
    <p className="text-sm text-muted-foreground">
      {formatDate(sesion.fecha)}
    </p>
  </div>
  <div className="flex items-center gap-2">
    <Badge variant={getVariant(progreso)}>
      {calificados}/{total}
    </Badge>
    <DropdownMenu>
      <DropdownMenuTrigger>⋮</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleCalificar}>
          Calificar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditar}>
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEliminar}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

---

## 📊 INDICADORES VISUALES

### **Estados de Sesión:**
- ✅ **Completa**: Todos los estudiantes calificados (verde)
- ⚠️ **Parcial**: Algunos estudiantes sin calificar (amarillo)
- ❌ **Pendiente**: Ningún estudiante calificado (rojo)
- 📝 **Nueva**: Recién creada (azul)

### **Badges de Progreso:**
```
✅ 30/30  →  Verde (100%)
⚠️ 25/30  →  Amarillo (>50%)
❌ 5/30   →  Rojo (<50%)
❌ 0/30   →  Gris (0%)
```

---

## 🔧 CAMBIOS TÉCNICOS NECESARIOS

### **1. Modificar Página de Libreta**
- Agregar sección de "Historial de Sesiones" arriba de la tabla
- Agrupar sesiones por competencia
- Mostrar progreso de calificación por sesión

### **2. Mejorar Hook `use-sesiones`**
- Agregar `updateSesion(id, data)` para editar
- Agregar `deleteSesion(id)` para eliminar
- Agregar `getSesionesPorCompetencia(competenciaId)`

### **3. Agregar Navegación**
- Breadcrumb en página de sesión: Libreta > Sesión X
- Botón "Volver a Libreta" en página de sesión
- Link directo desde historial a sesión

### **4. Persistencia**
- Guardar sesiones en Google Sheets (nueva hoja "Sesiones")
- Estructura: id, fecha, grado, seccion, areaId, competenciaId, titulo, capacidades

---

## ✅ BENEFICIOS DEL NUEVO FLUJO

1. **Visibilidad Total**: El docente ve todas sus sesiones de un vistazo
2. **Navegación Clara**: Puede ir directamente a calificar cualquier sesión
3. **Gestión Completa**: Puede editar/eliminar sesiones
4. **Progreso Visible**: Ve cuántos estudiantes ha calificado en cada sesión
5. **Organización**: Sesiones agrupadas por competencia
6. **Contexto**: Sabe cuándo creó cada sesión
7. **Eficiencia**: Menos clics para llegar a calificar

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### **Fase 1: Historial Básico** (1-2 horas)
1. Componente `SesionesHistorialCard`
2. Listar sesiones agrupadas por competencia
3. Link a calificar sesión
4. Mostrar progreso (X/Y calificados)

### **Fase 2: Gestión de Sesiones** (1 hora)
1. Editar título de sesión
2. Eliminar sesión (con validación)
3. Ver estadísticas de sesión

### **Fase 3: Mejoras UX** (30 min)
1. Breadcrumbs
2. Botón "Volver"
3. Animaciones de transición
4. Estados visuales mejorados

---

## 💡 PREGUNTAS PARA VALIDAR

1. ¿El docente necesita ver sesiones de bimestres anteriores?
2. ¿Puede duplicar una sesión para reutilizar el título/capacidades?
3. ¿Necesita exportar el historial de sesiones?
4. ¿Puede archivar sesiones antiguas?
5. ¿Necesita buscar/filtrar sesiones por fecha o título?

---

**¿Este flujo te parece más intuitivo y eficaz para el docente?**
