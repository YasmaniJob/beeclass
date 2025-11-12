# 📋 Propuesta: Sheet Unificado para Gestión de Sesiones

## 🎯 CONCEPTO

Usar un **Sheet lateral** (en lugar de Dialog) que combine:
1. Formulario para crear nueva sesión
2. Lista de sesiones recientes (últimas 5)
3. Botón "Ver todas las sesiones" que expande el sheet

---

## 🎨 DISEÑO VISUAL

### **Estado 1: Sheet Compacto (Crear + Recientes)**

```
┌─────────────────────────────────────────────────┐
│  [X] Gestión de Sesiones                        │
├─────────────────────────────────────────────────┤
│                                                  │
│  📝 CREAR NUEVA SESIÓN                          │
│  ┌─────────────────────────────────────────┐   │
│  │ Título de la sesión                      │   │
│  │ [_________________________________]      │   │
│  │                                           │   │
│  │ Competencia                               │   │
│  │ [C1: Lee diversos tipos de textos ▼]    │   │
│  │                                           │   │
│  │ Capacidades (opcional)                    │   │
│  │ ☐ Obtiene información del texto          │   │
│  │ ☐ Infiere e interpreta información       │   │
│  │ ☐ Reflexiona y evalúa                    │   │
│  │                                           │   │
│  │ [Cancelar]  [Crear y Calificar →]       │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ─────────────────────────────────────────      │
│                                                  │
│  📚 SESIONES RECIENTES                          │
│  ┌─────────────────────────────────────────┐   │
│  │ 📄 Análisis de textos narrativos         │   │
│  │    C1 • Hace 2 días • ✅ 30/30           │   │
│  │    [Calificar →]                         │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📄 Comprensión lectora                   │   │
│  │    C1 • Hace 5 días • ⚠️ 25/30           │   │
│  │    [Calificar →]                         │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📄 Redacción de ensayos                  │   │
│  │    C2 • Hace 1 semana • ❌ 0/30          │   │
│  │    [Calificar →]                         │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [Ver todas las sesiones (12) →]                │
│                                                  │
└─────────────────────────────────────────────────┘
```

### **Estado 2: Sheet Expandido (Todas las Sesiones)**

```
┌─────────────────────────────────────────────────┐
│  [←] Todas las Sesiones                         │
├─────────────────────────────────────────────────┤
│  [Buscar sesiones...]                    [+ Nueva]│
│                                                  │
│  🔵 COMPETENCIA 1: Lee diversos tipos de textos│
│  ┌─────────────────────────────────────────┐   │
│  │ 📄 Análisis de textos narrativos         │   │
│  │    15/03/2024 • ✅ 30/30                 │   │
│  │    [Calificar] [⋮]                       │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📄 Comprensión lectora                   │   │
│  │    22/03/2024 • ⚠️ 25/30                 │   │
│  │    [Calificar] [⋮]                       │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📄 Lectura de cuentos                    │   │
│  │    08/03/2024 • ✅ 30/30                 │   │
│  │    [Calificar] [⋮]                       │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  🟢 COMPETENCIA 2: Escribe diversos textos     │
│  ┌─────────────────────────────────────────┐   │
│  │ 📄 Redacción de ensayos                  │   │
│  │    29/03/2024 • ❌ 0/30                  │   │
│  │    [Calificar] [⋮]                       │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📄 Escritura creativa                    │   │
│  │    16/03/2024 • ✅ 30/30                 │   │
│  │    [Calificar] [⋮]                       │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## ✅ VENTAJAS DE ESTA PROPUESTA

### **1. Menos Intrusivo**
- Sheet lateral no bloquea toda la pantalla
- El docente puede ver la tabla de calificaciones mientras crea la sesión
- Puede cerrar el sheet y volver cuando quiera

### **2. Contexto Inmediato**
- Ve las últimas sesiones sin tener que navegar
- Puede comparar títulos para no duplicar
- Acceso rápido a sesiones pendientes

### **3. Flujo Natural**
```
Botón "Añadir Sesión" 
  → Sheet se abre (compacto)
  → Ve sesiones recientes
  → Decide:
     a) Crear nueva sesión
     b) Calificar sesión reciente
     c) Ver todas las sesiones
