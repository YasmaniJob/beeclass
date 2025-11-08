# Currículo Nacional de la Educación Básica - MINEDU

## 📋 Descripción

Este conjunto de scripts SQL contiene todas las áreas curriculares, competencias y capacidades del Currículo Nacional de la Educación Básica del Perú, según el MINEDU.

## 📁 Archivos

1. **`CURRICULO-00-TABLAS.sql`** - Creación de tablas (niveles, areas_curriculares, competencias, capacidades)
2. **`CURRICULO-01-NIVELES-AREAS.sql`** - Niveles educativos y áreas curriculares
3. **`CURRICULO-02-INICIAL.sql`** - Competencias y capacidades de Inicial
4. **`CURRICULO-03-PRIMARIA.sql`** - Competencias y capacidades de Primaria
5. **`CURRICULO-04-SECUNDARIA.sql`** - Competencias y capacidades de Secundaria
6. **`CURRICULO-05-TRANSVERSALES.sql`** - Competencias transversales

## 🚀 Orden de Ejecución

**IMPORTANTE:** Ejecutar en este orden:

```bash
1. MIGRACION-DATOS-MAESTROS-SUPABASE.sql  # Primero (crea tablas base)
2. CURRICULO-00-TABLAS.sql                # Crea tablas del currículo
3. CURRICULO-01-NIVELES-AREAS.sql         # Niveles y áreas
4. CURRICULO-02-INICIAL.sql               # Competencias Inicial
5. CURRICULO-03-PRIMARIA.sql              # Competencias Primaria
6. CURRICULO-04-SECUNDARIA.sql            # Competencias Secundaria
7. CURRICULO-05-TRANSVERSALES.sql         # Competencias transversales
```

## 📊 Resumen del Contenido

### INICIAL
- **5 áreas curriculares**
- **11 competencias**
- **~35 capacidades**

### PRIMARIA
- **10 áreas curriculares**
- **~25 competencias**
- **~80 capacidades**

### SECUNDARIA
- **11 áreas curriculares**
- **~30 competencias**
- **~90 capacidades**

### TRANSVERSALES
- **2 competencias** (aplican a todos los niveles)
- **7 capacidades**

## ✅ Características

- ✅ Datos oficiales del MINEDU
- ✅ Marcados como `es_oficial = true`
- ✅ Ordenados por nivel y área
- ✅ Incluye todas las capacidades
- ✅ Sistema híbrido: permite agregar áreas personalizadas

## 🔧 Uso

Después de ejecutar los scripts, las instituciones pueden:

1. **Usar las áreas oficiales** predefinidas
2. **Agregar áreas personalizadas** (talleres, cursos adicionales)
3. **Agregar competencias personalizadas** a áreas existentes
4. **Modificar capacidades** según su proyecto educativo

## 📝 Notas

- Las áreas oficiales tienen `es_oficial = true`
- Las áreas personalizadas tendrán `es_oficial = false`
- Los IDs siguen el patrón: `{nivel}-{area}-{tipo}{numero}`
- Ejemplo: `primaria-mat-c1` = Primaria, Matemática, Competencia 1
