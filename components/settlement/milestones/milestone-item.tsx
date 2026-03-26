'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SettlementDetail } from '@/lib/types'
import { BookOpenIcon, TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Milestone Item Component Properties
 */
export interface MilestoneItemProps {
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
  index,
  milestone,
  onRemove,
  onToggleComplete
}: MilestoneItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Completion Checkbox */}
      <Checkbox
        id={`milestone-complete-${index}`}
        name={`milestone-complete-${index}`}
        checked={milestone.complete}
        onCheckedChange={(checked) => onToggleComplete(index, !!checked)}
      />

      {/* Milestone Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`milestone-complete-${index}`}>
        {milestone.milestone_name}
      </Label>

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
          title="Remove milestone">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
