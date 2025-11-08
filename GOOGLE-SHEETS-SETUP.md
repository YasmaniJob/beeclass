# 📊 Configuración de Google Sheets - Inkuña

## ✅ Progreso Actual

- ✅ Service Account creada
- ✅ Credenciales configuradas en `.env.local`
- ✅ Código de integración implementado
- ⏳ Falta: Crear hoja de cálculo y configurar ID

---

## 🔧 PASO FINAL: Crear Hoja de Cálculo

### 1️⃣ Crear Nueva Hoja de Cálculo

1. Ve a: https://docs.google.com/spreadsheets/
2. Click en **"+ Crear"** o **"Hoja de cálculo en blanco"**
3. Nombra la hoja: **"Inkuña - Asistencias"**

---

### 2️⃣ Configurar la Hoja "Asistencias"

**Renombra la primera pestaña:**
- Click derecho en "Hoja 1"
- Selecciona "Cambiar nombre"
- Nombre: `Asistencias`

**Agrega los encabezados en la fila 1:**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Estudiante ID | Grado | Sección | Fecha | Estado | Registrado Por | Observaciones | Timestamp |

**Formato recomendado:**
- Fila 1: Negrita, fondo gris claro
- Columnas: Ajustar ancho automáticamente

---

### 3️⃣ Compartir con Service Account

**IMPORTANTE:** Debes compartir la hoja con el email de tu Service Account.

1. Click en **"Compartir"** (botón verde, esquina superior derecha)
2. En "Agregar personas y grupos", pega:
   ```
   inkuna-sheets@clean-respect-476520-e3.iam.gserviceaccount.com
   ```
3. Rol: **Editor**
4. **Desactiva** "Notificar a las personas"
5. Click en **"Compartir"**

---

### 4️⃣ Copiar el ID de la Hoja

El ID está en la URL de tu hoja de cálculo:

```
https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
```

**Ejemplo:**
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                      ↑
                                      Este es el ID
```

Copia solo la parte entre `/d/` y `/edit`

---

### 5️⃣ Agregar ID al .env.local

Abre tu archivo `.env.local` y actualiza:

```bash
# Reemplaza con tu ID real
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

## 🧪 PASO 6: Probar la Integración

### Reinicia el servidor de desarrollo:

```bash
# Detén el servidor (Ctrl+C)
# Inicia de nuevo
pnpm dev
```

### Prueba la API:

**Opción A: Desde el navegador**
```
http://localhost:9002/api/google-sheets/asistencias
```

Deberías ver:
```json
{
  "success": true,
  "data": []
}
```

**Opción B: Desde la terminal (PowerShell)**
```powershell
# GET - Leer asistencias
Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method GET

# POST - Guardar asistencia de prueba
$body = @{
    estudianteId = "12345678"
    grado = "1er Grado"
    seccion = "A"
    fecha = "2025-10-28"
    status = "presente"
    registradoPor = "Admin"
    observaciones = "Prueba de integración"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method POST -Body $body -ContentType "application/json"
```

---

## ✅ Verificación

Después de hacer el POST, verifica:

1. **En la terminal:** Deberías ver `{ success: true, data: {...} }`
2. **En Google Sheets:** Deberías ver una nueva fila con los datos
3. **En la API GET:** Deberías ver el registro que acabas de crear

---

## 🎯 Estructura de Datos

### Formato de Asistencia:

```typescript
{
  estudianteId: string;      // DNI o ID del estudiante
  grado: string;             // Ej: "1er Grado", "2do Grado"
  seccion: string;           // Ej: "A", "B", "C"
  fecha: string;             // Formato: "YYYY-MM-DD"
  status: "presente" | "tarde" | "falta" | "permiso";
  registradoPor: string;     // Usuario que registró
  observaciones?: string;    // Opcional
}
```

### Batch (múltiples asistencias):

```typescript
POST /api/google-sheets/asistencias
Content-Type: application/json

[
  {
    estudianteId: "12345678",
    grado: "1er Grado",
    seccion: "A",
    fecha: "2025-10-28",
    status: "presente",
    registradoPor: "Admin"
  },
  {
    estudianteId: "87654321",
    grado: "1er Grado",
    seccion: "A",
    fecha: "2025-10-28",
    status: "tarde",
    registradoPor: "Admin"
  }
]
```

---

## 🔍 Troubleshooting

### Error: "Google Sheets credentials not configured"
**Solución:** Verifica que `.env.local` tenga las variables correctas y reinicia el servidor.

### Error: "GOOGLE_SHEETS_SPREADSHEET_ID not configured"
**Solución:** Agrega el ID de la hoja en `.env.local` y reinicia.

### Error: "The caller does not have permission"
**Solución:** Asegúrate de haber compartido la hoja con el email de la Service Account como **Editor**.

### Error: "Unable to parse range"
**Solución:** Verifica que la pestaña se llame exactamente `Asistencias` (con mayúscula inicial).

### No aparecen datos en Google Sheets
**Solución:** 
1. Verifica que el POST devuelva `success: true`
2. Refresca la hoja de cálculo (F5)
3. Verifica que los encabezados estén en la fila 1

---

## 📚 Próximos Pasos

Una vez que la integración funcione:

1. ✅ Actualizar componentes de asistencia para usar Google Sheets
2. ✅ Crear hook `useAsistencias` para facilitar el uso
3. ✅ Implementar caché local para mejor rendimiento
4. ✅ Agregar sincronización automática

---

## 🎉 ¡Listo!

Cuando veas datos en Google Sheets después de hacer un POST, la integración está funcionando correctamente.

**Dime cuando hayas completado estos pasos y continuamos con la integración en los componentes de la UI.** 🚀
