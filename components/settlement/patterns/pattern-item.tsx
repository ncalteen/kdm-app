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
 * Pattern Item Component Properties
 */
export interface PatternItemProps {
  /** Custom Rules Sheet Display */
  customDetail?: CustomItemDisplay | null
  /** Index */
  index: number
  /** Pattern Row */
  pattern: SettlementDetail['patterns'][0]
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * Pattern Item Component
 *
 * Displays a single pattern linked to a settlement with its name and a remove
 * button.
 *
 * @param props Pattern Item Component Properties
 * @returns Pattern Item Component
 */
export const PatternItem = memo(function PatternItem({
  customDetail,
  index,
  pattern,
  onRemove
}: PatternItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Pattern Name */}
      <CustomRulesText
        className="truncate ml-1"
        custom={customDetail?.custom ?? false}
        description={customDetail?.description}
        label={pattern.pattern_name}
        sections={customDetail?.sections ?? []}
        title={customDetail?.title ?? pattern.pattern_name}
        showCustomBadge
      />

      {/* Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove pattern"
          title="Remove pattern">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
