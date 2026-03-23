'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * Logout Button Component
 *
 * Renders a button that, when clicked, logs the user out of their account and
 * redirects them to the login page. Uses Supabase for authentication handling.
 *
 * @returns Logout Button Component
 */
export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push('/auth/login')
  }

  return <Button onClick={logout}>Logout</Button>
}
