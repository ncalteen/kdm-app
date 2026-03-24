'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { MilestoneDetail, SettlementDetail } from '@/lib/types'
import { BookOpenIcon, CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement milestone row from SettlementDetail */
type MilestoneRow = SettlementDetail['milestones'][0]

/**
 * Milestone Item Component Properties
 */
export interface MilestoneItemProps {
  /** Index */
  index: number
  /** Milestone Row */
  milestone: MilestoneRow
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Complete Handler */
  onToggleComplete: (index: number, checked: boolean) => void
}

/**
 * New Milestone Item Component Properties
 */
export interface NewMilestoneItemProps {
  /** Available Milestones */
  availableMilestones: MilestoneDetail[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (milestoneId: string | undefined) => void
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

/**
 * New Milestone Item Component
 *
 * Renders a select dropdown for choosing a milestone to add to the settlement.
 *
 * @param props New Milestone Item Component Properties
 * @returns New Milestone Item Component
 */
export const NewMilestoneItem = memo(function NewMilestoneItem({
  availableMilestones,
  onCancel,
  onSave
}: NewMilestoneItemProps): ReactElement {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Completion Checkbox (Disabled) */}
      <Checkbox
        checked={false}
        disabled={true}
        id="milestone-new-complete"
        name="milestone-new-complete"
      />

      {/* Milestone Selector */}
      <Select
        value={selectedMilestoneId}
        onValueChange={(value) => setSelectedMilestoneId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select milestone" />
        </SelectTrigger>
        <SelectContent>
          {availableMilestones.map((milestone) => (
            <SelectItem key={milestone.id} value={milestone.id}>
              {milestone.milestone_name}
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
          onClick={() => onSave(selectedMilestoneId)}
          title="Save milestone">
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
