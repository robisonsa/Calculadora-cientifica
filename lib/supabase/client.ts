'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://mqnvhifjmgmzocnlgdwl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbnZoaWZqbWdtem9jbmxnZHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjYxMjMsImV4cCI6MjA5NDkwMjEyM30.uLi3rmc8ZxrpTSN9HmrcpOykOvSni4U2BElrIlI5Ihw'
  )
}
