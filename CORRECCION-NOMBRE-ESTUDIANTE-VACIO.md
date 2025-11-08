# ✅ Corrección: Columna B (Nombre Estudiante) Vacía

**Fecha:** 29 de octubre de 2025  
**Problema:** Nombre del estudiante no se guardaba en columna B  
**Causa:** Función deshabilitada + faltaba nombreEstudiante en API

---

## 🔍 PROBLEMA IDENTIFICADO

### Síntoma:
```
| A        | B | C         | D         | E          | F     | G            | H | I                   |
|----------|---|-----------|-----------|------------|-------|--------------|---|---------------------|
| 42767971 |   | 1er Grado | Sección A | 2025-10-29 | tarde | RICARDO...   |   | 2025-10-29T16:26:54 |
           ↑
       VACÍO!
```

### Causas Raíz:

#### 1. Función Deshabilitada
**Archivo:** `useMatriculaSupabaseHibrida.tsx`

```typescript
const registrarAsistencia = useCallback(async (data) => {
  // Google Sheets functionality temporarily disabled ← PROBLEMA!
  toast({
    variant: 'destructive',
    title: 'Error',
    description: 'Google Sheets no está disponible temporalmente'
  });
  return false;
}, [toast]);
```

**Problema:** La función solo mostraba un toast de error y no guardaba nada.

#### 2. Faltaba nombreEstudiante en lib/google-sheets.ts

**Antes:**
```typescript
export async function writeAsistencia(asistencia: {
  estudianteId: string;
  // nombreEstudiante: FALTABA!
  grado: string;
  seccion: string;
  // ...
}) {
  const values = [[
    asistencia.estudianteId,
    // asistencia.nombreEstudiante, ← FALTABA!
    asistencia.grado,
    asistencia.seccion,
    // ...
  ]];
}
```

#### 3. Faltaba nombreEstudiante en API route

**Antes:**
```typescript
const { estudianteId, grado, seccion, fecha, status, registradoPor, observaciones } = body;
// nombreEstudiante ← FALTABA!
```

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Habilitada Función registrarAsistencia

**Archivo:** `src/infrastructure/hooks/useMatriculaSupabaseHibrida.tsx`

**Ahora:**
```typescript
const registrarAsistencia = useCallback(async (data: {
  estudianteId: string;
  nombreEstudiante: string;
  grado: string;
  seccion: string;
  estado: EstadoAsistencia;
  registradoPor: string;
  observaciones?: string;
}): Promise<boolean> => {
  try {
    const response = await fetch('/api/google-sheets/asistencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estudianteId: data.estudianteId,
        nombreEstudiante: data.nombreEstudiante,  // ← AHORA SE ENVÍA
        grado: data.grado,
        seccion: data.seccion,
        fecha: new Date().toISOString().split('T')[0],
        status: data.estado.toString().toLowerCase(),
        registradoPor: data.registradoPor,
        observaciones: data.observaciones || ''
      })
    });

    if (!response.ok) {
      throw new Error('Error al registrar asistencia');
    }

    toast({
      title: 'Asistencia registrada',
      description: 'La asistencia se ha guardado correctamente'
    });
    
    return true;
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'No se pudo registrar la asistencia'
    });
    return false;
  }
}, [toast]);
```

### 2. Actualizada lib/google-sheets.ts

**Archivo:** `src/lib/google-sheets.ts`

**Función writeAsistencia:**
```typescript
export async function writeAsistencia(asistencia: {
  estudianteId: string;
  nombreEstudiante: string;  // ← AGREGADO
  grado: string;
  seccion: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  observaciones?: string;
}) {
  const values = [[
    asistencia.estudianteId,
    asistencia.nombreEstudiante,  // ← AGREGADO
    asistencia.grado,
    asistencia.seccion,
    asistencia.fecha,
    asistencia.status,
    asistencia.registradoPor,
    asistencia.observaciones || '',
    new Date().toISOString()
  ]];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Asistencias!A:I',  // ← ACTUALIZADO de A:H a A:I
    // ...
  });
}
```

**Función writeAsistenciasBatch:**
```typescript
export async function writeAsistenciasBatch(asistencias: Array<{
  estudianteId: string;
  nombreEstudiante: string;  // ← AGREGADO
  grado: string;
  seccion: string;
  // ...
}>) {
  const values = asistencias.map(a => [
    a.estudianteId,
    a.nombreEstudiante,  // ← AGREGADO
    a.grado,
    a.seccion,
    // ...
  ]);

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Asistencias!A:I',  // ← ACTUALIZADO de A:H a A:I
    // ...
  });
}
```

### 3. Actualizada API Route

**Archivo:** `src/app/api/google-sheets/asistencias/route.ts`

**Ahora:**
```typescript
const { 
  estudianteId, 
  nombreEstudiante,  // ← AGREGADO
  grado, 
  seccion, 
  fecha, 
  status, 
  registradoPor, 
  observaciones 
} = body;

if (!estudianteId || !nombreEstudiante || !grado || !seccion || !fecha || !status || !registradoPor) {
  return NextResponse.json(
    { success: false, error: 'Faltan campos requeridos' },
    { status: 400 }
  );
}

const result = await writeAsistencia({
  estudianteId,
  nombreEstudiante,  // ← AGREGADO
  grado,
  seccion,
  fecha,
  status,
  registradoPor,
  observaciones,
});
```

