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
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/**
 * Quarry Item Properties
 */
export interface QuarryItemProps {
  /** Index */
  index: number
  /** Monster Name */
  monsterName: string
  /** Monster Node */
  node: string
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (index: number, unlocked: boolean) => void
  /** Unlocked */
  unlocked: boolean
}

/**
 * New Quarry Item Component Properties
 */
export interface NewQuarryItemProps {
  /** Available Quarries */
  availableQuarries: { id: string; monster_name: string }[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (quarryId: string | undefined) => void
}

/**
 * Quarry Item Component
 *
 * Displays a single quarry linked to a settlement with its unlocked state,
 * name, node badge, and a remove button.
 *
 * @param props Quarry Item Component Properties
 * @returns Quarry Item Component
 */
export const QuarryItem = memo(function QuarryItem({
  index,
  monsterName,
  node,
  onRemove,
  onToggleUnlocked,
  unlocked
}: QuarryItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox */}
      <Checkbox
        id={`quarry-unlocked-${index}`}
        name={`quarry-unlocked-${index}`}
        checked={unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(index, !!checked)}
      />

      {/* Quarry Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`quarry-unlocked-${index}`}>
        {monsterName}
      </Label>

      {/* Node Badge and Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {node && (
          <Badge variant="secondary" className="h-8 w-20">
            {node}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove quarry">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

/**
 * New Quarry Item Component
 *
 * Renders a select dropdown for choosing a quarry to add to the settlement.
 *
 * @param props New Quarry Item Component Properties
 * @returns New Quarry Item Component
 */
export const NewQuarryItem = memo(function NewQuarryItem({
  availableQuarries,
  onCancel,
  onSave
}: NewQuarryItemProps): ReactElement {
  const [selectedQuarryId, setSelectedQuarryId] = useState<string | undefined>(
    undefined
  )

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox (disabled for new items) */}
      <Checkbox
        checked={false}
        disabled={true}
        id="quarry-new-unlocked"
        name="quarry-new-unlocked"
      />

      {/* Quarry Selector */}
      <Select
        value={selectedQuarryId}
        onValueChange={(value) => setSelectedQuarryId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select quarry" />
        </SelectTrigger>
        <SelectContent>
          {availableQuarries.map((quarry) => (
            <SelectItem key={quarry.id} value={quarry.id}>
              {quarry.monster_name}
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
          onClick={() => onSave(selectedQuarryId)}
          title="Save quarry">
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
