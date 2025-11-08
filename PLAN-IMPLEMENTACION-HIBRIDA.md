# Plan de Implementación: Sistema Híbrido Supabase + Google Sheets

## 🎯 Objetivo
Implementar un sistema de gestión educativa **100% gratuito** y **escalable** usando:
- **Supabase** para datos maestros y autenticación
- **Google Sheets** para datos transaccionales de alta frecuencia
- **localStorage** para configuración de UI

---

## 📅 FASE 1: Setup Supabase (2-3 días)

### Día 1: Crear Proyecto y Esquema

#### 1.1 Crear cuenta en Supabase
```bash
# 1. Ir a https://supabase.com
# 2. Sign up con GitHub (gratis)
# 3. Crear nuevo proyecto
#    - Nombre: asistenciafacil
#    - Database Password: [guardar en lugar seguro]
#    - Region: South America (São Paulo)
```

#### 1.2 Crear tablas (SQL Editor en Supabase)

```sql
-- Tabla: estudiantes
CREATE TABLE estudiantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_documento VARCHAR(10) NOT NULL,
  numero_documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  grado VARCHAR(50),
  seccion VARCHAR(10),
  nee TEXT,
  nee_documentos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_estudiantes_grado_seccion ON estudiantes(grado, seccion);
CREATE INDEX idx_estudiantes_documento ON estudiantes(numero_documento);

-- Tabla: personal
CREATE TABLE personal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_documento VARCHAR(10) NOT NULL,
  numero_documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(20),
  rol VARCHAR(50) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: areas_curriculares
CREATE TABLE areas_curriculares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  nivel VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: competencias
CREATE TABLE competencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID REFERENCES areas_curriculares(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: capacidades
CREATE TABLE capacidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competencia_id UUID REFERENCES competencias(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: asignaciones (relación docente-grado-área)
CREATE TABLE asignaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
  grado VARCHAR(50) NOT NULL,
  seccion VARCHAR(10) NOT NULL,
  rol_asignacion VARCHAR(50) NOT NULL,
  area_id UUID REFERENCES areas_curriculares(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: niveles_educativos
CREATE TABLE niveles_educativos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar niveles básicos
INSERT INTO niveles_educativos (nombre) VALUES 
  ('Inicial'),
  ('Primaria'),
  ('Secundaria');
```

#### 1.3 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas_curriculares ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo por ahora, refinar después)
CREATE POLICY "Enable read access for all users" ON estudiantes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON estudiantes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON estudiantes FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON estudiantes FOR DELETE USING (true);

-- Repetir para otras tablas...
-- (En producción, refinar estas políticas según roles)
```

### Día 2: Configurar Variables de Entorno

#### 2.1 Obtener credenciales de Supabase
```bash
# En Supabase Dashboard:
# Settings → API
# Copiar:
# - Project URL
# - anon/public key
# - service_role key (¡NUNCA exponer al cliente!)
```

#### 2.2 Crear archivo .env.local
```bash
# En la raíz del proyecto
# h:\Aplicaciones\Asistneciajem\.env.local

NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2.3 Migrar datos iniciales

```typescript
// scripts/migrate-to-supabase.ts
import { createClient } from '@supabase/supabase-js';
import { fullEstudiantesList } from '../src/lib/alumnos-data';
import { initialDocentes } from '../src/lib/docentes-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrate() {
  console.log('Migrando estudiantes...');
  
  for (const estudiante of fullEstudiantesList) {
    const { error } = await supabase.from('estudiantes').insert({
      tipo_documento: estudiante.tipoDocumento,
      numero_documento: estudiante.numeroDocumento,
      nombres: estudiante.nombres,
      apellido_paterno: estudiante.apellidoPaterno,
      apellido_materno: estudiante.apellidoMaterno,
      grado: estudiante.grado,
      seccion: estudiante.seccion,
      nee: estudiante.nee,
      nee_documentos: estudiante.neeDocumentos,
    });
    
    if (error) console.error('Error:', error);
  }
  
  console.log('✅ Migración completada');
}

migrate();
```

```bash
# Ejecutar migración
pnpm tsx scripts/migrate-to-supabase.ts
```

### Día 3: Actualizar Código

#### 3.1 Ya está hecho ✅
Los repositorios Supabase ya existen:
- `SupabaseEstudianteRepository.ts`
- `SupabasePersonalRepository.ts`
- `SupabaseAreaCurricularRepository.ts`

Solo necesitan las variables de entorno.

#### 3.2 Activar en useMatriculaSupabaseHibrida

```typescript
// src/infrastructure/hooks/useMatriculaSupabaseHibrida.tsx
// Descomentar las líneas que deshabilitamos hoy
// Ya está todo el código, solo falta configuración
```

---

## 📅 FASE 2: Setup Google Sheets (2-3 días)

### Día 1: Configurar Google Cloud

#### 1.1 Crear Service Account
```bash
# 1. Ir a https://console.cloud.google.com
# 2. Crear nuevo proyecto: "AsistenciaFacil"
# 3. Habilitar Google Sheets API
# 4. Crear Service Account
#    - Nombre: asistenciafacil-sheets
#    - Rol: Editor
# 5. Crear clave JSON
# 6. Descargar archivo de credenciales
```

#### 1.2 Configurar variables de entorno

```bash
# Agregar a .env.local

# Google Sheets
GOOGLE_SHEETS_ID=1abc123def456...
GOOGLE_PROJECT_ID=asistenciafacil-123456
GOOGLE_PRIVATE_KEY_ID=abc123...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_CLIENT_EMAIL=asistenciafacil-sheets@asistenciafacil-123456.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=123456789...
```

### Día 2: Crear Google Sheet

