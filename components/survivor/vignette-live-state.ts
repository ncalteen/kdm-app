import { updateVignetteEncounterSurvivorLiveState } from '@/lib/dal/vignette-encounter'
import { SurvivorCardMode } from '@/lib/enums'
import { ERROR_MESSAGE } from '@/lib/messages'
import type {
  ShowdownDetail,
  ShowdownStateSetter,
  ShowdownSurvivorDetail,
  SurvivorDetail
} from '@/lib/types'
import type { VignetteEncounterSurvivorLiveStateUpdateInput } from '@/schemas/vignette-encounter'
import { toast } from 'sonner'

/** Vignette Survivor Live State Field */
export type VignetteSurvivorLiveStateField = Exclude<
  keyof VignetteEncounterSurvivorLiveStateUpdateInput,
  'vignette_encounter_survivor_id'
>

/**
 * Get Active Survivor Record
 *
 * @param selectedShowdown Selected Showdown Adapter
 * @param selectedSurvivor Selected Survivor
 * @returns Active Survivor Record
 */
export function getActiveSurvivorRecord(
  selectedShowdown: ShowdownDetail | null,
  selectedSurvivor: SurvivorDetail | null
): ShowdownSurvivorDetail | undefined {
  if (!selectedShowdown?.showdown_survivors || !selectedSurvivor?.id)
    return undefined

  return Object.values(selectedShowdown.showdown_survivors).find(
    (survivorRecord) => survivorRecord.survivor_id === selectedSurvivor.id
  )
}

/**
 * Save Vignette Survivor Live State
 *
 * Updates the selected-showdown adapter optimistically and persists the same
 * field to the active vignette survivor row.
 *
 * @param input Vignette Live State Update Input
 * @returns Whether The Update Was Handled
 */
export function saveVignetteSurvivorLiveState({
  context,
  field,
  mode,
  selectedShowdown,
  selectedSurvivor,
  setSelectedShowdown,
  value
}: {
  /** Error Context */
  context: string
  /** Field To Update */
  field: VignetteSurvivorLiveStateField
  /** Survivor Card Mode */
  mode: SurvivorCardMode
  /** Selected Showdown Adapter */
  selectedShowdown: ShowdownDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Showdown Adapter */
  setSelectedShowdown?: ShowdownStateSetter
  /** Field Value */
  value: VignetteEncounterSurvivorLiveStateUpdateInput[VignetteSurvivorLiveStateField]
}): boolean {
  if (mode !== SurvivorCardMode.VIGNETTE_CARD) return false

  const survivorRecord = getActiveSurvivorRecord(
    selectedShowdown,
    selectedSurvivor
  )

  if (!survivorRecord || !selectedShowdown?.showdown_survivors) return true

  const survivorKey = Object.entries(selectedShowdown.showdown_survivors).find(
    ([, record]) => record.id === survivorRecord.id
  )?.[0]

  if (!survivorKey) return true

  const previousValue = survivorRecord[field as keyof ShowdownSurvivorDetail]
  const updatedRecord = { ...survivorRecord, [field]: value }

  setSelectedShowdown?.({
    ...selectedShowdown,
    showdown_survivors: {
      ...selectedShowdown.showdown_survivors,
      [survivorKey]: updatedRecord
    }
  })

  updateVignetteEncounterSurvivorLiveState({
    vignette_encounter_survivor_id: survivorRecord.id,
    [field]: value
  }).catch((error: unknown) => {
    setSelectedShowdown?.((prev) =>
      prev?.showdown_survivors
        ? {
            ...prev,
            showdown_survivors: {
              ...prev.showdown_survivors,
              [survivorKey]: {
                ...updatedRecord,
                [field]: previousValue
              }
            }
          }
        : prev
    )
    console.error(`${context} Error:`, error)
    toast.error(ERROR_MESSAGE())
  })

  return true
}