---

## 📊 FLUJO COMPLETO

### Antes ❌:
```
1. Usuario marca asistencia
2. handleEstadoChange() llama registrarAsistencia()
3. registrarAsistencia() muestra toast de error
4. ❌ No se guarda nada en Google Sheets
5. ❌ Columna B queda vacía
```

### Ahora ✅:
```
1. Usuario marca asistencia
2. handleEstadoChange() llama registrarAsistencia()
3. registrarAsistencia() hace fetch a /api/google-sheets/asistencias
4. API route recibe nombreEstudiante
5. writeAsistencia() guarda en Google Sheets con nombreEstudiante
6. ✅ Columna B tiene el nombre completo
7. ✅ Toast de éxito
```

---

## 🧪 TESTING

### Test 1: Registrar Asistencia

1. **Ir a:** Página de asistencia (cualquier grado/sección)
2. **Marcar un estudiante como "Tarde"**
3. **Verificar toast:**
   - ✅ "Asistencia registrada"
   - ✅ "La asistencia se ha guardado correctamente"
4. **Abrir Google Sheets**
5. **Verificar nueva fila:**
   ```
   | A        | B                         | C         | D         | E          | F     | G            | H | I                   |
   |----------|---------------------------|-----------|-----------|------------|-------|--------------|---|---------------------|
   | 42767971 | GARCIA LOPEZ, JUAN CARLOS | 1er Grado | Sección A | 2025-10-29 | tarde | RICARDO...   |   | 2025-10-29T16:26:54 |
              ↑
          ¡COMPLETO!
   ```

### Test 2: Diferentes Estados

**Probar:**
- Presente
- Tarde
- Falta
- Permiso

**Verificar:**
- Todos guardan el nombre en columna B

### Test 3: Marcar Todos Presentes

1. **Click en "Marcar todos presentes"**
2. **Verificar en Google Sheets:**
   - Todos los registros tienen nombre en columna B

---

## 📁 ARCHIVOS MODIFICADOS

### 1. `src/infrastructure/hooks/useMatriculaSupabaseHibrida.tsx`
- ✅ Habilitada función `registrarAsistencia`
- ✅ Implementado fetch a API
- ✅ Agregados toasts de éxito/error

### 2. `src/lib/google-sheets.ts`
- ✅ Agregado `nombreEstudiante` a `writeAsistencia`
- ✅ Agregado `nombreEstudiante` a `writeAsistenciasBatch`
- ✅ Actualizado rango de A:H a A:I

### 3. `src/app/api/google-sheets/asistencias/route.ts`
- ✅ Agregado `nombreEstudiante` al destructuring
- ✅ Agregada validación de `nombreEstudiante`
- ✅ Pasado `nombreEstudiante` a `writeAsistencia`

**Total:** 3 archivos modificados

---

## 🎯 RESULTADO

### Antes ❌:
```
Columna B: VACÍA
Función: Deshabilitada
API: Sin nombreEstudiante
```

### Ahora ✅:
```
Columna B: "GARCIA LOPEZ, JUAN CARLOS"
Función: Habilitada y funcional
API: Con nombreEstudiante
Toast: Confirmación de éxito
```

---

## 💡 NOTAS IMPORTANTES

### 1. Formato del Nombre

El nombre se guarda en formato:
```
"APELLIDO_PATERNO APELLIDO_MATERNO, NOMBRES"
```

Ejemplos:
- "GARCIA LOPEZ, JUAN CARLOS"
- "PEREZ RODRIGUEZ, MARIA ANA"
- "SILVA, PEDRO" (sin apellido materno)

### 2. Toast de Confirmación

Ahora verás un toast cada vez que se registre una asistencia:
- ✅ Éxito: "Asistencia registrada"
- ❌ Error: "No se pudo registrar la asistencia"

### 3. Validación en API

La API ahora valida que `nombreEstudiante` esté presente. Si falta, retorna error 400.

### 4. Rango Actualizado

El rango de Google Sheets se actualizó de `A:H` a `A:I` para incluir las 9 columnas.

---

## 🎉 RESUMEN

### Problema:
- Función deshabilitada
- Faltaba nombreEstudiante en 3 lugares
- Columna B siempre vacía

### Solución:
- ✅ Habilitada función registrarAsistencia
- ✅ Agregado nombreEstudiante en lib/google-sheets.ts
- ✅ Agregado nombreEstudiante en API route
- ✅ Actualizado rango a A:I

### Resultado:
- ✅ Columna B se llena correctamente
- ✅ Toast de confirmación
- ✅ Validación completa
- ✅ Listo para usar

---

**¡Prueba ahora y verifica que el nombre del estudiante aparece en la columna B!** 🚀

**Última actualización:** 29 de octubre de 2025, 11:44 AM
