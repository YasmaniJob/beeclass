import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/infrastructure/adapters/supabase/config';

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => {
        if (typeof (cookieStore as any).set === 'function') {
          (cookieStore as any).set({ name, value, ...(options ?? {}) });
        }
      },
      remove: (name, options) => {
        if (typeof (cookieStore as any).delete === 'function') {
          (cookieStore as any).delete({ name, ...(options ?? {}) });
        }
      },
    },
  });
}
