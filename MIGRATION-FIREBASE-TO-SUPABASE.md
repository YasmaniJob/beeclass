# 📋 PLAN DE MIGRACIÓN: Firebase → Supabase + Google Sheets

## 🎯 **SITUACIÓN ACTUAL**

Después del análisis exhaustivo del código, **no se encontró implementación de Firebase**. La aplicación actualmente usa:

- ✅ **Archivos estáticos** para datos maestros (estudiantes, docentes, áreas curriculares)
- ✅ **LocalStorage** para configuración y autenticación de usuarios
- ✅ **Google Sheets** ya configurado para asistencias (prueba de concepto)
- ✅ **Arquitectura hexagonal** ya implementada con adaptadores

## 🏗️ **ARQUITECTURA PROPUESTA**

### **📍 Distribución de Datos**

#### **🗄️ SUPABASE (Datos Maestros - Baja frecuencia de cambio)**
```sql
-- Tabla de estudiantes
CREATE TABLE estudiantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento TEXT NOT NULL,
  numero_documento TEXT UNIQUE NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  nombres TEXT NOT NULL,
  grado TEXT,
  seccion TEXT,
  nee TEXT,
  nee_documentos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de personal/docentes
CREATE TABLE personal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento TEXT NOT NULL,
  numero_documento TEXT UNIQUE NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  nombres TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  rol TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asignaciones (docentes a grados/secciones)
CREATE TABLE asignaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
  grado TEXT NOT NULL,
  seccion TEXT NOT NULL,
  rol_asignacion TEXT NOT NULL,
  area_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de horarios (horarios de docentes)
CREATE TABLE horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
  dia_semana TEXT NOT NULL,
  hora_id TEXT NOT NULL,
  asignacion_id UUID REFERENCES asignaciones(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de áreas curriculares
CREATE TABLE areas_curriculares (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  nivel TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de competencias
CREATE TABLE competencias (
  id TEXT PRIMARY KEY,
  area_id TEXT REFERENCES areas_curriculares(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de capacidades
CREATE TABLE capacidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia_id TEXT REFERENCES competencias(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de niveles educativos
CREATE TABLE niveles_educativos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **📊 GOOGLE SHEETS (Datos Transaccionales - Alta frecuencia)**

**Hoja: Asistencias**
```
EstudianteID | Fecha | Estado | HoraIngreso | RegistradoPor | ID
```

**Hoja: Incidentes**
```
ID | EstudianteID | Fecha | Descripción | ReportadoPor | Seguimiento
```

**Hoja: Permisos**
```
ID | EstudianteID | FechaInicio | FechaFin | Motivo | RegistradoPor
```

**Hoja: Calificaciones**
```
ID | EstudianteID | DocenteID | ÁreaID | CompetenciaID | Periodo | Fecha | Nota
```

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Configuración Base (1-2 días)**

#### **1.1 Configuración de Supabase**
- [ ] Crear proyecto en Supabase
- [ ] Configurar variables de entorno
- [ ] Instalar dependencias de Supabase
- [ ] Crear archivo de configuración de base de datos

#### **1.2 Schema de Base de Datos**
- [ ] Crear todas las tablas en Supabase
- [ ] Configurar RLS (Row Level Security)
- [ ] Crear políticas de acceso
- [ ] Configurar triggers para updated_at

### **FASE 2: Repositorios y Servicios (2-3 días)**

#### **2.1 Repositorios de Supabase**
- [ ] `SupabaseEstudianteRepository` - CRUD estudiantes
- [ ] `SupabasePersonalRepository` - CRUD personal/docentes
- [ ] `SupabaseAsignacionRepository` - CRUD asignaciones
- [ ] `SupabaseAreaCurricularRepository` - CRUD áreas y competencias
- [ ] `SupabaseConfiguracionRepository` - Configuración de institución

#### **2.2 Adaptadores de Google Sheets**
- [ ] Mejorar `GoogleSheetsAsistenciaRepository`
- [ ] Crear `GoogleSheetsIncidenteRepository`
- [ ] Crear `GoogleSheetsPermisoRepository`
- [ ] Crear `GoogleSheetsCalificacionRepository`

### **FASE 3: Migración de Datos (1-2 días)**

#### **3.1 Scripts de Migración**
- [ ] Script para migrar estudiantes desde archivos estáticos
- [ ] Script para migrar personal/docentes
- [ ] Script para migrar áreas curriculares y competencias
- [ ] Script para migrar asignaciones y horarios

#### **3.2 Validación de Datos**
- [ ] Verificar integridad de datos migrados
- [ ] Probar consultas y relaciones
- [ ] Validar performance de queries

### **FASE 4: Actualización de Hooks (2-3 días)**

#### **4.1 Reemplazar useMatriculaData**
- [ ] Modificar para usar repositorios de Supabase
- [ ] Mantener compatibilidad con código existente
- [ ] Implementar caching inteligente

#### **4.2 Actualizar Autenticación**
- [ ] Migrar de localStorage a Supabase Auth
- [ ] Actualizar `use-current-user.tsx`
- [ ] Implementar roles y permisos en Supabase

#### **4.3 Actualizar Hooks Específicos**
- [ ] `use-estudiantes.ts` → Supabase
- [ ] `use-docentes.ts` → Supabase
- [ ] `use-asistencia.ts` → Google Sheets
- [ ] `use-incidentes.ts` → Google Sheets

### **FASE 5: Adaptadores y Compatibilidad (1-2 días)**

#### **5.1 Factory Pattern Mejorado**
- [ ] `SupabaseFactory` para datos maestros
- [ ] `GoogleSheetsFactory` para datos transaccionales
- [ ] Dependency injection mejorada

#### **5.2 Adaptadores de Compatibilidad**
- [ ] `SupabaseAdapter` para código legacy
- [ ] `HybridAdapter` para datos mixtos
- [ ] Mantener interfaces existentes

## 📁 **ESTRUCTURA FINAL PROPUESTA**

```
src/
├── domain/
│   ├── entities/          # ✅ Ya implementado
│   ├── value-objects/     # ✅ Ya implementado
│   ├── ports/            # ✅ Ya implementado
│   └── shared/           # ✅ Ya implementado
├── application/
│   └── use-cases/        # ✅ Ya implementado
├── infrastructure/
│   ├── adapters/
│   │   ├── supabase/     # 🆕 Supabase services
│   │   ├── google-sheets/ # ✅ Ya existe (mejorar)
│   │   └── legacy/       # 🆕 Adaptadores de compatibilidad
│   ├── repositories/
│   │   ├── supabase/     # 🆕 Repositorios Supabase
│   │   └── google-sheets/ # ✅ Ya existe (mejorar)
│   ├── stores/           # ✅ Ya implementado (Zustand)
│   ├── factories/        # ✅ Ya implementado (mejorar)
│   └── hooks/            # ✅ Ya implementado (actualizar)
└── presentation/         # ✅ Ya implementado
```

## 🔧 **CONFIGURACIÓN REQUERIDA**

### **Variables de Entorno**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Sheets (ya existe)
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_spreadsheet_id
NEXT_PUBLIC_GOOGLE_CREDENTIALS={"type":"service_account",...}
```

