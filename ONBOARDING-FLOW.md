# Flujo de Onboarding - Beeclass

## Descripción General

El flujo de onboarding guía a los administradores a través de la configuración inicial de la aplicación cuando la usan por primera vez. Este proceso asegura que la aplicación esté correctamente configurada antes de su uso.

## Características

### ✅ Configuración Inicial Obligatoria
- **Nivel Educativo**: Inicial, Primaria o Secundaria (obligatorio)
- **Nombre de la Institución**: Nombre de la institución educativa (obligatorio)
- **Nombre de la Aplicación**: Personalización del nombre de la app (opcional)

### ✅ Experiencia de Usuario
- Wizard paso a paso con 4 pasos
- Barra de progreso visual
- Validaciones en cada paso
- Diseño limpio y moderno
- Confirmación antes de finalizar

### ✅ Migración Automática
- Usuarios existentes con configuración previa no ven el onboarding
- Se marca automáticamente como completado si ya existe configuración

## Flujo Técnico

### 1. Detección de Onboarding Pendiente

El componente `OnboardingGuard` verifica:
1. Si el usuario está autenticado
2. Si el usuario es administrador
3. Si el onboarding está completado (`localStorage: onboarding_completed`)
4. Si ya existe configuración previa (nivel educativo configurado)

### 2. Redirección Automática

**Para nuevos administradores:**
- Al iniciar sesión → Redirige a `/onboarding`
- No puede acceder a otras páginas hasta completar el onboarding

**Para administradores existentes:**
- Si ya tienen nivel configurado → Marca onboarding como completado automáticamente
- Acceso normal a todas las páginas

**Para otros roles (docentes, auxiliares):**
- No requieren completar onboarding
- Acceso normal a todas las páginas

### 3. Pasos del Onboarding

#### Paso 1: Bienvenida
- Mensaje de bienvenida
- Explicación del proceso
- Botón "Comenzar"

#### Paso 2: Nivel Educativo (Obligatorio)
- Selector con 3 opciones:
  - Inicial (3 a 5 años)
  - Primaria (1° a 6° grado)
  - Secundaria (1° a 5° año)
- Explicación: "Esto determinará las áreas curriculares disponibles"
- No se puede continuar sin seleccionar

#### Paso 3: Información Básica
- **Nombre de la Institución** (obligatorio)
  - Ejemplo: "I.E. San José"
- **Nombre de la Aplicación** (opcional)
  - Default: "Beeclass"
  - Aparece en sidebar y reportes

#### Paso 4: Confirmación
- Resumen de toda la configuración
- Nota: "Puedes cambiar esto después en Ajustes"
- Botón "Comenzar a usar la aplicación"

### 4. Guardado de Configuración

Al completar el onboarding:
1. Se guarda la configuración en `localStorage` (via `useAppConfig`)
2. Se marca `onboarding_completed = true` en `localStorage`
3. Se redirige al dashboard principal

## Archivos Involucrados

### Componentes Principales
- `src/app/onboarding/page.tsx` - Página del wizard de onboarding
- `src/components/onboarding-guard.tsx` - Guard que verifica y redirige
- `src/components/auth-layout-renderer.tsx` - Integración del guard en el layout

### Hooks y Contextos
- `src/hooks/use-app-config.tsx` - Manejo de configuración de la app

### Estilos
- Usa componentes de shadcn/ui
- Diseño responsive
- Gradiente de fondo personalizado

## Configuración Posterior

Los administradores pueden modificar la configuración en:
- **Ajustes → Personalización**
  - Cambiar nivel educativo (con advertencia)
  - Cambiar nombre de institución
  - Cambiar nombre de la app
  - Agregar logo personalizado
  - Agregar imagen de login
  - Cambiar color del tema

## Consideraciones de Seguridad

- Solo administradores ven el onboarding
- La configuración se guarda en `localStorage` (cliente)
- No se envía información sensible al servidor
- El guard previene acceso sin configuración completa

## Testing

### Escenarios a Probar

1. **Nuevo administrador sin configuración**
   - Debe ver onboarding al iniciar sesión
   - No puede saltar el onboarding
   - Debe completar todos los pasos obligatorios

2. **Administrador existente con configuración**
   - No debe ver onboarding
   - Acceso directo al dashboard

3. **Usuario no administrador**
   - No debe ver onboarding
   - Acceso normal a la aplicación

4. **Navegación durante onboarding**
   - Intentar acceder a otras rutas → Redirige a onboarding
   - Completar onboarding → Permite acceso normal

## Mejoras Futuras

- [ ] Agregar paso para configurar logo en el onboarding
- [ ] Agregar paso para configurar color del tema
- [ ] Permitir saltar pasos opcionales
- [ ] Agregar tour guiado después del onboarding
- [ ] Guardar configuración en base de datos (además de localStorage)
- [ ] Agregar analytics para tracking del onboarding

## Notas de Implementación

### LocalStorage Keys
- `onboarding_completed`: Indica si el onboarding fue completado
- `app_config_nivel_institucion`: Nivel educativo configurado
- `app_config_institution_name`: Nombre de la institución
- `app_config_name`: Nombre personalizado de la app

### Migración de Usuarios Existentes
El sistema detecta automáticamente si un usuario ya tiene configuración previa (nivel educativo configurado) y marca el onboarding como completado sin mostrar el wizard.

### Compatibilidad
- Compatible con todos los navegadores modernos
- Funciona en modo offline (localStorage)
- Responsive para móviles y tablets
