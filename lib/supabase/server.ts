import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createServerClient(
    (url && url.startsWith('http')) ? url : 'https://mqnvhifjmgmzocnlgdwl.supabase.co',
    (key && key.startsWith('ey')) ? key : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbnZoaWZqbWdtem9jbmxnZHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjYxMjMsImV4cCI6MjA5NDkwMjEyM30.uLi3rmc8ZxrpTSN9HmrcpOykOvSni4U2BElrIlI5Ihw',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
