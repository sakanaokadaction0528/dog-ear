'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

// Singleton browser client — safe to call multiple times
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
