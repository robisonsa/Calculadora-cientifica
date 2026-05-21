'use client'

import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqnvhifjmgmzocnlgdwl.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbnZoaWZqbWdtem9jbmxnZHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjYxMjMsImV4cCI6MjA5NDkwMjEyM30.uLi3rmc8ZxrpTSN9HmrcpOykOvSni4U2BElrIlI5Ihw'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
