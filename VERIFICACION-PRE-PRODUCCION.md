# Verificación Pre-Producción - Beeclass

## ✅ Checklist de Estabilidad

### 1. Base de Datos
- [ ] Ejecutar script `MIGRACION-CONFIGURACION-APP.sql` en Supabase
- [ ] Verificar que existe la tabla `configuracion_app`
- [ ] Verificar políticas RLS activas
- [ ] Confirmar que tu usuario tiene rol 'Admin' en tabla `personal`
- [ ] Hacer backup de la base de datos antes de cargar datos reales

**Comando para verificar:**
```sql
-- Verificar tabla configuracion_app
SELECT * FROM configuracion_app;

-- Verificar tu rol
SELECT id, nombre, apellido, rol FROM personal WHERE id = auth.uid();

-- Si no tienes rol Admin, ejecutar:
UPDATE personal SET rol = 'Admin' WHERE id = auth.uid();
```

### 2. Autenticación y Registro
- [x] Registro crea usuario en auth.users
- [x] Registro crea registro en tabla personal
- [x] Login funciona correctamente
- [x] Redirección después de login funciona
- [ ] Probar registro con email real
- [ ] Verificar que el email de confirmación llegue (si está habilitado)

### 3. Configuración de la App
- [x] Configuración se guarda en base de datos
- [x] Configuración es compartida entre usuarios
- [x] Solo admins pueden modificar configuración
- [ ] Probar cambiar logo y verificar que persiste
- [ ] Probar cambiar colores y verificar que persiste
- [ ] Probar cambiar nombre de institución

### 4. Performance - Áreas Críticas

#### 4.1 Carga de Estudiantes
```typescript
// Verificar en: src/hooks/use-matricula-data.tsx
// ⚠️ POTENCIAL PROBLEMA: Carga todos los estudiantes en memoria
```
**Recomendación:** Si tienes más de 500 estudiantes, considera implementar paginación.

#### 4.2 Tablas Grandes
- Asistencia: Puede crecer rápidamente (días × estudiantes)
- Permisos: Crecimiento moderado
- Evaluaciones: Depende del uso

**Recomendación:** Implementar paginación en tablas con más de 100 registros.

#### 4.3 Búsquedas
- [x] Búsqueda de estudiantes usa filtrado en cliente
- [ ] Verificar performance con 200+ estudiantes

### 5. Funcionalidades Principales

#### 5.1 Gestión de Estudiantes
- [x] Crear estudiante
- [x] Editar estudiante
- [x] Eliminar estudiante
- [x] Búsqueda funciona
- [ ] Probar con datos reales

#### 5.2 Asistencia
- [x] Registro individual
- [x] Registro por aula
- [x] Filtros funcionan
- [ ] Probar con clase completa (30+ estudiantes)

#### 5.3 Permisos
- [x] Registro individual
- [x] Registro múltiple (nuevo)
- [x] Búsqueda funciona
- [ ] Probar selección múltiple con 10+ estudiantes

#### 5.4 Evaluaciones
- [x] Crear evaluación
- [x] Registrar notas
- [ ] Probar con clase completa

### 6. Optimizaciones Recomendadas

#### 6.1 Índices de Base de Datos
Verificar que existan estos índices:
```sql
-- Estudiantes
CREATE INDEX IF NOT EXISTS idx_estudiantes_grado_seccion ON estudiantes(grado, seccion);
CREATE INDEX IF NOT EXISTS idx_estudiantes_documento ON estudiantes(numero_documento);

-- Personal
CREATE INDEX IF NOT EXISTS idx_personal_documento ON personal(numero_documento);
CREATE INDEX IF NOT EXISTS idx_personal_rol ON personal(rol);

-- Asistencia (si la tabla existe)
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencia_estudiante ON asistencia(estudiante_id);
```

#### 6.2 Caché de Configuración
La configuración se carga en cada página. Considera:
- Usar React Query para caché
- Implementar revalidación inteligente

#### 6.3 Lazy Loading
Componentes pesados deberían cargarse con lazy loading:
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 7. Seguridad

#### 7.1 Variables de Entorno
- [x] `.env.local` no está en git
- [x] Credenciales de Supabase seguras
- [ ] Verificar que `.env.example` esté actualizado

#### 7.2 RLS (Row Level Security)
- [x] Tabla `configuracion_app` tiene RLS
- [ ] Verificar RLS en tabla `estudiantes`
- [ ] Verificar RLS en tabla `personal`
- [ ] Verificar RLS en otras tablas críticas

