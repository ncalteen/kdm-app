'use client'

import {
  CustomItemDisplay,
  CustomRulesText
} from '@/components/custom/custom-rules-sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SettlementDetail } from '@/lib/types'
import { BookOpenIcon, TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Milestone Item Component Properties
 */
export interface MilestoneItemProps {
  /** Custom Rules Sheet Display */
  customDetail?: CustomItemDisplay | null
  /** Index */
  index: number
  /** Milestone Row */
  milestone: SettlementDetail['milestones'][0]
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Complete Handler */
  onToggleComplete: (index: number, checked: boolean) => void
}

/**
 * Milestone Item Component
 *
 * Displays a single milestone linked to a settlement with its completion
 * state, name, event badge, and a remove button.
 *
 * @param props Milestone Item Component Properties
 * @returns Milestone Item Component
 */
export const MilestoneItem = memo(function MilestoneItem({
  customDetail,
  index,
  milestone,
  onRemove,
  onToggleComplete
}: MilestoneItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Completion Checkbox */}
      <Checkbox
        aria-label={`Complete ${milestone.milestone_name}`}
        id={`milestone-complete-${index}`}
        name={`milestone-complete-${index}`}
        checked={milestone.complete}
        onCheckedChange={(checked) => onToggleComplete(index, !!checked)}
      />

      {/* Milestone Name */}
      <CustomRulesText
        className="truncate ml-1"
        custom={milestone.custom}
        description={customDetail?.description}
        label={milestone.milestone_name}
        sections={
          customDetail?.sections ?? [
            { label: 'Requirements', content: milestone.requirements },
            { label: 'Rules', content: milestone.rules }
          ]
        }
        title={customDetail?.title ?? milestone.milestone_name}
        showCustomBadge
        authorUserId={milestone.author_user_id}
        authorUsername={milestone.author_username}
      />

      {/* Event Badge and Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {milestone.event_name && (
          <Badge variant="secondary" className="h-8 w-40">
            <BookOpenIcon className="h-4 w-4" />
            <span className="text-xs truncate">{milestone.event_name}</span>
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove milestone"
          title="Remove milestone">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
