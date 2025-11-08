# 📚 Guía de Migración: Arquitectura Hexagonal + DDD + Zustand

## 🎯 Visión General

Esta guía documenta la migración de **AsistenciaFacil** hacia una arquitectura más robusta y mantenible usando **Arquitectura Hexagonal**, **Domain Driven Design (DDD)** y **Zustand** para state management.

## 🏗️ Arquitectura Implementada

### **Estructura de Directorios**
```
src/
├── domain/                          # Capa de dominio (DDD)
│   ├── entities/                    # Entidades de negocio
│   │   ├── Estudiante.ts
│   │   └── RegistroAsistencia.ts
│   ├── value-objects/               # Objetos de valor
│   │   └── EstadoAsistencia.ts
│   ├── ports/                       # Interfaces de repositorios
│   │   ├── EstudianteRepository.ts
│   │   └── AsistenciaRepository.ts
│   └── shared/                      # Utilidades compartidas
│       └── types.ts
├── application/                     # Capa de aplicación
│   └── use-cases/                   # Casos de uso
│       └── RegistrarAsistenciaUseCase.ts
├── infrastructure/                  # Capa de infraestructura
│   ├── adapters/                    # Adaptadores externos
│   │   ├── GoogleSheetsService.ts
│   │   └── AsistenciaAdapter.ts
│   ├── repositories/                # Implementaciones de repositorios
│   │   └── GoogleSheetsAsistenciaRepository.ts
│   ├── stores/                      # Stores de Zustand
│   │   └── asistenciaStore.ts
│   ├── factories/                   # Factories para DI
│   │   └── AsistenciaFactory.ts
│   └── hooks/                       # Hooks de infraestructura
│       └── useAsistenciaHibrida.ts
└── presentation/                    # Capa de presentación
    └── components/
        └── asistencia/
            └── AsistenciaFormHexagonal.tsx
```

## 🚀 Cómo Usar la Nueva Arquitectura

### **1. Configuración Básica**

```typescript
// En tu componente o página
import { useAsistenciaHibrida } from '@/infrastructure/hooks/useAsistenciaHibrida';
import { EstadoAsistencia } from '@/domain/value-objects/EstadoAsistencia';

function MiComponente() {
  const {
    asistenciasDelDia,
    isLoading,
    error,
    registrarAsistencia,
    setFecha
  } = useAsistenciaHibrida({
    googleSheetsConfig: {
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID!,
      credentials: JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS!)
    },
    currentUser: { numeroDocumento: '12345678' },
    autoLoad: true
  });

  // Usar la nueva arquitectura...
}
```

### **2. Usando el Adaptador (Compatibilidad)**

```typescript
// Para mantener compatibilidad con código existente
import { useAsistenciaAdapter } from '@/infrastructure/adapters/AsistenciaAdapter';

function ComponenteExistente() {
  const {
    subjects,
    state,
    dispatch,
    markAllAsPresent
  } = useAsistenciaAdapter('estudiantes', '1er Grado', 'A');

  // Compatible con el hook anterior
  // pero usando la nueva arquitectura internamente
}
```

### **3. Configuración de Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_spreadsheet_id
NEXT_PUBLIC_GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}
```

## 🔧 Domain Layer (DDD)

### **Entidades de Dominio**

```typescript
import { Estudiante } from '@/domain/entities/Estudiante';

// Crear estudiante con validación
const estudianteResult = Estudiante.crear({
  numeroDocumento: '12345678',
  tipoDocumento: TipoDocumento.DNI,
  nombres: 'Juan',
  apellidoPaterno: 'Pérez',
  grado: '1er Grado',
  seccion: 'A'
});

if (estudianteResult.isSuccess) {
  console.log('Estudiante creado:', estudianteResult.value.nombreCompleto);
} else {
  console.error('Error:', estudianteResult.error.message);
}
```

### **Value Objects**

```typescript
import { EstadoAsistencia } from '@/domain/value-objects/EstadoAsistencia';

// Crear estado de asistencia
const presente = EstadoAsistencia.PRESENTE;
const estado = EstadoAsistencia.fromString('tarde');

console.log(presente.esJustificable()); // false
console.log(EstadoAsistencia.TARDE.esJustificable()); // true
```

## 💾 State Management (Zustand)

### **Store de Asistencia**

```typescript
import { useAsistenciaStore } from '@/infrastructure/stores/asistenciaStore';

// En tu componente
const {
  asistenciasDelDia,
  isLoading,
  registrarAsistencia,
  setFecha
} = useAsistenciaStore();

// Acciones
await registrarAsistencia('12345678', EstadoAsistencia.PRESENTE);
setFecha(new Date());
```

## 🔌 Infrastructure Layer

### **Google Sheets Integration**

```typescript
// El repositorio maneja toda la integración con Google Sheets
const repository = new GoogleSheetsAsistenciaRepository(sheetsService);

// Operaciones disponibles
await repository.guardar(asistencia);
await repository.obtenerPorFecha(new Date());
await repository.obtenerEstadisticasPorFecha(new Date());
```

## 📊 Use Cases (Lógica de Negocio)

### **Registrar Asistencia**

```typescript
// El use case maneja toda la lógica de negocio
const useCase = new RegistrarAsistenciaUseCase(repository);