**Comando para verificar:**
```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### 7.3 Validación de Datos
- [x] Formularios usan Zod para validación
- [x] Validación en cliente
- [ ] Verificar validación en servidor (acciones)

### 8. Monitoreo y Logs

#### 8.1 Errores en Producción
- [ ] Configurar Sentry o similar para tracking de errores
- [ ] Revisar logs de Vercel regularmente
- [ ] Configurar alertas para errores críticos

#### 8.2 Performance Monitoring
- [ ] Usar Vercel Analytics
- [ ] Monitorear Web Vitals (LCP, FID, CLS)
- [ ] Revisar tiempos de carga de páginas

### 9. Backup y Recuperación

#### 9.1 Backup de Base de Datos
```sql
-- En Supabase Dashboard > Database > Backups
-- Configurar backups automáticos diarios
```

#### 9.2 Backup de Configuración
- [ ] Exportar configuración de Supabase
- [ ] Guardar variables de entorno en lugar seguro
- [ ] Documentar proceso de restauración

### 10. Testing Pre-Producción

#### 10.1 Flujo Completo de Usuario
1. [ ] Registrarse como nuevo usuario
2. [ ] Configurar institución (logo, nombre, colores)
3. [ ] Crear 5 estudiantes de prueba
4. [ ] Registrar asistencia para un día
5. [ ] Crear un permiso individual
6. [ ] Crear un permiso múltiple (3 estudiantes)
7. [ ] Crear una evaluación
8. [ ] Registrar notas
9. [ ] Verificar reportes/historial

#### 10.2 Testing de Carga
- [ ] Crear 50 estudiantes de prueba
- [ ] Registrar asistencia para todos
- [ ] Verificar que la búsqueda siga siendo rápida
- [ ] Verificar que las tablas carguen en < 2 segundos

#### 10.3 Testing Multi-Usuario
- [ ] Crear segundo usuario (docente)
- [ ] Verificar que vea la misma configuración
- [ ] Verificar permisos según rol
- [ ] Probar acciones simultáneas

### 11. Problemas Conocidos a Resolver

#### 11.1 Favicon Dinámico
- ⚠️ Componentes `DynamicFavicon` y `DynamicManifest` fueron removidos por causar errores
- ✅ Se usa `icon.tsx` estático
- 📝 Para favicon dinámico, implementar con metadata de Next.js

#### 11.2 Configuración en BD
- ✅ Implementado pero requiere ejecutar SQL
- ⚠️ Usuario debe tener rol 'Admin' para modificar
- 📝 Documentar proceso de primer setup

### 12. Recomendaciones Finales

#### Antes de Cargar Datos Reales:
1. ✅ Hacer backup completo de Supabase
2. ✅ Ejecutar todos los scripts SQL pendientes
3. ✅ Verificar que tu usuario sea Admin
4. ✅ Probar flujo completo con datos de prueba
5. ✅ Configurar backups automáticos
6. ✅ Documentar proceso de recuperación

#### Durante la Carga Inicial:
1. Cargar datos en lotes pequeños (10-20 registros)
2. Verificar que cada lote se guarde correctamente
3. Revisar logs de errores después de cada lote
4. No cargar todo de una vez

#### Después de Cargar Datos:
1. Verificar integridad de datos
2. Probar búsquedas y filtros
3. Verificar performance de tablas
4. Hacer backup inmediato

### 13. Contactos de Emergencia

#### Si algo sale mal:
1. **Revertir deployment**: Vercel Dashboard > Deployments > Rollback
2. **Restaurar BD**: Supabase Dashboard > Database > Backups > Restore
3. **Limpiar caché**: Vercel Dashboard > Settings > Clear Cache

#### Logs importantes:
- Vercel: https://vercel.com/dashboard > Logs
- Supabase: Dashboard > Logs
- Browser Console: F12 > Console

---

## 🎯 Checklist Rápido Pre-Producción

- [ ] SQL ejecutado en Supabase
- [ ] Usuario tiene rol Admin
- [ ] Backup de BD realizado
- [ ] Configuración probada y funciona
- [ ] Registro/Login probado
- [ ] 5 estudiantes de prueba creados
- [ ] Asistencia probada
- [ ] Permisos múltiples probados
- [ ] Performance aceptable (< 2s carga)
- [ ] Sin errores en consola
- [ ] Backups automáticos configurados

---

**Fecha de verificación:** _________
**Verificado por:** _________
**Listo para producción:** ☐ SÍ  ☐ NO

