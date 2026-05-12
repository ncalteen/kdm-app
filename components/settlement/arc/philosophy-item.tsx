'use client'

import {
  CustomItemDisplay,
  CustomPhilosophyRulesText,
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
  /**
   * Custom Rules Sheet Display
   *
   * Optional override used for non-custom philosophies (e.g. catalog detail
   * surfaces). Custom philosophies render their own sheet via
   * {@link CustomPhilosophyRulesText} and ignore this prop.
   */
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
 * remove button. When the philosophy is user-defined, the name becomes a
 * clickable trigger that opens a sheet displaying its overview, rank rules,
 * and any other custom data. Otherwise the name is rendered as plain text
 * (or, when `customDetail` is provided, the supplied generic sheet content).
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
      {philosophy.custom ? (
        <CustomPhilosophyRulesText
          className="ml-1 grow"
          custom={philosophy.custom}
          philosophyId={philosophy.philosophy_id}
          philosophyName={philosophy.philosophy_name}
          tier={philosophy.tier}
          huntXpMilestones={philosophy.hunt_xp_milestones}
          showCustomBadge
        />
      ) : (
        <CustomRulesText
          className="ml-1 grow"
          custom={customDetail?.custom ?? philosophy.custom}
          description={customDetail?.description}
          label={philosophy.philosophy_name}
          sections={customDetail?.sections ?? []}
          title={customDetail?.title ?? philosophy.philosophy_name}
          showCustomBadge
        />
      )}

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => onRemove(index)}
        aria-label="Remove philosophy"
        title="Remove philosophy">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})
