'use client'

import { SurvivorCard } from '@/components/survivor/survivor-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { updateShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import { SurvivorCardMode } from '@/lib/enums'
import { ERROR_MESSAGE, SHOWDOWN_NOTES_SAVED_MESSAGE } from '@/lib/messages'
import {
  SettlementDetail,
  ShowdownDetail,
  ShowdownSurvivorDetail,
  SurvivorDetail
} from '@/lib/types'
import { CheckIcon } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Showdown Survivor Card Component Properties
 */
interface ShowdownSurvivorCardProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Showdown Survivor Card Component
 *
 * Displays a survivor's details during a showdown, including the standard
 * survivor card and showdown-specific notes with optimistic save/rollback.
 *
 * @param props Showdown Survivor Card Properties
 * @returns Showdown Survivor Card Component
 */
export function ShowdownSurvivorCard({
  selectedShowdown,
  selectedSettlement,
  selectedSurvivor,
  setSelectedShowdown,
  setSurvivors,
  survivors
}: ShowdownSurvivorCardProps): ReactElement {
  const showdownSurvivorDetail = selectedShowdown?.showdown_survivors
    ? Object.values(selectedShowdown.showdown_survivors).find(
        (ss) => ss.survivor_id === selectedSurvivor?.id
      )
    : undefined

  const prevSurvivorId = useRef(selectedSurvivor?.id)
  const [notesDraft, setNotesDraft] = useState(
    showdownSurvivorDetail?.notes ?? ''
  )
  const [isNotesDirty, setIsNotesDirty] = useState(false)

  if (prevSurvivorId.current !== selectedSurvivor?.id) {
    prevSurvivorId.current = selectedSurvivor?.id
    setNotesDraft(showdownSurvivorDetail?.notes ?? '')
    setIsNotesDirty(false)
  }

  const handleSaveNotes = useCallback(() => {
    if (
      !selectedSurvivor?.id ||
      !selectedShowdown?.showdown_survivors ||
      !showdownSurvivorDetail
    )
      return

    const previousNotes = showdownSurvivorDetail.notes
    const ssKey = Object.entries(selectedShowdown.showdown_survivors).find(
      ([, ss]) => ss.id === showdownSurvivorDetail.id
    )?.[0]
    if (!ssKey) return

    // Optimistic update
    const updatedSurvivors: { [key: string]: ShowdownSurvivorDetail } = {
      ...selectedShowdown.showdown_survivors,
      [ssKey]: { ...showdownSurvivorDetail, notes: notesDraft }
    }
    setSelectedShowdown({
      ...selectedShowdown,
      showdown_survivors: updatedSurvivors
    })
    setIsNotesDirty(false)

    updateShowdownSurvivor(showdownSurvivorDetail.id, { notes: notesDraft })
      .then(() => toast.success(SHOWDOWN_NOTES_SAVED_MESSAGE()))
      .catch((err: unknown) => {
        // Rollback
        setSelectedShowdown({
          ...selectedShowdown,
          showdown_survivors: {
            ...selectedShowdown.showdown_survivors!,
            [ssKey]: { ...showdownSurvivorDetail, notes: previousNotes }
          }
        })
        setIsNotesDirty(true)
        console.error('Showdown Survivor Notes Save Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [
    selectedSurvivor?.id,
    selectedShowdown,
    showdownSurvivorDetail,
    notesDraft,
    setSelectedShowdown
  ])

  if (!selectedSurvivor) return <></>

  return (
    <Card className="w-full min-w-[430px] border-0 p-0">
      <CardContent className="px-2">
        <SurvivorCard
          mode={SurvivorCardMode.SHOWDOWN_CARD}
          selectedHunt={null}
          selectedSettlement={selectedSettlement}
          selectedShowdown={selectedShowdown}
          selectedSurvivor={selectedSurvivor}
          setSelectedShowdown={setSelectedShowdown}
          setSurvivors={setSurvivors}
          survivors={survivors}
        />

        <Separator className="my-2" />

        <div className="flex flex-col gap-2">
          <Textarea
            value={notesDraft}
            name="showdown-survivor-notes"
            id={`showdown-survivor-notes-${selectedSurvivor.id}`}
            onChange={(e) => {
              setNotesDraft(e.target.value)
              setIsNotesDirty(e.target.value !== showdownSurvivorDetail?.notes)
            }}
            placeholder="Add showdown notes..."
            className="w-full resize-none text-xs font-normal"
            style={{ minHeight: '125px' }}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSaveNotes}
              disabled={!isNotesDirty}
              title="Save showdown notes">
              <CheckIcon className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
