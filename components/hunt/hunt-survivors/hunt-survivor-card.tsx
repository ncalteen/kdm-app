'use client'

import { SurvivorCard } from '@/components/survivor/survivor-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { updateHuntSurvivor } from '@/lib/dal/hunt-survivor'
import { SurvivorCardMode } from '@/lib/enums'
import { ERROR_MESSAGE, HUNT_NOTES_SAVED_MESSAGE } from '@/lib/messages'
import {
  HuntDetail,
  HuntSurvivorDetail,
  SettlementDetail,
  SurvivorDetail
} from '@/lib/types'
import { CheckIcon } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Hunt Survivor Card Component Properties
 */
interface HuntSurvivorCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Hunt Survivor Card Component
 *
 * Displays a survivor's details during a hunt, including the standard survivor
 * card and hunt-specific notes with optimistic save/rollback.
 *
 * @param props Hunt Survivor Card Properties
 * @returns Hunt Survivor Card Component
 */
export function HuntSurvivorCard({
  selectedHunt,
  selectedSettlement,
  selectedSurvivor,
  setSelectedHunt,
  setSurvivors,
  survivors
}: HuntSurvivorCardProps): ReactElement {
  /** Find the hunt survivor detail record for the current survivor */
  const huntSurvivorDetail = selectedHunt?.hunt_survivors
    ? Object.values(selectedHunt.hunt_survivors).find(
        (hs) => hs.survivor_id === selectedSurvivor?.id
      )
    : undefined

  // Track survivor ID to detect changes
  const prevSurvivorId = useRef(selectedSurvivor?.id)

  // State for managing notes
  const [notesDraft, setNotesDraft] = useState<string>(
    huntSurvivorDetail?.notes ?? ''
  )
  const [isNotesDirty, setIsNotesDirty] = useState<boolean>(false)

  // Reset notes draft when survivor changes
  if (prevSurvivorId.current !== selectedSurvivor?.id) {
    prevSurvivorId.current = selectedSurvivor?.id
    setNotesDraft(huntSurvivorDetail?.notes ?? '')
    setIsNotesDirty(false)
  }

  /**
   * Handle Save Notes
   *
   * Optimistically updates the hunt survivor notes, then persists to the
   * database. Rolls back on error.
   */
  const handleSaveNotes = useCallback(() => {
    if (
      !selectedSurvivor?.id ||
      !selectedHunt?.hunt_survivors ||
      !huntSurvivorDetail
    )
      return

    const previousNotes = huntSurvivorDetail.notes

    // Optimistic update
    const updatedSurvivors: { [key: string]: HuntSurvivorDetail } = {}
    for (const [key, hs] of Object.entries(selectedHunt.hunt_survivors)) {
      updatedSurvivors[key] =
        hs.id === huntSurvivorDetail.id ? { ...hs, notes: notesDraft } : hs
    }

    setSelectedHunt({
      ...selectedHunt,
      hunt_survivors: updatedSurvivors
    })
    setIsNotesDirty(false)

    updateHuntSurvivor(huntSurvivorDetail.id, { notes: notesDraft })
      .then(() => toast.success(HUNT_NOTES_SAVED_MESSAGE()))
      .catch((err: unknown) => {
        // Rollback
        const revertedSurvivors: { [key: string]: HuntSurvivorDetail } = {}
        for (const [key, hs] of Object.entries(selectedHunt.hunt_survivors!)) {
          revertedSurvivors[key] =
            hs.id === huntSurvivorDetail.id
              ? { ...hs, notes: previousNotes }
              : hs
        }

        setSelectedHunt({
          ...selectedHunt,
          hunt_survivors: revertedSurvivors
        })
        setIsNotesDirty(true)

        console.error('Hunt Survivor Notes Save Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [
    selectedSurvivor?.id,
    selectedHunt,
    huntSurvivorDetail,
    notesDraft,
    setSelectedHunt
  ])

  if (!selectedSurvivor) return <></>

  return (
    <Card className="w-full min-w-[430px] border-0 p-0">
      <CardContent className="px-2">
        <SurvivorCard
          mode={SurvivorCardMode.HUNT_CARD}
          selectedHunt={selectedHunt}
          selectedSettlement={selectedSettlement}
          selectedShowdown={null}
          selectedSurvivor={selectedSurvivor}
          setSelectedHunt={setSelectedHunt}
          setSurvivors={setSurvivors}
          survivors={survivors}
        />

        <Separator className="my-2" />

        {/* Hunt Notes Section */}
        <div className="flex flex-col gap-2">
          <Textarea
            value={notesDraft}
            name="hunt-survivor-notes"
            id={`hunt-survivor-notes-${selectedSurvivor.id}`}
            onChange={(e) => {
              setNotesDraft(e.target.value)
              setIsNotesDirty(e.target.value !== huntSurvivorDetail?.notes)
            }}
            placeholder="Add hunt notes..."
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
              title="Save hunt notes">
              <CheckIcon className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
