'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

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
