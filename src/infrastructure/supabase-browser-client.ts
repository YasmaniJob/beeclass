import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/infrastructure/adapters/supabase/config';

let browserClient: SupabaseClient<Database> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase no está configurado correctamente. Revisa las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const match = globalThis.document?.cookie
          ?.split('; ')
          .find((row) => row.startsWith(`${name}=`));
        return match ? match.split('=')[1] : null;
      },
      set(name: string, value: string, options) {
        let cookie = `${name}=${value}`;
        const path = options?.path ?? '/';
        cookie += `; path=${path}`;
        if (options?.domain) {
          cookie += `; domain=${options.domain}`;
        }
        if (options?.maxAge !== undefined) {
          cookie += `; max-age=${options.maxAge}`;
        }
        if (options?.expires) {
          const expires = options.expires instanceof Date ? options.expires.toUTCString() : options.expires;
          cookie += `; expires=${expires}`;
        }
        if (options?.sameSite) {
          cookie += `; samesite=${String(options.sameSite).toLowerCase()}`;
        }
        if (options?.secure) {
          cookie += '; secure';
        }
        document.cookie = cookie;
      },
      remove(name: string, options) {
        let cookie = `${name}=; max-age=0`;
        const path = options?.path ?? '/';
        cookie += `; path=${path}`;
        if (options?.domain) {
          cookie += `; domain=${options.domain}`;
        }
        if (options?.sameSite) {
          cookie += `; samesite=${String(options.sameSite).toLowerCase()}`;
        }
        if (options?.secure) {
          cookie += '; secure';
        }
        document.cookie = cookie;
      },
    },
  });

  return browserClient;
}