#### 2.1 Estructura de la hoja

```
Hoja 1: Asistencias
| ID | EstudianteID | Fecha | Estado | HoraIngreso | RegistradoPor | Timestamp | Observaciones |

Hoja 2: Incidentes
| ID | EstudianteID | Fecha | Descripcion | ReportadoPor | Seguimiento | Timestamp |

Hoja 3: Permisos
| ID | EstudianteID | FechaInicio | FechaFin | Motivo | RegistradoPor | Timestamp |
```

#### 2.2 Compartir con Service Account
```bash
# Compartir la hoja con el email del service account
# asistenciafacil-sheets@asistenciafacil-123456.iam.gserviceaccount.com
# Permisos: Editor
```

### Día 3: Crear API Routes

```typescript
// src/app/api/sheets/asistencias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const values = [[
      crypto.randomUUID(),
      body.estudianteId,
      body.fecha,
      body.estado,
      body.horaIngreso || '',
      body.registradoPor,
      new Date().toISOString(),
      body.observaciones || ''
    ]];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Asistencias!A:H',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Asistencias!A2:H',
    });
    
    return NextResponse.json({ data: response.data.values || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## 📅 FASE 3: Integración (1-2 días)

### Actualizar useMatriculaSupabaseHibrida

```typescript
// Ya está implementado, solo descomentar:
// 1. Importación de AsistenciaGoogleSheetsService
// 2. Inicialización del servicio
// 3. Funciones de asistencias, incidentes, permisos
```

---

## 📊 ESTIMACIÓN DE RECURSOS

### Supabase Free Tier
```
✅ 500MB almacenamiento
   - Estudiantes: ~2000 × 1KB = 2MB
   - Docentes: ~100 × 1KB = 100KB
   - Áreas: ~50 × 2KB = 100KB
   - Total: ~3MB (0.6% del límite)

✅ 50,000 requests/día
   - Cargas de página: ~100/día
   - Operaciones CRUD: ~200/día
   - Total: ~300/día (0.6% del límite)

✅ 2GB transferencia/mes
   - Suficiente para 100+ usuarios
```

### Google Sheets
```
✅ 10,000,000 celdas
   - Asistencias: 2000/día × 8 columnas × 365 días = 5.8M celdas
   - Incidentes: ~50/día × 7 columnas × 365 días = 128K celdas
   - Permisos: ~20/día × 7 columnas × 365 días = 51K celdas
   - Total año 1: ~6M celdas (60% del límite)

✅ 100 requests/100 segundos
   - Con batching: suficiente para 50 usuarios concurrentes
```

---

## ⚠️ LIMITACIONES Y MITIGACIONES

### Limitación 1: Latencia de Google Sheets
```
Problema: 300-800ms por request
Solución: 
  - Cache en memoria (5 minutos)
  - Batch operations
  - Optimistic UI updates
```

### Limitación 2: Concurrencia
```
Problema: Conflictos en escrituras simultáneas
Solución:
  - Queue de operaciones
  - Retry logic
  - Timestamps para resolución
```

### Limitación 3: Límite de Supabase
```
Problema: 500MB puede llenarse en 2-3 años
Solución:
  - Archivar datos antiguos a Google Sheets
  - Comprimir imágenes/documentos
  - Limpiar datos no usados
```

---

## 🎯 CRITERIOS DE ÉXITO

### Mes 1
- ✅ Supabase configurado y funcionando
- ✅ Google Sheets recibiendo asistencias
- ✅ 10 usuarios de prueba
- ✅ Sin pérdida de datos

### Mes 3
- ✅ 50 usuarios activos
- ✅ 5000+ asistencias registradas
- ✅ Latencia < 2 segundos
- ✅ Uptime > 99%

### Mes 6
- ✅ 100+ usuarios
- ✅ 20,000+ asistencias
- ✅ Backup automático funcionando
- ✅ Costo: $0/mes

---

## 💰 PLAN DE ESCALAMIENTO

### Si se excede Supabase Free (500MB)
```
Opción 1: Upgrade a Pro ($25/mes)
  - 8GB almacenamiento
  - 100GB transferencia
  - Soporte prioritario

Opción 2: Migrar a PostgreSQL self-hosted
  - Railway: $5/mes
  - Render: $7/mes
  - Fly.io: $0-5/mes

Opción 3: Archivar datos antiguos
  - Mover asistencias >1 año a Google Sheets
  - Mantener solo datos activos en Supabase
```

### Si se excede Google Sheets (10M celdas)
```
Opción 1: Crear nueva hoja por año
  - Asistencias-2025, Asistencias-2026, etc.
  - Gratis, ilimitado

Opción 2: Migrar a BigQuery
  - 10GB gratis/mes
  - Queries SQL completas
```

---

## 🚀 PRÓXIMOS PASOS

1. **HOY**: Crear cuenta Supabase
2. **Mañana**: Ejecutar SQL schema
3. **Día 3**: Configurar .env.local
4. **Día 4**: Migrar datos iniciales
5. **Día 5**: Probar con 10 estudiantes
6. **Semana 2**: Configurar Google Sheets
7. **Semana 3**: Testing completo
8. **Semana 4**: Deploy a producción

---

## 📞 SOPORTE

### Recursos Gratuitos
- Supabase Docs: https://supabase.com/docs
- Google Sheets API: https://developers.google.com/sheets
- Next.js Docs: https://nextjs.org/docs
- Discord Supabase: https://discord.supabase.com

### Comunidad
- Stack Overflow
- Reddit r/nextjs
- GitHub Discussions

---

**Costo Total: $0/mes**
**Tiempo de Implementación: 7-10 días**
**Escalabilidad: 2-3 años sin costo**
**Viabilidad: ✅ ALTA**
