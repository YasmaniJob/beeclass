# Inkuña - Sistema de Gestión Educativa

Sistema completo de gestión educativa construido con Next.js 15.3.3, TypeScript, Tailwind CSS y shadcn/ui.

## Resumen de Arquitectura

Esta aplicación se desarrolla siguiendo un enfoque de prototipado rápido y escalable. A continuación se detallan los paradigmas y la arquitectura que deben seguirse para cualquier modificación.

### 1. Arquitectura General: Next.js con App Router

La aplicación utiliza la arquitectura **App Router** de Next.js.
- **Server Components por defecto:** Las páginas y componentes se renderizan en el servidor para un rendimiento óptimo.
- **Interactividad con `'use client'`:** Para componentes que requieren interactividad en el navegador (manejo de estado, eventos, hooks como `useState` y `useEffect`), se debe declarar la directiva `'use client'` al inicio del archivo. La mayoría de los componentes en `src/components` y los hooks en `src/hooks` son de cliente.
- **Enrutamiento:** Las rutas se definen por la estructura de carpetas en `src/app`.

### 2. Arquitectura de Datos: Fachada Centralizada (Facade Pattern)

La gestión de datos está abstraída para facilitar la futura migración a una base de datos real como Firebase.
- **Hook Fachada `useMatriculaData`:** Es el **único punto de acceso** a los datos de la aplicación. Cualquier componente que necesite leer o modificar datos (estudiantes, docentes, grados, etc.) debe hacerlo a través de este hook.
- **Simulación en Memoria:** Actualmente, los datos persisten en variables en memoria (ej: `memoryEstudiantes`) dentro del hook `useMatriculaData.tsx`. Estas se reinician al recargar la página.
- **Contexto Global (`MatriculaDataProvider`):** Este proveedor, ubicado en el `layout.tsx` principal, hace que `useMatriculaData` esté disponible globalmente, evitando el *prop-drilling*.
- **Escalabilidad:** Para migrar a una base de datos real, **solo se debe modificar el archivo `src/hooks/use-matricula-data.tsx`**. La interfaz de usuario y los componentes no deben ser alterados, ya que son agnósticos a la fuente de datos.

### 3. Paradigma de Componentes y Lógica: Hooks Personalizados

Seguimos una estricta separación de responsabilidades.
- **Componentes (`/src/components`):** Responsables únicamente de la presentación (el "cómo se ve"). Deben ser lo más "tontos" posible, recibiendo datos y funciones a través de props.
- **Hooks Personalizados (`/src/hooks`):** Encapsulan toda la lógica de negocio, manejo de estado y efectos secundarios (el "cómo funciona"). Los componentes de página (`page.tsx`) deben usar estos hooks para obtener datos y acciones.

### 4. Arquitectura de Estilos: Utility-First con Sistema de Diseño

- **Tailwind CSS:** La interfaz se construye componiendo clases de utilidad directamente en el JSX.
- **ShadCN/UI:** Se utilizan componentes de esta librería, que están pre-configurados para usar nuestro tema.
- **Tema Centralizado:** Los colores, radios de borde y fuentes se definen como variables CSS en `src/app/globals.css`. **No se deben usar colores arbitrarios**; en su lugar, se deben utilizar las variables del tema (ej: `bg-primary`, `text-destructive`).

### 5. Principios Clave Adicionales

- **UI Reactiva:** No se manipula el DOM directamente. La interfaz reacciona a los cambios en el estado gestionado por los hooks.
- **Tipado Estricto:** Se utiliza TypeScript en todo el proyecto. Las definiciones centrales de tipos y esquemas de validación con **Zod** se encuentran en `src/lib/definitions.ts` y deben ser la única fuente de verdad para las estructuras de datos.
- **Diseño Adaptable:** Utilizar el hook `useIsMobile` para adaptar la interfaz entre escritorio y móvil cuando sea necesario (ej: cambiar `Tabs` por `Select`).
