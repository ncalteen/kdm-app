'use client'

import { GearGridCell } from '@/components/survivor/gear-grid/gear-grid-cell'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { GearDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { ReactElement, useMemo, useState } from 'react'

/**
 * Gear Grid Picker Dialog Properties
 */
interface GearGridPickerDialogProps {
  /** Dialog Open */
  open: boolean
  /** Dialog Open/Close Callback */
  onOpenChange: (open: boolean) => void
  /** Slot Label (e.g. "Top Left") */
  slotLabel: string
  /**
   * Settlement Gear
   *
   * Filtered within this component to items still available to equip.
   */
  candidates: GearCandidate[]
  /** Catalog of GearDetail keyed by gear ID */
  gearMap: { [key: string]: GearDetail }
  /** Currently Equipped Gear ID (when replacing) */
  currentGearId: string | null
  /** Equip Selection Callback */
  onSelect: (gearId: string) => void
}

/**
 * Gear Candidate
 *
 * One row in the picker representing an item from the settlement's gear list
 * that may still be equipped (after accounting for stock and existing
 * equipment across all survivors). Mirrors SettlementDetail['gear'] but with a
 * derived `remaining` count.
 */
export interface GearCandidate {
  /** Gear ID */
  gear_id: string
  /** Gear Name */
  gear_name: string
  /** Settlement Gear Quantity */
  quantity: number
  /** Quantity Remaining After Current Equipment */
  remaining: number
  /** Custom Flag */
  custom: boolean
}

/**
 * Gear Grid Picker Dialog Component
 *
 * Modal dialog that lets the user pick one piece of gear from the settlement's
 * stock to equip into a particular grid slot. Items already fully equipped
 * across the settlement are disabled so the picker visibly mirrors the
 * `validate_gear_grid_positions` database trigger.
 *
 * @param props Gear Grid Picker Dialog Properties
 * @returns Gear Grid Picker Dialog Component
 */
export function GearGridPickerDialog({
  open,
  onOpenChange,
  slotLabel,
  candidates,
  gearMap,
  currentGearId,
  onSelect
}: GearGridPickerDialogProps): ReactElement {
  const [previewGearId, setPreviewGearId] = useState<string | null>(
    currentGearId
  )

  const sortedCandidates = useMemo(
    () =>
      [...candidates].sort((a, b) => a.gear_name.localeCompare(b.gear_name)),
    [candidates]
  )

  const previewGear = previewGearId ? (gearMap[previewGearId] ?? null) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Equip Gear — {slotLabel}</DialogTitle>
          <DialogDescription>
            Choose a piece of gear from your settlement to equip into this slot.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,200px)]">
          {/* Picker list */}
          <div className="rounded-md border">
            <Command>
              <CommandInput placeholder="Search gear..." />
              <CommandList className="max-h-[320px]">
                <CommandEmpty>No gear in settlement storage.</CommandEmpty>
                <CommandGroup>
                  {sortedCandidates.map((candidate) => {
                    const isCurrent = candidate.gear_id === currentGearId
                    const exhausted = !isCurrent && candidate.remaining <= 0
                    const detail = gearMap[candidate.gear_id]
                    return (
                      <CommandItem
                        key={candidate.gear_id}
                        value={candidate.gear_name}
                        disabled={exhausted}
                        onSelect={() => setPreviewGearId(candidate.gear_id)}
                        className={cn(
                          previewGearId === candidate.gear_id && 'bg-accent'
                        )}>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            previewGearId === candidate.gear_id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <span className="flex-1 truncate">
                          {candidate.gear_name}
                          {detail?.custom && (
                            <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                              custom
                            </span>
                          )}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {candidate.remaining}/{candidate.quantity}
                        </span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preview
            </p>
            {previewGear ? (
              <GearGridCell gear={previewGear} slotLabel={slotLabel} readOnly />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-2 text-center text-xs text-muted-foreground">
                Select gear to preview
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!previewGearId || previewGearId === currentGearId}
            onClick={() => {
              if (previewGearId) onSelect(previewGearId)
            }}>
            Equip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
