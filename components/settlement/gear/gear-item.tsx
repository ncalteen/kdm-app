'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { GearDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/**
 * Gear Item Component Properties
 */
export interface GearItemProps {
  /** Index */
  index: number
  /** Gear Row */
  gear: SettlementDetail['gear'][0]
  /** On Quantity Change Handler */
  onQuantityChange: (index: number, quantity: number) => void
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * New Gear Item Component Properties
 */
export interface NewGearItemProps {
  /** Available Gear */
  availableGear: GearDetail[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (gearId: string | undefined) => void
}

/**
 * Gear Item Component
 *
 * Displays a single gear item linked to a settlement with its name, quantity
 * input, and a remove button.
 *
 * @param props Gear Item Component Properties
 * @returns Gear Item Component
 */
export const GearItem = memo(function GearItem({
  index,
  gear,
  onQuantityChange,
  onRemove
}: GearItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Gear Name */}
      <Label className="text-sm truncate ml-1">{gear.gear_name}</Label>

      {/* Quantity and Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <NumericInput
          className="w-16"
          label={`${gear.gear_name} quantity`}
          min={0}
          onChange={(value) => onQuantityChange(index, value)}
          value={gear.quantity}
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove gear">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

/**
 * New Gear Item Component
 *
 * Renders a select dropdown for choosing gear to add to the settlement.
 *
 * @param props New Gear Item Component Properties
 * @returns New Gear Item Component
 */
export const NewGearItem = memo(function NewGearItem({
  availableGear,
  onCancel,
  onSave
}: NewGearItemProps): ReactElement {
  const [selectedGearId, setSelectedGearId] = useState<string | undefined>(
    undefined
  )

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Gear Selector */}
      <Select
        value={selectedGearId}
        onValueChange={(value) => setSelectedGearId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select gear" />
        </SelectTrigger>
        <SelectContent>
          {availableGear.map((gear) => (
            <SelectItem key={gear.id} value={gear.id}>
              {gear.gear_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Interaction Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSave(selectedGearId)}
          title="Save gear">
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
