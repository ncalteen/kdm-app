'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { updateSettlement } from '@/lib/dal/settlement'
import { ERROR_MESSAGE, SETTLEMENT_NOTES_SAVED_MESSAGE } from '@/lib/messages'
import { SettlementDetail } from '@/lib/types'
import { CheckIcon, StickyNoteIcon } from 'lucide-react'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * Notes Card Properties
 */
interface NotesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Notes Card Component
 *
 * Displays and manages the settlement's notes with optimistic updates. The
 * user edits a local draft; pressing "Save Notes" applies the change
 * optimistically to the settlement state and persists to the DB, rolling
 * back on failure.
 *
 * @param props Notes Card Properties
 * @returns Notes Card Component
 */
export function NotesCard({
  selectedSettlement,
  setSelectedSettlement
}: NotesCardProps): ReactElement {
  const [draft, setDraft] = useState<string>(selectedSettlement?.notes ?? '')
  const [isDirty, setIsDirty] = useState<boolean>(false)

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setDraft(selectedSettlement?.notes ?? '')
    setIsDirty(false)
  }

  /**
   * Handle Notes Save
   *
   * Optimistically updates the settlement notes, then persists to the DB.
   * Rolls back on failure.
   */
  const handleSave = useCallback(() => {
    if (!selectedSettlement) return

    const previousNotes = selectedSettlement.notes
    const newNotes = draft ?? ''

    // Optimistic update.
    setSelectedSettlement({
      ...selectedSettlement,
      notes: newNotes
    })
    setIsDirty(false)

    updateSettlement(selectedSettlement.id, { notes: newNotes })
      .then(() => toast.success(SETTLEMENT_NOTES_SAVED_MESSAGE()))
      .catch((err: unknown) => {
        // Revert the optimistic update.
        setSelectedSettlement({
          ...selectedSettlement,
          notes: previousNotes
        })
        setDraft(previousNotes ?? '')
        setIsDirty(true)

        console.error('Notes Save Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedSettlement, setSelectedSettlement, draft])

  return (
    <Card className="p-0 pb-1 border-0 h-full flex flex-col">
      <CardHeader className="px-2 py-0 flex-shrink-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <StickyNoteIcon className="h-4 w-4" /> Notes
        </CardTitle>
      </CardHeader>

      {/* Notes Textarea */}
      <CardContent className="p-1 py-0 flex-1 flex flex-col">
        <div className="flex flex-col h-full">
          <Textarea
            value={draft}
            name="notes"
            id="settlement-notes"
            onChange={(e) => {
              setDraft(e.target.value)
              setIsDirty(e.target.value !== (selectedSettlement?.notes ?? ''))
            }}
            placeholder="Add notes about your settlement..."
            className="w-full flex-1 resize-none"
            style={{ minHeight: '200px' }}
          />
          <div className="flex justify-end pt-1 flex-shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={!isDirty}
              title="Save notes">
              <CheckIcon className="h-4 w-4" />
              Save Notes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