### **Dependencias a Agregar**
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0"
}
```

## ✅ **VENTAJAS DE LA ARQUITECTURA PROPUESTA**

### **1. Separación por Frecuencia de Uso**
- **Supabase**: Datos maestros (baja frecuencia, alta consistencia)
- **Google Sheets**: Datos transaccionales (alta frecuencia, flexibilidad)

### **2. Performance Optimizada**
- **Consultas rápidas** en datos estructurados (Supabase)
- **Flexibilidad** para reportes y análisis (Google Sheets)
- **Caching inteligente** en frontend

### **3. Seguridad y Escalabilidad**
- **Autenticación robusta** con Supabase Auth
- **RLS policies** para seguridad granular
- **Backup automático** en ambas plataformas

### **4. Mantenibilidad**
- **Código limpio** con separación clara
- **Testing fácil** con datos estructurados
- **Migración gradual** sin breaking changes

## 🎯 **CRONOGRAMA SUGERIDO**

| Semana | Actividad | Entregable |
|--------|-----------|------------|
| **1** | Configuración Supabase + Schema | Base de datos lista |
| **2** | Repositorios y migración | Datos migrados |
| **3** | Hooks y adaptadores | Integración completa |
| **4** | Testing y optimización | Sistema en producción |

## 🔍 **MÉTRICAS DE ÉXITO**

- ✅ **0 data loss** en migración
- ✅ **100% compatibility** con código existente
- ✅ **Performance mejorada** vs archivos estáticos
- ✅ **Type safety** completa en nueva arquitectura
- ✅ **Testing coverage** > 80%

## 🚨 **CONSIDERACIONES IMPORTANTES**

### **Compatibilidad Hacia Atrás**
- Mantener interfaces existentes
- Adaptadores para código legacy
- Migración gradual por módulos

### **Performance**
- Implementar caching en hooks
- Lazy loading para datos no críticos
- Optimizar queries con índices

### **Seguridad**
- RLS policies estrictas
- Validación en frontend y backend
- Audit logging para cambios críticos

---

**¿Quieres que proceda con la implementación de alguna fase específica del plan?**
