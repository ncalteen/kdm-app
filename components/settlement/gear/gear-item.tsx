'use client'

import { CustomGearRulesTrigger } from '@/components/custom/custom-rules-sheet'
import { AuthoredByChip } from '@/components/generic/authored-by-chip'
import { NumericInput } from '@/components/menu/numeric-input'
import { Button } from '@/components/ui/button'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Gear Item Component Properties
 */
export interface GearItemProps {
  /**
   * Custom Flag
   *
   * When true, the gear name renders as a clickable trigger that opens the
   * custom gear sheet (a read-only mirror of the gear creation dialog).
   */
  custom?: boolean | null
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
 * input, and a remove button. When the gear is user-defined, the name becomes
 * a clickable trigger that opens the read-only gear card sheet.
 *
 * @param props Gear Item Component Properties
 * @returns Gear Item Component
 */
export const GearItem = memo(function GearItem({
  custom,
  index,
  gear,
  onQuantityChange,
  onRemove
}: GearItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2 pb-1">
      {/* Gear Name */}
      <CustomGearRulesTrigger
        className="truncate ml-1"
        custom={custom ?? false}
        gearId={gear.gear_id}
        gearName={gear.gear_name}
        showCustomBadge
      />

      <AuthoredByChip
        authorUserId={gear.author_user_id}
        authorUsername={gear.author_username}
        authorAvatarUrl={gear.author_avatar_url}
      />

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
          aria-label="Remove gear"
          title="Remove gear">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
