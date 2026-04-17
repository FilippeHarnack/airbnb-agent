// lib/supabase/server.ts  —  server client (use in API Routes / Server Components)
import { createClient } from '@supabase/supabase-js'

// Service-role client — ignora RLS, use apenas em rotas de servidor confiáveis
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
