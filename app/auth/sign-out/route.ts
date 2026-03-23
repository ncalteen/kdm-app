import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Sign Out
 *
 * Signs the user out of the application by ending their Supabase Auth session,
 * then redirects to the login page.
 */
export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  redirect('/auth/login')
}
