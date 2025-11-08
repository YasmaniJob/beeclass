import { createSupabaseServerClient } from '@/infrastructure/supabase-server-client';
import { resolveDocenteFromAuthUser } from '@/services/personal/docente-profile';

export async function getCurrentDocente() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    return await resolveDocenteFromAuthUser(session.user);
  } catch (error) {
    console.error('Error fetching current docente on server', error);
    return null;
  }
}