const result = await useCase.execute({
  estudianteId: '12345678',
  estado: EstadoAsistencia.PRESENTE,
  registradoPor: '87654321'
});

if (result.isSuccess) {
  console.log('Asistencia registrada:', result.value);
} else {
  console.error('Error:', result.error.message);
}
```

## 🔄 Migración Gradual

### **Paso 1: Usar Adaptador (Recomendado)**

```typescript
// Cambiar solo la importación
// ❌ Antes
import { useAsistencia } from '@/hooks/use-asistencia';

// ✅ Después
import { useAsistenciaAdapter } from '@/infrastructure/adapters/AsistenciaAdapter';
```

### **Paso 2: Migrar Componentes Nuevos**

```typescript
// Para componentes nuevos, usar directamente la nueva arquitectura
import { AsistenciaFormHexagonal } from '@/presentation/components/asistencia/AsistenciaFormHexagonal';
```

### **Paso 3: Refactor Gradual**

```typescript
// Migrar componentes existentes paso a paso
// 1. Cambiar imports a nueva arquitectura
// 2. Actualizar props y handlers
// 3. Eliminar código legacy
```

## 🧪 Testing

### **Testing de Use Cases**

```typescript
// tests/application/use-cases/RegistrarAsistenciaUseCase.test.ts
test('debe registrar asistencia correctamente', async () => {
  const mockRepository = new MockAsistenciaRepository();
  const useCase = new RegistrarAsistenciaUseCase(mockRepository);

  const result = await useCase.execute({
    estudianteId: '123',
    estado: EstadoAsistencia.PRESENTE,
    registradoPor: '456'
  });

  expect(result.isSuccess).toBe(true);
});
```

### **Testing de Stores**

```typescript
// tests/infrastructure/stores/asistenciaStore.test.ts
test('debe actualizar fecha y recargar asistencias', () => {
  const store = useAsistenciaStore.getState();

  store.setFecha(new Date('2024-01-15'));

  expect(store.fechaSeleccionada).toEqual(new Date('2024-01-15'));
});
```

## 🚨 Errores Comunes

### **1. Configuración Faltante**

```typescript
// ❌ Error común
const { asistenciasDelDia } = useAsistenciaHibrida({});

// ✅ Solución
const { asistenciasDelDia, isConfigured } = useAsistenciaHibrida({
  googleSheetsConfig: {
    spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID!,
    credentials: JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS!)
  },
  currentUser: { numeroDocumento: '12345678' }
});
```

### **2. Estado de Asistencia Incorrecto**

```typescript
// ❌ Error común
const estado = EstadoAsistencia.fromString('invalid');

// ✅ Solución
const estadoResult = EstadoAsistencia.fromString('presente');
if (estadoResult.isSuccess) {
  const estado = estadoResult.value;
}
```

## 📈 Mejores Prácticas

### **1. Validación de Dominio**

```typescript
// Siempre usar factory methods con validación
const estudianteResult = Estudiante.crear(data);
if (!estudianteResult.isSuccess) {
  throw new Error(estudianteResult.error.message);
}
const estudiante = estudianteResult.value;
```

### **2. Manejo de Errores**

```typescript
// Usar Result type para manejo de errores
const result = await useCase.execute(request);
if (result.isSuccess) {
  // Success path
} else {
  // Error path con mensaje específico
  console.error(result.error.message);
}
```

### **3. Inmutabilidad**

```typescript
// Zustand con Immer maneja inmutabilidad automáticamente
// No mutar estado directamente
set((state) => {
  state.asistenciasDelDia.push(nuevaAsistencia); // ❌ Mal
  // state.asistenciasDelDia = [...state.asistenciasDelDia, nuevaAsistencia]; // ✅ Bien (Immer lo hace)
});
```

## 🔧 Troubleshooting

### **Store no se actualiza**

```typescript
// Verificar que las dependencias estén configuradas
const { isConfigured } = useAsistenciaHibrida({...});
console.log('Store configurado:', isConfigured);
```

### **Google Sheets no funciona**

```typescript
// Verificar configuración
console.log('Google Sheets ID:', process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID);
console.log('Credenciales:', process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS);
```

### **TypeScript errors**

```typescript
// Asegurar imports correctos
import { EstadoAsistencia } from '@/domain/value-objects/EstadoAsistencia';
import { useAsistenciaStore } from '@/infrastructure/stores/asistenciaStore';
```

## 🎯 Próximos Pasos

1. **Migrar componentes existentes** al adaptador
2. **Implementar más use cases** (actualizar, eliminar asistencias)
3. **Agregar testing** para toda la nueva arquitectura
4. **Optimizar performance** con memoización
5. **Documentar APIs** públicas

## 📞 Soporte

Para preguntas o problemas:
1. Revisar esta documentación
2. Verificar configuración de environment variables
3. Consultar tests de ejemplo
4. Verificar logs del navegador

**¡La nueva arquitectura está lista para usar! 🚀**
