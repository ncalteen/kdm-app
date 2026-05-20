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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocal } from '@/contexts/local-context'
import { ERROR_MESSAGE } from '@/lib/messages'
import { generateSeedData } from '@/lib/seed'
import { DatabaseIcon, Loader2 } from 'lucide-react'
import { ReactElement, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

/**
 * Is Local Development Host
 *
 * Seed-data generation is intentionally limited to local development.
 *
 * @returns Whether the current browser host is local development
 */
function isLocalDevelopmentHost(): boolean {
  if (process.env.NODE_ENV !== 'development') return false
  if (typeof window === 'undefined') return false

  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

/**
 * Admin Development Card Component
 *
 * Hosts privileged development-only maintenance actions. Visibility is guarded
 * by the sidebar and by this component using the verified Supabase Auth role
 * stored in local context.
 *
 * @returns Admin Development Card Component
 */
export function AdminDevelopmentCard(): ReactElement {
  const { isAdmin } = useLocal()
  const [isLocalDevelopment, setIsLocalDevelopment] = useState<boolean>(false)
  const [isSeeding, startSeedTransition] = useTransition()

  useEffect(() => {
    setIsLocalDevelopment(isLocalDevelopmentHost())
  }, [])

  if (!isAdmin) return <></>

  /**
   * Handle Generating Seed Data
   *
   * Only available in local development mode. Deletes all existing data for the
   * user and creates comprehensive test settlements.
   */
  const handleGenerateSeedData = () => {
    if (!isLocalDevelopment) {
      toast.error('The seed ritual only answers beside a local lantern.')
      return
    }

    startSeedTransition(async () => {
      try {
        await generateSeedData()
      } catch (err) {
        console.error('Seed Data Error:', err)
        toast.error(ERROR_MESSAGE())
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 pt-12 px-2">
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5 text-amber-400/90" />
            Development
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {isLocalDevelopment ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-sm">Generate Seed Data</div>
                <div className="text-sm text-muted-foreground">
                  Creates multiple test settlements with survivors, hunts, and
                  showdowns. This will replace all existing data.
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isSeeding}>
                    {isSeeding ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <DatabaseIcon className="h-4 w-4 mr-2" />
                    )}
                    {isSeeding ? 'Generating...' : 'Seed Data'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Generate Seed Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace all existing settlements, survivors,
                      hunts, and showdowns with comprehensive test data. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleGenerateSeedData}
                      className="bg-blue-600 text-white hover:bg-blue-700">
                      Generate Seed Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Development tools are only available while running locally.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
