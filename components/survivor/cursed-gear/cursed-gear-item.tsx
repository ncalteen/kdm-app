'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement gear row from SettlementDetail */
type GearRow = SettlementDetail['gear'][0]

/**
 * Cursed Gear Item Component Properties
 */
export interface CursedGearItemProps {
  /** Gear Name */
  gearName: string
  /** On Remove Handler */
  onRemove: () => void
}

/**
 * New Cursed Gear Item Component Properties
 */
export interface NewCursedGearItemProps {
  /** Available Gear (settlement gear not yet cursed) */
  availableGear: GearRow[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (gearId: string | undefined) => void
}

/**
 * Cursed Gear Item Component
 *
 * Displays a single cursed gear item linked to a survivor with its name and a
 * remove button.
 *
 * @param props Cursed Gear Item Component Properties
 * @returns Cursed Gear Item Component
 */
export const CursedGearItem = memo(function CursedGearItem({
  gearName,
  onRemove
}: CursedGearItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      <span className="text-sm ml-1 flex-grow truncate">{gearName}</span>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={onRemove}
        title="Remove cursed gear">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})

/**
 * New Cursed Gear Item Component
 *
 * Renders a select dropdown for choosing settlement gear to mark as cursed.
 *
 * @param props New Cursed Gear Item Component Properties
 * @returns New Cursed Gear Item Component
 */
export const NewCursedGearItem = memo(function NewCursedGearItem({
  availableGear,
  onCancel,
  onSave
}: NewCursedGearItemProps): ReactElement {
  const [selectedGearId, setSelectedGearId] = useState<string | undefined>(
    undefined
  )

  return (
    <div className="flex items-center gap-2 pl-2">
      <Select
        value={selectedGearId}
        onValueChange={(value) => setSelectedGearId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select gear" />
        </SelectTrigger>
        <SelectContent>
          {availableGear.map((gear) => (
            <SelectItem key={gear.gear_id} value={gear.gear_id}>
              {gear.gear_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSave(selectedGearId)}
          title="Save cursed gear">
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          title="Cancel">
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
