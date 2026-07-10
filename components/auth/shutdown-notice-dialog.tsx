'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useEffect, useState } from 'react'

const SHUTDOWN_NOTICE_STORAGE_KEY = 'archivist-shutdown-notice-acknowledged-v1'

/**
 * Shutdown Notice Dialog
 *
 * Displays a one-time decommission warning to visitors on public auth pages.
 * Acknowledgement is persisted in local storage for subsequent visits.
 *
 * @returns Shutdown Notice Dialog Component
 */
export function ShutdownNoticeDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return

    try {
      const hasAcknowledgedNotice =
        window.localStorage.getItem(SHUTDOWN_NOTICE_STORAGE_KEY) === 'true'

      if (!hasAcknowledgedNotice) {
        setIsOpen(true)
      }
    } catch {
      setIsOpen(true)
    }
  }, [])

  /**
   * Handle Notice Acknowledgement
   *
   * Saves acknowledgement locally so the notice appears only once per browser.
   */
  const handleAcknowledge = () => {
    try {
      window.localStorage.setItem(SHUTDOWN_NOTICE_STORAGE_KEY, 'true')
    } catch {
      // Ignore storage failures and close the notice for this session.
    }

    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Archivist Shutdown Notice: July 27th, 2026
          </AlertDialogTitle>
          <AlertDialogDescription>
            New and existing users: this application will be shut down on July
            27th, 2026. Please find an alternative between now and then to avoid
            potential campaign loss.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAcknowledge}>
            I understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
