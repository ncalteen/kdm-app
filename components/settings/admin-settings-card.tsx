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
import { DatabaseIcon, Loader2, ShieldCheckIcon } from 'lucide-react'
import { ReactElement, useTransition } from 'react'
import { toast } from 'sonner'

/**
 * Admin Settings Card Component
 *
 * Hosts privileged maintenance actions. Visibility is guarded both by the
 * sidebar and by this component using the verified Supabase Auth role stored in
 * local context.
 *
 * @returns Admin Settings Card Component
 */
export function AdminSettingsCard(): ReactElement {
  const { isAdmin } = useLocal()
  const [isSeeding, startSeedTransition] = useTransition()

  if (!isAdmin) return <></>

  /**
   * Handle Generating Seed Data
   *
   * Only available in development mode. Deletes all existing data for the
   * user and creates comprehensive test settlements.
   */
  const handleGenerateSeedData = () => {
    startSeedTransition(async () => {
      try {
        await generateSeedData()
      } catch (err) {
        console.error('Seed Data Error:', err)
        toast.error(ERROR_MESSAGE())
      }
    })
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex flex-col gap-4 pt-12 px-2">
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-amber-400/90" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {isDevelopment ? (
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
              No admin actions are available outside the lantern-lit workshop.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
