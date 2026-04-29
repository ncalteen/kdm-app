'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/client'
import { LogOutIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'

/**
 * Logout Button Component
 *
 * Sidebar-native logout control. Renders as a regular `SidebarMenuButton` so
 * it adapts to the rail's icon-collapsed mode (icon + tooltip) and stays
 * visually consistent with the rest of the navigation, rather than the older
 * full-width ghost button. Clicking opens an `AlertDialog` confirmation so a
 * misclick doesn't cost the user their session.
 *
 * @returns Logout Button Component
 */
export function LogoutButton(): ReactElement {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <SidebarMenuButton tooltip="Sign out">
              <LogOutIcon className="h-4 w-4" />
              <span className="text-xs">Sign out</span>
            </SidebarMenuButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Extinguish the lantern?</AlertDialogTitle>
              <AlertDialogDescription>
                Your settlements will endure, but you&apos;ll need to sign in
                again to return.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={logout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
