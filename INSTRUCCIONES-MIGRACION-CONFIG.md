# Migración: Configuración de la Aplicación a Base de Datos

## Cambios Realizados

### 1. Nueva Tabla en Supabase
- **Archivo**: `MIGRACION-CONFIGURACION-APP.sql`
- **Tabla**: `configuracion_app`
- **Propósito**: Almacenar la configuración global compartida entre todos los usuarios

### 2. Acciones del Servidor
- **Archivo**: `src/server/actions/configuracion-app.ts`
- **Funciones**:
  - `getConfiguracionApp()`: Obtiene toda la configuración
  - `updateConfiguracionApp()`: Actualiza la configuración (solo administradores)
  - `getConfigValue()`: Obtiene un valor específico

### 3. Hook Actualizado
- **Archivo**: `src/hooks/use-app-config.tsx`
- **Cambios**:
  - Ahora carga la configuración desde la base de datos
  - Guarda los cambios en la base de datos
  - Ya no usa localStorage

### 4. Página de Personalización
- **Archivo**: `src/app/ajustes/personalizacion/page.tsx`
- **Cambios**:
  - Manejo asíncrono del guardado
  - Mensajes de error mejorados

## Pasos para Ejecutar la Migración

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre el Dashboard de Supabase
2. Ve a la sección **SQL Editor**
3. Copia y pega el contenido de `MIGRACION-CONFIGURACION-APP.sql`
4. Ejecuta el script

Esto creará:
- La tabla `configuracion_app`
- Los índices necesarios
- Los triggers para actualización automática
- Las políticas de seguridad (RLS)
- Los valores por defecto

### Paso 2: Verificar la Tabla

Ejecuta esta consulta para verificar que la tabla se creó correctamente:

```sql
SELECT * FROM configuracion_app;
```

Deberías ver 6 registros con las configuraciones por defecto:
- `app_name`: Beeclass
- `institution_name`: (vacío)
- `theme_color`: #59AB45
- `logo_url`: (vacío)
- `login_image_url`: (vacío)
- `nivel_institucion`: Primaria

### Paso 3: Migrar Datos Existentes (Opcional)

Si ya tienes configuración en localStorage que quieres migrar:

1. Abre la consola del navegador en tu aplicación
2. Ejecuta este código para ver tu configuración actual:

```javascript
console.log({
  app_name: localStorage.getItem('app_config_name'),
  institution_name: localStorage.getItem('app_config_institution_name'),
  theme_color: localStorage.getItem('app_config_theme_color'),
  logo_url: localStorage.getItem('app_config_logo_url'),
  login_image_url: localStorage.getItem('app_config_login_image_url'),
  nivel_institucion: localStorage.getItem('app_config_nivel_institucion')
});
```

3. Si hay valores, actualízalos manualmente en Supabase:

```sql
UPDATE configuracion_app SET valor = 'Tu Institución' WHERE clave = 'institution_name';
UPDATE configuracion_app SET valor = 'https://tu-logo.com/logo.png' WHERE clave = 'logo_url';
-- etc.
```

### Paso 4: Verificar Permisos

Asegúrate de que tu usuario tenga el rol de "Administrador" en la tabla `personal`:

```sql
SELECT id, nombre, apellido, rol FROM personal WHERE rol = 'Administrador';
```

Si no tienes un administrador, actualiza tu usuario:

```sql
UPDATE personal SET rol = 'Administrador' WHERE id = 'tu-user-id';
```

### Paso 5: Reiniciar la Aplicación

1. Detén el servidor de desarrollo
2. Limpia el caché: `rm -rf .next`
3. Reinicia: `npm run dev`

## Comportamiento Nuevo

### Para Administradores
- Pueden modificar la configuración en `/ajustes/personalizacion`
- Los cambios se guardan en la base de datos
- Los cambios son visibles para todos los usuarios inmediatamente

### Para Usuarios No Administradores
- Pueden ver la configuración pero no modificarla
- Si intentan guardar, recibirán un error de permisos

### Persistencia
- La configuración se almacena en la base de datos
- Es compartida entre todos los usuarios
- Persiste entre sesiones y dispositivos
- No depende de localStorage

## Seguridad

### Row Level Security (RLS)
- **Lectura**: Todos los usuarios pueden leer la configuración
- **Escritura**: Solo usuarios con rol "Administrador" pueden modificar

### Validación
- El servidor verifica el rol antes de permitir cambios
- Se registra quién hizo cada cambio (`actualizado_por`)
- Se mantiene un historial de cuándo se actualizó cada valor

## Troubleshooting

### Error: "Solo los administradores pueden modificar la configuración"
**Solución**: Verifica que tu usuario tenga el rol "Administrador" en la tabla `personal`

### Error: "relation configuracion_app does not exist"
**Solución**: Ejecuta el script SQL `MIGRACION-CONFIGURACION-APP.sql` en Supabase

### La configuración no se carga
**Solución**: 
1. Verifica que la tabla tenga datos: `SELECT * FROM configuracion_app;`
2. Verifica las políticas RLS: `SELECT * FROM pg_policies WHERE tablename = 'configuracion_app';`
3. Revisa la consola del navegador para errores

### Los cambios no se reflejan
**Solución**: 
1. Recarga la página completamente (Ctrl+Shift+R)
2. Verifica que los cambios se guardaron en la base de datos
3. Limpia el caché del navegador

## Rollback (Si es necesario)

Si necesitas volver a localStorage:

```sql
-- Eliminar la tabla
DROP TABLE IF EXISTS configuracion_app CASCADE;
```

Luego revierte los cambios en:
- `src/hooks/use-app-config.tsx`
- `src/app/ajustes/personalizacion/page.tsx`

## Notas Adicionales

- La migración es compatible con la funcionalidad de favicon dinámico
- El `DynamicFavicon` y `DynamicManifest` seguirán funcionando correctamente
- Los valores por defecto son los mismos que antes
- No se requieren cambios en otros componentes
