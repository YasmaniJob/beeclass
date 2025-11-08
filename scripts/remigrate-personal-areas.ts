// scripts/remigrate-personal-areas.ts
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initialDocentes } from '../src/lib/docentes-data';
import { initialAreas } from '../src/lib/curricular-data';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migratePersonal() {
  console.log('👨‍🏫 Re-migrando personal...\n');

  for (const docente of initialDocentes) {
    const { data: personal, error: personalError } = await supabase
      .from('personal')
      .upsert({
        tipo_documento: docente.tipoDocumento || 'DNI',
        numero_documento: docente.numeroDocumento,
        apellido_paterno: docente.apellidoPaterno,
        apellido_materno: docente.apellidoMaterno || null,
        nombres: docente.nombres,
        email: docente.email || null,
        telefono: docente.telefono || null,
        rol: docente.rol,
        activo: true,
      }, {
        onConflict: 'numero_documento'
      })
      .select()
      .single();

    if (personalError) {
      console.error(`❌ Error migrando ${docente.nombres}:`, personalError.message);
      continue;
    }

    console.log(`✅ ${docente.nombres} ${docente.apellidoPaterno} (${docente.rol})`);

    // Migrar asignaciones si existen
    if (docente.asignaciones && docente.asignaciones.length > 0) {
      // Primero eliminar asignaciones existentes
      await supabase
        .from('asignaciones')
        .delete()
        .eq('personal_id', personal.id);

      // Insertar nuevas asignaciones
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
          console.error(`  ⚠️  Error en asignación:`, asignacionError.message);
        } else {
          console.log(`  ✓ Asignación: ${asignacion.grado} - ${asignacion.seccion}`);
        }
      }
    }
  }

  console.log(`\n✅ ${initialDocentes.length} personal migrados\n`);
}

async function migrateAreas() {
  console.log('📚 Re-migrando áreas curriculares...\n');

  // Primero limpiar áreas existentes
  console.log('🧹 Limpiando áreas existentes...');
  await supabase.from('areas_curriculares').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Áreas limpiadas\n');

  for (const area of initialAreas) {
    // Insertar área (sin especificar ID, dejar que Supabase genere uno)
    const { data: areaData, error: areaError } = await supabase
      .from('areas_curriculares')
      .insert({
        nombre: area.nombre,
        nivel: area.nivel,
      })
      .select()
      .single();

    if (areaError) {
      console.error(`❌ Error migrando área ${area.nombre}:`, areaError.message);
      continue;
    }

    console.log(`✅ ${area.nombre} (${area.nivel})`);

    // Migrar competencias
    if (area.competencias && area.competencias.length > 0) {
      for (const competencia of area.competencias) {
        const { data: compData, error: compError } = await supabase
          .from('competencias')
          .insert({
            area_id: areaData.id,
            nombre: competencia.nombre,
            descripcion: competencia.descripcion || null,
          })
          .select()
          .single();

        if (compError) {
          console.error(`  ⚠️  Error en competencia:`, compError.message);
          continue;
        }

        console.log(`  ✓ ${competencia.nombre}`);

        // Migrar capacidades
        if (competencia.capacidades && competencia.capacidades.length > 0) {
          // Primero eliminar capacidades existentes de esta competencia
          await supabase
            .from('capacidades')
            .delete()
            .eq('competencia_id', compData.id);

          // Insertar nuevas capacidades
          for (const capacidad of competencia.capacidades) {
            const { error: capError } = await supabase
              .from('capacidades')
              .insert({
                competencia_id: compData.id,
                descripcion: capacidad,
              });

            if (capError) {
              console.error(`    ⚠️  Error en capacidad:`, capError.message);
            }
          }
          console.log(`    ✓ ${competencia.capacidades.length} capacidades`);
        }
      }
    }
  }

  console.log(`\n✅ ${initialAreas.length} áreas curriculares migradas\n`);
}

async function main() {
  console.log('🚀 Re-migrando Personal y Áreas Curriculares\n');
  console.log('='.repeat(50) + '\n');

  try {
    await migratePersonal();
    await migrateAreas();

    console.log('='.repeat(50));
    console.log('\n🎉 ¡Re-migración completada!\n');
    console.log('📊 Resumen:');
    console.log(`  - ${initialDocentes.length} personal`);
    console.log(`  - ${initialAreas.length} áreas curriculares`);
    console.log('\n✅ Recarga la página de prueba para ver los cambios\n');

  } catch (error) {
    console.error('\n❌ Error durante la re-migración:', error);
    process.exit(1);
  }
}

main();
