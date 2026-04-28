'use client'

import {
  CustomItemDisplay,
  CustomRulesText
} from '@/components/custom/custom-rules-sheet'
import { Button } from '@/components/ui/button'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Philosophy Item Component Properties
 */
export interface PhilosophyItemProps {
  /** Custom Rules Sheet Display */
  customDetail?: CustomItemDisplay | null
  /** Index */
  index: number
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** Philosophy Row */
  philosophy: SettlementDetail['philosophies'][0]
}

/**
 * Philosophy Item Component
 *
 * Displays a single philosophy linked to a settlement with its name and a
 * remove button.
 *
 * @param props Philosophy Item Component Properties
 * @returns Philosophy Item Component
 */
export const PhilosophyItem = memo(function PhilosophyItem({
  customDetail,
  index,
  onRemove,
  philosophy
}: PhilosophyItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Philosophy Name */}
      <CustomRulesText
        className="ml-1 flex-grow"
        custom={customDetail?.custom ?? philosophy.custom}
        description={customDetail?.description}
        label={philosophy.philosophy_name}
        sections={customDetail?.sections ?? []}
        title={customDetail?.title ?? philosophy.philosophy_name}
        showCustomBadge
      />

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => onRemove(index)}
        title="Remove philosophy">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})
