#!/usr/bin/env node
// scripts/migrate-to-supabase.ts
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });
import { fullEstudiantesList } from '../src/lib/alumnos-data';
import { initialDocentes } from '../src/lib/docentes-data';
import { initialAreas } from '../src/lib/curricular-data';
import { initialNiveles } from '../src/lib/curricular-data';

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validar que las variables existan
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Asegúrate de tener .env.local con:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateNivelesEducativos() {
  console.log('📚 Migrando niveles educativos...');

  for (const nivel of initialNiveles) {
    const { error } = await supabase
      .from('niveles_educativos')
      .upsert({
        id: nivel.id,
        nombre: nivel.nombre,
      });

    if (error) {
      console.error(`Error migrando nivel ${nivel.nombre}:`, error);
    } else {
      console.log(`✅ Nivel ${nivel.nombre} migrado`);
    }
  }
}

async function migrateAreasCurriculares() {
  console.log('🎯 Migrando áreas curriculares...');

  for (const area of initialAreas) {
    // Insertar área
    const { error: areaError } = await supabase
      .from('areas_curriculares')
      .upsert({
        id: area.id,
        nombre: area.nombre,
        nivel: area.nivel,
      });

    if (areaError) {
      console.error(`Error migrando área ${area.nombre}:`, areaError);
      continue;
    }

    console.log(`✅ Área ${area.nombre} migrada`);

    // Insertar competencias y capacidades
    for (const competencia of area.competencias) {
      const { error: competenciaError } = await supabase
        .from('competencias')
        .upsert({
          id: competencia.id,
          area_id: area.id,
          nombre: competencia.nombre,
          descripcion: competencia.descripcion,
        });

      if (competenciaError) {
        console.error(`Error migrando competencia ${competencia.nombre}:`, competenciaError);
        continue;
      }

      console.log(`  ✅ Competencia ${competencia.nombre} migrada`);

      // Insertar capacidades
      if (competencia.capacidades && competencia.capacidades.length > 0) {
        for (const capacidad of competencia.capacidades) {
          const { error: capacidadError } = await supabase
            .from('capacidades')
            .insert({
              competencia_id: competencia.id,
              descripcion: capacidad,
            });

          if (capacidadError) {
            console.error(`Error migrando capacidad:`, capacidadError);
          } else {
            console.log(`    ✅ Capacidad migrada`);
          }
        }
      }
    }
  }
}

async function migrateEstudiantes() {
  console.log('👨‍🎓 Migrando estudiantes...');

  for (const estudiante of fullEstudiantesList) {
    const { error } = await supabase
      .from('estudiantes')
      .upsert({
        tipo_documento: estudiante.tipoDocumento,
        numero_documento: estudiante.numeroDocumento,
        apellido_paterno: estudiante.apellidoPaterno,
        apellido_materno: estudiante.apellidoMaterno || null,
        nombres: estudiante.nombres,
        grado: estudiante.grado || null,
        seccion: estudiante.seccion || null,
        nee: estudiante.nee || null,
        nee_documentos: estudiante.neeDocumentos || null,
      });

    if (error) {
      console.error(`Error migrando estudiante ${estudiante.nombres}:`, error);
    } else {
      console.log(`✅ Estudiante ${estudiante.nombres} migrado`);
    }
  }
}

async function migratePersonal() {
  console.log('👨‍🏫 Migrando personal...');

  for (const docente of initialDocentes) {
    // Insertar personal
    const { data: personal, error: personalError } = await supabase
      .from('personal')
      .upsert({
        tipo_documento: docente.tipoDocumento,
        numero_documento: docente.numeroDocumento,
        apellido_paterno: docente.apellidoPaterno,
        apellido_materno: docente.apellidoMaterno || null,
        nombres: docente.nombres,
        email: docente.email || null,
        telefono: docente.telefono || null,
        rol: docente.rol,
        activo: true,
      })
      .select()
      .single();

    if (personalError) {
      console.error(`Error migrando personal ${docente.nombres}:`, personalError);
      continue;
    }

    console.log(`✅ Personal ${docente.nombres} migrado`);

    // Insertar asignaciones
    if (docente.asignaciones && docente.asignaciones.length > 0) {
      for (const asignacion of docente.asignaciones) {
        const { error: asignacionError } = await supabase
          .from('asignaciones')
          .insert({
            personal_id: personal.id,
            grado: asignacion.grado,
            seccion: asignacion.seccion,
            rol_asignacion: asignacion.rol,
            area_id: asignacion.areaId || null,
          });

        if (asignacionError) {
          console.error(`Error migrando asignación:`, asignacionError);
        } else {
          console.log(`  ✅ Asignación ${asignacion.grado} - ${asignacion.seccion} migrada`);
        }
      }
    }

    // Insertar horarios
    if (docente.horario) {
      for (const [key, asignacionId] of Object.entries(docente.horario)) {
        const [diaSemana, horaId] = key.split('-');

        const { error: horarioError } = await supabase
          .from('horarios')
          .insert({
            personal_id: personal.id,
            dia_semana: diaSemana,
            hora_id: horaId,
            asignacion_id: asignacionId,
          });

        if (horarioError) {
          console.error(`Error migrando horario ${key}:`, horarioError);
        } else {
          console.log(`  ✅ Horario ${key} migrado`);
        }
      }
    }
  }
}

async function createIndexes() {
  console.log('🔍 Creando índices para optimización...');

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_estudiantes_documento ON estudiantes(numero_documento);',
    'CREATE INDEX IF NOT EXISTS idx_estudiantes_grado_seccion ON estudiantes(grado, seccion);',
    'CREATE INDEX IF NOT EXISTS idx_personal_documento ON personal(numero_documento);',
    'CREATE INDEX IF NOT EXISTS idx_personal_rol ON personal(rol);',
    'CREATE INDEX IF NOT EXISTS idx_asignaciones_personal ON asignaciones(personal_id);',
    'CREATE INDEX IF NOT EXISTS idx_asignaciones_grado_seccion ON asignaciones(grado, seccion);',
    'CREATE INDEX IF NOT EXISTS idx_horarios_personal ON horarios(personal_id);',
    'CREATE INDEX IF NOT EXISTS idx_competencias_area ON competencias(area_id);',
    'CREATE INDEX IF NOT EXISTS idx_capacidades_competencia ON capacidades(competencia_id);',
  ];

  for (const indexQuery of indexes) {
    const { error } = await supabase.rpc('exec_sql', { query: indexQuery });
    if (error) {
      console.error(`Error creando índice:`, error);
    } else {
      console.log(`✅ Índice creado`);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando migración a Supabase...\n');

  try {
    // Ejecutar migraciones en orden
    await migrateNivelesEducativos();
    console.log('');

    await migrateAreasCurriculares();
    console.log('');

    await migrateEstudiantes();
    console.log('');

    await migratePersonal();
    console.log('');

    await createIndexes();
    console.log('');

    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- ${fullEstudiantesList.length} estudiantes migrados`);
    console.log(`- ${initialDocentes.length} personal migrados`);
    console.log(`- ${initialAreas.length} áreas curriculares migradas`);
    console.log(`- Índices de optimización creados`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

export { migrateNivelesEducativos, migrateAreasCurriculares, migrateEstudiantes, migratePersonal };
