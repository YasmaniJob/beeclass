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
  type MutableCookieStore = {
    set?: (options: { name: string; value: string } & Record<string, unknown>) => void;
    delete?: (options: { name: string } & Record<string, unknown>) => void;
  };
  const mutableStore = cookieStore as unknown as MutableCookieStore;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => {
        if (typeof mutableStore.set !== 'function') {
          return;
        }

        try {
          mutableStore.set({ name, value, ...(options ?? {}) });
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Supabase cookie set skipped outside Route Handler/Server Action', error);
          }
        }
      },
      remove: (name, options) => {
        if (typeof mutableStore.delete !== 'function') {
          return;
        }

        try {
          mutableStore.delete({ name, ...(options ?? {}) });
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Supabase cookie delete skipped outside Route Handler/Server Action', error);
          }
        }
      },
    },
  });
}
