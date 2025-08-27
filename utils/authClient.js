import { createClient } from '@supabase/supabase-js';

export function makeClient(jwt) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} }
    }
  );
}

export function makeAuthedClient() {
  if (typeof window === 'undefined') return makeClient(null);
  const token = localStorage.getItem('lt_jwt');
  return makeClient(token);
}