```

### **4. Escalabilidad**
- Funciona bien con pocas sesiones (muestra todas)
- Funciona bien con muchas sesiones (muestra recientes + link a todas)
- Búsqueda disponible en vista expandida

### **5. Consistencia UI**
- Ya usas Sheets en otros lugares (desglose de calificaciones)
- Mantiene el patrón de diseño consistente
- Familiar para el usuario

---

## 🔄 FLUJOS DE USUARIO

### **Flujo 1: Crear Nueva Sesión**
1. Clic en "Añadir Sesión" → Sheet se abre
2. Completa formulario
3. Clic en "Crear y Calificar"
4. Sheet se cierra
5. Redirige a `/evaluaciones/.../sesion-123`

### **Flujo 2: Calificar Sesión Reciente**
1. Clic en "Añadir Sesión" → Sheet se abre
2. Ve "Comprensión lectora ⚠️ 25/30"
3. Clic en "Calificar"
4. Sheet se cierra
5. Redirige a `/evaluaciones/.../sesion-456`

### **Flujo 3: Buscar Sesión Antigua**
1. Clic en "Añadir Sesión" → Sheet se abre
2. Clic en "Ver todas las sesiones (12)"
3. Sheet se expande
4. Busca "ensayo"
5. Encuentra sesión
6. Clic en "Calificar"

### **Flujo 4: Editar/Eliminar Sesión**
1. Abre sheet → "Ver todas las sesiones"
2. Clic en menú "⋮" de una sesión
3. Opciones:
   - Editar título
   - Duplicar sesión
   - Eliminar sesión
   - Ver estadísticas

---

## 🎨 COMPONENTES NECESARIOS

### **1. `SesionesSheet` (Principal)**
```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right" className="w-[500px]">
    <SheetHeader>
      <SheetTitle>
        {viewMode === 'create' ? 'Gestión de Sesiones' : 'Todas las Sesiones'}
      </SheetTitle>
    </SheetHeader>
    
    {viewMode === 'create' ? (
      <>
        <SesionFormSection />
        <Separator />
        <SesionesRecientesSection />
        <Button onClick={() => setViewMode('all')}>
          Ver todas las sesiones ({totalSesiones})
        </Button>
      </>
    ) : (
      <SesionesTodasSection />
    )}
  </SheetContent>
</Sheet>
```

### **2. `SesionFormSection`**
```tsx
<div className="space-y-4">
  <h3>📝 Crear Nueva Sesión</h3>
  <Input placeholder="Título de la sesión" />
  <Select>
    <SelectTrigger>Competencia</SelectTrigger>
    <SelectContent>
      {competencias.map(c => (
        <SelectItem key={c.id}>{c.nombre}</SelectItem>
      ))}
    </SelectContent>
  </Select>
  <div className="space-y-2">
    <Label>Capacidades (opcional)</Label>
    {capacidades.map(cap => (
      <Checkbox key={cap}>{cap}</Checkbox>
    ))}
  </div>
  <Button onClick={handleCrearYCalificar}>
    Crear y Calificar →
  </Button>
</div>
```

### **3. `SesionesRecientesSection`**
```tsx
<div className="space-y-2">
  <h3>📚 Sesiones Recientes</h3>
  {sesionesRecientes.map(sesion => (
    <SesionRecenteCard 
      key={sesion.id}
      sesion={sesion}
      onCalificar={handleCalificar}
    />
  ))}
</div>
```

### **4. `SesionRecenteCard`**
```tsx
<Card className="p-3">
  <div className="flex items-start justify-between">
    <div>
      <h4 className="font-medium">{sesion.titulo}</h4>
      <p className="text-sm text-muted-foreground">
        {competencia.nombre.substring(0, 3)} • 
        {formatRelativeTime(sesion.fecha)} • 
        <Badge variant={getVariant(progreso)}>
          {calificados}/{total}
        </Badge>
      </p>
    </div>
    <Button size="sm" onClick={() => onCalificar(sesion.id)}>
      Calificar →
    </Button>
  </div>
</Card>
```

### **5. `SesionesTodasSection`**
```tsx
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <Button variant="ghost" onClick={() => setViewMode('create')}>
      ← Volver
    </Button>
    <Input placeholder="Buscar sesiones..." />
    <Button size="sm" onClick={handleNuevaSesion}>
      + Nueva
    </Button>
  </div>
  
  {competencias.map(comp => (
    <CompetenciaSesionesGroup 
      key={comp.id}
      competencia={comp}
      sesiones={getSesionesPorCompetencia(comp.id)}
    />
  ))}
</div>
```

---

## 📊 COMPARACIÓN: Dialog vs Sheet

| Aspecto | Dialog (Actual) | Sheet (Propuesto) | Ganador |
|---------|-----------------|-------------------|---------|
| Espacio visual | Bloquea pantalla | Lateral, no bloquea | ✅ Sheet |
| Contexto | Pierde vista de tabla | Mantiene vista | ✅ Sheet |
| Navegación | Un solo propósito | Multi-propósito | ✅ Sheet |
| Escalabilidad | Limitado | Expandible | ✅ Sheet |
| Consistencia | Diferente patrón | Mismo patrón (ya usado) | ✅ Sheet |
| Mobile | Ocupa toda pantalla | Ocupa toda pantalla | Empate |

**Resultado: Sheet es superior en 5/6 aspectos** ✅

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Sheet Básico** (1 hora)
1. Crear `SesionesSheet` component
2. Mover formulario actual a `SesionFormSection`
3. Reemplazar Dialog por Sheet en libreta
4. Mantener funcionalidad actual

### **Fase 2: Sesiones Recientes** (1 hora)
1. Crear `SesionesRecientesSection`
2. Crear `SesionRecenteCard`
3. Mostrar últimas 5 sesiones
4. Agregar botón "Calificar" por sesión

### **Fase 3: Vista Expandida** (1.5 horas)
1. Crear `SesionesTodasSection`
2. Agrupar por competencia
3. Agregar búsqueda
4. Agregar menú de acciones (⋮)

### **Fase 4: Gestión de Sesiones** (1 hora)
1. Editar título de sesión
2. Duplicar sesión
3. Eliminar sesión (con validación)
4. Ver estadísticas

**Total: ~4.5 horas**

---

## 💡 MEJORAS ADICIONALES

### **1. Sugerencias Inteligentes**
- Autocompletar títulos basados en sesiones anteriores
- Sugerir capacidades más usadas
- Detectar títulos duplicados

### **2. Filtros en Vista Expandida**
- Por competencia
- Por estado (completas/parciales/pendientes)
- Por fecha (última semana/mes/bimestre)

### **3. Acciones Rápidas**
- Duplicar sesión con un clic
- Marcar sesión como "Favorita"
- Archivar sesiones antiguas

### **4. Estadísticas**
- Total de sesiones por competencia
- Promedio de calificación por sesión
- Sesiones más recientes sin calificar

---

## ✅ DECISIÓN FINAL

**RECOMENDACIÓN: Implementar Sheet Unificado** ✅

**Razones:**
1. Mejor UX - Menos intrusivo, más contextual
2. Más funcional - Combina crear + ver + gestionar
3. Escalable - Funciona con pocas o muchas sesiones
4. Consistente - Usa patrón ya establecido
5. Eficiente - Menos clics para acciones comunes

**¿Procedemos con esta implementación?**
